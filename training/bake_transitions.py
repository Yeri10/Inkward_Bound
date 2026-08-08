#!/usr/bin/env python3
"""Bake the atlas transition library through ComfyUI's API.

    ⚠ NOT THE PRODUCTION ROUTE — this approach was designed, written, and then
    not adopted. It is kept as process evidence, not as part of the working
    system.

    Three candidate forms were on the table once the interpolate-and-repaint
    recipe had been validated (15 July entry in docs/PROCESS_LOG.md): a single
    full-axis video scrubbed by c, this per-bridge transition library with
    random pairing, and the bin-breathing crossfade already live in
    TouchDesigner. The full-axis video won on interaction feel, and the
    installation runs on comfyui_workflows/full_axis_v2_production.json.

    This script therefore never produced anything — latent_atlas/
    transitions_manifest.json does not exist. Nothing downstream reads it, and
    deleting it would break nothing; it is here because a rejected design is
    part of the record of how the final one was chosen.

For every adjacent bin pair (7 bridges), every source image gets
TARGETS_PER_IMAGE random destination images in the next bin. Each pair is
submitted to ComfyUI as a RIFE interpolation job (2 stills -> MULTIPLIER
frames), saved as a PNG sequence under ComfyUI's output folder:

    output/transitions/c0.0-c0.2/src01_dst05/frame_00001_.png ...

The pairing plan is written to latent_atlas/transitions_manifest.json with a
fixed random seed, so the bake is reproducible and TouchDesigner can read the
same plan to know which bridges exist.

Prerequisites, were it ever run:
  * ComfyUI running at --comfy-url with ComfyUI-Frame-Interpolation installed
  * --comfy-input pointing at ComfyUI's input folder (images are copied there)

Note that even --dry-run has a side effect: it writes the manifest. Nothing
reads that file, so if you run it to inspect the plan, delete the manifest
afterwards rather than leaving a rejected route's artefact in latent_atlas/.

    python3 training/bake_transitions.py            # bake everything
    python3 training/bake_transitions.py --dry-run  # just write the plan
"""

import argparse
import json
import random
import shutil
import time
import urllib.request
from pathlib import Path

# ---- config ----------------------------------------------------------------
# Both of these describe one particular machine's ComfyUI install, so they are
# defaults rather than constants — override with --comfy-url / --comfy-input.
# The port is the ComfyUI desktop default; if it differs, it is shown under
# Settings → Server Config.
DEFAULT_COMFY_URL = "http://127.0.0.1:8000"
DEFAULT_COMFY_INPUT = Path.home() / "Documents" / "ComfyUI-Shared" / "input"
ROOT = Path(__file__).resolve().parent.parent
ATLAS = ROOT / "latent_atlas"
BINS = ["0.0", "0.2", "0.4", "0.5", "0.6", "0.7", "0.8", "1.0"]
TARGETS_PER_IMAGE = 3
MULTIPLIER = 16          # frames per transition
RIFE_CKPT = "rife49.pth"
SEED = 42
# -----------------------------------------------------------------------------


CHECKPOINT = "v1-5-pruned-emaonly.safetensors"
LORA = "inkwb_v7.safetensors"
UPSCALER = "RealESRGAN_x2plus.pth"
POS_PROMPT = "inkwb, black ink in water, ink texture"
NEG_PROMPT = "blurry, distorted, frame, border"
DENOISE = 0.24


