# Ink Dataset

[中文](README.zh-CN.md) | **English**

Photographic dataset of black ink in water, captured for LoRA training. The trained model generates the pre-baked latent atlas used by the TouchDesigner system (see [project README](../README.md)).

## Structure

```text
ink_dataset/
├── 01_pure_diffusion/   # 24 images — ink spreading freely across still water (top-down)
├── 02_layered_ink/      # 24 images — ink plumes settling into suspended layers (side view)
├── 03_disturbed_ink/    # 24 images — turbulent, agitated ink
└── 04_gathering_ink/    # 29 images — ink condensing into dense masses
```

101 JPEG images, 4320×4320, monochrome. Each image has a same-name `.txt` caption file (kohya / AI Toolkit format).

## Sequences

Filenames encode experiment sequences: `<experiment>-<frame>.jpg`. For example `1-1.jpg` → `1-4.jpg` in `01_pure_diffusion` is one diffusion process over time. Frame order within a sequence maps to a temporal phase, which is written into the caption.

## Caption format

```
inkwb, <state phrase>, <phase phrase>, <per-image morphology>, monochrome, high contrast
```

Example (`01_pure_diffusion/1-2.txt`):

```
inkwb, black ink diffusing freely across still water, developing phase of diffusion, ink flooding in from the upper left, marbled ripples along the lower right edge, monochrome, high contrast
```

| Part | Purpose |
|---|---|
| `inkwb` | Trigger word (Inkward Bound). A meaningless token that absorbs the overall visual style. |
| State phrase | One per folder: diffusing freely / layered suspended / turbulent agitated / gathering and condensing. Aligns with the installation's five system states. |
| Phase phrase | `early / developing / advanced / final phase of <process>`, assigned by frame position within each sequence. Enables temporal control at generation time. |
| Morphology | Hand-written per image: shape, direction, density, negative space. Only these described variations remain promptable after training. |
| Style tags | `monochrome, high contrast` shared across all captions. |

## Mapping to the c value

At generation time, captions navigate the convergence value axis, for example:

- Low c (autonomous / disturbance): `inkwb, turbulent agitated black ink in water, developing phase of disturbance`
- Mid c (latent search): `inkwb, black ink gathering and condensing in water, developing phase of gathering`
- High c (temporary return): `inkwb, black ink gathering and condensing in water, final phase of gathering`

## Notes

- Near-black frames (e.g. `01/1-4`, `01/6-4`) are kept as `final phase of diffusion`; the phase phrase gives them semantic value.
- Captions written in natural language for Flux / SDXL-style training; compatible with tag-based trainers.
