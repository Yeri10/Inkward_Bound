# Inkward Bound — Dataset Capture and Production Log

[中文](DATASET_CAPTURE_LOG.zh-CN.md) | **English**

## Purpose

This document records the production of any photographed, filmed, scanned or otherwise captured dataset used by Inkward Bound. It provides evidence of work that is not visible in source-code commits: planning, setup, capture sessions, rejected material, selection criteria, processing, permissions and the relationship between the dataset and the final interactive system.

The repository now contains eight dataset contact-sheet screenshots documenting ink-diffusion experiments conducted on 22, 26 and 29 June 2026. Raw photographs or videos, complete file counts and the capture location are not yet stored in the repository, so unknown fields remain marked `TBC`.

## Dataset overview

| Field | Record |
| --- | --- |
| Working dataset title | Ink Diffusion Material Study |
| Purpose within Inkward Bound | Morphological references for ink visuals, Latent Atlas selection and TouchDesigner state design |
| Type of material captured | Black ink diffusing, gathering, stirring and being drawn through water |
| Capture period | 22, 26 and 29 June 2026; contact sheets assembled 1 July 2026 |
| Location(s) | TBC |
| Participant(s) / subject(s) | No people; water, ink, salt/salt water, hand soap and stirring tools |
| Capture device(s) | Camera and phone |
| Lighting | Two phone lights; soft evening light |
| File formats | Raw format TBC; process evidence stored as PNG contact sheets |
| Person responsible | TBC |
| Storage location | Raw-material location TBC; public previews in `docs/images/dataset/` |

## Capture intention

The capture compares how different materials and forces alter ink diffusion in water:

- Compare edges, density and diffusion under plain water, salt/salt water and hand-soap conditions.
- Compare natural diffusion, outward stirring, small central stirring and pipette actions.
- Test monochrome contrast and detail using a camera with two phone lights and a phone under soft evening light.
- Collect representative forms for ink-visual research and later Latent Atlas/TouchDesigner tests.

## Capture plan

| Item | Planned approach | Reason | Status |
| --- | --- | --- | --- |
| Subject / material | Water, ink, salt/salt water, hand soap, chopsticks/small stick and pipette | Produce varied diffusion, gathering and disturbance | Documented |
| Camera / sensor | Camera and phone | Compare capture approaches | Documented |
| Resolution / frame rate | TBC | TBC | Not documented |
| Lighting | Two phone lights; soft evening light | Compare controlled fill and available soft light | Documented |
| Background / environment | Transparent vessel and bright background; location TBC | Keep ink contours visible | Partly documented |
| Action list | Natural drop, outward stirring, small central stirring, drawing/releasing ink with pipette | Produce different directions and densities | Documented |
| Naming and storage | Raw naming TBC; contact sheets renamed consistently | Keep process evidence traceable | Partly documented |
| Consent / permissions | No people; location and material permissions TBC | Record public-use conditions | TBC |

## Session index

Add one row immediately after each session.

| Session | Date | Location | Files captured | Selected | Main outcome | Evidence |
| --- | --- | --- | ---: | ---: | --- | --- |
| 01 | 22 June 2026 | TBC | TBC | Representative frames organised | Camera + two phone lights; diffusion and stirring | Contact sheets 03, 05 |
| 02 | 26 June 2026 | TBC | TBC | Representative frames organised | Phone/camera; salt, stirring tools, pipette and small stick | Contact sheets 01, 02, 04, 06, 07 |
| 03 | 29 June 2026 | TBC | TBC | Representative frames organised | Phone + soft evening light; hand soap, pipette and local stirring | Contact sheets 04, 08 |

## Detailed session record

### Session 01 — Camera lighting and baseline diffusion

**Date:** 22 June 2026  
**Device:** Camera  
**Lighting:** Two phone lights  
**Materials:** Water and ink; water, salt/salt water and ink; chopsticks  
**Methods:** Natural diffusion and outward stirring

This session tested baseline ink forms under controlled fill lighting. Representative frames include fine smoke-like tendrils, dense pools gathered at the bottom and directional clouds produced by stirring. Raw file count, lens settings and location remain TBC.

**Evidence:** [Contact sheet 03](images/dataset/2026-07-01-ink-dataset-contact-sheet-03.png), [Contact sheet 05](images/dataset/2026-07-01-ink-dataset-contact-sheet-05.png)

### Session 02 — Salinity, stirring-tool and pipette variables

