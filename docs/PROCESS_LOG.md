# Inkward Bound — Development Process Log

[中文](PROCESS_LOG.zh-CN.md) | **English**

## Purpose

This log documents how Inkward Bound develops across the browser interface, WebSocket relay, deployment and TouchDesigner system. It follows the process-documentation approach demonstrated by Pippin Barr's [The Artist Is Present 2](https://github.com/pippinbarr/the-artist-is-present-2/blob/master/press/README.md): project information should link to process notes and to the Git history rather than presenting only a finished outcome.

Each entry separates:

1. the intention or problem;
2. the work completed;
3. the decision and its reason;
4. evidence available in the repository;
5. reflection and the next test.

## Evidence index

- [Complete commit history](https://github.com/Yeri10/Inkward_Bound/commits/main)
- [Current browser interface](../InkWard_Bound_Interface/public/sketch.js)
- [Current server and WebSocket relay](../InkWard_Bound_Interface/app.js)
- [Current TouchDesigner system](../InWard%20Bound%20System/InWard%20Bound%20System.toe)
- [TouchDesigner iteration backups](../InWard%20Bound%20System/Backup)
- [Dataset capture and production log](../ink_dataset/DATASET_CAPTURE_LOG.md)
- [Live Render deployment](https://inkward-bound.onrender.com)

## Development timeline

### 31 May 2026 — Initial installation sketch and first 3D model

**Intention**

Translate the ideas of fragmented consciousness, increasing entropy and renewed convergence into a physical installation, while defining an initial relationship between audience input, screen roles and sound.

**Work completed**

- Drew the first installation sketch, mapping interaction data to conceptual meaning: hold duration to sustained attention, touch stability to inner stillness, clicking frequency to restlessness, release to consciousness escaping again, and touch position to the direction of recall.
- Proposed translating these inputs into a convergence value controlling how strongly the fragments return.
- Planned contrasting sound states: fragmented breathing, digital noise and unstable frequencies at high entropy; slower, clearer sound approaching silence at low entropy.
- Built an initial 3D installation model with two principal displays, several smaller screens and an interactive screen arranged densely along a vertical cable spine.
- Rendered front and angled views of the model.

**Design decision**

The initial design was a dense multi-screen structure rather than a single-screen installation. Exposed cables and irregular screen placement represented fragmented consciousness, entangled information and instability. The lower landscape screen acted as the audience interaction point, the principal upper screens carried ink diffusion and latent-space imagery, and the smaller screens represented drifting consciousness fragments.

**Evidence**

- [Initial installation concept sketch](images/2026-05-31-initial-installation-concept-sketch.jpg)
- [Initial installation model — front view](images/2026-05-31-initial-installation-model-front.png)
- [Initial installation model — angled view](images/2026-05-31-initial-installation-model-angle.png)
- Local file creation times: the two model renders were created at 17:41 and 17:45 on 31 May 2026, and the photographed sketch at 22:04 (BST). No embedded EXIF date was available, so the date is based on local filesystem metadata.

**Reflection / next step**

The initial version established the relationship between multiple screens, interaction data and entropy states, but its screen hierarchy was dense and the boundaries between audience interface, primary visual output and system status were not yet clear. A later revision should simplify the hierarchy and clarify who each display is for and what it communicates.

---

### 8 June 2026 — Repository established

**Intention**

Create a version-controlled space for the project before integrating the working prototypes.

**Work completed**

- Initialised the Git repository.
- Added Git attributes for repository file handling.

**Evidence**

- Commit [`64278d5`](https://github.com/Yeri10/Inkward_Bound/commit/64278d5) — `Initial commit`

**Reflection / next step**

The repository existed, but this commit did not yet evidence the design or technical process. The next step was to begin developing and testing the installation prototype.

---

### 10 June 2026 — Complete data bridge between the web interface and TouchDesigner

**Intention**

Integrate the browser interface and TouchDesigner into one interactive system. The browser would act as a lightweight input layer, while TouchDesigner would handle visual processing and installation output.

**Work completed**

- Created an Express static server (`server.js`, port `3000`) and a WebSocket relay (port `9980`).
- Completed a p5.js particle interface (`sketch.js`) with 180 particles responding to Perlin noise and supporting mouse and touch input.
- Calculated position, duration, speed, stability, agitation, click count and the `c` value in the browser, then sent the data to TouchDesigner over WebSocket.
- Added a bottom HUD showing connection status and live interaction values.
- Built the TouchDesigner receiving chain: `ws_touch_input` → `ws_parser` → `touch_store` → `c_value_chop`.
- Verified the end-to-end data flow: the `timestamp` field in `touch_store` updated in real time as the browser was touched.

**Technical decisions**

The browser sends more than raw coordinates. It first derives higher-level behavioural values (`stability`, `agitation` and `c`). This gives TouchDesigner a stable data interface for mapping stillness and agitation directly to visual parameters without repeating the calculations in TD.

A Node.js relay was used instead of making TouchDesigner the WebSocket server. Testing indicated that callbacks in the TouchDesigner WebSocket DAT were more reliable in client mode when connecting to an external relay.

**Key bug fix**

Clicking the canvas initially produced no response. The root cause was that p5.js wrapper functions such as `rand` and `noiseFn` were defined before p5 had initialised, causing a silent failure. The wrappers were removed, p5 global functions were used directly, and `connectWS()` was called from inside `setup()`.

**Related files and evidence**

- `InkWard_Bound_Interface/server.js` (the filename used at this stage; later renamed to `app.js`)
- [`InkWard_Bound_Interface/public/sketch.js`](../InkWard_Bound_Interface/public/sketch.js)
- [`InkWard_Bound_Interface/public/index.html`](../InkWard_Bound_Interface/public/index.html)
- `系统搭建测试记录/td数据接收.mov` (screen recording of TD receiving live data; not currently stored in the repository)
- `系统搭建测试记录/使用TD的粒子噪声系统测试c_value_chop的输出.mov` (not currently stored in the repository)
- Retrospective process details supplied by the project author; the later code and TouchDesigner files are preserved together in commit [`c0e3e20`](https://github.com/Yeri10/Inkward_Bound/commit/c0e3e20).

**Reflection**

This phase involved substantial work across several directions at once. Future TouchDesigner changes should be recorded separately and accompanied by screenshots explaining network or visual changes, making the iteration process easier to trace.

---

### 12 June 2026 — Second installation concept restructure

**Intention**

Reorganise the initial dense vertical stack of screens into a clearer primary structure, separating the main visual space from the audience interaction point.

**Visual changes**

- Replaced the single vertical cable spine with a freestanding rectangular metal frame.
- Used layered black and translucent planes inside the frame to create a deeper primary visual area.
- Distributed three gradient screens around the frame edges to retain the idea of drifting consciousness fragments.
- Separated the colourful interaction screen from the main structure and placed it on its own plinth, clarifying the division between audience input and primary visual output.
- Retained floating, offset and overlapping forms while establishing a clearer structural boundary.

**Design decision**

This was not a change from one screen to two screens. It reorganised the initial dense multi-screen stack into a primary visual frame plus a separate interaction terminal. The terminal offered the audience a clear entry point, while the main frame focused on fragmentation, diffusion and convergence.

**Evidence**

- [Second installation concept render](images/2026-06-12-second-version-concept.png)
- Local file creation time: 12 June 2026 at 21:08 (BST). No embedded EXIF date was available, so the date is based on local filesystem metadata.

**Reflection / next step**

The second version clarified the relationship between the main structure and interaction terminal, but it still contained many interior planes, screens and plinth elements. Further modelling tests were needed to remove components that did not contribute directly to the concept.

---

### 22–29 June 2026 — Ink-diffusion dataset capture

**Intention**

Capture ink-diffusion forms produced by different materials and forces, creating physical references for the installation's monochrome ink visuals, Latent Atlas material and TouchDesigner state changes.

**Work completed**

- Conducted three groups of experiments on 22, 26 and 29 June.
- Captured with a camera and phone, testing two phone lights and soft evening light.
- Compared water, ink, salt/salt water, hand soap, chopsticks, a small stick and a pipette.
- Tested natural diffusion, outward stirring, small central stirring and pipette actions.
- Assembled representative frames into eight parameter-labelled contact sheets on 1 July.

**Evidence**

- [Dataset capture and production log](../ink_dataset/DATASET_CAPTURE_LOG.md)
- [Dataset contact sheets](images/dataset_record/)

**Reflection / next step**

The records establish material, tool, device and lighting variables, but raw file counts, resolution, frame rate, material quantities and rejection criteria remain incomplete. The next step is to test explicit mappings between representative forms and TouchDesigner states or Latent Atlas categories.

---

### 23–25 June 2026 — Progressive reduction and adjustment of the second visual structure

**Intention**

Use three consecutive model outputs to test combinations of frames, screens, central visual forms and the interaction terminal, progressively removing unnecessary structure.

**Visual iterations**

- **23 June:** Expanded the main body into a more open double-frame structure with a black central volume, several floating screens, a separate colourful terminal and additional white modules, testing distance and orientation between components.
- **24 June:** Removed the heavy external plinth and some central elements, opening the structure and bringing the colourful terminal closer to the main body.
- **25 June:** Further reduced the number of gradient screens and central white forms, retaining the principal frame, black background volume, a small number of fragment screens and the colourful interaction terminal.

**Design decision**

These iterations used subtraction rather than additional screens to express complexity. Fragmentation was increasingly carried by frames, gaps, translucent layers and a small number of offset displays. The interaction terminal remained outside the main structure to preserve functional separation.

**Evidence**

- [23 June visual study](images/2026-06-23-installation-visual-study-03.png)
- [24 June visual study](images/2026-06-24-installation-visual-study-04.png)
- [25 June visual study](images/2026-06-25-installation-visual-study-05.png)
- Local file creation times: 23 June at 16:09, 24 June at 18:25 and 25 June at 22:03 (BST).

**Reflection / next step**

Progressive reduction produced a clearer visual centre, but the installation still consisted of several separate frames and planes. The next step was to consolidate these elements into one manufacturable frame with a clear viewing direction and practical cable routing.

---

### 30 June 2026 — Prototype and TouchDesigner iterations committed to the repository

**Intention**

Bring the data-bridge prototype developed from 10 June, the browser code and the TouchDesigner iterations into Git version control.

**Work completed**

- Added numbered TouchDesigner files from versions 1–8.
- Added the current `.toe` system file.
- Added the existing p5.js browser interface, state model and HUD.
- Added the existing Express server and WebSocket relay.

**Technical decision**

The purpose of this commit was to preserve the preceding development work; it does not imply that every feature was created on 30 June.

**Evidence**

- Commit [`c0e3e20`](https://github.com/Yeri10/Inkward_Bound/commit/c0e3e20) — `I add some files`
- [`sketch.js`](../InkWard_Bound_Interface/public/sketch.js)
- [TouchDesigner backup files](../InWard%20Bound%20System/Backup)

**Reflection / next step**

This commit contains substantial work but is too large to show the sequence clearly, and its message does not describe the work. The numbered `.toe` files indicate iteration, but binary files do not provide readable diffs. Future TouchDesigner changes should be committed individually with a screenshot and a short explanation of the network or visual change.

---

### 30 June 2026 — Node entry point clarified

**Problem**

The deployment entry file needed to match the expected application naming and npm configuration.

**Work completed**

- Renamed `server.js` to `app.js`.
- Updated the `main` field and `npm start` command in `package.json`.

**Evidence**

- Commit [`c5fc728`](https://github.com/Yeri10/Inkward_Bound/commit/c5fc728) — `I change some codes`

**Reflection / next step**

The source and package configuration now agreed, but the first Render attempt exposed a separate issue: the deployment service was initially looking for the entry file from the wrong working directory.

---

### 30 June 2026 — Render-compatible WebSocket networking

**Problem**

The local prototype used separate HTTP and WebSocket ports. That model did not work for a Render Web Service, where public HTTP and WebSocket traffic must reach the same public listener. The deployed HTTPS page also required secure WebSocket connections.

**Work completed**

- Created one HTTP server shared by Express and `WebSocketServer`.
- Bound the service to Render's `PORT` environment variable on `0.0.0.0`.
- Removed the separate public WebSocket port `9980`.
- Made the browser choose `ws://` locally and `wss://` when served over HTTPS.
- Preserved text and binary message types while relaying data between clients.

**Technical decision**

The same origin now serves the interface and upgrades WebSocket connections. This removes hard-coded deployment ports and allows the browser and TouchDesigner to connect through the Render domain on port `443`.

**Evidence**

- Commit [`42c9a6d`](https://github.com/Yeri10/Inkward_Bound/commit/42c9a6d) — `change network port`
- [`app.js`](../InkWard_Bound_Interface/app.js)

**Reflection / next step**

Deployment configuration and application networking are now aligned. The next evidence should be a screenshot of the successful Render deploy, a connected browser HUD, and the TouchDesigner WebSocket DAT receiving a sample JSON message.

---

### 1 July 2026 — TouchDesigner iteration 9 and presentation control

**Intention**

Preserve the next TouchDesigner iteration and make the browser interface suitable for display without browser chrome.

**Work completed**

- Archived TouchDesigner version 8 in `Backup/`.
- Added version 9 and updated the current `.toe` file.
- Added `F` as a fullscreen toggle.
- Kept canvas resizing connected to browser window changes.

**Evidence**

- Commit [`1bc18a2`](https://github.com/Yeri10/Inkward_Bound/commit/1bc18a2) — `add some codes`
- [`InWard Bound System.9.toe`](../InWard%20Bound%20System/InWard%20Bound%20System.9.toe)
- Fullscreen handler in [`sketch.js`](../InkWard_Bound_Interface/public/sketch.js)

**Reflection / next step**

The versioned `.toe` file and fullscreen code are preserved, but the commit does not explain what changed visually between TouchDesigner versions 8 and 9. Add comparison screenshots or a short screen recording in the next entry.

---

### 1 July 2026 — Frame consolidation and translucent enclosure studies

**Intention**

Consolidate the previously dispersed double frames and floating planes into a more complete installation volume, then test how a translucent surface might affect the visibility of the interior imagery.

**Visual changes**

- The early version connected the upper and lower rails to four uprights, creating a complete rectangular frame and reducing peripheral gradient screens and separate modules.
- Retained the external colourful interaction screen, preserving the distinction between audience input and the generated imagery inside the frame.
- A 21:03 Blender screenshot documents the working scene before the final render: the complete frame, small gradient screens, external colourful display and side module were positioned together while materials, placement and shadows were checked in rendered view.
- The later version introduced a large translucent enclosure surface, turning the interior white visual form into a blurred, luminous presence.
- The structural language shifted from several fragments placed alongside one another to fragments contained within a translucent space.

**Design decision**

The complete frame improved manufacturability and provided a shared boundary for mounting screens, concealing cables and fixing translucent material. The translucent surface prevented the interior image from being read all at once, aligning more closely with the project's ideas of consciousness appearing, escaping and gathering again.

**Evidence**

- [1 July consolidated-frame study](images/2026-07-01-installation-frame-study-06.png)
- [1 July Blender work-in-progress screenshot](images/2026-07-01-blender-frame-work-in-progress.png)
- [1 July translucent-enclosure study](images/2026-07-01-installation-enclosure-study-07.png)
- Local file creation times: 01:50, 21:03 and 21:10 on 1 July 2026 (BST); the final image was modified at 21:28.

**Reflection / next step**

This direction is more unified than the early stacked-screen design, but the real material transmission, projection brightness, screen mounting, heat dissipation and maintenance access still require physical tests.

### 2 July 2026 — LoRA caption pass over the ink dataset

**Intention**

Prepare the 101 captured ink photographs in `ink_dataset/` for LoRA training, so that the trained model can generate the pre-baked latent atlas navigable by the convergence value.

**Work completed**

- Wrote a same-name `.txt` caption for every image (kohya / AI Toolkit format), reviewed image by image via contact sheets.
- Fixed the caption structure as `inkwb, <state phrase>, <phase phrase>, <per-image morphology>, monochrome, high contrast`.
- Assigned temporal phase phrases (`early / developing / advanced / final phase`) from each frame's position within its experiment sequence, e.g. `1-1.jpg` → `1-4.jpg` as one diffusion process.
- Renamed `04_gathering_ink/3-2-.jpg` to `3-2.jpg`.
- Documented the structure in [`ink_dataset/README.md`](../ink_dataset/README.md) and [`ink_dataset/README.zh-CN.md`](../ink_dataset/README.zh-CN.md).
- Consolidated dataset documentation: moved `DATASET_CAPTURE_LOG` (EN / zh-CN) from `docs/` into `ink_dataset/`, so capture, captioning and training evidence live alongside the images.
- Updated all cross-references in the main READMEs and this log, and repaired contact-sheet image links broken by the earlier `docs/images/dataset` → `docs/images/dataset_record` folder rename.

**Decision and reason**

Chose the meaningless trigger word `inkwb` to absorb the overall style without colliding with existing concepts, and natural-language captions to stay compatible with Flux / SDXL-style training. Encoding sequence position as a phase phrase turns the capture sessions' temporal progression into a promptable control, which maps directly onto the c-value axis (e.g. `final phase of gathering` for temporary return). Near-black frames were kept because the phase phrase gives them semantic value as end states of diffusion.

**Evidence**

- 101 `.txt` caption files across the four `ink_dataset/` subfolders.
- [`ink_dataset/README.md`](../ink_dataset/README.md) — structure, caption format, and c-value mapping.

**Reflection / next step**

Captions are consistent and verified one-to-one with the images, but their effectiveness is untested. Run a first LoRA training pass, then evaluate whether the state and phase vocabulary is actually steerable in generation before producing the atlas images.

---

### 6 July 2026 — LoRA training pipeline carried over from The-Latent-Mycelium

**Intention**

Set up the training infrastructure for the `inkwb` LoRA by reusing the proven SD 1.5 pipeline from the earlier project [The-Latent-Mycelium](https://github.com/Yeri10/The-Latent-Mycelium), instead of building a new one.

**Work completed**

- Reviewed The-Latent-Mycelium and identified reusable parts: the diffusers LoRA training script, conda environments, generator class, NDI sender / buffered playback, and hyperparameters from the successful `mycelium_lora_structure_v1` run (80 images).
- Created `training/` with `train_text_to_image_lora.py` (copied unchanged), `prepare_dataset.py` and a training README.
- `prepare_dataset.py` converts the kohya-style captions in `ink_dataset/` into the diffusers format (`training/dataset/images/` at max 1024 px + `metadata.jsonl`); ran it and produced 101 records.

**Decision and reason**

Kept the mycelium hyperparameters (512 resolution, rank 16, lr 5e-5, batch 1 with gradient accumulation 4, 12 epochs) as a tested starting point. Disabled `random_flip` because the ink captions encode left/right positions. The mapping layer will be rewritten later: PM2.5 → density/tangle phrases becomes c value → state/phase/viewpoint phrases, which matches the caption vocabulary defined on 2 July.

**Evidence**

- [`training/README.md`](../training/README.md), [`training/prepare_dataset.py`](../training/prepare_dataset.py)
- `training/dataset/metadata.jsonl` — 101 records generated from the captions.

**Reflection / next step**

The pipeline is untested against this dataset. Next: run `inkwb_lora_v1` on the Mac Studio, evaluate with the checklist in the training README (state / phase / viewpoint steerability), then decide whether the caption vocabulary needs a second pass before baking the latent atlas.

---

### 6 July 2026 — First training run review: container features leak into the trigger word

**Problem**

The first `inkwb_lora_v1` previews reproduced vessel features from the capture setup — glass walls, curved container bottoms, water surface lines and bubbles — because these recurring features were not described in the captions, so the model absorbed them into the trigger word.

**Work completed**

- Added a container-context part to all 101 captions: `inside a shallow pale basin` (01) / `inside a clear water tank` (02–04), with targeted extras (`curved basin rim visible`, `water surface line at the top`, `reflective tank floor below`) where clearly visible.
- Added a negative prompt to the notebook's Inference Test cell (glass, tank, vessel walls, rim, surface line, reflection, bubbles).
- Updated the caption format documentation in the ink_dataset READMEs and regenerated `ink_dataset_captions.xlsx` with a Container column.

**Decision and reason**

Rather than cropping the photographs immediately, the vessel features were bound to explicit caption words so they can be excluded at generation time. Cropping is kept as the fallback if v2 previews are still contaminated, because it would also alter the composition information (negative space, positions) that the morphology captions describe.

**Evidence**

- [v1 preview with glass walls and water surface](images/2026-07-06-inkwb-lora-v1-baseline-01-container-leak.png), [v1 preview with curved vessel bottom](images/2026-07-06-inkwb-lora-v1-baseline-02-container-leak.png)
- Updated caption files across `ink_dataset/`; [`ink_dataset/README.md`](../ink_dataset/README.md) caption-format table.
- Negative prompt in [`training/Inkward Bound LoRA Training.ipynb`](../training/Inkward%20Bound%20LoRA%20Training.ipynb).

**Reflection / next step**

Re-run `prepare_dataset.py`, train `inkwb_lora_v2`, and compare previews against v1 with the same seeds. If container features persist, add per-image cropping to `prepare_dataset.py` and adjust position words in the affected captions.

---

### 6 July 2026 — v1/v2 preview comparison: realism, prompt tuning and acceptance criteria

**Problem**

Comparing the two runs' phase-control previews showed v1 looking more "photographic" than v2. The realism in v1 largely came from the leaked container features themselves — water-surface refraction, glass gloss and specular highlights are photographic evidence, and removing the container removed them too. The v2 negative prompt also over-suppressed: broad words like `glass` and `reflection` killed the wet, glossy quality of dense ink. v2 previews still showed residual tank walls and a dark ink-smear band along the bottom edge. Separately, the four phase prompts produced near-identical images under the same seed, showing that the phase axis alone is weakly steerable.

**Work completed**

- Narrowed the negative prompt to concrete features only (`tank walls, basin rim, water surface line, bubbles, table edge, dark smears at the bottom edge`), dropping `glass / reflection / vessel`.
- Added positive photographic terms to all test prompts (`macro photograph, wet glossy ink, soft light`), so realism is requested explicitly instead of arriving through container leakage.
- Reinforced the phase-control prompts by pairing each phase phrase with a matching morphology description (compact clump sinking → lobes drifting down → heavy mass condensing → settled mound).
- Prompt-only changes; no retraining required to re-evaluate.

**Decision and reason**

Realism is not the training target. Acceptance criteria were defined for the LoRA, in order of importance: (1) vocabulary steerability — state, phase and viewpoint words each produce distinct results, since c-value navigation depends on this; (2) clean style — container features appear only when prompted; (3) seed diversity — one prompt yields varied compositions; (4) no overfitting — outputs are not copies of the training photographs. Realism only needs to hold at exhibition viewing distance, and the atlas is hand-curated, so a 60–70% usable rate is sufficient.

**Evidence**

- [v1 phase preview, early](images/2026-07-06-inkwb-lora-v1-phase-early.png), [v1 phase preview, final](images/2026-07-06-inkwb-lora-v1-phase-final.png) — photographic look carried by leaked container cues; early and final nearly identical.
- [v2 phase preview, early](images/2026-07-06-inkwb-lora-v2-phase-early.png), [v2 phase preview, final](images/2026-07-06-inkwb-lora-v2-phase-final.png) — cleaner but flatter; residual tank walls and bottom smear band.
- [v1 full preview sheet](images/2026-07-06-inkwb-lora-v1-preview-sheet.png) — baseline, state, phase and viewpoint groups of the first run.
- [v2 full preview sheet](images/2026-07-06-inkwb-lora-v2-preview-sheet.png) — the same groups after the caption pass.
- Updated Inference Test cell in [`training/Inkward Bound LoRA Training.ipynb`](../training/Inkward%20Bound%20LoRA%20Training.ipynb).

**Full-set assessment (added after reviewing all v1 and v2 preview groups)**

Comparing complete preview sets revised the picture. v1: states distinct with a photographic in-water look, viewpoint switching worked (top-down pool vs side funnel), phases flat, containers leaked uncontrollably. v2: states still distinct but drifting toward an ink-on-paper aesthetic, viewpoint collapsed (both prompts produced flat blots), phases still flat, container leakage reduced with residual frame edges. The key insight: v1's in-water feel and working viewpoint were carried by the leaked container context; v2 bound that context to words, so prompts that omit them lose the aquatic space entirely. The fix is not banning containers but using the words deliberately — a `suspended in clear water` anchor was added to all side-view prompts, and `paper texture, ink on paper, photo border, dark frame edges` to the negative prompt.

**Reflection / next step**

Re-run the Inference Test with the water-anchored prompts. The v2 caption pass turned container context from uncontrollable leakage into an inference-time switch, which is the intended behaviour — the open issues are phase steerability (flat in both runs; if morphology pairing is not enough, revisit training) and confirming the water anchor restores viewpoint switching. Once steerability passes, fix 3–4 seeds, generate the 4-state × 4-phase evaluation matrix, and move to batch-generating the latent atlas.

---

### 6 July 2026 — Measured density captions for v3: giving the phase axis a visual anchor

**Intention**

Fix the flat phase axis observed in both training runs. Abstract phase words (`early / developing / final phase`) give the text encoder no visual anchor, while what actually changes across a captured sequence is ink coverage.

**Work completed**

- Wrote `training/measure_ink_coverage.py`: measures each image's dark-pixel ratio (grayscale threshold 100) and inserts one of five coverage phrases into its caption, from `sparse ink traces, mostly clear water` to `ink almost filling the entire frame`. Safe to re-run; replaces previous density phrases.
- Applied it to all 101 captions. Distribution across the five bins: 10 / 19 / 36 / 15 / 21, and sequences progress through bins as expected (e.g. `01/1-1 → 1-4`: dense → dense → heavy → filling).
- Updated the notebook's phase-control and evaluation-matrix prompts to pair each phase word with its corresponding measured density phrase.
- Documented the new caption part in the ink_dataset READMEs.

**Decision and reason**

Density is assigned by measurement rather than by eye: the phrase is derived from the actual dark-pixel ratio, making the caption claim objectively true for every image. The phase words are kept alongside the density phrases so both vocabularies remain usable at generation time.

**Evidence**

- [`training/measure_ink_coverage.py`](../training/measure_ink_coverage.py); updated captions across `ink_dataset/`.
- Caption-format table in [`ink_dataset/README.md`](../ink_dataset/README.md).

**Reflection / next step**

Re-run `prepare_dataset.py` and train `inkwb_lora_v3`, then judge the phase axis with the evaluation matrix. If density phrases steer coverage successfully, the c-value mapping can use them directly (low c → sparse/turbulent, high c → heavy/condensed).

---

### 6 July 2026 — v3 evaluation: style and diversity pass, phase mildly improved, seed-dependent state collapse

**Intention**

Evaluate `inkwb_lora_v3` (trained on the density-graded captions) against the acceptance criteria using the evaluation-matrix cell: 4 states × 4 phases at fixed seeds, plus a seed-diversity strip.

**Results**

- Clean style: pass. The wet, glossy in-water look returned via the `suspended in clear water` anchor and positive photographic terms; no container features or paper texture in any preview.
- Diversity: pass. The three diversity-strip seeds produce clearly different compositions; no memorisation observed.
- Phase axis: mildly improved. At seed 42 the gathering row shows a visible density progression (brighter early frame, heavier later frames) — the first run in which phase prompts move the image at all — but the progression is still subtle.
- State axis: regressed at some seeds. Seed 42 keeps the four states distinguishable; at seed 123 the whole matrix collapses into near-identical draped-veil compositions.
- Caption-length check: a CLIP-token estimate puts the longest caption at ≈70 tokens, under the 77-token limit, so training-time truncation does not explain the collapse.

**Diagnosis and decision**

The likely cause of the seed-dependent collapse is the heavy shared prompt suffix (`suspended in clear water` + three photographic phrases + style tags) diluting the state phrase at inference. This is a generation-side issue; no retraining planned. Countermeasures: trim the photographic suffix when state separation matters, and sweep more seeds during atlas generation — the atlas is curated, so seed-level collapse only lowers the usable rate.

**Evidence**

- [v3 state × phase matrix, seed 42](images/2026-07-06-inkwb-lora-v3-matrix-seed42.png) — states distinguishable, mild phase progression.
- [v3 state × phase matrix, seed 123](images/2026-07-06-inkwb-lora-v3-matrix-seed123.png) — state collapse at this seed.
- [v3 state × phase matrix, seed 777](images/2026-07-09-inkwb-lora-v3-matrix-seed777.png) — for comparison with the v4 run at the same seed.
- [v3 seed-diversity strip](images/2026-07-06-inkwb-lora-v3-diversity.png), [v3 baseline](images/2026-07-06-inkwb-lora-v3-baseline.png).
- [v3 full preview sheet](images/2026-07-06-inkwb-lora-v3-preview-sheet.png) — baseline, state, phase and viewpoint groups.

**Reflection / next step**

v3 is good enough to begin trial atlas generation: per state, sweep seeds, curate the usable images, and drive density with the measured coverage phrases. In parallel, test whether trimming the shared photographic suffix restores state separation at collapsing seeds.

---

### 9 July 2026 — v4 experiment: trimmed captions

**Intention**

Test whether shorter captions improve state separation. The v3 captions reach an estimated ~70 CLIP tokens; trimming reduces attention dilution across the many shared tokens.

**Work completed**

- Added a `--trim` flag to `prepare_dataset.py`: at dataset-build time it drops the abstract phase phrases (the measured density phrase carries the temporal axis) and the dataset-wide style tags (absorbed by the trigger word). Source caption files stay untouched, so v3 can be rebuilt at any time by running without the flag.
- Longest caption estimate drops from ~70 to ~61 tokens.
- Notebook updated: `TRIM_CAPTIONS` switch in Dataset Validation, output to `training/runs/inkwb_lora_v4`, validation prompt rewritten in the trimmed vocabulary.

**Decision criterion**

Train v4 on the trimmed captions and compare same-seed evaluation matrices against v3. Adopt v4 if state separation improves (especially at previously collapsing seeds) without losing the wet in-water look or density steerability; otherwise return to v3 by setting `TRIM_CAPTIONS = False` and continue atlas generation with v3.

**Evidence**

- [`training/prepare_dataset.py`](../training/prepare_dataset.py) (`trim_caption`), [`training/Inkward Bound LoRA Training.ipynb`](../training/Inkward%20Bound%20LoRA%20Training.ipynb).

**Result and decision (added after the v4 run)**

v4 was trained on the trimmed captions and evaluated at seeds 42 / 123 / 777. State separation improved where it mattered most: at seed 123, which had fully collapsed under v3, the diffusion and settling rows are now clearly distinct; seed 777's settling row (columns dropping from a surface layer) is the strongest state expression so far. The wet in-water look and seed diversity are preserved. Remaining issues: disturbance and gathering stay hard to tell apart at every seed — a dataset-level confusion, since both categories contain similar dense-plume material — and the density/phase columns still change little within a row. **Decision: adopt v4.** The atlas generation script was switched to the v4 weights and its prompts rewritten in the trimmed vocabulary; because prompt-side density control is weak, the script now also measures each generated image's dark-pixel coverage into the manifest, so atlas curation can re-bin by measured coverage instead of trusting the prompt.

**Evidence**

- [v4 matrix seed 42](images/2026-07-09-inkwb-lora-v4-matrix-seed42.png), [seed 123](images/2026-07-09-inkwb-lora-v4-matrix-seed123.png), [seed 777](images/2026-07-09-inkwb-lora-v4-matrix-seed777.png)
- [v4 diversity strip](images/2026-07-09-inkwb-lora-v4-diversity.png), [v4 full preview sheet](images/2026-07-09-inkwb-lora-v4-preview-sheet.png)
- [`training/generate_atlas.py`](../training/generate_atlas.py) — v4 vocabulary and measured-coverage manifest.

**Reflection / next step**

Proceed to atlas candidate generation with v4. Disturbance-vs-gathering separation, if it matters for the installation, needs a data-level fix (more distinctive capture material) rather than further caption work; density is handled by measuring outputs rather than steering prompts.

---

### 9 July 2026 — Atlas prompt vocabulary tuned per c bin against capture references

**Problem**

The first atlas prompts used only state + density words, and the generated states still looked too similar: disturbance came out as sharp glossy swirls instead of the soft mist-like dispersion of stirred ink, gathering lacked the centripetal "being drawn back" motion of the pipette material, and diffusion was rendered side-on although the source material is top-down.

**Work completed**

Each c bin in `generate_atlas.py` was given a distinctive morphology phrase, matched against reference frames from the capture sessions and written in that category's own caption vocabulary:

- c 0.0 diffusion: top-down view restored; ink pool drifting outward with marbled swirls; side-view water anchor disabled for this bin.
- c 0.2 disturbance: murky churned clouds dissolving like mist; the glossy photo suffix is disabled for this bin because it contradicts the hazy quality.
- c 0.4 settling: surface canopy with droplet fringes, translucent veils sinking in distinct layers toward a settled base.
- c 0.6 → 1.0 gathering: a centripetal progression — strands converging toward the centre, threads spiraling inward into a solid mass, a vast black mass absorbing the last curling threads.

**Decision and reason**

All changes are generation-side; the v4 weights are untouched. The morphology phrases reuse wording that exists in the training captions, so the model has seen each combination. Training v5 is deferred until this prompt-level recall is tested: if the hazy disturbance or centripetal gathering cannot be recalled by vocabulary the model was trained on, the fix is data-level (weighting or re-shooting those categories), not caption-level.

**Evidence**

- Per-bin `morph` / `photo` / `water` fields in [`training/generate_atlas.py`](../training/generate_atlas.py).

**Reflection / next step**

Run all six bins (`--seeds 6`) and judge against the reference frames: mist-like c 0.2, layered c 0.4, centripetal c 0.6–1.0, top-down c 0.0. Pass → start full atlas candidate production and curation; fail on specific bins → plan v5 with data-level fixes for those categories.

---

### 9 July 2026 — First atlas batch reviewed: viewpoint recall works, shared seeds anchor the gathering bins

**Problem**

The first full atlas batch (6 bins × 6 seeds, tuned prompts, v4 weights) needed to be judged against the four capture reference frames before deciding between atlas production and a v5 retrain.

**Work completed**

- Ran `generate_atlas.py --seeds 6` (36 candidates + `manifest.jsonl`) and assembled a 6 × 6 overview sheet.
- Review against the references: c 0.0 diffusion now renders as a genuine top-down marbled surface, clearly separated from every side-view bin — the strongest confirmation yet that trained viewpoint vocabulary is recallable. c 0.2 shows softer mist-like billows on several seeds; c 0.4 shows sinking layered strands. But c 0.6 → 0.8 → 1.0 barely progress, and c 1.0 never produces the settled solid mass.
- Diagnosis: all six bins shared the same seed list (1000–1005), so within each seed column the initial noise anchored the composition and the three gathering grades could not diverge. A prompt-wording issue was also found: the c 1.0 morphology phrase was invented wording rather than the training-caption wording.
- Fixes in `generate_atlas.py`: each bin now draws from its own seed range (`seed_start + bin_index × 1000`), and the c 1.0 morphology reuses the exact final-phase caption phrasing ("a dense settled black mound…, twisting tendril column above").

**Decision and reason**

Still no retrain: the failed axis (gathering progression) had not yet been tested under fair conditions — independent noise per bin and trained recall wording. v5 is only justified if the axis fails after these two generation-side fixes.

**Evidence**

- [Batch 1 overview, 6 bins × 6 seeds](images/2026-07-09-atlas-batch1-overview.jpg)
- Seed-offset and c 1.0 morphology changes in [`training/generate_atlas.py`](../training/generate_atlas.py).

**Reflection / next step**

Re-run the three gathering bins (`--bins 0.6 0.8 1.0 --seeds 8`) with independent seeds. If the mound at c 1.0 and the centripetal progression appear, begin full production and curation; if not, this is data-level evidence for v5 (weight or re-shoot the gathering category).

---

### 9 July 2026 — Gathering re-run passes: independent seeds unlock the centripetal progression, no v5 needed

**Intention / question**

Test whether the gathering axis (c 0.6 → 1.0) diverges once the two generation-side fixes are in place: independent seed ranges per bin and the trained caption phrasing for the c 1.0 mound.

**Work completed**

- Re-ran the three gathering bins with 8 fresh seeds each (`--bins 0.6 0.8 1.0 --seeds 8`; seed ranges 4000+, 5000+, 6000+).
- Review: the progression now reads — c 0.6 scattered strands with an inward pull, c 0.8 threads visibly drawn into dark masses (seeds 5002, 5003), and at c 1.0 the settled solid mound finally appears (seed 6005 matches the reference frame almost exactly: dense black mound below, single tendril column above; 6001 and 6002 also carry solid mass).

**Decision and reason**

The prompt-recall test passes on all six bins, so v5 retraining is dropped from the plan. The failure in batch 1 was seed anchoring, not missing capability in the weights — confirming the earlier diagnosis that shared initial noise, not the LoRA, was flattening the axis. Remaining weak seeds are handled by curation, consistent with the acceptance criteria (the atlas is hand-picked; a 60–70 % usable rate suffices).

**Evidence**

- [Gathering bins re-run, 3 bins × 8 independent seeds](images/2026-07-09-atlas-batch2-gathering.jpg)
- `training/atlas_candidates/manifest.jsonl` records both batches with prompts, seeds and measured coverage.

**Reflection / next step**

Full atlas production: a larger seed sweep across all six bins, then hand-curation into the TouchDesigner `latent_atlas` folders. Batch-1 images in the gathering bins (seeds 1000–1005, anchored) should be removed during curation; the manifest keeps them as process evidence.

---

### 9 July 2026 — Curation review drives per-bin prompt iteration: c 0.0 through four passes, mist added to c 0.4–0.6

**Intention / question**

During curation review of the full production batch, per-bin visual mismatches against the capture references surfaced and were corrected at the prompt level, one generation-side pass at a time. The c 0.0 top-down diffusion bin took four passes to pin down.

**Work completed**

- **c 0.0, pass 1 → 2**: the original "marbled swirls" wording was misread as full-frame paper-marbling texture — everything looked like ink, nothing like water. Rewrote to a solid black blob with gray ripple rings, and added per-bin negative-prompt support to `generate_atlas.py` (a `neg` field appended to the shared negative).
- **c 0.0, pass 2 → 3**: "ripple rings" pulled the model toward water-droplet splash photography. The water is now described as calm and still; ripples moved into the negative prompt. Blob/water separation became clean but the images went static.
- **c 0.0, pass 3 → 4**: restoring diffusion with "feathered edges + translucent gray halo" brought back movement but read as wispy threads and veil membranes. Final wording: *an already-pooled solid black mass spreading slowly outward as one body, rounded lobed edges bleeding softly into the calm pale water* — with thin threads, wispy tendrils, translucent veils and bubble membranes all pushed into the bin's negative prompt. This matches the 01 source material: the ink has already massed together and diffuses as a body, not as filaments.
- **c 0.4 / c 0.6**: kept the layered-settling and centripetal-gathering structures but added mist-like dispersing edges ("edges softly blurring and diffusing like mist" / "surrounded by soft hazy ink clouds still dispersing"), and disabled the glossy photo suffix on both bins, which contradicts the hazy quality — the 0.4–0.6 range should read as ink still actively dispersing.

**Decision and reason**

Every correction stayed on the generation side; the v4 weights were never touched. The pattern across the four c 0.0 passes: each wording choice imports the visual cliché of its nearest photographic genre (marbling paper, droplet photography, veil macro), and the fix is to name the wanted structure precisely and push the neighbouring genre into the negative prompt.

**Evidence**

- [c 0.0 pass 2: blob + ripple rings](images/2026-07-09-atlas-c00-pass2-blob-ripples.jpg)
- [c 0.0 pass 3: calm water, static blobs](images/2026-07-09-atlas-c00-pass3-calm-water.jpg)
- [c 0.0 pass 4 input: halo diffusion, still too wispy](images/2026-07-09-atlas-c00-pass4-halo.jpg)
- Per-bin `neg` field and final morphology wording in [`training/generate_atlas.py`](../training/generate_atlas.py).

**Reflection / next step**

Re-run c 0.0, 0.4 and 0.6 with the final wording (`--bins 0.0 0.4 0.6 --seeds 12`), then hand-curate all six bins into the TouchDesigner `latent_atlas` folders.

---

### 9 July 2026 — c 0.0 hits the prompt-level ceiling: basin entanglement confirmed, v5 retrain planned

**Intention / question**

After four prompt passes the c 0.0 bin still failed review. A fifth pass tested the remaining hypothesis: the 01 top-down aesthetic (pale field + pooled blob) lives in the trained container phrase `inside a shallow pale basin`, which the shared negative prompt had been suppressing all along.

**Work completed**

- Pass 5 rebuilt the c 0.0 prompt entirely from trained 01 caption phrases (`inside a shallow pale basin`, `a large rounded ink blob … on a bright pale field`, `ink spreading across part of the frame`) and lifted the basin terms from the negative prompt for this bin only (new `container` and `neg_full` fields in `generate_atlas.py`).
- Result: the container took over the frame — basin rims, bowls, a drain, a glass — with the ink blob incidental. Combined with passes 1–4 (no basin → wispy threads and veils), both directions are now bracketed: the 01 look cannot be recalled without the container words, and the container words summon the container itself.
- Alongside, the c 0.2/0.4 bins were swapped at the user's direction (settling now at c 0.2, disturbance at c 0.4), the c 0.2 mist-edge variant was rolled back to the sharp layered look, and all superseded candidates were moved to `atlas_candidates/_superseded/`. Final candidate pool: 120 images across six bins.
- v5 preparation: `prepare_dataset.py --v5` drops the basin phrase (present on every 01 image) at build time so `top-down view` absorbs the pale-basin look, keeps `curved basin rim visible` as a negatable per-image switch, and duplicates the 01 category ×2 (24 → 48 records, 125 total). Notebook and README updated to `inkwb_lora_v5`.

**Decision and reason**

This is exactly the v5 trigger condition defined earlier: trained vocabulary cannot recall the desired look, so the fix moves to the data level. The entanglement follows from the v1 lesson in reverse — naming the container on every 01 image bound the whole category aesthetic to those tokens; un-naming it should transfer that binding to the viewpoint phrase.

**Evidence**

- [c 0.0 pass 5: container takes over the frame](images/2026-07-09-atlas-c00-pass5-basin.jpg)
- `--v5` build mode in [`training/prepare_dataset.py`](../training/prepare_dataset.py); `container` / `neg_full` fields in [`training/generate_atlas.py`](../training/generate_atlas.py).

**Reflection / next step**

Train v5 via the notebook (dataset rebuild with `--trim --v5`, output `training/runs/inkwb_lora_v5`), then re-run the evaluation matrix. Acceptance focuses on one question: does `top-down view` now recall the pale-field pooled-blob look without container words? Other bins already pass with v4 vocabulary and are not expected to regress, but the matrix will verify.

---

### 9 July 2026 — v5 trained: basin-free captions, top-down look recalled without container words

**Intention / question**

Train the v5 LoRA on the rebuilt dataset (`--trim --v5`: basin phrase dropped from all 01 captions, 01 category duplicated ×2 → 125 records) and check the single acceptance question from the previous entry.

**Work completed**

- Trained `inkwb_lora_v5` with the same hyperparameters as v3/v4 (rank 16, lr 5e-5, 12 epochs, no random flip) on the 125-record v5 dataset.
- Evaluation matrices at seeds 42/123/777, diversity strip, and the four control groups were generated by the notebook.
- Review: in the seed-42 matrix the diffusion row now renders a flat top-down marbled water surface with a solid poured ink mass — clearly separated from the three side-view rows — **with no container words in the prompt**, which was impossible in v4 (prompting the look required the basin phrase, which then summoned basins, drains and glasses). No regression visible in the settling / disturbance / gathering rows: layered veils, hazy plumes and converging strands still read as in v4, and seed diversity is intact. Phase columns remain near-identical, as expected for trimmed captions (the temporal axis lives in the density phrases).
- Generation side updated: `generate_atlas.py` now defaults to the v5 weights; the c 0.0 bin drops the `container` field and moves `curved basin rim` into its negative prompt (the rim phrase survives in the captions per-image, so it stays negatable).

**Decision and reason**

The v1 lesson applied in reverse worked: un-naming a feature shared by every image in a category transfers its look onto the remaining tokens — here from `inside a shallow pale basin` onto `top-down view`. Category weighting (×2) gave the 01 look enough gradient signal to survive without its container anchor.

**Evidence**

- [v5 matrix seed 42](images/2026-07-09-inkwb-lora-v5-matrix-seed42.png), [seed 123](images/2026-07-09-inkwb-lora-v5-matrix-seed123.png), [seed 777](images/2026-07-09-inkwb-lora-v5-matrix-seed777.png)
- [v5 diversity strip](images/2026-07-09-inkwb-lora-v5-diversity.png), [v5 preview sheet](images/2026-07-09-inkwb-lora-v5-preview-sheet.png)
- Weights and log: `training/runs/inkwb_lora_v5/` (not committed).

**Reflection / next step**

Final acceptance runs through the atlas prompt itself: `generate_atlas.py --bins 0.0 --seeds 12` with the v5 blob vocabulary. If c 0.0 passes, re-sweep all six bins with v5 for a stylistically consistent candidate pool, then hand-curate into the TouchDesigner `latent_atlas` folders.

---

### 10 July 2026 — v5 atlas refinement round: c 0.0 direction accepted, mist vocabulary rebuilt for c 0.4 / 0.6

**Intention / question**

Run the atlas prompts against the v5 weights and refine each bin against the user's reading of the source material — including a correction of what the gray zones in the 01 photographs actually are.

**Work completed**

- **c 0.0 under v5, first attempt failed differently**: carrying over the heavy v4-era negative list (threads, veils, ripples…) plus the blob morphology pushed v5 into flat graphic collages — bowls, glass rings, even cut-paper leaf patterns. Diagnosis: the v4-era negatives suppress texture language that v5 needs; every weight version requires its own prompt calibration.
- **c 0.0 direction accepted**: from the v5 blob batch the user picked three frames (solid pooled blob on a pale basin-like field) as "close". An irregular-edge + ripple variant was tried and rolled back — the original phrasing reads better.
- **Correction from the source material**: the gray zones around the blob in the 01 photographs are *not* water ripples — they are layers of already-dispersed ink. The morphology now reads "translucent gray layers of dispersed ink pushed apart outward from the center, layer by layer" (拨开), with matte even light; specular reflections (glossy sheen, light glare) joined the bin's negative prompt, along with a cleanliness pass (dust, specks, stains added to the shared negative for all bins).
- **c 0.4 mist rebuilt**: the v5 re-sweep produced sharp glossy swirls with no mist. Haze words now lead the morphology ("soft murky clouds … dissolving into hazy gray mist, smoke-like billows with blurred diffuse edges") and the sharp-swirl look is excluded per-bin ("sharp crisp edges, glossy hard-edged swirls, thin defined filaments").
- **c 0.6 rebuilt as broken-apart mist**: scattered hazy fragments and drifting mist clouds lead, with loose strands *just beginning* to converge — preserving the centripetal progression into c 0.8/1.0 while adding the 打散 (broken-apart) quality.
- All refinement runs use fresh seed ranges (1200+/3100+/4100+) so earlier batches survive for comparison during curation.

**Decision and reason**

Same principle as the v4 round, now confirmed across weight versions: name the wanted structure precisely, push the neighbouring genre into the negative prompt — but negatives calibrated for one weight version do not transfer to the next.

**Evidence**

- [v5 c 0.0 blob batch (user-picked direction)](images/2026-07-10-atlas-v5-c00-blob-batch.jpg)
- [v5 c 0.4 before the mist rebuild: sharp glossy swirls](images/2026-07-10-atlas-v5-c04-before-mist.jpg)
- Final per-bin wording in [`training/generate_atlas.py`](../training/generate_atlas.py).

**Reflection / next step**

Generate the refined c 0.0 / 0.4 / 0.6 batches, review against the references, then final curation of all six bins into the TouchDesigner `latent_atlas` folders.

---

### 10 July 2026 — Full v5 re-sweep and a fog gradient across the middle bins; 216-candidate pool assembled for curation

**Intention / question**

Rebuild the whole candidate pool on v5 with the final per-bin wording, then tune the middle of the c axis, where the user wanted the "mist" quality to intensify with convergence rather than sit in a single bin.

**Work completed**

- Cleared all earlier atlas candidates (mixed v4/v5 generations); the old manifest was archived as `manifest_archive_2026-07-10.jsonl` and a fresh full sweep was generated: 6 bins × 24 seeds on v5, per-bin independent seed ranges.
- **Fog gradient, three iterations**: first the c 0.6 morphology was rebuilt around fog vocabulary (smoke-like haze, forms dissolving, the gathering mass only faintly visible) — accepted. Then, at the user's direction, the gradient was rebalanced: c 0.4 adopted that fog level while keeping its stirring identity ("fog of ink churned up by stirring"), and c 0.6 was pushed one layer further ("the whole frame veiled in dense gray ink fog… only a faint dark shadow of a gathering mass deep behind the fog", with "clear outlines" added to its negatives). The middle of the axis now reads: stirred fog (0.4) → denser fog with a gathering shadow (0.6) → defined convergence (0.8).
- Each iteration ran on a fresh seed range, so competing versions coexist for curation: c 0.4 holds 48 candidates (sharp + fog), c 0.6 holds 72 (structured + fog + dense fog).
- Assembled six labelled selection sheets (216 candidates in total) for the final hand-pick.
- Alongside: the six capture-session setup photos (22/26/29 June) were placed into `docs/images/dataset_record/`, completing the evidence links in the dataset capture log.

**Decision and reason**

The mist is treated as an axis property rather than a bin property: fog density now increases monotonically from c 0.4 to c 0.6, mirroring the installation's narrative where disturbance dissolves the ink before the system begins to re-gather it. Keeping superseded batches in place (fresh seed ranges instead of overwrites) turns curation into a comparison across prompt versions, not just across seeds.

**Evidence**

- [c 0.6 fog rebuild, first accepted batch](images/2026-07-10-atlas-c06-fog1.jpg)
- [c 0.4 with the adopted fog level](images/2026-07-10-atlas-c04-fog.jpg)
- [c 0.6 pushed one fog layer further](images/2026-07-10-atlas-c06-fog2.jpg)
- Final wording per bin in [`training/generate_atlas.py`](../training/generate_atlas.py); full generation record in `training/atlas_candidates/manifest.jsonl`.

**Reflection / next step**

Hand-pick the six bins from the 216-candidate pool, copy the selection into the TouchDesigner `latent_atlas` folders, and connect the atlas to the c-value navigation.

---

### 10 July 2026 — The c axis grows to eight bins; a failed loop, a fog that wasn't darkness, and prompts rebuilt from trained captions

**Intention / question**

Continue shaping the middle of the c axis against the capture references, and test the idea of closing the axis into a loop.

**Work completed**

- **Loop attempt failed instructively**: a c 1.2 "re-release" bin (the settled mound dissolving back into diffusion) was tried using the diffusion state phrase in side view — a combination absent from the training data, and the model collapsed into graphic water-surface illustrations. The bin was removed; the plan changed from a loop to a **fog arc**: c 0.7 "fog_receding" now bridges full fog back into the defined gathering states.
- **Partial clean rebuild**: mixed-version folders (c 0.4, c 0.6) were cleared and re-swept so every bin folder holds exactly one prompt version; c 0.5 "fog_deepening" was added between the stirred fog and the full fog, growing the axis to eight bins (0.0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0).
- **Prompts rebuilt from trained captions** (extending the c 1.0 lesson to more bins): c 0.0 now uses the 01-caption phrases verbatim ("a large rounded ink mass centered on a pale field with a soft halo", "soft gray washes", "scalloped lobed edge"); c 0.6 first borrowed the densest 03-caption fog phrases ("cloudy agitated murk", "hazy churned billows glowing faintly", then the final-phase "dense murky darkness", "near-black churned murk").
- **The decisive correction came from the user**: the c 0.6 fog kept reading lighter than c 0.4 no matter how dark the words became, because the intent was never darkness — *the 0.6 fog is ink strands broken apart into particles*. The morphology was rewritten as a granular cloud ("ink strands broken apart into countless distinct fine black particles, each grain sharply visible") suspended against a hazy fog background, with sharpness assigned to the grains and softness to the atmosphere. This required a per-bin negative override: the shared negative bans dust/specks/grain (added earlier for cleanliness), which would have suppressed exactly this texture.

**Decision and reason**

Two working rules consolidated this round: prompts recall best when assembled from caption phrases the model was actually trained on, and axis semantics must be stated as material states (particles, layers, washes), not as adjective intensities ("heavier", "darker") — intensity words saturate quickly, material words do not.

**Evidence**

- [c 1.2 loop attempt: collapse into graphic illustration](images/2026-07-10-atlas-c12-loop-failed.jpg)
- [c 0.7 fog receding, first batch](images/2026-07-10-atlas-c07-fog-receding.jpg)
- [c 0.6 during the "darker" dead end (murky darkness wording)](images/2026-07-10-atlas-c06-murky-darkness.jpg)
- Final eight-bin wording in [`training/generate_atlas.py`](../training/generate_atlas.py); every attempt recorded in `training/atlas_candidates/manifest.jsonl`.

**Reflection / next step**

Generate the granular-fog c 0.6 and the new c 0.5, review the four-step fog arc (0.4 → 0.5 → 0.6 → 0.7) side by side, then final curation of all eight bins into the TouchDesigner `latent_atlas` folders.

---

### 10 July 2026 — Starting the v6 training: an img2img control experiment and a caption audit locate the ceiling in the data, not the prompts

**Intention / question**

The c 0.0 top-down diffusion bin kept failing the "natural" test through every prompt strategy on v5 — trained caption phrases included, which had worked for every other bin. Before committing to another training run, isolate where the failure actually lives.

**Work completed**

- **Control experiment**: an img2img variant generator was built (real 01 photographs as init images, v5 LoRA re-rendering at strength 0.5–0.65). Its outputs looked immediately natural — solid irregular ink pools on plain water — while text-to-image kept producing rings, bowls, cups and petal shapes from the same weights and equivalent vocabulary. Conclusion: the model's *texture* knowledge is sufficient; its *composition* knowledge for this viewpoint is not recallable through text. The experiment was then removed from the pipeline (the project wants the pre-baked atlas generated from text navigation, not photo-anchored variants).
- **Caption audit of 01 and 03** (both categories exported with Chinese translations for review): the failure has legible causes in the data. In 01, `marbled` appears six times — feeding exactly the paper-marbling drift fought at generation time — and the pooled-blob frames never say *solid, opaque, black*, so the concept "one solid pooled mass" was never named for the model. In 03, the fog vocabulary is rich but the granular quality (ink strands broken into particles) that c 0.6 needs is absent from all 24 captions — the model cannot recall a texture it was never taught to name.
- **Temporal keywords**: the phase phrases (`early/developing/advanced/final phase of …`) were confirmed intact in the source captions — v4/v5 only dropped them at dataset-build time (`--trim`). v6 will keep them, restoring the temporal axis to the trained vocabulary.

**Decision and reason**

Train v6 with data-level fixes, per the standing decision rule (retrain only when trained vocabulary cannot recall the desired look): rewrite the 01 morphology lines (`marbled` → physical wash/gradation language; name the solid opaque blob where present), add granular-particle wording to the 03 frames that show it, rebuild the dataset keeping phase phrases while still trimming the constant style tags, and keep the v5 gains (basin phrase removed, 01 weighted ×2).

**Evidence**

- [c 0.0 text-to-image on v5: rings, bowls and petals](images/2026-07-10-atlas-c00-rings-petals.jpg)
- [img2img control from real 01 photographs: immediately natural](images/2026-07-10-atlas-c00-img2img-comparison.jpg)
- Caption audit source: `ink_dataset/01_pure_diffusion/*.txt`, `ink_dataset/03_disturbed_ink/*.txt`.

**Reflection / next step**

Revise the 01/03 captions (granular frames to be identified image by image), extend `prepare_dataset.py` with a style-only trim, train `inkwb_lora_v6` through the notebook, and re-run the c 0.0 / 0.6 acceptance tests first.

---

### 10 July 2026 — v6 trained: states hold, the temporal axis returns as a gentle nudge, real acceptance moves to the atlas prompts

**Intention / question**

`inkwb_lora_v6` finished training on the revised dataset (125 records: `marbled` purged from 01, the solid opaque blob named where present, granular-particle wording added to seven 03 frames, phase phrases kept, style tags trimmed, 01 still weighted ×2). First read of the standard eval matrices: did the caption surgery change what the model can say, and did restoring the temporal keywords buy back a usable axis?

**Work completed**

- Ran the notebook's full eval suite: baseline pairs, state control, phase control, viewpoint control, and the state × phase matrices at seeds 42 / 123 / 777.
- **State control still separates cleanly** — diffusion's membrane-like spread, settling's hanging layers, disturbance's burst, gathering's contraction each read as distinct materials at the same seed. The caption rewrite did not destabilise the four trained states.
- **Phase control is back, but as a gentle nudge rather than a strong dial**: at seed 42 the gathering row condenses slightly from early to final, and diffusion's advanced column pulls into a closed boundary; at seeds 123 and 777 the four phase columns are nearly identical. Expected — the phase phrase is one short clause in every caption, so it biases rather than steers.
- Noted the limit of this eval: the test prompts are short and carry none of the atlas machinery (density phrases, morphology lines, per-bin negatives). Whether c 0.0 now produces a natural pooled mass, and whether c 0.6 can recall `fine grainy ink particles` as a trained phrase, cannot be judged from these sheets.
- Switched `training/generate_atlas.py` `DEFAULT_LORA` to `inkwb_lora_v6`.

**Decision and reason**

Do not accept or reject v6 on the eval matrices. The two questions v6 exists to answer are compositional recall questions, and only the full atlas prompts test them — so acceptance moves directly to a targeted run of the two problem bins (`--bins 0.0 0.6`) on fresh seeds before any full re-sweep.

**Evidence**

- [v6 baseline pair](images/2026-07-10-v6-eval-baseline.jpg)
- [v6 state control: four states at one seed](images/2026-07-10-v6-eval-state-control.jpg)
- [v6 phase control: early → final on gathering](images/2026-07-10-v6-eval-phase-control.jpg)
- [v6 state × phase matrix, seed 42](images/2026-07-10-v6-eval-matrix-seed42.jpg)

**Reflection / next step**

The eval sheets confirm nothing broke; they cannot confirm what was fixed. Run the c 0.0 / c 0.6 acceptance batch on v6, judge against the two failure modes that forced the retrain (rings-bowls-petals at 0.0, unreachable granularity at 0.6), then decide between full re-sweep and prompt-side adjustment.

---

### 12–13 July 2026 — v6 atlas acceptance: the full sweep runs into a fresh folder, c 0.0 fails once more, and the curved-texture rollback finally lands

**Intention / question**

With v6 trained, run the real acceptance: the full eight-bin sweep on the atlas prompts (the eval matrices had already shown that short test prompts prove nothing about compositional recall). The two questions on trial: does c 0.0 now produce a natural top-down ink pool, and does c 0.6 recall the newly trained granular vocabulary?

**Work completed**

- Redirected atlas output to a fresh `training/atlas_candidates_v6/` folder (gitignored) so v6 generations never mix with the v5 pool, and ran the full sweep: 8 bins × 24 seeds from seed 7000, per-bin offsets.
- **c 0.0, first v6 round (seeds 7000+): failed.** The "solid opaque blob on a clean even background" wording — written to chase the img2img reference — produced solid blobs but wildly unstable surroundings: empty gray fields, glossy trays, fingerprint-like concentric rings, rectangular frames. The composition knowledge v6 was meant to unlock recalled the mass but not a believable water surface around it.
- **Direction change (user):** rather than pushing the isolated-blob ideal further, return to the earliest accepted look — the ink mass surrounded by curved flowing textures — with one clarification: the curved gray washes belong to the ink, and the water surface behind them stays clean.
- Rewrote the c 0.0 morphology from v6-trained caption phrases verbatim (`solid opaque black ink blob with a bumpy lobed edge` + `soft gray washes` + `gray gradations` + clean pale water); negatives updated for the new failure inventory (fingerprint pattern, concentric circles, tray, textured background) while dropping the veil ban that had been suppressing the wanted washes.
- Deleted the failed 24 and their manifest rows, regenerated on seeds 8000+. **Second round: accepted direction.** Most of the sheet reads as natural ink in water with curved wash textures; failures shrank to a handful (two near-empty frames, two dish-rim swirls, one symmetric artifact).

**Decision and reason**

c 0.0 keeps the curved-texture composition as its identity. Two rounds of evidence show the "isolated blob on clean background" ideal fights the dataset — the training photographs themselves carry flowing gray washes around every mass, so prompts that ban the washes leave the background undefined and the model improvises trays and rings. Building the prompt from what the captions actually say, rather than from an imagined cleaner image, is the same verbatim-recall rule that fixed every other bin.

**Evidence**

- [c 0.0 v6 first round: solid blobs, unstable backgrounds](images/2026-07-13-v6-c00-blob-unstable.jpg)
- [c 0.0 v6 second round: curved-texture rollback, seeds 8000+](images/2026-07-13-v6-c00-curved-texture-round2.jpg)

**Reflection / next step**

v6 did move the bin — solid opaque masses now appear on command, which v5 never managed — but the lesson repeats at a higher level: recall works phrase by phrase, and a composition assembled from trained phrases still needs *all* of its parts named, background included. Next: per-bin seed picks across all eight bins, the TouchDesigner `latent_atlas` folder structure, and the atlas-to-TD integration (crossfade navigation between adjacent bins).

---

### 13 July 2026 — Ledger audit: stale manifest rows, a silent seed collision, and a guard so it cannot happen again

**Intention / question**

An external review of the repository flagged three bookkeeping faults in `atlas_candidates_v6`: 210 manifest rows against 192 images on disk, 30 rows for c 0.0 alone, and a full cross-bin seed collision — c 0.0's rerun at `--seed-start 8000` had landed exactly on c 0.2's offset segment (7000 + 1000) from the full sweep. Verify the claims and repair the generation pipeline before final curation.

**Work completed**

- Confirmed all three findings by direct count. The stale rows were leftovers of the deleted first-round c 0.0 batch (an earlier regex-based cleanup had missed some) plus duplicate c 0.6 rows from repeated runs appending to the same manifest.
- Rebuilt the manifest: rows whose image no longer exists dropped, duplicate (bin, seed) rows deduplicated keeping the latest — 210 → 192 rows, exactly 24 per bin.
- Added a seed-collision guard to `generate_atlas.py`: before generating, the script now prunes stale rows automatically and refuses to run if any requested seed already belongs to a *different* bin, with an error naming the collision. Single-bin reruns can no longer silently share initial noise with a neighbour.
- Assessed the one real collision (c 0.0 vs c 0.2, seeds 8000–8023): practical impact judged small — the two bins differ in viewpoint and full prompt vocabulary, which overrides skeleton anchoring — but a clean rerun of c 0.0 on a fresh segment (seeds 20000+) was prepared as the default path since no picks were locked yet.
- Declined the review's suggestion to differentiate adjacent-bin prompts (c 0.4/0.5, c 0.8/1.0): the shared fog vocabulary across the middle bins is the deliberately built gradient, and a navigable c axis needs adjacent bins to be material neighbours for the crossfade to read as one continuous substance.

**Decision and reason**

The manifest is the provenance chain — every exhibited image must remain traceable to its weights, prompt and seed. Ledger faults are therefore repaired at the pipeline level (automatic pruning, hard failure on collision) rather than by one-off cleanup, so future errors announce themselves instead of accumulating silently.

**Evidence**

- `training/atlas_candidates_v6/manifest.jsonl`: 192 rows, 24 per bin, zero stale entries after rebuild.
- Guard implementation in `training/generate_atlas.py` (seed-ownership check before generation).

**Reflection / next step**

Rerun c 0.0 at seeds 20000+, compare against the accepted 8000 batch, then per-bin seed picks and the `latent_atlas` folder build.

---

### 13 July 2026 — A v1 comparison revises the v5 absorption hypothesis: bare "top-down view" lost its compositional pull

**Intention / question**

Reviewing old eval sheets, the user noticed that v1's viewpoint control was *accurate*: bare `top-down view` produced a true pooled-blob-over-pale-field composition, and `side view` a clean hanging plume — while v6's pair barely separates. The eval prompt carries no basin phrase in either version, so what changed?

**Work completed**

- Rebuilt the v1-vs-v6 viewpoint comparison side by side and confirmed the eval prompts are identical and container-free: in v1 the single phrase `top-down view` recalled the whole 01 composition; in v6 it no longer does.
- Traced the mechanism: v5 dropped `inside a shallow pale basin` from every 01 caption, betting the pale-basin aesthetic would transfer onto `top-down view`. The comparison shows the transfer was partial at best — with its co-anchor deleted, part of the 01 look migrated to the trigger word instead (the v1 rule again: shared un-named features bind to the remaining shared token) and diluted across all bins. v1's bare-phrase accuracy came from the full redundant bundle (`top-down view` + basin + rim) reinforcing one composition — the same entanglement that made v1 unusable in the atlas, where the basin phrase summoned literal basins.
- Confirmed no impact on current output: the atlas c 0.0 prompt never relies on the bare viewpoint phrase — it ships the full 01 bundle (solid opaque blob, gray washes, pale water), and the accepted second-round batch demonstrates the recall works at full strength.

**Decision and reason**

No action for v6. Logged as the design rule for a hypothetical v7: aesthetics do not transfer to a surviving phrase just because a co-occurring phrase is deleted — if a category needs a strong recallable anchor, *write a new consistent phrase into the captions* (e.g. `on a pale water surface`) rather than expecting absorption. Deleting a bad name requires coining a good one.

**Evidence**

- [Viewpoint control, v1 vs v6: bare top-down prompt](images/2026-07-13-viewpoint-v1-vs-v6.jpg)

**Reflection / next step**

The finding closes a loop opened at v5 with a cleaner rule than the one acted on then. It also reframes the eval sheets' value: they measure single-phrase recall, and single phrases are exactly what the atlas never uses alone.

---

### 13 July 2026 — Starting v7: the captions were too generic — every category rewritten as the physical process it photographed

**Intention / question**

After a run of generations that kept falling short of the intended state — c 0.6's particles rendering too coarse, without the fine-grained mist quality of the source photographs — and after noticing across the eval sheets that several trained groups barely separate, the captions themselves were re-examined. The diagnosis: the keywords were too generic and too uniform. Every 03 frame said "turbulent, murky, churned" — action words shared by all 24 — while what distinguishes the frames from one another (strands being torn apart, fragments dissolving into fine particles, particles fading into grain fog) was never named. The model cannot separate states its vocabulary does not separate.

**Work completed**

- **The shooting processes were recovered as the organizing principle.** Each category documents one physical experiment unfolding in time, and the captions now say so, column by column: 01 — ink poured into still water (pooling blob → curved gray washes spreading layer by layer → washes overlapping → merged dark sheet); 02 — ink injected and left to sink naturally (plume, no strands yet → veils with fine strands appearing → layered curtains → settled layers with rounded droplets in series 2–6, full-frame in the heavily-injected series 1); 03 — settled ink broken apart with chopsticks (strands torn into fragments → fragments dissolving into countless tiny particles, a fine grain mist → even hazy grain fog → near-uniform murk); 04 — two gathering methods, pipette suction (sink-back into a settled mound) and reversed video (retraction into a compact suspended mass), written as two distinct visual narratives.
- **The exact per-stage wording, as inserted into the captions** (one phrase per timeline position, placed before the style tags; everything already in each caption was kept):

  *01_pure_diffusion — ink poured into still water, top-down:*

  | Frame | Inserted phrase |
  |---|---|
  | x-1 | black ink freshly poured into the still water, pooling into a solid opaque blob |
  | x-2 | curved flowing soft gray ink washes spreading outward layer by layer around the dark mass |
  | x-3 | gray washes overlapping layer upon layer, ink taking over most of the pale water |
  | x-4 | washes merged into a nearly solid dark sheet covering the water |

  *02_layered_ink — ink injected, sinking naturally, side view:*

  | Frame | Inserted phrase |
  |---|---|
  | x-1 | ink freshly injected into the water, a plume drifting down naturally *(no strands yet — corrected by the author)* |
  | x-2 | translucent ink veils sinking gently, fine ink strands hanging between them, unfolding into layers |
  | x-3 | veils and strands settling one over another, layered curtains of ink deepening |
  | 1-4 | settled ink layers merged into a dense dark depth *(series 1: heavier injection, frame filled)* |
  | 2-4 – 6-4 | layers of ink strands settled over a dense dark depth, rounded ink droplets hanging alongside |

  *03_disturbed_ink — settled ink broken apart with chopsticks, side view (the older "fine grainy ink particles suspended in the haze" on seven frames was replaced by this finer four-stage wording):*

  | Frame | Inserted phrase |
  |---|---|
  | x-1 | ink strands torn apart by stirring, breaking into drifting fragments |
  | x-2 | broken strands dissolving into countless tiny ink particles, a fine grain mist spreading |
  | x-3 | fine ink particles dispersed evenly into a hazy grain fog |
  | x-4 | particles dissolved into near-uniform dark murk, faint fine grain texture remaining |

  *04_gathering_ink — two production methods, two visual narratives, side view:*

  | Series / position | Inserted phrase |
  |---|---|
  | 1–4 first | dispersed ink beginning to sink back, wisps drawn toward the dark mass below |
  | 1–4 middle | ink clouds condensing downward, gathering into the dark mass |
  | 1-4 (fourth of five) | ink nearly regathered, the mass thickening at the bottom |
  | 1–4 last | ink regathered into a dense settled black mound, faint wisps curling above |
  | 5–8 first | spread ink beginning to retract, strands drawing inward |
  | 5–8 middle | ink pulling inward and upward, strands coiling into the condensing mass |
  | 5–8 last | ink condensed into a single compact dark mass suspended in the clear water |

- **The four vocabularies interlock as one material narrative**: 02 teaches what an intact strand is, 03 teaches strands being torn into particles, 04 teaches the scattered material drawing back together — so each state is defined partly in terms of its neighbours, which is what a navigable axis requires.
- **Two anchor phrases were coined deliberately**, applying the rule from the v1-viewpoint finding: the accepted c 0.0 look ("curved flowing soft gray ink washes spreading outward layer by layer") and the accepted c 1.0 look ("a dense settled black mound, wisps curling above") are now trained vocabulary rather than prompt-side assemblies.
- All 101 captions updated (insertion only — existing morphology lines kept; 03's older grainy-particle phrase replaced by the finer four-stage wording). The caption registry `ink_dataset_captions.xlsx` re-synced from the source files, and the capture log extended with a per-category production-method table; the 04 series split was corrected there (1–4 pipette / 5–8 reversed) per the author's account.
- Clean-environment verification before training: dataset rebuilt from scratch (`--trim-style --v5`), 12/12 checks passed — 125 records, all four categories' process phrases counted correct, phase phrases kept, style tags dropped, no basin, no marbled, empty v7 output directory.

**Decision and reason**

The earlier rule said: retrain only when a wanted look exists in the photographs but has no trained name. This round generalizes it: the c axis needs states that *separate*, and separation is built in the captions or nowhere. Generic action words describe every frame equally and therefore distinguish nothing; process words — what the material is doing at this moment of this experiment — are what give each frame, and each future prompt, a retrievable identity.

**Evidence**

- Revised captions: `ink_dataset/*/**.txt` (101 files); registry `ink_dataset/ink_dataset_captions.xlsx`.
- Production-method table: `ink_dataset/DATASET_CAPTURE_LOG.md`.
- [Trigger case: v6 c 0.6 candidates — particles rendering too coarse](images/2026-07-13-v6-c06-grain-too-coarse.jpg)
- [The fine-grain reference: 03 source photographs, chopstick-dispersal aftermath](images/2026-07-13-dataset-03-fine-grain-source.jpg)

**Reflection / next step**

Train `inkwb_lora_v7`, switch the atlas to it, and re-run acceptance with priority on c 0.6 (fine grain mist) and the two anchored bins (c 0.0, c 1.0); then check whether the state × phase eval separates better now that the temporal axis is backed by concrete per-stage morphology instead of bare phase labels.

---

### 13 July 2026 — v7 accepted: the fine-grain fog arrives, the recall tests grade each new phrase, and a same-cluster lesson closes the c 0.6 tuning

**Intention / question**

`inkwb_lora_v7` finished training on the process-rewritten captions. Three verdicts to collect: do the newly coined phrases recall (tested by the new `v7_recall` eval group added before training, alongside a validation prompt updated to the trained c 1.0 anchor); does the frozen standard eval move; and — the decisive one — what does the full atlas sweep produce.

**Work completed**

- **Recall tests, graded phrase by phrase**: 02's "veils + fine strands" recalls cleanly (hanging veil, photographic, on-style). 03's "tiny particles / grain mist" recalls partially — granular webbing present, strand-burst still dominant in the bare test. 04's "settled mound" produces the gathered mass but suspended, not settled. 01's wash anchor recalls the *structure* (curved, flowing, layered) but renders it as a graphic engraving — the bare test sentence carries no solid-blob context, no pale-water context, no photographic framing, and since v6 the style tags are untrained, so the base model's reading of "curved flowing layers" takes over. Bare-word tests grade words; the atlas prompts carry the full bundles.
- **Viewpoint control still does not separate** — as predicted when the test was frozen: v5 spent bare "top-down view"'s compositional pull deliberately, and v7 never aimed to restore the bare word, only the bundled recall.
- **Full eight-bin sweep on v7** (fresh `atlas_candidates_v7/` folder, seeds 40000+, 192 images, ledger verified clean): the fine-grain fog is the headline — c 0.6 judged "much better than before" by the author. The atlas prompts were switched to v7 weights beforehand, and the c 0.6 morphology rebuilt verbatim from the newly trained x-2/x-3 process phrases.
- **c 0.6 refinement round and its lesson**: the author asked for finer grain and heavier fog, "like disturbance developing→final". The bin was pushed to the late-stage wording (phase → advanced, x-3/x-4 phrases). The A/B comparison came back nearly identical — diagnosis: an incremental wording change within one trained vocabulary cluster relocates the prompt to a neighbouring point of the *same* latent region, and the strongest dial (the density phrase) was never moved. Both batches embody the accepted look; a further "final-stage" push was declined because near-uniform murk would crowd c 0.5 and blur the bin's granular identity.

**Decision and reason**

v7 is the atlas's production weights. c 0.6 curation draws from the merged A+B pool (48 candidates) rather than forcing a third variant — when two batches sample the same accepted distribution, the correct move is to curate across them, not to keep re-prompting for a difference the axis does not need.

**Evidence**

- [v7 recall tests: one image per coined phrase](images/2026-07-13-v7-recall-tests.jpg)
- [v7 c 0.6, first accepted batch: fine-grain fog](images/2026-07-13-v7-c06-fine-grain-accepted.jpg)
- [c 0.6 A/B comparison: developing vs advanced wording, near-identical](images/2026-07-13-v7-c06-A-vs-B.jpg)
- `training/atlas_candidates_v7/manifest.jsonl`: 192 rows + 24 (c 0.6 B batch), per-bin seed segments, zero collisions.

**Reflection / next step**

The vocabulary rewrite paid off where it was aimed: the fine-grain fog exists on demand. The two open grades (01's graphic drift, 04's unsettled mound in bare tests) are watch-items for the atlas sweeps, not confirmed failures — both bins carry full bundles there. Next: per-bin seed picks (≈6 per bin) from the v7 pool, the `latent_atlas` folder build, then TouchDesigner integration.

---

### 13 July 2026 — Curation: 192 candidates become the 66-image latent atlas

**Intention / question**

With v7 accepted, the authorship moves from generation to selection: reduce the eight 24-image candidate pools to the final navigable atlas. Curation is where the artist's judgment becomes the work — the model proposes, the author disposes.

**Work completed**

- A curation document was assembled (all eight bins as seed-labelled contact sheets, ordered along the c axis, with the c 0.6 A/B batches side by side) around five filters applied in order: discard artefacts; bin identity (recognisable with the seed number covered); in-bin diversity (typical + variations + one edge state); cross-bin transition continuity (tone and ink coverage); and finally "does it look like *my* ink".
- The author selected 8–9 images per bin — deliberately uneven: the dwell bins hold more, the transit bins fewer. c 0.6 draws from both wording batches (one B-batch pick, seed 54010), confirming the merged-pool decision.
- Selection hygiene during intake: duplicate seed numbers in the submitted list deduplicated (41014 ×3, 42008 ×2, 47006 ×2); a systematic typo caught — the c 0.8 picks were reported as 48xxx, a segment that does not exist, and mapped to the bin's actual 46xxx segment. The mapped picks were rendered back as a contact sheet for visual confirmation, and the author removed one image (46019) on review — the mapping verified not by trust but by looking.
- Built the production structure `latent_atlas/c_X.X/` (repo root, git-tracked — the work's core asset, unlike the gitignored working pools): 66 images, clean sequential naming, plus `atlas_selection.json` recording every image's seed, source file, weights version and full generation prompt — the provenance chain from exhibition wall back to training run.

**Decision and reason**

66 over more: each bin needs enough variety for the in-bin drift loop in TouchDesigner without admitting weaker frames that a gallery screen would expose. Uneven counts follow expected audience dwell, not symmetry. The atlas is now frozen as the interface between the ML pipeline and the installation — further changes happen in playback (TouchDesigner, interpolation), not in generation.

**Evidence**

- [The final atlas: 66 images across eight bins](images/2026-07-13-latent-atlas-final-66.jpg)
- `latent_atlas/atlas_selection.json` — full per-image provenance.

**Reflection / next step**

The selection stage surfaced its own quality lesson: human-reported lists carry errors (duplicates, segment typos), and the pipeline caught them because every image is addressable by a verifiable number — the manifest discipline paying off at the human end. Next: point the TouchDesigner prototype at `latent_atlas`, extend it from 2 test bins to all 8, connect the WebSocket c value, and test RIFE interpolation for the bin-to-bin transitions.

---

### 14 July 2026 — TouchDesigner integration goes live, and RIFE interpolation turns the atlas into motion

**Intention / question**

Two fronts on the playback layer: wire the curated atlas into the live interactive system, and answer the fluidity question — crossfades between stills read as dissolves, so can frame interpolation give the transitions real motion without sacrificing the millisecond response?

**Work completed**

- **The full interaction chain is connected.** The eight-bin atlas component (66 images, per-bin blended rotation with phase-offset breathing, non-uniform c mapping via a `c_map` module, 0.6 s lag smoothing) was merged into the main `inkward_bound` system, which already carried the WebSocket touch chain and HUD. The final wire: `ws_touch_input → touch_store → c_value_chop → c_source (live/manual switch) → c_lag → nav_bins` — browser touch now drives the atlas directly, with the author's 3D render pipeline downstream. Live c was flowing at connection time.
- **Real-time vs pre-baked resolved as two routes with a fixed hierarchy**: pre-baked transitions are the exhibition backbone (finite input space — a finite atlas implies enumerable transitions — so baking buys video-grade fluidity at zero live risk); a real-time ComfyUI route is kept as a time-boxed experiment for the dissertation, conceptually paired as curated memory vs generative present.
- **RIFE interpolation validated in ComfyUI.** First an in-bin pair (two c 0.6 picks, multiplier 16): the interpolated frames read as ink genuinely moving, no ghosting. Then the author's own extension — one representative image per bin, chained into a single batch and interpolated end-to-end — produced a continuous c = 0→1 traversal sequence: pooled blob → veils → fog → grain → convergence → settled mound as one unbroken motion. This simultaneously previews every cross-bin bridge and yields a standalone full-axis sequence usable as the installation's idle state.
- **The transition-library design** (author's): every image in each bin gets 2–3 random partners in the next bin, so wherever the visitor's c currently rests, an interpolated bridge exists; random pairing means repeated journeys never replay identically. `training/bake_transitions.py` written to bake the ~170-pair library through ComfyUI's API from a seeded, manifest-recorded plan.

**Decision and reason**

Transitions move from crossfade to pre-baked interpolation sequences, scrubbed by c in TouchDesigner (play position bound to the c value, so approach speed and direction stay in the visitor's hand). Randomized bridges are adopted as designed: they make each return journey singular, which is the work's thesis enacted by the playback system itself.

**Evidence**

- [ComfyUI chain: one pick per bin interpolated end-to-end](images/2026-07-14-comfyui-full-axis-chain.jpg)
- [The resulting c 0→1 traversal frames](images/2026-07-14-rife-full-axis-sequence.jpg)
- `training/bake_transitions.py`; `latent_atlas/transitions_manifest.json` (plan, once baked).

**Reflection / next step**

Bake the full library overnight, then rebuild the TD transition player: on bin-boundary crossing, pick the current image's random bridge and bind the sequence index to c. Then the remaining runtime checklist items, and the time-boxed real-time experiment.

---

### 14–15 July 2026 — Full-axis video experiment: an interpolate-and-repaint pipeline turns the atlas into 13 seconds of continuous ink time

**Intention / question**

An experiment, explicitly not yet the final output form: can a complete c = 0→1 traversal be rendered as one continuous video — and what pipeline yields ink that *moves* rather than images that *dissolve*?

**Work completed**

- **First cut diagnosed a principle.** Chaining one pick per bin through RIFE produced a journey whose diffusion phase read as melting, not spreading. Diagnosis: interpolation connects states but cannot invent process — the unfolding of diffusion has visual content (tendrils reaching, washes growing) that no morph supplies. Fix: feed the process, not just the endpoints — keyframe density doubled in the early bins (two picks each for c 0.0–0.4), 11 keyframes total, all drawn from the existing curated atlas with no new generation or selection.
- **The pipeline grew into its final experimental form**, each stage answering one deficiency: 11 keyframes → **img2img repaint** through SD 1.5 + v7 LoRA (denoise 0.24, seed fixed at 42 — the light repaint unifies texture across keyframes without flicker) → **RealESRGAN ×2** upscale with light sharpen (512 exhibition-blur insurance) → **RIFE ×32** interpolation (fast_mode off, ensemble on) → **film grain** (grayscale, sat 0, power 0.12 — applied *after* interpolation so the grain lives per-frame instead of smearing) → 24 fps H.264. Repaint-before-interpolate was chosen over the reverse for cost (11 sampler runs, not 400) and zero flicker risk; the night-shift variant (repaint every interpolated frame) remains available if morph texture ever bothers.
- **Result: 321 frames, 13.4 s, 1024².** The traversal reads as material evolution — pooled blob, veils falling, strands, turbulence, grain fog, convergence, settled mass — with the v7 texture holding throughout. Archived to `training/experiments/` (not `latent_atlas/`, which stays production-only).
- The workflow was exported and versioned (`training/comfyui_workflows/full_axis_v1.json`), its 28 links verified node by node before the run. ComfyUI itself was consolidated during the session: everything moved under Documents, shared model/input/output directories mapped, and the bake script pointed at the true shared input folder.

**Decision and reason**

The experiment validates the interpolate-and-repaint recipe but does not yet commit the work to a final form. Three candidates stand: single full-axis video scrubbed by c; the per-bridge transition library with random pairing; or the bin-breathing crossfade system already live in TD. The choice belongs to hands-on comparison in TouchDesigner — interaction feel, not thumbnails, decides.

**Evidence**

- [Sampled frames of the full-axis video](images/2026-07-15-full-axis-video-frames.jpg)
- `training/experiments/full_axis_rife_test_v1.mp4`; `training/comfyui_workflows/full_axis_v1.json`.

**Reflection / next step**

The session's transferable lesson mirrors the caption rewrite at a new layer: whether teaching a model or cutting a video, a process must be *supplied* with its intermediate states, never inferred from its endpoints. Next: wire the video's play head to the live c value in TD, A/B the three candidate forms, then decide — and open the time-boxed real-time re-dream experiment after the main line settles.

---

### 15 July 2026 — The video meets the hand: c-scrubbing in TD, the ink-detection layer debugged, and the system HUD moves into the visitor's screen

**Intention / question**

Wire the experimental full-axis video into the live system so the three candidate forms can be compared by touch; make the 3D particle layer read the *ink* rather than the water; and surface the system's internal values on the visitor-facing interface.

**Work completed**

- **Video scrubbing is live.** The 481-frame interpolated video went into a Movie File In on *Specify Index*, its play head bound to the live c value by parameter expression (`op('c_lag')['c'] * 480`) — approach speed and direction belong to the visitor's hand; c falling plays the journey backwards. A `mode_switch` toggles between the bin-breathing atlas (mode 0) and video scrubbing (mode 1) for the pending A/B decision.
- **The detection layer now reads ink, not water.** Two inversions untangled the black-on-white problem: a Level TOP (invert) ahead of the TOP-to-POP conversion so point clouds grow on the ink mass, and a second invert plus a Reorder TOP (alpha from luminance) ahead of the bloom, turning the particle render into white glowing points keyed over transparency.
- **A blob-detection Script TOP** (OpenCV connected components, transcribed from a tutorial) was written into the project: per-blob centroids and normalized sizes, tunable by three constants. Its display chain had a real bug — the DAT-to-CHOP node was set to *channel per row*, transposing the point table so every on-screen number read 0 (the header row) while positions came from the wrong cells. Fixed to *channel per column* with the index column preserved; 40 blobs now each carry their own number at their own position. The lesson: when mapped values look wrong, check the table's *orientation* before its contents.
- **The system HUD crossed to the visitor's side.** The observation that unlocked it: C-VALUE, STABILITY, AGITATION, DURATION and STATE are all computed *in the browser* (they are what the browser sends to TD), so no return channel is needed. The interface gained a TD-styled terminal-green panel that fades in on touch, updates from local variables at zero latency, and lingers through the decay alongside the REDIFFUSION state before fading out.
- The transition-bake script was upgraded to the validated full recipe (repaint → upscale → sharpen → RIFE → grain), pointed at the desktop app's real port and shared input folder, and given a `--limit` smoke-test flag.

**Decision and reason**

The interface displays its own locally computed values rather than round-tripping them through the relay: the browser is the origin of these numbers, and showing the origin is both zero-latency and architecturally honest. In TD, both visual forms stay wired side by side until touch comparison decides.

**Evidence**

- TouchDesigner project versions `.19`–`.31` (`InWard Bound System/`), nodes `full_axis_video`, `mode_switch`, `invert_ink`, `white_particles`, `key_black`, `script1` + `script1_callbacks`, corrected `datto1` chain.
- Interface: `InkWard_Bound_Interface/public/index.html`, `style.css`, `sketch.js` (`#sys-hud`).
- `training/bake_transitions.py` (full-recipe workflow).

**Reflection / next step**

Local test of the interface HUD, push to Render, then the full-system touch test — which doubles as the A/B session between video scrubbing and bin breathing, and covers the outstanding runtime verification checklist.

---

### 15 July 2026 — A particle-diffusion layer over the interpolated video: the ink grows a second, artistic skin

**Intention / question**

The ComfyUI video renders the ink's *body*; on its own it stays documentary. Layer a particle system over it in TouchDesigner so the material grows an expressive dimension — ink that sheds and regathers particles, closer to the work's language of consciousness fragments than to fluid footage alone.

**Work completed**

- Built on top of yesterday's scrub-wired video: the inverted ink drives a TOP→POP conversion whose points are filtered, animated with curl-noise particle flow (particleFlow → curl → scale/randomize → lookup-texture → delete chain), and instanced as small circles (uniform scale 0.005) through a dedicated geo/render pass.
- The particle render is inverted and luminance-keyed (the earlier white_particles → key_black chain), then composited back over the video with bloom and levels — dark grain clusters growing along the ink's edges, loose specks drifting off into the water.
- The result reads as intended: the video supplies the ink's mass and motion, the particle layer supplies its *dissolution* — every ink body permanently shedding and re-attracting fragments, the c-axis narrative embodied at the texture level. Because the particles are re-derived from the ink every frame, they follow wherever the c value scrubs the video.

**Decision and reason**

The artistic layer lives in TouchDesigner, not in the baked video: keeping the video documentary and the expression real-time means the particle behaviour can later be modulated by the live c value (calmer when gathering, wilder when disturbed) without re-baking anything — the same division of labour as everywhere else in the system: baked matter, live behaviour.

**Evidence**

- [Composited frame: interpolated ink video with the particle-diffusion layer](images/2026-07-15-td-particle-diffusion-layer.jpg)
- TouchDesigner project `.35` (`inkward_bound` particle chain: topto1 → delete → particleFlow → curl → lookuptex → circle-instanced render → white_particles → key_black → bloom → comp).

**Reflection / next step**

The layered architecture earned its keep within a day of existing. Next: modulate particle energy by c (and agitation), then the full-system touch test and the A/B between the two visual forms — now three, counting this hybrid.

---

### 2026-07-23 — Smoothing the search gesture: gated c-signal chain, touch-triggered video switch, and the HAP codec fix

**Intention / question**

Three interaction problems surfaced during touch testing. First, the c-value drove the video with visible stutter — the ink jumped between states instead of flowing. Second, releasing the screen should guarantee a return to the dispersed state (c = 0), without depending on the browser to keep sending decaying values. Third, the whole interaction had become laggy, and the cause needed measuring rather than guessing.

**Work completed**

- Rebuilt the c-signal chain inside TouchDesigner as a dedicated conditioning pipeline: `c_pick × is_touching → c_gate → c_lag → c_filter (Gaussian, 0.25 s) → c_out → video index`. The browser still computes c from touch (duration, stability, agitation); TD now shapes it before it reaches the image.
- Diagnosed two stutter sources: the 30 fps WebSocket stream appearing as a staircase inside TD's 60 fps cook loop (ground out by the Gaussian Filter CHOP), and integer frame snapping in the Movie File In (fixed by enabling frame interpolation, so fractional indices blend adjacent frames).
- Made release behaviour explicit with a logic gate: `c × is_touching` collapses to 0 the instant contact ends, and an asymmetric Lag CHOP (rise 0.4 s, fall 2.5 s) turns that collapse into a slow re-diffusion back to frame 0 — robust even if the browser freezes or the socket drops mid-touch.
- Built the idle/touch video switch she wired as `switch1`: `is_touching → touch_lag (0.3 s in / 1.2 s out) → switch1.index` with Blend enabled, so the idle loop crossfades into the c-scrubbed axis video on contact and fades back after release.
- Profiled the network for the lag report. Worst offenders per cook: `base3/script1` 498 ms, `base3/proximity1` 137 ms, `particle1` (50,000 particles) 110 ms, and both axis-video players at ~35–40 ms each. The video cost had a structural cause: H.264 is inter-frame coded, so scrubbing to an arbitrary frame forces a decode walk back to the nearest keyframe.
- Re-encoded the axis video to HAP Q (`ffmpeg -c:v hap -format hap_q`, 23 MB → 278 MB), a per-frame, GPU-decoded codec built for random access, and repointed both movie players at it.
- Fixed the idle loop never playing through: `moviefilein1` was set to Locked to Timeline, so the project timeline's 600-frame loop kept yanking the 481-frame video back to its start. Switched to Sequential mode — the idle ink now plays on its own clock and loops independently.
- Fixed the axis video never reaching its final frame during interaction: the c formula (`duration×0.5 + stability×0.3 − agitation×0.2`) has a theoretical ceiling of 0.8, so frame 480 was unreachable by design. Normalised the reachable range onto the full axis: `index = min(c/0.8, 1) × 480` — a sustained, calm hold now carries the ink all the way to condensation.

**Decision and reason**

Keep the division of labour explicit: the browser computes meaning (what the touch is worth), TD computes motion (how the image gets there). Putting the return-to-zero in TD rather than trusting the browser's decay makes the installation fail-safe — an unplugged network cable now produces a slow fade to dispersion, not a frozen frame. HAP Q was chosen over reducing particle counts first because the codec cost was structural and lossless to the artwork, whereas thinning particles changes the visual.

**Evidence**

- TouchDesigner project: `inkward_bound` network — `c_gate`, `c_filter`, `c_out`, `touch_lag`, `touch_out` nodes; `switch1` blend expression `op('touch_out')['is_touching']`.
- `InWard Bound System/Movie/inkwb_full_axis_00004_hapq.mov` (HAP Q re-encode of the 481-frame axis video).
- Profiling snapshot: cook times recorded via the TD Python API during the session.

**Reflection / next step**

The gesture now reads as intended: pressure gathers the ink, release lets it drift apart on its own clock. Remaining suspects if lag persists after the HAP test: cache or downsize `base3/script1` (1280×720 per-pixel Python), thin `particle1` below 50 k, and convert the 1080p ambient loop (`3.mp4`) to HAP as well. Then the full-system touch test.

---

### 2026-07-24 — Five ink axes: a video library with random selection per touch, and a slower climb to condensation

**Intention / question**

One axis video meant every visitor searched the same ink. The goal for this session: bake a library of five axis videos, have the idle state cycle through them, and have each new touch randomly select which ink the visitor will search — so no two interactions look alike. Alongside this, the climb to the final frame felt too quick; condensation should cost more patience.

**Work completed**

- Tuned the ComfyUI bake pipeline for perceptual smoothness before the batch: film grain seed set to `fixed` (per-frame random grain made the image "boil" when the scrub lingered), Video Combine `crf` 19 → 14 (the mp4 is an intermediate — H.264 artifacts would be inherited by the HAP re-encode), RIFE multiplier raised with `ensemble` on.
- Baked five axis videos (`inkwb_full_axis_00001–00005.mp4`, 449–481 frames each) and converted all five to HAP Q for random-access scrubbing (~280–300 MB each, excluded from the repo).
- Built the switching architecture in TouchDesigner without adding decoders: a `video_list` Table DAT holds the five paths and their frame counts; `touch_swap` (CHOP Execute on the rising edge of `is_touching`) loads a random video — always different from the previous one — into `full_axis_video` at the moment a touch begins, hidden inside the 0.3 s crossfade from idle; `idle_swap` advances the idle player to the next video each time its loop wraps, so the resting state cycles 1→2→3→4→5.
- Fixed a cook dependency loop: the scrub expression originally asked an Info CHOP for the current video's frame count, but that Info CHOP watched the same player the expression drove. Frame counts now live in the playlist table and a `fa_len` Constant CHOP that `touch_swap` updates together with the file — the loop warning and the transient `NoneType` index error are both gone.
- Slowed the c-value climb in the browser: the duration term now saturates at 18 s instead of 10 s (`duration/18`), so carrying the ink all the way to condensation requires a genuinely sustained, calm hold.

**Decision and reason**

Switching by swapping the file on two existing players, rather than five players feeding a Switch TOP, keeps only two decode streams alive — five simultaneous 1024² HAP decoders would have spent the frame budget the codec fix had just recovered. Randomising per touch (not per visitor) makes repetition itself expressive: the same hand returning meets different ink.

**Evidence**

- Commits: `d53767d` (TD smoothing chain and fixes), `c901a6c` (18 s climb).
- Mid-frame of each of the five axis videos: ![Five axis videos, mid-frames](images/2026-07-24-axis-video-library.jpg)
- TouchDesigner nodes: `video_list`, `fa_len`, `touch_swap`, `idle_swap` in the `inkward_bound` network.

**Reflection / next step**

The library turns one search into five possible searches, and the slower climb makes reaching the end feel earned. Still open: whether five variations are perceptibly different to visitors in situ, and whether the 18 s hold is patience or boredom — both questions for the next full-system touch test.

---

## Current verification checklist

The repository confirms the code and version history. The following runtime evidence should be captured during the next full-system test:

- [ ] Render deployment reports a successful build and running service.
- [ ] The browser interface loads from the public URL.
- [ ] The browser HUD connection indicator turns green.
- [ ] TouchDesigner WebSocket DAT connects to `inkward-bound.onrender.com` on port `443`.
- [ ] TouchDesigner receives `down`, `move`, `up` and `frame` JSON messages.
- [ ] `F` enters fullscreen and `F` or `Esc` exits fullscreen.
- [ ] A slow, stable hold and a fast, agitated movement produce visibly different results.

## Documentation practice for future sessions

For each meaningful development session:

1. Create a focused commit with a descriptive message, for example `Map stability to particle convergence in TouchDesigner`.
2. Add a dated entry below before ending the session.
3. Record the intention, implementation, result, failure or limitation, and next action.
4. Add a screenshot or short recording under `docs/images/` when the change is visual.
5. Link the image and commit from the entry.
6. Use GitHub Issues for unresolved technical tasks and link the issue to the relevant commit.

Avoid committing generated dependencies such as `node_modules`; keep `package.json` and `package-lock.json` as the reproducible dependency evidence instead.

Dataset recording is documented separately in the [dataset capture and production log](../ink_dataset/DATASET_CAPTURE_LOG.md). This keeps capture conditions, permissions, file selection and processing decisions visible without overloading the software-development timeline.

## Entry template

```markdown
### YYYY-MM-DD — Short descriptive title

**Intention / question**

What was being explored or fixed?

**Work completed**

- Specific implementation or design changes.

**Decision and reason**

What choice was made, and why?

**Evidence**

- Commit: [`abcdef0`](https://github.com/Yeri10/Inkward_Bound/commit/abcdef0)
- Screenshot/video: `docs/images/YYYY-MM-DD-description.png`
- Test result or relevant source file.

**Reflection / next step**

What worked, what remains uncertain, and what will be tested next?
```
