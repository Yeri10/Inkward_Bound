#!/usr/bin/env python3
"""Measure the ink coverage of every ink_dataset image and write a visually
grounded density phrase into its caption.

Why: abstract phase words (early/developing/final) gave the model no visual
anchor, so the phase axis stayed flat in v1 and v2. Coverage-based density
phrases describe what actually changes across a sequence.

Coverage = fraction of pixels darker than DARK_THRESHOLD (0-255 grayscale).
The phrase is inserted before the morphology part; existing density phrases
are replaced, so the script is safe to re-run.

    python3 training/measure_ink_coverage.py
"""

import re
from pathlib import Path

from PIL import Image

DARK_THRESHOLD = 100  # grayscale value below which a pixel counts as ink
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "ink_dataset"

CATEGORIES = [
    "01_pure_diffusion",
    "02_layered_ink",
    "03_disturbed_ink",
    "04_gathering_ink",
]

# (upper coverage bound, phrase)
BINS = [
    (0.15, "sparse ink traces, mostly clear water"),
    (0.40, "ink spreading across part of the frame"),
    (0.70, "dense ink covering much of the frame"),
    (0.90, "heavy ink covering most of the frame"),
    (1.01, "ink almost filling the entire frame"),
]
DENSITY_PHRASES = [p for _, p in BINS]


def coverage(path: Path) -> float:
    with Image.open(path) as im:
        im.draft("L", (256, 256))
        im = im.convert("L")
        hist = im.histogram()
    dark = sum(hist[:DARK_THRESHOLD])
    return dark / sum(hist)


def phrase_for(cov: float) -> str:
    for bound, phrase in BINS:
        if cov < bound:
            return phrase
    return BINS[-1][1]


def main() -> None:
    counts = {p: 0 for p in DENSITY_PHRASES}
    for cat in CATEGORIES:
        for jpg in sorted((SRC / cat).glob("*.jpg")):
            txt = jpg.with_suffix(".txt")
            parts = [p for p in txt.read_text(encoding="utf-8").strip().split(", ")
                     if p not in DENSITY_PHRASES]
            cov = coverage(jpg)
            phrase = phrase_for(cov)
            # insert before the morphology part: after trigger/state/phase/viewpoint
            # and any container-context phrases (which directly follow position 3)
            idx = 4
            while idx < len(parts) and parts[idx].startswith(("inside ", "curved ", "water surface", "reflective ")):
                idx += 1
            parts.insert(idx, phrase)
            txt.write_text(", ".join(parts), encoding="utf-8")
            counts[phrase] += 1
    for p, n in counts.items():
        print(f"{n:3d}  {p}")


if __name__ == "__main__":
    main()
