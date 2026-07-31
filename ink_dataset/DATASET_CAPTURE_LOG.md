# Inkward Bound — Dataset Capture and Production Log

[中文](DATASET_CAPTURE_LOG.zh-CN.md) | **English**

## Purpose

This document records the production of any photographed, filmed, scanned or otherwise captured dataset used by Inkward Bound. It provides evidence of work that is not visible in source-code commits: planning, setup, capture sessions, rejected material, selection criteria, processing, permissions and the relationship between the dataset and the final interactive system.

The repository now contains eight dataset contact-sheet screenshots and processing-evidence images documenting ink-diffusion experiments conducted on 22, 26 and 29 June 2026. All sessions were captured at the artist's home. Raw video files themselves are not stored in the repository, but clip counts, selection numbers and the selection/processing workflow are now recorded below; a smaller set of fields (licensing and backup procedures) remain marked `TBC`.

## Dataset overview

| Field | Record |
| --- | --- |
| Working dataset title | Ink Diffusion Material Study |
| Purpose within Inkward Bound | Morphological references for ink visuals, Latent Atlas selection and TouchDesigner state design |
| Type of material captured | Black ink diffusing, gathering, stirring and being drawn through water |
| Capture period | 22, 26 and 29 June 2026; contact sheets assembled 1 July 2026 |
| Location(s) | The artist's home |
| Participant(s) / subject(s) | No people; water, ink, salt/salt water, hand soap and stirring tools |
| Capture device(s) | Two devices compared: camera and phone |
| Lighting | Two environments compared: controlled artificial light (phone lights in a darkened room) and natural soft light (window daylight / soft evening light) |
| File formats | Raw capture is video (MP4, 4K resolution); still frames were extracted from video by screenshotting selected moments, then cropped and converted to the monochrome JPEGs in `ink_dataset/`; process evidence stored as PNG contact sheets |
| Person responsible | Yerie (sole author of capture, selection and captioning) |
| Storage location | Public previews in `docs/images/dataset_record/`; raw video files are not included in the repository |

## Capture intention

The capture compares how different materials and forces alter ink diffusion in water:

- Compare edges, density and diffusion under plain water, salt/salt water and hand-soap conditions.
- Compare natural diffusion, outward stirring, small central stirring and pipette actions.
- Compare two lighting environments — controlled artificial light (phone lights in a darkened room) and natural soft light (window daylight and soft evening light) — for monochrome contrast and detail.
- Compare two capture devices — camera and phone — under both lighting environments.
- Collect representative forms for ink-visual research and later Latent Atlas/TouchDesigner tests.

## Capture plan

| Item | Planned approach | Reason | Status |
| --- | --- | --- | --- |
| Subject / material | Water, ink, salt/salt water, hand soap, chopsticks/small stick and pipette | Produce varied diffusion, gathering and disturbance | Documented |
| Camera / sensor | Camera and phone | Compare the two devices under both lighting environments | Documented |
| Resolution / frame rate | 4K resolution | Preserve fine diffusion detail for close crops | Documented |
| Lighting | Two environments compared: controlled artificial light (phone lights in a darkened room) and natural soft light (window daylight / soft evening light) | Compare controlled fill and available soft light | Documented |
| Background / environment | Transparent vessel and bright background at home | Keep ink contours visible | Partly documented |
| Action list | Natural drop, outward stirring, small central stirring, drawing/releasing ink with pipette | Produce different directions and densities | Documented |
| Naming and storage | Contact sheets renamed consistently | Keep process evidence traceable | Documented |
| Consent / permissions | No people; captured at the artist's home, so no location permission was required | Record public-use conditions | Documented |

## Session index

Add one row immediately after each session.

| Session | Date | Location | Files captured | Selected | Main outcome | Evidence |
| --- | --- | --- | ---: | ---: | --- | --- |
| 01 | 22 June 2026 | Home | 13 | 26 total (not split per session) | Camera + two phone lights; diffusion and stirring | Contact sheets 03, 05 |
| 02 | 26 June 2026 | Home | 35 | 26 total (not split per session) | Phone/camera; salt, stirring tools, pipette and small stick | Contact sheets 01, 02, 04, 06, 07 |
| 03 | 29 June 2026 | Home | 6 | 26 total (not split per session) | Phone + soft evening light; hand soap, pipette and local stirring | Contact sheets 04, 08 |