**Date:** 26 June 2026  
**Devices:** Phone and camera  
**Lighting:** Soft evening light and two phone lights  
**Materials:** Water, ink, salt/salt water, chopsticks, small stick and pipette  
**Methods:** Natural diffusion, outward stirring, small central stirring and drawing/releasing ink with a pipette

This session expanded the variables. Salt and salt water altered ink boundaries and gathering; chopsticks and a small stick created different scales of mechanical disturbance; the pipette produced concentrated injection or drawing effects. Representative frames range from smooth black masses to thin tendrils, curls and cloud forms.

**Evidence:** [Contact sheet 01](images/dataset/2026-07-01-ink-dataset-contact-sheet-01.png), [02](images/dataset/2026-07-01-ink-dataset-contact-sheet-02.png), [04](images/dataset/2026-07-01-ink-dataset-contact-sheet-04.png), [06](images/dataset/2026-07-01-ink-dataset-contact-sheet-06.png), [07](images/dataset/2026-07-01-ink-dataset-contact-sheet-07.png)

### Session 03 — Hand-soap and local-disturbance tests

**Date:** 29 June 2026  
**Device:** Phone  
**Lighting:** Soft evening light  
**Materials:** Water, ink, hand soap, salt, small stick and pipette  
**Methods:** Natural diffusion, small central stirring and pipette actions

This session introduced hand soap and repeated pipette and local-stirring methods to observe how a surfactant and local force affect ink contours. The selected frames add thinner, more dispersed and locally gathered forms. Original settings and material quantities remain TBC.

**Evidence:** [Contact sheet 04](images/dataset/2026-07-01-ink-dataset-contact-sheet-04.png), [08](images/dataset/2026-07-01-ink-dataset-contact-sheet-08.png)

### 1 July 2026 — Contact-sheet assembly

Representative frames from the three experiment dates were assembled into eight screenshots labelled with device, lighting, materials, method and date. The screenshots were created between 21:35 and 21:36 BST on 1 July; they document earlier experiments and do not indicate that capture occurred on 1 July.

## File organisation and naming

Keep private or high-volume raw media outside the public Git repository. A suggested working structure is:

```text
dataset/
├── raw/          # Original, unchanged captures
├── selected/     # Approved source files
├── processed/    # Cropped, cleaned, labelled or converted outputs
├── metadata/     # Shot lists, labels and checksums
└── previews/     # Small images suitable for process documentation
```

Suggested filename format:

```text
YYYYMMDD_session##_subject##_take##_description.ext
```

Never overwrite raw files. Record processing as a reproducible step or keep the original and processed outputs side by side.

## Selection and processing log

| Date | Source range | Action | Tool / settings | Output | Reason |
| --- | --- | --- | --- | --- | --- |
| 1 July 2026 | Experiments from 22, 26 and 29 June | Selected representative frames and added device, lighting, material, method and date labels | Layout tool and export settings TBC | Eight PNG contact sheets | Create publicly reviewable evidence of dataset production |

For each stage, state the criteria used to exclude or retain material. Examples include focus, exposure, framing consistency, movement visibility, duplication, permission status and relevance to the intended interaction.

## Permissions, privacy and data handling

- [x] The dataset contains no people or identifying information.
- [x] Current public previews contain only liquid and material experiments.
- [ ] Add location permission if the capture location requires it.
- [ ] Dataset licensing and reuse conditions are recorded.
- [ ] Backup and deletion procedures are defined.

If no people are captured, replace participant consent notes with the relevant location, ownership, copyright or material-source permissions.

## Connection to the final work

Use this table to demonstrate how dataset production influenced the installation rather than documenting capture as an isolated activity.

| Dataset decision | Resulting system decision | Evidence |
| --- | --- | --- |
| Capture in high-contrast monochrome | Continue the installation's black-and-white language of ink appearing, diffusing and disappearing | Eight contact sheets |
| Vary salinity, surfactant and mechanical disturbance | Provide different edge, density and flow references for Latent Atlas and TouchDesigner states | Sessions 01–03 |
| Retain natural diffusion, stirring and pipette methods | Establish morphological references for stability, agitation, gathering and diffusion | Contact sheets 03–08; exact system mapping still to be tested |

## Evidence checklist

- [x] Capture materials and methods record
- [x] Equipment and lighting record
- [ ] Behind-the-scenes image
- [x] Contact sheets and representative frames
- [ ] Complete selection and rejection notes
- [ ] Processing/export settings
- [ ] Location, material-permission or licensing record where applicable
- [ ] Backup/storage record
- [ ] Link to the TouchDesigner or interface change informed by the dataset
- [ ] Reflection describing what changed after reviewing the material
