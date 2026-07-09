#!/usr/bin/env python3
"""Batch-generate latent-atlas candidate images along the c-value grid.

For each c bin, generates N seeds with the bin's caption vocabulary (state +
phase + density), saves images into training/atlas_candidates/c_X.X/ and
records every generation in manifest.jsonl (prompt, negative, seed, params).
Curate by deleting unwanted images; the manifest stays as process evidence.

Usage (from the repository root, ml-art environment):

    python3 training/generate_atlas.py --seeds 8
    python3 training/generate_atlas.py --seeds 2 --bins 1.0        # quick test
    python3 training/generate_atlas.py --no-photo-suffix          # if states blur together

Requires the trained LoRA at training/runs/inkwb_lora_v4 (override with --lora).
"""

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import torch
from diffusers import DDIMScheduler, StableDiffusionPipeline

DARK_THRESHOLD = 100  # same definition as training/measure_ink_coverage.py


def coverage(image) -> float:
    hist = image.convert("L").histogram()
    return round(sum(hist[:DARK_THRESHOLD]) / sum(hist), 3)

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_LORA = ROOT / "training" / "runs" / "inkwb_lora_v4"
DEFAULT_OUT = ROOT / "training" / "atlas_candidates"
MODEL_ID = "runwayml/stable-diffusion-v1-5"

TRIGGER = "inkwb"
WATER = "suspended in clear water"
PHOTO = "macro photograph, wet glossy ink, soft light"
STYLE = "monochrome, high contrast"
NEG = ("tank walls, basin rim, bubbles, table edge, dark smears at the bottom edge, "
       "paper texture, ink on paper, photo border, dark frame edges")

# c-value grid -> caption vocabulary. Matches the installation's state table and
# the TouchDesigner latent_atlas folder layout (c_0.0 ... c_1.0).
BINS = [
    {"c": 0.0, "label": "autonomous_diffusion",
     "state": "black ink diffusing freely across still water", "process": "diffusion",
     "phase": "developing", "density": "sparse ink traces, mostly clear water",
     "viewpoint": "side view"},
    {"c": 0.2, "label": "human_disturbance",
     "state": "turbulent agitated black ink in water", "process": "disturbance",
     "phase": "developing", "density": "ink spreading across part of the frame",
     "viewpoint": "side view"},
    {"c": 0.4, "label": "early_search",
     "state": "layered black ink suspended in water", "process": "settling",
     "phase": "developing", "density": "dense ink covering much of the frame",
     "viewpoint": "side view"},
    {"c": 0.6, "label": "latent_search",
     "state": "black ink gathering and condensing in water", "process": "gathering",
     "phase": "developing", "density": "dense ink covering much of the frame",
     "viewpoint": "side view"},
    {"c": 0.8, "label": "convergence",
     "state": "black ink gathering and condensing in water", "process": "gathering",
     "phase": "advanced", "density": "heavy ink covering most of the frame",
     "viewpoint": "side view"},
    {"c": 1.0, "label": "temporary_return",
     "state": "black ink gathering and condensing in water", "process": "gathering",
     "phase": "final", "density": "heavy ink covering most of the frame",
     "viewpoint": "side view"},
]


def build_prompt(b: dict, photo_suffix: bool) -> str:
    # v4 vocabulary: phase phrases and style tags were trimmed from the v4 training
    # captions, so prompts use state + viewpoint + water anchor + density only.
    parts = [TRIGGER, b["state"], b["viewpoint"], WATER, b["density"]]
    if photo_suffix:
        parts.append(PHOTO)
    return ", ".join(parts)


def resolve_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--seeds", type=int, default=8, help="seeds per bin (default 8)")
    ap.add_argument("--seed-start", type=int, default=1000, help="first seed value")
    ap.add_argument("--bins", type=float, nargs="*", help="only generate these c values, e.g. --bins 0.8 1.0")
    ap.add_argument("--steps", type=int, default=28)
    ap.add_argument("--guidance", type=float, default=7.5)
    ap.add_argument("--size", type=int, default=512)
    ap.add_argument("--lora", type=Path, default=DEFAULT_LORA)
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--no-photo-suffix", action="store_true",
                    help="drop the photographic suffix if states blur together")
    args = ap.parse_args()

    device = resolve_device()
    dtype = torch.float16 if device in {"cuda", "mps"} else torch.float32
    print(f"device={device}  lora={args.lora}")

    pipe = StableDiffusionPipeline.from_pretrained(
        MODEL_ID, torch_dtype=dtype, safety_checker=None, requires_safety_checker=False)
    pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
    pipe.load_lora_weights(str(args.lora), weight_name="pytorch_lora_weights.safetensors")
    pipe = pipe.to(device)

    args.out.mkdir(parents=True, exist_ok=True)
    manifest = args.out / "manifest.jsonl"

    bins = [b for b in BINS if not args.bins or b["c"] in args.bins]
    seeds = range(args.seed_start, args.seed_start + args.seeds)
    total = len(bins) * args.seeds
    done = 0

    with manifest.open("a", encoding="utf-8") as mf:
        for b in bins:
            bin_dir = args.out / f"c_{b['c']:.1f}"
            bin_dir.mkdir(parents=True, exist_ok=True)
            prompt = build_prompt(b, photo_suffix=not args.no_photo_suffix)
            for seed in seeds:
                torch.manual_seed(seed)
                image = pipe(prompt=prompt, negative_prompt=NEG,
                             num_inference_steps=args.steps, guidance_scale=args.guidance,
                             width=args.size, height=args.size).images[0]
                name = f"{b['label']}_seed{seed}.png"
                image.save(bin_dir / name)
                mf.write(json.dumps({
                    "file": f"c_{b['c']:.1f}/{name}",
                    "c": b["c"], "label": b["label"], "seed": seed,
                    "measured_coverage": coverage(image),
                    "prompt": prompt, "negative_prompt": NEG,
                    "steps": args.steps, "guidance": args.guidance, "size": args.size,
                    "lora": str(args.lora.name),
                    "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                }, ensure_ascii=False) + "\n")
                mf.flush()
                done += 1
                print(f"[{done}/{total}] {b['label']} seed {seed}")

    print(f"done. images in {args.out}, manifest at {manifest}")


if __name__ == "__main__":
    main()
