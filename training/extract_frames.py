#!/usr/bin/env python3
"""Extract evenly spaced square frames from the top-down capture videos to
expand the 01_pure_diffusion category for v6 training.

    python3 training/extract_frames.py --per-video 8
    python3 training/extract_frames.py --per-video 8 --start-skip 2 --end-skip 2

Videos:  ink_dataset/_source_videos/01_pure_diffusion/*.mp4|mov
Output:  ink_dataset/_frame_candidates/01_pure_diffusion/<video-stem>-f<n>.jpg
         (center-cropped square, long side capped at 2048)

The output folder is a staging area: review the frames, delete the bad ones,
then move the keepers into ink_dataset/01_pure_diffusion/ with sequence names
before captioning.

Requires opencv:  pip install opencv-python
"""

import argparse
from pathlib import Path

import cv2

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "ink_dataset" / "_source_videos" / "01_pure_diffusion"
DST = ROOT / "ink_dataset" / "_frame_candidates" / "01_pure_diffusion"
MAX_SIDE = 2048


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-video", type=int, default=8, help="frames per video")
    ap.add_argument("--start-skip", type=float, default=1.0, help="seconds to skip at the start")
    ap.add_argument("--end-skip", type=float, default=1.0, help="seconds to skip at the end")
    args = ap.parse_args()

    videos = sorted(p for p in SRC.iterdir()
                    if p.suffix.lower() in {".mp4", ".mov", ".avi", ".m4v"})
    if not videos:
        raise SystemExit(f"No videos found in {SRC}")
    DST.mkdir(parents=True, exist_ok=True)

    for vid in videos:
        cap = cv2.VideoCapture(str(vid))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        n_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = n_frames / fps
        t0, t1 = args.start_skip, max(duration - args.end_skip, args.start_skip + 0.1)
        times = [t0 + (t1 - t0) * i / (args.per_video - 1) for i in range(args.per_video)] \
            if args.per_video > 1 else [(t0 + t1) / 2]

        for i, t in enumerate(times, 1):
            cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
            ok, frame = cap.read()
            if not ok:
                print(f"  ! failed to read {vid.name} at {t:.1f}s")
                continue
            h, w = frame.shape[:2]
            side = min(h, w)
            y0, x0 = (h - side) // 2, (w - side) // 2
            square = frame[y0:y0 + side, x0:x0 + side]
            if side > MAX_SIDE:
                square = cv2.resize(square, (MAX_SIDE, MAX_SIDE), interpolation=cv2.INTER_AREA)
            out = DST / f"{vid.stem}-f{i}.jpg"
            cv2.imwrite(str(out), square, [cv2.IMWRITE_JPEG_QUALITY, 95])
            print(f"{vid.name} {t:6.1f}s -> {out.name}")
        cap.release()

    total = len(list(DST.glob("*.jpg")))
    print(f"done. {total} frames in {DST}")


if __name__ == "__main__":
    main()
