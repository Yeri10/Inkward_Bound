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
DEFAULT_LORA = ROOT / "training" / "runs" / "inkwb_lora_v5"
DEFAULT_OUT = ROOT / "training" / "atlas_candidates"
MODEL_ID = "runwayml/stable-diffusion-v1-5"

TRIGGER = "inkwb"
WATER = "suspended in clear water"
PHOTO = "macro photograph, wet glossy ink, soft light"
STYLE = "monochrome, high contrast"
NEG = ("tank walls, basin rim, bubbles, table edge, dark smears at the bottom edge, "
       "paper texture, ink on paper, photo border, dark frame edges, "
       "dust, specks, dirt particles, grainy noise, stains, smudges")

# c-value grid -> caption vocabulary. Matches the installation's state table and
# the TouchDesigner latent_atlas folder layout (c_0.0 ... c_1.0).
BINS = [
    # Diffusion uses the 01 top-down vocabulary: an ink pool spreading across the
    # water surface with marbled swirls. The side-view water anchor is disabled here.
    {"c": 0.0, "label": "autonomous_diffusion",
     "state": "black ink diffusing freely across still water", "process": "diffusion",
     "phase": "developing", "density": "ink spreading across part of the frame",
     "viewpoint": "top-down view",
     # Rebuilt from trained 01 caption phrases (v5 build removes the basin
     # phrase, so these recall without container words): 6-2 "a large rounded
     # ink mass centered on a pale field with a soft halo", 5-2 "soft gray
     # washes", 4-2 "scalloped lobed edge". Gray = dispersed ink layers.
     "morph": ("a large rounded ink mass centered on a pale field with a soft halo, "
               "soft gray washes of dispersed ink spreading around it, "
               "a scalloped lobed edge advancing slowly over the pale water"),
     "neg_full": ("curved basin rim, tank walls, bubbles, table edge, paper texture, ink on paper, photo border, "
                  "dark frame edges, marbled paper texture, paint marbling, "
                  "thin ink threads, wispy tendrils, translucent veils, bubble membranes, water droplet splash, "
                  "dust, specks, dirt particles, grainy noise, stains, smudges, cluttered textured background, "
                  "specular highlights, glossy reflections, shiny water surface, light glare, wet glossy sheen"),
     "photo": False,
     "water": False},
    # Settling sits at c 0.2 (swapped with disturbance on 9 July 2026): the 02
    # layered vocabulary — surface canopy with droplet fringes, translucent veils
    # sinking in distinct layers. The mist-edge variant was tried and rolled back:
    # this bin reads better with the original sharp layered look.
    {"c": 0.2, "label": "early_search",
     "state": "layered black ink suspended in water", "process": "settling",
     "phase": "developing", "density": "dense ink covering much of the frame",
     "viewpoint": "side view",
     "morph": "a dense ink canopy at the surface with droplet fringes, translucent veils and tendrils sinking in distinct layers through clear water toward a settled dark base"},
    # Disturbance sits at c 0.4: hazy vocabulary from the 03 captions (murky
    # billows, churned haze); glossy photo suffix disabled — it contradicts the
    # soft mist-like dispersion of stirred ink.
    {"c": 0.4, "label": "human_disturbance",
     "state": "turbulent agitated black ink in water", "process": "disturbance",
     "phase": "developing", "density": "ink spreading across part of the frame",
     "viewpoint": "side view",
     # Fog level shifted up one grade: c 0.4 now wears the dense-fog veil that
     # the previous 0.6 batch had, with the stirring identity kept.
     "morph": ("dense gray fog of ink churned up by stirring filling the frame, thick smoke-like haze, "
               "forms dissolving into soft mist, only faint churned shadows moving in the fog"),
     "neg": ("sharp crisp edges, glossy hard-edged swirls, thin defined filaments, high gloss, "
             "solid black shapes, high contrast silhouettes, clear outlines"),
     "photo": False},
    # The three gathering bins grade the pipette-drawn recall from the 04 captions:
    # strands pulled downward -> column condensing at its foot -> settled solid mound.
    # Intermediate fog grade between the stirred gray fog of 0.4 and the dense
    # murky darkness of 0.6: fuller coverage, darker tone, small pale openings.
    {"c": 0.5, "label": "fog_deepening",
     "state": "turbulent agitated black ink in water", "process": "disturbance",
     "phase": "developing", "density": "heavy ink covering most of the frame",
     "viewpoint": "side view",
     "morph": ("thick gray ink fog churned through the water covering most of the frame, "
               "smoke-like haze deepening, hazy billows glowing softly, forms dissolving into mist, "
               "only small pale openings remaining"),
     "neg": ("sharp crisp edges, glossy hard-edged swirls, thin defined filaments, high gloss, "
             "solid black shapes, high contrast silhouettes, clear outlines"),
     "photo": False},
    {"c": 0.6, "label": "latent_search",
     # Pure fog rebuilt directly from the trained captions of the densest 03 fog
     # frames: disturbance state + "ink almost filling the entire frame" + their
     # exact murk/billow phrases. The gathering axis re-emerges at c 0.7/0.8.
     "state": "turbulent agitated black ink in water", "process": "disturbance",
     "phase": "developing", "density": "ink almost filling the entire frame",
     "viewpoint": "side view",
     # Trained 03 fog phrases combined with the earlier fog wording that the
     # user liked: murk/billow recall + dense veil / dissolving-mist language.
     # Heavier fog, minimal negative space: pale empty areas pushed into the
     # negative prompt, the haze fills every corner of the frame.
     # The 0.6 fog is GRANULAR, not darker: ink strands broken apart into fine
     # suspended particles — a powdery cloud of ink grains. The shared NEG bans
     # dust/specks/grain, which would kill this look, so neg_full replaces it.
     # Granular AND misty, grains crisp: distinct sharply visible particles
     # suspended in a soft fog atmosphere ("blurred atmosphere" was softening
     # the grains too, so sharpness applies to particles, fog to background).
     "morph": ("ink strands broken apart into countless distinct fine black particles, "
               "each tiny ink grain sharply visible, a granular cloud suspended in soft gray mist, "
               "crisp specks drifting against a hazy fog background filling the frame, no strands, no solid shapes"),
     "neg_full": ("tank walls, basin rim, bubbles, table edge, paper texture, ink on paper, photo border, "
                  "dark frame edges, sharp crisp edges, glossy hard-edged swirls, thin defined filaments, "
                  "high gloss, solid black shapes, high contrast silhouettes, clear outlines, "
                  "large pale empty areas, wide negative space"),
     "photo": False},
    # Transition bin: the full fog of c 0.6 thins and recedes, and the first
    # gathering strands emerge from the dissolving haze — bridging fog (0.4–0.6)
    # into the defined centripetal states (0.8–1.0).
    {"c": 0.7, "label": "fog_receding",
     "state": "black ink gathering and condensing in water", "process": "gathering",
     "phase": "developing", "density": "dense ink covering much of the frame",
     "viewpoint": "side view",
     "morph": ("thinning gray ink fog receding and clearing, dark ink strands emerging out of the dissolving haze, "
               "slowly beginning to gather toward the center"),
     "neg": "sharp crisp edges, glossy hard-edged swirls, high gloss",
     "photo": False},
    {"c": 0.8, "label": "convergence",
     "state": "black ink gathering and condensing in water", "process": "gathering",
     "phase": "advanced", "density": "heavy ink covering most of the frame",
     "viewpoint": "side view",
     "morph": "delicate looping ink threads spiraling inward, being drawn into a solid dark mass"},
    {"c": 1.0, "label": "temporary_return",
     "state": "black ink gathering and condensing in water", "process": "gathering",
     "phase": "final", "density": "heavy ink covering most of the frame",
     "viewpoint": "side view",
     # Uses the exact morphology phrasing of the 04 final-phase training captions
     # ("dense black mound", "tendril column above") for the strongest recall.
     "morph": "a dense settled black mound at the bottom, a single twisting tendril column above it, clear water around"},
    # Loop bin: closes the c axis into a cycle. The settled mound softens and
    # begins to release ink back into the water — temporary return dissolving
    # into autonomous diffusion again. In TouchDesigner this bin sits between
    # c 1.0 and c 0.0 so the atlas can be navigated as a loop.
]


