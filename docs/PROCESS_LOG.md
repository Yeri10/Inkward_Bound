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
- [Dataset capture and production log](DATASET_CAPTURE_LOG.md)
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

- [Dataset capture and production log](DATASET_CAPTURE_LOG.md)
- [Dataset contact sheets](images/dataset/)

**Reflection / next step**

The records establish material, tool, device and lighting variables, but raw file counts, resolution, frame rate, material quantities, location and rejection criteria remain incomplete. The next step is to test explicit mappings between representative forms and TouchDesigner states or Latent Atlas categories.

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

Dataset recording is documented separately in the [dataset capture and production log](DATASET_CAPTURE_LOG.md). This keeps capture conditions, permissions, file selection and processing decisions visible without overloading the software-development timeline.

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
