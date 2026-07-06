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


def main() -> None:
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

            stem = re.sub(r"[^\w-]", "_", f"{cat}_{jpg.stem}")
            out_name = f"images/{stem}.jpg"
            out_path = DST / out_name

            with Image.open(jpg) as im:
                im.draft("RGB", (MAX_SIDE, MAX_SIDE))
                im = im.convert("RGB")
                im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
                im.save(out_path, "JPEG", quality=92)

            records.append({"file_name": out_name, "text": caption})

    with open(DST / "metadata.jsonl", "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print(f"Wrote {len(records)} records to {DST / 'metadata.jsonl'}")


if __name__ == "__main__":
    main()