**Totals:** 54 video clips were recorded across the three sessions — 13 in Session 01, 35 in Session 02, 6 in Session 03. Of these, 26 clips were selected as source material, a selection rate of roughly 48% at the clip level. Selected clips were screenshotted at four clear, distinct phases per clip to produce still frames, which were then cropped and converted to monochrome — and retouched in Photoshop to remove visual interference such as air bubbles and tank-bottom reflections — to build the 101-image training set in `ink_dataset/`. The 26 selected clips are not tracked per session; only the aggregate total is recorded.

## Detailed session record

### Session 01 — Camera lighting and baseline diffusion

**Date:** 22 June 2026  
**Device:** Camera  
**Lighting:** Two phone lights  
**Materials:** Water and ink; water, salt/salt water and ink; chopsticks  
**Methods:** Natural diffusion and outward stirring

This session recorded 13 video clips and tested baseline ink forms under controlled fill lighting. Representative frames include fine smoke-like tendrils, dense pools gathered at the bottom and directional clouds produced by stirring.

**Setup:** The camera was mounted on a tripod at the table edge, framing a transparent acrylic tank placed on white foam boards over a cloth-covered desk. A phone light stood beside the tank as a hard side light, casting crossing shadows across the white board and backdrop, with the room otherwise darkened; a second phone light was kept beside the setup.

**Evidence:** [Contact sheet 03](../docs/images/dataset_record/2026-07-01-ink-dataset-contact-sheet-03.png), [Contact sheet 05](../docs/images/dataset_record/2026-07-01-ink-dataset-contact-sheet-05.png), [setup photo 01](../docs/images/dataset_record/2026-06-22-capture-setup-01.jpg), [setup photo 02](../docs/images/dataset_record/2026-06-22-capture-setup-02.jpg)

### Session 02 — Salinity, stirring-tool and pipette variables

**Date:** 26 June 2026  
**Devices:** Phone and camera  
**Lighting:** Soft evening light and two phone lights  
**Materials:** Water, ink, salt/salt water, chopsticks, small stick and pipette  
**Methods:** Natural diffusion, outward stirring, small central stirring and drawing/releasing ink with a pipette

This session recorded 35 video clips and expanded the variables. Salt and salt water altered ink boundaries and gathering; chopsticks and a small stick created different scales of mechanical disturbance; the pipette produced concentrated injection or drawing effects. Representative frames range from smooth black masses to thin tendrils, curls and cloud forms.

**Setup:** A phone was mounted horizontally on a tripod directly above the tank for top-down recording, by a window in daylight, with the tank sitting on a white foam-board base. A second phone on a mini tripod served as an additional light source beside the setup.

**Evidence:** [Setup photo 01](../docs/images/dataset_record/2026-06-26-capture-setup-01.jpg), [setup photo 02](../docs/images/dataset_record/2026-06-26-capture-setup-02.jpg), [Contact sheet 01](../docs/images/dataset_record/2026-07-01-ink-dataset-contact-sheet-01.png), [02](../docs/images/dataset_record/2026-07-01-ink-dataset-contact-sheet-02.png), [04](../docs/images/dataset_record/2026-07-01-ink-dataset-contact-sheet-04.png), [06](../docs/images/dataset_record/2026-07-01-ink-dataset-contact-sheet-06.png), [07](../docs/images/dataset_record/2026-07-01-ink-dataset-contact-sheet-07.png)

### Session 03 — Hand-soap and local-disturbance tests

**Date:** 29 June 2026  
**Device:** Phone  
**Lighting:** Soft evening light  
**Materials:** Water, ink, hand soap, salt, small stick and pipette  
**Methods:** Natural diffusion, small central stirring and pipette actions

This session recorded 6 video clips and introduced hand soap and repeated pipette and local-stirring methods to observe how a surfactant and local force affect ink contours. The selected frames add thinner, more dispersed and locally gathered forms.

**Setup:** A phone on a tripod recorded the tank side-on beside a window under soft evening light. The water-filled acrylic tank stood on a white board raised above the desk, with ink already diffusing during recording; a light stand was positioned at the right of the window bay.