def workflow(img_a: str, img_b: str, prefix: str) -> dict:
    """Full validated recipe (same as full_axis_v1.json): the pair is repainted
    through the v7 LoRA, upscaled and sharpened, THEN interpolated, with
    per-frame film grain last. Repaint-before-interpolate: 2 sampler runs per
    pair instead of MULTIPLIER*2, zero flicker risk."""
    return {
        "1": {"class_type": "LoadImage", "inputs": {"image": img_a}},
        "2": {"class_type": "LoadImage", "inputs": {"image": img_b}},
        "3": {"class_type": "ImageBatch",
              "inputs": {"image1": ["1", 0], "image2": ["2", 0]}},
        # img2img repaint (unify texture with the trained aesthetic)
        "10": {"class_type": "CheckpointLoaderSimple",
               "inputs": {"ckpt_name": CHECKPOINT}},
        "11": {"class_type": "LoraLoaderModelOnly",
               "inputs": {"model": ["10", 0], "lora_name": LORA,
                          "strength_model": 1.0}},
        "12": {"class_type": "CLIPTextEncode",
               "inputs": {"clip": ["10", 1], "text": POS_PROMPT}},
        "13": {"class_type": "CLIPTextEncode",
               "inputs": {"clip": ["10", 1], "text": NEG_PROMPT}},
        "14": {"class_type": "VAEEncode",
               "inputs": {"pixels": ["3", 0], "vae": ["10", 2]}},
        "15": {"class_type": "KSampler",
               "inputs": {"model": ["11", 0], "positive": ["12", 0],
                          "negative": ["13", 0], "latent_image": ["14", 0],
                          "seed": SEED, "steps": 20, "cfg": 7.0,
                          "sampler_name": "euler", "scheduler": "karras",
                          "denoise": DENOISE}},
        "16": {"class_type": "VAEDecode",
               "inputs": {"samples": ["15", 0], "vae": ["10", 2]}},
        # upscale + sharpen
        "20": {"class_type": "UpscaleModelLoader",
               "inputs": {"model_name": UPSCALER}},
        "21": {"class_type": "ImageUpscaleWithModel",
               "inputs": {"upscale_model": ["20", 0], "image": ["16", 0]}},
        "22": {"class_type": "ImageSharpen",
               "inputs": {"image": ["21", 0], "sharpen_radius": 1,
                          "sigma": 1.0, "alpha": 0.2}},
        # interpolate, then per-frame grain
        "30": {"class_type": "RIFE VFI",
               "inputs": {"frames": ["22", 0], "ckpt_name": RIFE_CKPT,
                          "multiplier": MULTIPLIER,
                          "clear_cache_after_n_frames": 10,
                          "fast_mode": False, "ensemble": True,
                          "scale_factor": 1.0}},
        "31": {"class_type": "ProPostFilmGrain",
               "inputs": {"image": ["30", 0], "gray_scale": True,
                          "grain_type": "Fine", "grain_sat": 0.0,
                          "grain_power": 0.12, "shadows": 0.2, "highs": 0.2,
                          "scale": 1.0, "sharpen": 0, "src_gamma": 1.0,
                          "seed": SEED}},
        "40": {"class_type": "SaveImage",
               "inputs": {"images": ["31", 0], "filename_prefix": prefix}},
    }


def submit(graph: dict, comfy_url: str) -> str:
    req = urllib.request.Request(
        comfy_url + "/prompt",
        data=json.dumps({"prompt": graph}).encode(),
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())["prompt_id"]


def wait(prompt_id: str, comfy_url: str, timeout: int = 600) -> None:
    t0 = time.time()
    while time.time() - t0 < timeout:
        with urllib.request.urlopen(comfy_url + f"/history/{prompt_id}") as r:
            hist = json.loads(r.read())
        if prompt_id in hist:
            return
        time.sleep(2)
    raise TimeoutError(prompt_id)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true",
                    help="write the pairing plan without submitting jobs")
    ap.add_argument("--limit", type=int, default=0,
                    help="only bake the first N pairs (smoke test)")
    ap.add_argument("--comfy-url", default=DEFAULT_COMFY_URL,
                    help=f"ComfyUI server address (default {DEFAULT_COMFY_URL})")
    ap.add_argument("--comfy-input", type=Path, default=DEFAULT_COMFY_INPUT,
                    help="ComfyUI's input folder; LoadImage reads from here")
    args = ap.parse_args()

    rng = random.Random(SEED)
    plan = []
    for a, b in zip(BINS, BINS[1:]):
        srcs = sorted((ATLAS / f"c_{a}").glob("*.png"))
        dsts = sorted((ATLAS / f"c_{b}").glob("*.png"))
        for s in srcs:
            for d in rng.sample(dsts, min(TARGETS_PER_IMAGE, len(dsts))):
                plan.append({
                    "bridge": f"c{a}-c{b}",
                    "src": s.name, "dst": d.name,
                    "dir": f"transitions/c{a}-c{b}/"
                           f"src{s.name.split('_')[0]}_dst{d.name.split('_')[0]}",
                })

    manifest = ATLAS / "transitions_manifest.json"
    manifest.write_text(json.dumps(
        {"seed": SEED, "multiplier": MULTIPLIER, "ckpt": RIFE_CKPT,
         "pairs": plan}, indent=1), encoding="utf-8")
    print(f"plan: {len(plan)} pairs -> {manifest}")
    if args.dry_run:
        return

    if args.limit:
        plan = plan[:args.limit]
    for i, p in enumerate(plan, 1):
        a_bin, b_bin = p["bridge"].replace("c", "").split("-")
        src = ATLAS / f"c_{a_bin}" / p["src"]
        dst = ATLAS / f"c_{b_bin}" / p["dst"]
        # LoadImage reads from ComfyUI's input folder; copy with unique names
        ia = f"bake_{p['bridge']}_{p['src']}"
        ib = f"bake_{p['bridge']}_{p['dst']}"
        shutil.copy(src, args.comfy_input / ia)
        shutil.copy(dst, args.comfy_input / ib)
        pid = submit(workflow(ia, ib, p["dir"] + "/frame"), args.comfy_url)
        wait(pid, args.comfy_url)
        print(f"[{i}/{len(plan)}] {p['dir']}")

    print("done — sequences in ComfyUI output/transitions/")


if __name__ == "__main__":
    main()
