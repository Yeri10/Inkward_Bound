#!/usr/bin/env python3
"""Convert ink_dataset (kohya-style .txt captions) into the diffusers
text-to-image format used by train_text_to_image_lora.py:

    training/dataset/
    ├── images/          # resized copies of the source photographs
    └── metadata.jsonl   # {"file_name": "images/...", "text": "<caption>"}

Source images stay untouched in ink_dataset/. Run from the repository root
or from training/:

    python3 training/prepare_dataset.py
"""

import argparse
import json
import re
from pathlib import Path

from PIL import Image

MAX_SIDE = 1024  # training resolution is 512; 1024 copies keep detail and stay small

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "ink_dataset"
DST = ROOT / "training" / "dataset"
IMG_DST = DST / "images"

CATEGORIES = [
    "01_pure_diffusion",
    "02_layered_ink",
    "03_disturbed_ink",
    "04_gathering_ink",
]


PHASE_RE = re.compile(r"^(early|developing|middle|advanced|final) phase of \w+$")
STYLE_PARTS = {"monochrome", "high contrast"}

# v5: the 01 top-down aesthetic (pale field + pooled blob) was entangled with the
# container phrase — prompting without it recalled wispy threads, prompting with
# it produced photos of basins. Dropping the phrase that appears on EVERY 01
# image lets "top-down view" itself absorb the pale-basin look (v1 lesson:
# shared un-named features bind to the remaining tokens). "curved basin rim
# visible" only appears where the rim is prominent, so it stays as a negatable
# switch. The 01 category is also duplicated to strengthen the top-down signal.
V5_DROP_01 = "inside a shallow pale basin"
V5_WEIGHT_01 = 2


def trim_caption(caption: str) -> str:
    """v4 experiment: drop the abstract phase phrase (the measured density phrase
    carries the temporal axis) and the dataset-wide style tags (absorbed by the
    trigger word). The source .txt files stay untouched."""
    parts = caption.split(", ")
    parts = [p for p in parts if not PHASE_RE.match(p) and p not in STYLE_PARTS]
    return ", ".join(parts)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--trim", action="store_true",
                    help="drop phase phrases and style tags from captions (v4 experiment)")
    ap.add_argument("--trim-style", action="store_true",
                    help="v6: drop only the constant style tags, KEEP the phase phrases (temporal axis)")
    ap.add_argument("--v5", action="store_true",
                    help="v5: drop the shared basin phrase from 01 captions and duplicate the 01 category ×2")
    args = ap.parse_args()

    IMG_DST.mkdir(parents=True, exist_ok=True)
    records = []

    for cat in CATEGORIES:
        for jpg in sorted((SRC / cat).glob("*.jpg")):
            txt = jpg.with_suffix(".txt")
            if not txt.exists():
                raise SystemExit(f"Missing caption for {jpg}")
            caption = txt.read_text(encoding="utf-8").strip()
            if not caption.startswith("inkwb"):
                raise SystemExit(f"Caption does not start with trigger word: {txt}")
            if args.trim:
                caption = trim_caption(caption)
            elif args.trim_style:
                caption = ", ".join(p for p in caption.split(", ") if p not in STYLE_PARTS)
            if args.v5 and cat == "01_pure_diffusion":
                caption = ", ".join(p for p in caption.split(", ") if p != V5_DROP_01)

            stem = re.sub(r"[^\w-]", "_", f"{cat}_{jpg.stem}")
            out_name = f"images/{stem}.jpg"
            out_path = DST / out_name

            with Image.open(jpg) as im:
                im.draft("RGB", (MAX_SIDE, MAX_SIDE))
                im = im.convert("RGB")
                im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
                im.save(out_path, "JPEG", quality=92)

            records.append({"file_name": out_name, "text": caption})

            # v5 weighting: physical duplicate copies so the imagefolder loader
            # counts the 01 category twice (duplicate file_name rows are unsafe).
            if args.v5 and cat == "01_pure_diffusion":
                for w in range(2, V5_WEIGHT_01 + 1):
                    dup_name = f"images/{stem}_w{w}.jpg"
                    Image.open(out_path).save(DST / dup_name, "JPEG", quality=92)
                    records.append({"file_name": dup_name, "text": caption})

    with open(DST / "metadata.jsonl", "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print(f"Wrote {len(records)} records to {DST / 'metadata.jsonl'}")


if __name__ == "__main__":
    main()