def build_prompt(b: dict, photo_suffix: bool) -> str:
    # v4 vocabulary: phase phrases and style tags were trimmed from the v4 training
    # captions, so prompts use state + viewpoint + water anchor + density, plus an
    # optional per-bin morphology phrase drawn from that category's caption vocabulary.
    parts = [TRIGGER, b["state"], b["viewpoint"]]
    if b.get("container"):
        parts.append(b["container"])
    if b.get("water", True):
        parts.append(WATER)
    parts.append(b["density"])
    if b.get("morph"):
        parts.append(b["morph"])
    if photo_suffix and b.get("photo", True):
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
    total = len(bins) * args.seeds
    done = 0

    with manifest.open("a", encoding="utf-8") as mf:
        for b in bins:
            bin_dir = args.out / f"c_{b['c']:.1f}"
            bin_dir.mkdir(parents=True, exist_ok=True)
            prompt = build_prompt(b, photo_suffix=not args.no_photo_suffix)
            negative = b["neg_full"] if b.get("neg_full") else NEG + (", " + b["neg"] if b.get("neg") else "")
            # Offset seeds per bin (by its index in BINS, stable under --bins
            # filtering) so bins do not share initial noise: identical seeds
            # anchor the composition and make neighbouring bins look alike.
            offset = args.seed_start + BINS.index(b) * 1000
            seeds = range(offset, offset + args.seeds)
            for seed in seeds:
                torch.manual_seed(seed)
                image = pipe(prompt=prompt, negative_prompt=negative,
                             num_inference_steps=args.steps, guidance_scale=args.guidance,
                             width=args.size, height=args.size).images[0]
                name = f"{b['label']}_seed{seed}.png"
                image.save(bin_dir / name)
                mf.write(json.dumps({
                    "file": f"c_{b['c']:.1f}/{name}",
                    "c": b["c"], "label": b["label"], "seed": seed,
                    "measured_coverage": coverage(image),
                    "prompt": prompt, "negative_prompt": negative,
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
