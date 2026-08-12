# Inkward Bound — Browser Touch Interface

[中文](README.zh-CN.md) | **English**

The input side of the *Inkward Bound* installation. A browser-based p5.js
canvas measures touch, folds it into a single convergence value `c` (0–1),
and relays that value to TouchDesigner over WebSocket, where it drives a
LoRA-generated ink-diffusion video between dispersed and condensed states.

The canvas is not a controller with a readout on it. It runs the same
dispersed-to-condensed process the projection does, in its own material — a
density field of large, soft, unevenly bright nodes. See ["The browser
canvas"](../README.md#the-browser-canvas) in the project README for the
concept and its argument.

## Architecture

```
Hand → Browser (p5.js sketch) ──ws:// or wss://──▶ Node.js relay
                                                        │
                                                        ▼
                                              TouchDesigner WebSocket DAT
                                                        │
                                                        ▼
                                       LoRA video scrubbed by c value
```

`app.js` serves the static browser files and runs a WebSocket broadcast
relay on the same port. Whatever the browser sends is forwarded to every
other connected client — TouchDesigner listens on the same address.

## Requirements

- Node.js ≥ 18
- A modern browser (Chrome, Safari, Firefox)
- TouchDesigner (optional — the sketch runs standalone if the WebSocket
  never connects; only the visuals will show, no video will be driven)

## Run

```bash
npm ci
npm start
```

Open `http://localhost:3000` in a browser. To use a tablet as the touch
surface, put it on the same network and open `http://<this machine's LAN IP>:3000`.

In TouchDesigner, set the WebSocket DAT (`ws_touch_input`) to network
address `localhost`, port `3000`, no TLS.

For the deployed variant (Render), the browser opens
[inkward-bound.onrender.com](https://inkward-bound.onrender.com) and
TouchDesigner points at the same address on port `443` with TLS enabled.
The free Render tier sleeps when idle, so the first load may take up to a
minute — the exhibition itself runs locally.

## Data contract

The browser sends JSON at interaction events and at approximately 30 fps:

```json
{
  "event":      "down" | "move" | "up" | "frame",
  "isTouching": true,
  "x":          0.5,
  "y":          0.5,
  "duration":   2.4,
  "speed":      0.12,
  "stability":  0.88,
  "agitation":  0.16,
  "clickCount": 1,
  "c":          0.42,
  "state":      "search",
  "timestamp":  1782864000000
}
```

These field names are a contract with the TouchDesigner patch — renaming
one silently breaks the installation.

## Files

```
InkWard_Bound_Interface/
├── app.js               # Express server + WebSocket broadcast relay (55 lines)
├── package.json
└── public/
    ├── index.html       # Canvas host + two HUD panels
    ├── sketch.js        # Interaction, c-value engine, density field
    ├── style.css        # HUD styling
    └── p5.js            # p5.js v1.11.13 — vendored, do not modify
```

`p5.js` is vendored rather than loaded from a CDN because the exhibition
machine runs offline.