**Evidence:** [Setup photo 01](../docs/images/dataset_record/2026-06-29-capture-setup-01.jpg), [setup photo 02](../docs/images/dataset_record/2026-06-29-capture-setup-02.jpg), [Contact sheet 04](../docs/images/dataset_record/2026-07-01-ink-dataset-contact-sheet-04.png), [08](../docs/images/dataset_record/2026-07-01-ink-dataset-contact-sheet-08.png)

### Source note — `ink_dataset/04_gathering_ink`

The gathering material comes from two production methods:

| Series | Source | Method |
| --- | --- | --- |
| 1–4 | Pipette-drawn | Ink physically drawn back together by suction with a pipette; frames follow the re-gathering timeline (series 3 and 4 have only two frames because those runs re-gathered quickly) |
| 5–8 | Reversed video | Frames extracted from diffusion videos played in reverse; frame numbering follows the reversed playback |

*(Series split corrected from 1–3 / 4–8 to 1–4 / 5–8 on 13 July 2026 during the v7 caption revision.)*

The reversal is a deliberate production decision, not a capture artefact: playing diffusion backwards produces the condensing motion that visualises *temporary return*, echoing the work's premise that the return of consciousness is a temporary, constructed state. Since the v7 caption revision (13 July 2026) the two sources are distinguished in the captions as two visual narratives: the pipette series describe dispersed ink sinking back into a settled mound, the reversed series describe spread ink retracting inward and upward into a compact suspended mass; for the later video atlas the reversed clips are the source of condensing motion and must remain traceable.

### Production method per category (recorded 13 July 2026, v7 caption revision)

The v7 captions encode each category as a time process. The underlying physical production, as carried out during the capture sessions:

| Category | Viewpoint | Physical process | Temporal arc written into the captions |
| --- | --- | --- | --- |
| 01_pure_diffusion | Top-down | Ink poured into still water in a shallow pale basin | Poured blob pooling → curved gray washes spreading layer by layer → washes overlapping → merged dark sheet |
| 02_layered_ink | Side | Ink injected into the tank, left to sink naturally (series 1 used a larger injection, filling the frame by its final phase) | Plume drifting down (no strands yet) → veils sinking, fine strands appearing → veils and strands layering → settled layers over a dark depth, with rounded droplets alongside in series 2–6 |
| 03_disturbed_ink | Side | Settled ink broken apart by stirring with chopsticks; frames follow the aftermath | Strands torn apart into fragments → fragments dissolving into tiny particles, a fine grain mist → particles dispersing into a hazy grain fog → near-uniform dark murk |
| 04_gathering_ink | Side | Two methods, see source note above (pipette suction / reversed video) | Sink-back into a settled mound (series 1–4) / retraction into a compact suspended mass (series 5–8) |

### 1 July 2026 — Contact-sheet assembly

Representative frames from the three experiment dates were assembled into eight screenshots labelled with device, lighting, materials, method and date. The screenshots were created between 21:35 and 21:36 BST on 1 July; they document earlier experiments and do not indicate that capture occurred on 1 July.

## Selection and processing log

| Date | Source range | Action | Tool / settings | Output | Reason |
| --- | --- | --- | --- | --- | --- |
| 26–29 June 2026 | 54 video clips (13 / 35 / 6 across Sessions 01–03) | Selected 26 clips as source material | Visual clarity and sufficient clip length; representative morphology — each clip had to clearly express the target state of its experimental condition (e.g. for `disturbed_ink`, visible dispersal after chopstick stirring); absence of interference such as reflections | 26 selected video clips | Narrow raw footage to material worth extracting frames from |
| 28–29 June 2026 | 26 selected video clips | Selected four clear, visually distinct phases per clip in CapCut (剪映); colour-corrected and reframed each clip from its original landscape recording to a square crop for a consistent screenshot format (also convenient for ML training); took screenshots at those four phases; retouched the stills in Photoshop to remove interference elements such as surface air bubbles and tank-bottom reflections, so the model would not learn these artefacts; cropped and converted to monochrome | CapCut (剪映) for phase selection, colour correction and square-crop screenshots; Adobe Photoshop for interference removal | 101 JPEG stills, 4320×4320 | Build the LoRA training set from the clearest representative moments in each clip, free of capture artefacts |
| 1 July 2026 | Experiments from 22, 26 and 29 June | Selected representative frames and added device, lighting, material, method and date labels | Layout tool and export settings not tracked | Eight PNG contact sheets | Create publicly reviewable evidence of dataset production |

