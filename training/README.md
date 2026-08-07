# LoRA Training

[中文](README.zh-CN.md) | **English**

Trains the `inkwb` LoRA on the [ink dataset](../ink_dataset/README.md), reusing the pipeline from [The-Latent-Mycelium](https://github.com/Yeri10/The-Latent-Mycelium) (SD 1.5 + diffusers LoRA, tested on Apple Silicon / MPS).

## Files

| File | Purpose |
|---|---|
| `Inkward Bound LoRA Training.ipynb` | End-to-end training notebook (same format as the Mycelium one): Environment Setup → Hardware Check → Dataset Validation → Training Configuration → Start Training → Inference Test → Result Packaging |
| `prepare_dataset.py` | Converts `ink_dataset/` (per-image `.txt` captions) into `training/dataset/` (resized images + `metadata.jsonl`, diffusers format) |
| `train_text_to_image_lora.py` | Official diffusers LoRA training script; the notebook re-downloads the version matching the installed diffusers, this copy is the offline fallback |
| `measure_ink_coverage.py` | Measures each image's dark-pixel ratio and writes the five-level density phrase into its caption |
| `generate_atlas.py` | Batch-generates latent-atlas candidates along the c-value grid (6 bins × N seeds) into `atlas_candidates/`, with a `manifest.jsonl` recording every prompt/seed |
| `bake_transitions.py` | Drives ComfyUI's API to bake interpolated transitions between curated atlas stills, from a seeded, manifest-recorded plan |
| `comfyui_workflows/` | Exported ComfyUI graphs for the atlas→video stage (see the note below on `full_axis_v1.json`) |
| `dataset/` | Generated training data, not committed to git (re-run `prepare_dataset.py` after caption changes) |
| `runs/` | Training outputs (weights, checkpoints, logs) |

## Environment

Use the `ml-art` conda environment from The-Latent-Mycelium (`environment.yml` there):

```bash
conda activate ml-art
```

## Steps

1. Prepare the dataset (re-run whenever captions change):

   ```bash
   python3 training/prepare_dataset.py --trim-style --v5
   ```

   `--trim` drops phase phrases and style tags (v4); `--v5` drops the shared basin phrase from the 01 captions and duplicates the 01 category ×2 (decoupling the top-down pooled-blob look from the container words).

2. Launch training from the repository root:

   ```bash
   accelerate launch training/train_text_to_image_lora.py \
     --pretrained_model_name_or_path runwayml/stable-diffusion-v1-5 \
     --train_data_dir training/dataset \
     --resolution 512 --center_crop \
     --train_batch_size 1 --gradient_accumulation_steps 4 \
     --num_train_epochs 12 --learning_rate 5e-5 \
     --lr_scheduler constant --lr_warmup_steps 0 \
     --rank 16 --seed 42 \
     --checkpointing_steps 100 \
     --validation_prompt "inkwb, black ink gathering and condensing in water, final phase of gathering, side view, a dense black mound with a twisting tendril column above, monochrome, high contrast" \
     --validation_epochs 2 --num_validation_images 2 \
     --report_to tensorboard \
     --output_dir training/runs/inkwb_lora_v7
   ```

   Do not add `--random_flip`: captions encode left/right positions.

3. Test the weights (`training/runs/inkwb_lora_v7/pytorch_lora_weights.safetensors`) by loading them with `StableDiffusionPipeline.load_lora_weights`, then sweep the caption vocabulary: state phrase × phase phrase × viewpoint (see [ink_dataset README](../ink_dataset/README.md) for the c-value mapping).

## Training versions (v1 → v7)

Seven retrains, each triggered by a specific diagnosed failure rather than routine iteration. Full detail and reasoning for every round lives in [`docs/PROCESS_LOG.md`](../docs/PROCESS_LOG.md) (6–14 July 2026 entries); this table is the short version.

| Version | Problem it addressed | What changed | Result |
|---|---|---|---|
| v1 | Baseline first run | Reused The-Latent-Mycelium hyperparameters as-is, no caption changes yet | Container features from the capture setup (glass walls, water-surface lines, bubbles) leaked into the trigger word — the model had absorbed the photography setup, not just the ink |
| v2 | v1's container leakage | Bound container features to explicit caption words (`inside a shallow pale basin` / `inside a clear water tank`) and added a negative prompt | Container features became promptable and excludable, but the four phase words still produced near-identical images at a fixed seed — the phase axis was flat |
| v3 | Flat, unanchored phase axis | Wrote `measure_ink_coverage.py`: measures each image's dark-pixel ratio and auto-inserts one of five density phrases | Phase axis mildly improved, but at some seeds the four states collapsed into near-identical images. The working hypothesis at the time was that the long shared photographic suffix was diluting the state phrase — v4 was trained to test it, and the real cause turned out to lie elsewhere (see the v4 row) |
| v4 | Seed-dependent state collapse | Trimmed captions (`--trim`): dropped phase phrases and style tags from training data, cutting the longest caption from ~70 to ~61 CLIP tokens | v4 was adopted and the atlas script switched onto its weights, but at a fixed seed the matrices are nearly indistinguishable from v3 (see the evidence images below) — deleting words from captions proved a weak lever. The collapse it was meant to cure was later traced to the generation side rather than the weights: every bin had been sampling from the same initial noise, and giving each bin its own seed range recovered the axis without another retrain (9 July entries) |
| v5 | Not the leftover from v4 — that one turned out not to need a retrain. A different ceiling: top-down (c 0.0) diffusion could not be recalled without also summoning literal basins, bowls and drains, and no combination of already-trained vocabulary got past it, so the fix had to move down to the data level | Dropped the shared basin phrase from all 01 captions and weighted the 01 category ×2 (`--v5`) | `top-down view` recalled the pale-field pooled-blob look without any container word in the prompt for the first time — but only on a minority of seeds; the atlas c 0.0 batch still returned bowls, glass rings and graphic collages on most, so the bin stayed dependent on curation |
| v6 | c 0.0 still not fully natural; c 0.6 couldn't recall fine granular particles | Purged `marbled` from 01 captions, explicitly named the solid opaque blob, added granular-particle wording to seven 03 frames, restored phase phrases | The four states held cleanly, but neither target was fully reached. c 0.0 still needed a further generation-side prompt rewrite after retraining — composition has to be assembled from trained phrases one by one, not conjured by retraining alone. And c 0.6 kept rendering its particles too coarse, missing the fine mist of the source photographs: the granular phrase had been added to only seven 03 frames while the other seventeen still carried the same generic action words, so there was nothing in the vocabulary for the model to separate them by. That is what v7 set out to fix |
| v7 | Every category used generic, shared action words (e.g. all 24 `disturbed_ink` frames said "turbulent, murky, churned") — a model can't separate frames whose captions don't differ | Rewrote all 101 captions around the literal physical process each category documents, stage by stage (e.g. 03: strands torn apart → dissolving into particles → hazy grain fog → uniform murk) | The fine-grain mist became reliably generatable at c 0.6 for the first time. This is the production LoRA: 192 candidates were curated down to the final 66-image latent atlas |

**Evidence, one image per turning point:**

- v1 — container leakage: ![v1 container leak](../docs/images/2026-07-06-inkwb-lora-v1-baseline-01-container-leak.png)
- v2 — after caption binding + negative prompt: ![v2 preview sheet](../docs/images/2026-07-06-inkwb-lora-v2-preview-sheet.png)

The next three entries are the same seed (42) and the same prompts under v3, v4 and v5, so they can be read row against row. (Seed 42 was one of the seeds where v3's states held; the seed-123 matrices, where they collapsed, are linked in the 6 and 9 July entries of [`docs/PROCESS_LOG.md`](../docs/PROCESS_LOG.md).)

- v3 — the four states are distinguishable and the phase axis has picked up a mild progression from the measured density phrases, but the **diffusion** row carries a pebbled, mottled texture across its upper left that is nowhere in the source photographs ![v3 matrix seed 42](../docs/images/2026-07-06-inkwb-lora-v3-matrix-seed42.png)
- v4 — same seed, same prompts, captions trimmed: essentially unchanged from v3, row for row, the pebbled texture included ![v4 matrix seed 42](../docs/images/2026-07-09-inkwb-lora-v4-matrix-seed42.png)
- v5 — same seed again, and this time the difference is legible precisely because it is confined to one row: in the **diffusion** row (the top-down 01 category, the only captions `--v5` touched) the pebbled texture is gone, replaced by smooth gray washes and a consolidated blob on a clean pale field. Rows 2–4 (settling / disturbance / gathering, categories 02–04, captions untouched) stay as they were, which is what makes them useful — they are the control showing the change came from the caption edit rather than from the sampling. Read the three images together and the pattern is that removing words moved nothing, while re-aiming them moved exactly the row they were aimed at. Note that this is the evaluation matrix at one seed; under the longer atlas prompts the same bin was still unreliable across seeds, which is what the v5 row records ![v5 matrix seed 42](../docs/images/2026-07-09-inkwb-lora-v5-matrix-seed42.png)
- v6 — c 0.0's curved-texture rollback, second round: ![v6 c0.0 curved texture](../docs/images/2026-07-13-v6-c00-curved-texture-round2.jpg)
- v7 — recall tests, one image per coined phrase, after fixing a shared-seed bug and transplanting proven prompts/negatives from `generate_atlas.py` (28 July 2026): ![v7 recall tests](../docs/images/2026-07-28-v7-recall-tests-round2.png)
- v7 — the final curated 66-image atlas: ![latent atlas final 66](../docs/images/2026-07-13-latent-atlas-final-66.jpg)

## Ink prompt vocabulary (v7)

Shared building blocks, used across every group in the Inference Test cell:

| Block | Value |
|---|---|
| Trigger word | `inkwb` |
| Style | `monochrome, high contrast` |
| Photo qualifier | `macro photograph, wet glossy ink, soft light` |
| Water anchor | `suspended in clear water` |
| Negative prompt | `tank walls, basin rim, bubbles, table edge, dark smears at the bottom edge, paper texture, ink on paper, photo border, dark frame edges` |

Per-category state phrase, viewpoint/container, and the four-stage physical-process phrases coined in the v7 caption rewrite (full reasoning in the 13 July 2026 entry of [`docs/PROCESS_LOG.md`](../docs/PROCESS_LOG.md)):

**01_pure_diffusion** — `black ink diffusing freely across still water` · `top-down view` · `inside a shallow pale basin`
- x-1: `black ink freshly poured into the still water, pooling into a solid opaque blob`
- x-2: `curved flowing soft gray ink washes spreading outward layer by layer around the dark mass`
- x-3: `gray washes overlapping layer upon layer, ink taking over most of the pale water`
- x-4: `washes merged into a nearly solid dark sheet covering the water`

**02_layered_ink** — `layered black ink suspended in water` · `side view` · `inside a clear water tank`
- x-1: `ink freshly injected into the water, a plume drifting down naturally`
- x-2: `translucent ink veils sinking gently, fine ink strands hanging between them, unfolding into layers`
- x-3: `veils and strands settling one over another, layered curtains of ink deepening`
- x-4: `settled ink layers merged into a dense dark depth, rounded ink droplets hanging alongside` (series 1: heavier injection, frame filled by this stage)

**03_disturbed_ink** — `turbulent agitated black ink in water` · `side view` · `inside a clear water tank`
- x-1: `ink strands torn apart by stirring, breaking into drifting fragments`
- x-2: `broken strands dissolving into countless tiny ink particles, a fine grain mist spreading`
- x-3: `fine ink particles dispersed evenly into a hazy grain fog`
- x-4: `particles dissolved into near-uniform dark murk, faint fine grain texture remaining`

**04_gathering_ink** — `black ink gathering and condensing in water` · `side view` · `inside a clear water tank` · two production methods
- Series 1–4 (pipette-drawn): `dispersed ink beginning to sink back, wisps drawn toward the dark mass below` → `ink clouds condensing downward, gathering into the dark mass` → `ink nearly regathered, the mass thickening at the bottom` → `ink regathered into a dense settled black mound, faint wisps curling above`
- Series 5–8 (reversed video): `spread ink beginning to retract, strands drawing inward` → `ink pulling inward and upward, strands coiling into the condensing mass` → `ink condensed into a single compact dark mass suspended in the clear water`

Shared across all four categories:

- Phase words: `early` / `developing` / `advanced` / `final` phase of `<process>`
- Measured density (5 levels, auto-assigned by `measure_ink_coverage.py` from each image's dark-pixel ratio): `sparse ink traces, mostly clear water` → `ink spreading across part of the frame` → `dense ink covering much of the frame` → `heavy ink covering most of the frame` → `ink almost filling the entire frame`

## Evaluation checklist

- Does `inkwb` reproduce the monochrome ink-in-water look?
- Do the four state phrases produce distinct morphologies?
- Do `early → final phase` prompts move along a plausible temporal axis?
- Do `top-down view` / `side view` switch the camera angle?

Once these hold, batch-generate the pre-baked latent atlas along the c-value grid and replace the placeholder images in the TouchDesigner atlas folders.

## From atlas to video (ComfyUI)

The curated atlas is a set of stills at fixed coordinates. Turning it into something the c-value can scrub continuously happens in ComfyUI, in one chain:

**11 keyframes** drawn from the curated atlas → **img2img repaint** through SD 1.5 + the v7 LoRA (denoise 0.24, seed fixed at 42 — a light repaint unifies texture across keyframes without flicker) → **RealESRGAN ×2** upscale with light sharpen → **RIFE ×32** interpolation (`fast_mode` off, `ensemble` on) → **film grain** applied *after* interpolation, so the grain sits per-frame instead of being smeared along the motion → **24 fps H.264**.

Repaint-before-interpolate was chosen over the reverse for cost (11 sampler runs rather than 400) and for zero flicker risk. Keyframe density is doubled in the early bins, because interpolation connects states but cannot invent process: the unfolding of diffusion has visual content that no morph supplies. Full reasoning is in the 14–15 July entries of [`docs/PROCESS_LOG.md`](../docs/PROCESS_LOG.md).

The output is five continuous axis videos, each re-encoded to HAP Q for random-access scrubbing in TouchDesigner — H.264 is inter-frame coded, so scrubbing to an arbitrary frame forces a decode walk back to the nearest keyframe (23 July entry).

Two graphs are kept in `comfyui_workflows/`:

| File | What it is |
|---|---|
| `full_axis_v2_production.json` | **The graph that produced the five axis videos.** 95 `LoadImage` nodes batched into five chains, plus a `ColorMatchV2` pass. Carries the 24 July tuning: film-grain seed `fixed` and Video Combine `crf` 14 |
| `full_axis_v1.json` | The first single-chain experiment, exported 14 July — 11 keyframes, one output. Kept as the record of the test that validated the recipe, not for reproduction |

The difference between them is worth knowing before re-running either: v1 still has the film-grain seed on `randomize`, which makes the image boil whenever a scrub lingers on one frame — the failure the 24 July entry diagnosed and fixed.

## Prompt groups (Inference Test cell)

The `prompt_groups` dict in the notebook's Inference Test cell runs five groups, each isolating one thing to check. Exact wording lives in the notebook (it changes as tuning continues); this table only tracks what each group is for and whether it currently carries extra anchor phrases beyond the bare state/phase words.

| Group | Tests | Status |
|---|---|---|
| `baseline` | Whether `inkwb` alone reproduces the basic ink-in-water look | Unmodified |
| `state_control` | Whether the four state phrases (diffusing / settling / disturbed / gathering) alone produce distinct morphologies | Unmodified — briefly patched with anchors on two of the four lines, then reverted, because a partial patch left the group internally inconsistent (two enriched, two bare), which confounds the very comparison this group exists to make. Anchored-vocabulary testing belongs to `v7_recall`; this group stays a clean bare-word test |
| `phase_control` | Whether `early → final phase` (paired with measured-density phrases) moves along a plausible temporal axis | Unmodified |
| `v7_recall` | Whether the per-category physical-process phrases coined for the v7 caption rewrite recall on their own | Modified twice — first pass added a preceding-stage anchor plus `{PHOTO}` to all four lines, after the 01 (pure_diffusion) line was found rendering as a graphic/engraving look rather than photographic. Second pass (28 July) replaced lines 02–04 with the prompt/negative recipes transplanted from `generate_atlas.py`, including a line-specific negative on 03 to recall the fine-grain fog look |
| `viewpoint_control` | Whether `top-down view` / `side view` alone switch the camera angle | Line 0 (top-down) is no longer bare — it was replaced with the full atlas c 0.0 prompt and negative (transplanted from `generate_atlas.py`) to fix a striped/marbled result. As of the 28 July re-test it shows some thin radiating structure rather than a fully flat blob, but the artist reviewed the result and accepted it as good enough — no further prompt tuning planned for this line. Line 1 (side view) is unchanged and still bare |

Also note: the sampling loop now seeds each image with `seed + index` instead of a single shared `seed`, so images are no longer generated from identical initial noise — differences between prompts in the same group should no longer be masked by a shared composition. `NEGATIVE_OVERRIDES` and `GUIDANCE_OVERRIDES` are now keyed by `(group, line_idx)` rather than by group alone, so a per-line override (e.g. `v7_recall` line 03's fog negative) no longer leaks into other lines of the same group.
