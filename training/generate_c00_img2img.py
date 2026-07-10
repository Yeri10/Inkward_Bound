#!/usr/bin/env python3
"""Generate c_0.0 atlas candidates via img2img: real 01_pure_diffusion photos
anchor the natural top-down composition, the v5 LoRA re-renders variations.

    python3 training/generate_c00_img2img.py --strength 0.5 --variations 3

strength 0.35-0.45 = close to the photo, subtle variation
strength 0.5-0.6   = same composition, freely re-rendered texture
strength 0.7+      = only rough layout survives

Outputs to training/atlas_candidates/c_0.0/ as img2img_<src>_s<strength>_v<n>.png
and appends to the shared manifest.jsonl.
"""

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import torch
from PIL import Image
from diffusers import DDIMScheduler, StableDiffusionImg2ImgPipeline

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "ink_dataset" / "01_pure_diffusion"
OUT = ROOT / "training" / "atlas_candidates" / "c_0.0"
LORA = ROOT / "training" / "runs" / "inkwb_lora_v5"
MODEL_ID = "runwayml/stable-diffusion-v1-5"

# Trained 01 vocabulary (v5: no basin phrase), same as the text-to-image bin.
PROMPT = ("inkwb, black ink diffusing freely across still water, top-down view, "
          "ink spreading across part of the frame, "
          "a large rounded ink mass centered on a pale field with a soft halo, "
          "soft gray washes of dispersed ink spreading around it")
NEG = ("curved basin rim, tank walls, bubbles, table edge, paper texture, ink on paper, photo border, "
       "dark frame edges, thin ink threads, wispy tendrils, translucent veils, bubble membranes, "
       "specular highlights, glossy reflections, light glare")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--strength", type=float, default=0.5, help="0=copy photo, 1=ignore photo")
    ap.add_argument("--variations", type=int, default=3, help="variations per source photo")
    ap.add_argument("--images", nargs="*", help="only these source stems, e.g. --images 3-1 6-1 6-2")
    ap.add_argument("--steps", type=int, default=36)
    ap.add_argument("--guidance", type=float, default=7.5)
    ap.add_argument("--size", type=int, default=512)
    ap.add_argument("--seed-start", type=int, default=9000)
    args = ap.parse_args()

    device = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")
    dtype = torch.float16 if device != "cpu" else torch.float32
    pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        MODEL_ID, torch_dtype=dtype, safety_checker=None, requires_safety_checker=False)
    pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
    pipe.load_lora_weights(str(LORA), weight_name="pytorch_lora_weights.safetensors")
    pipe = pipe.to(device)

    sources = sorted(SRC.glob("*.jpg"))
    if args.images:
        sources = [p for p in sources if p.stem in set(args.images)]
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = OUT.parent / "manifest.jsonl"

    seed = args.seed_start
    total = len(sources) * args.variations
    done = 0
    with manifest.open("a", encoding="utf-8") as mf:
        for src in sources:
            init = Image.open(src).convert("RGB").resize((args.size, args.size), Image.LANCZOS)
            for v in range(args.variations):
                torch.manual_seed(seed)
                image = pipe(prompt=PROMPT, negative_prompt=NEG, image=init,
                             strength=args.strength, num_inference_steps=args.steps,
                             guidance_scale=args.guidance).images[0]
                name = f"img2img_{src.stem}_s{int(args.strength*100)}_v{v}.png"
                image.save(OUT / name)
                mf.write(json.dumps({
                    "file": f"c_0.0/{name}", "c": 0.0, "label": "autonomous_diffusion",
                    "mode": "img2img", "init_image": f"ink_dataset/01_pure_diffusion/{src.name}",
                    "strength": args.strength, "seed": seed,
                    "prompt": PROMPT, "negative_prompt": NEG,
                    "steps": args.steps, "guidance": args.guidance, "size": args.size,
                    "lora": LORA.name,
                    "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                }, ensure_ascii=False) + "\n")
                mf.flush()
                seed += 1
                done += 1
                print(f"[{done}/{total}] {src.stem} v{v}")

    print(f"done. images in {OUT}")


if __name__ == "__main__":
    main()