**Processing evidence:** [CapCut phase selection](../docs/images/dataset_record/2026-07-28-processing-jianying-phase-select.jpg) — selecting the four screenshot phases from a clip's timeline. [Photoshop interference marked](../docs/images/dataset_record/2026-07-28-processing-ps-interference-marked.jpg) — an unprocessed still with interference elements (air bubbles, tank-bottom reflection line) boxed in red. [Photoshop corrected](../docs/images/dataset_record/2026-07-28-processing-ps-corrected.jpg) — the same still after the interference elements were removed, matching the version used in the training set. [`01_pure_diffusion` folder listing](../docs/images/dataset_record/2026-07-28-01_pure_diffusion-finder-folder.jpg) — the resulting output folder, showing six clips (`1`–`6`) each contributing four selected phases (`-1` to `-4`), 24 images in total, matching the `<experiment>-<frame>.jpg` naming convention in the [dataset README](README.md#sequences).

For each stage, state the criteria used to exclude or retain material. Examples include focus, exposure, framing consistency, movement visibility, duplication, permission status and relevance to the intended interaction.

## Permissions, privacy and data handling

- [x] The dataset contains no people or identifying information.
- [x] Current public previews contain only liquid and material experiments.
- [x] Location: captured at the artist's home; no external location permission required.
- [ ] Dataset licensing and reuse conditions are recorded.
- [ ] Backup and deletion procedures are defined.

If no people are captured, replace participant consent notes with the relevant location, ownership, copyright or material-source permissions.

## Connection to the final work

Use this table to demonstrate how dataset production influenced the installation rather than documenting capture as an isolated activity.

| Dataset decision | Resulting system decision | Evidence |
| --- | --- | --- |
| Capture in high-contrast monochrome | Continue the installation's black-and-white language of ink appearing, diffusing and disappearing | Eight contact sheets |
| Vary salinity, surfactant and mechanical disturbance | Provide different edge, density and flow references for Latent Atlas and TouchDesigner states | Sessions 01–03 |
| Retain natural diffusion, stirring and pipette methods | Established the four morphological categories (`01_pure_diffusion`, `02_layered_ink`, `03_disturbed_ink`, `04_gathering_ink`) that structure the LoRA dataset and map directly onto the installation's dispersed-to-condensed axis | `ink_dataset/` category folders; captions encode each category as a temporal arc (see [dataset README](README.md#mapping-to-the-c-value)) |
| Reversed-video gathering footage (Session outcome, `04_gathering_ink` series 5–8) | Baked into five continuous axis videos (`inkwb_full_axis_00001–00005`), scrubbed live by the touch-derived c-value in TouchDesigner | See [process log](../docs/PROCESS_LOG.md), 2026-07-24 entry |

## Evidence checklist

- [x] Capture materials and methods record
- [x] Equipment and lighting record
- [x] Behind-the-scenes image (setup photos linked under each session)
- [x] Contact sheets and representative frames
- [x] Selection and rejection notes (criteria recorded in the Selection and processing log; recorded at the criteria level rather than per clip)
- [x] Processing/export settings (CapCut phase selection and square-crop screenshots; Photoshop interference removal — see Selection and processing log)
- [x] Location and material-permission record (captured at the artist's home, no people and no external permission required — see Permissions, privacy and data handling)
- [ ] Dataset licensing and reuse conditions
- [ ] Backup/storage record
- [x] Link to the TouchDesigner or interface change informed by the dataset (see Connection to the final work: the reversed `04_gathering_ink` footage became the five axis videos scrubbed by the c-value)
- [x] Reflection describing what changed after reviewing the material (the `04_gathering_ink` series split was corrected and the four categories were re-captioned as physical time processes during the v7 revision — see the source note and Production method per category)
