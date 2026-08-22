// ── CONFIG ───────────────────────────────────────────────────────
const SEND_FPS  = 30;
const HUD_H     = 36;
// Halved from 600 when the speed measurement below was corrected. rawSpeed used
// to come out at exactly twice the real value, and 600 had been tuned by hand
// against that inflated figure — so 300 against the true reading reproduces the
// previous feel exactly, and the `speed` field sent to TouchDesigner is
// numerically unchanged. The difference is that the threshold now means what it
// says: 300 px/s is the movement rate that counts as fully agitated.
const SPEED_MAX = 300;

// ── DENSITY FIELD (tuning block) ────────────────────────────────
// A scatter of soft nodes of differing size and opacity. Most of what the
// field expresses — dispersed or gathered — is carried by how bright and how
// wide each node is; the nodes also drift and converge, but only at speeds far
// below their own radius (see KINEMATICS). A glow that outruns its radius
// drags a fading copy of itself behind it and that copy reads as a tail, which
// is the one failure mode this whole layer is arranged to avoid.
const GLOW_TEX     = 256;          // sprite resolution — raised with the radius,
                                   // a 128px gradient blown up to 500px bands
const N_NODE       = 85;           // few and very large: one node should read as
                                   // a mass of fog, not as a grain in one
const N_CLUSTER    = 4;            // hot spots they are drawn around. Fewer means
                                   // each flickering region covers more of the screen
const CLUSTER_SD   = 0.185;        // cluster spread, as a fraction of the canvas
const STRAY_FRAC   = 0.25;         // share of nodes placed anywhere at all, ignoring
                                   // the clusters — without them the field resolves
                                   // into a countable number of neat blobs
const NODE_SIZE_MIN= 0.7;          // per-node radius multiplier — kept off the
                                   // floor so nothing shrinks back into a speck
const NODE_SIZE_MAX= 1.6;
const NODE_R_LOW   = 150;          // base radius at c = 0  (px)
const NODE_R_HIGH  = 250;          // at c = 1 — wider, so cores merge
// Every node used to carry the same base opacity, so the only fixed thing that
// varied between them was width — which reads as one substance at one density
// cut to different sizes, not as a field where some places hold more than
// others. Each node now has its own multiplier as well, so size and weight are
// independent axes: a wide faint node and a small dense one both exist.
const NODE_A_VAR_MIN = 0.18;       // per-node opacity multiplier, fixed at build
const NODE_A_VAR_MAX = 2.60;
const NODE_A_LOW   = 10;           // per-node alpha at c = 0  (0..255)
const NODE_A_HIGH  = 20;           // at c = 1
// Monochrome. The per-node value is deliberately far below white: under ADD
// blending, overlapping glows accumulate toward white only where nodes
// actually cluster, while sparse regions stay a dim grey. That tonal spread IS
// the density read — the image is built out of overlap, not out of colour.
const FOG_LOW      = [176, 176, 176];   // c = 0  — dimmer, flatter haze
const FOG_HIGH     = [242, 242, 242];   // c = 1  — denser, closer to white
// A very slow, very small breath, so a still field does not read as a frozen
// image. Set BREATH_AMT to 0 for a completely static field.
const BREATH_AMT   = 0.10;         // ±10% on alpha
const BREATH_SPD   = 0.004;        // radians per frame (~26s per cycle)
// And a faster scintillation on top of it. Two timescales, which is how a sky
// reads: a very slow swell underneath, and individual masses brightening and
// dimming out of step with each other. Each node has its own noise lane, and
// its rate is tied to its size — the big masses shimmer more slowly than the
// small ones, so the field never pulses as a single sheet.
// Two levels, because independent flicker does not survive an overlapping
// field: N layers each wavering by ±A sum to a wobble of only ±A/√N, so at
// twenty layers deep a per-node twinkle of ±15% shows up as ±3%. Correlated
// variation is not diluted that way, so whole clusters flicker together — that
// is the part you actually see — with a smaller independent wobble on top so
// the cluster does not read as one solid object switching on and off.
const CLUS_TWINKLE = 0.65;         // cluster-wide depth (0 = off)
const CLUS_TW_SPD  = 0.010;        // its noise step per frame
const NODE_TWINKLE = 0.40;         // per-node depth on top of that
const NODE_TW_SPD  = 0.014;        // base noise step per frame
// p5's noise() stacks four octaves, so it almost never reaches 0 or 1 — values
// sit around 0.3–0.7 in practice and a raw (n - 0.5) * 2 delivers barely 40% of
// the amplitude it looks like it should. Stretched and clamped to get the range
// the constants above actually name.
const NOISE_STRETCH = 4.0;
// The hand raises the density it rests over instead of pushing anything about.
const HEAT_R       = 240;          // radius of influence, px
const HEAT_RISE    = 0.06;         // per frame at the centre of the hand
const HEAT_FALL    = 0.012;        // per frame, everywhere
const HEAT_A       = 26;           // extra alpha at full heat
const HEAT_GROW    = 0.25;         // extra radius at full heat, as a fraction

// ── KINEMATICS ───────────────────────────────────────────────────
// The nodes do move now, but only on timescales that cannot streak. The test
// is per-frame travel over glow radius: safe below about 0.05. Condensation
// measures 0.0017, the search drift 0.0004, dispersal 0.037.
const POS_EASE     = 0.02;         // approach rate toward the target, both ways
const CONVERGE     = 0.62;         // how far toward the attractor a node travels
                                   // at c = 1. Not 1.0: everything arriving at
                                   // one point would be a dot, not a gathering
const ATTRACT_X    = 0.5;          // where condensation pulls toward
const ATTRACT_Y    = 0.5;
const DRIFT_AMT    = 0.045;        // search-state wander, in canvas fractions
const DRIFT_SPD    = 0.0009;       // its noise step per frame (~19s per lap)
// Dispersal is carried by size and opacity rather than by flight. The field
// fades out in about 1.5s; positions ease home at the same rate they left, and
// nobody sees the tail of that because the alpha has already gone.
const DISPERSE_GROW= 1.6;          // extra radius at full dispersal
const DISPERSE_FADE= 0.92;         // how much alpha is taken away

// ── TRAIL: TWO LAYERS ────────────────────────────────────────────
// The head marks where the hand is now; the residue marks where it has been.
// They are separated by more than opacity — the residue also grows as it fades,
// so what is disappearing looks like it is physically spreading and thinning
// rather than merely being turned down. A residue kernel ends its life four
// times wider and effectively invisible.
const HEAD_R       = 34;           // head radius, px — small and definite
const HEAD_A       = 105;          // head alpha
const TRAIL_MIN_D  = 16;           // px of travel before a residue is dropped
const TRAIL_MAX    = 90;           // pool cap
const TRAIL_LIFE   = 1.6;          // seconds
const TRAIL_R0     = 44;           // residue radius when dropped
const TRAIL_R1     = 200;          // and at the end of its life
const TRAIL_A0     = 62;           // residue alpha when dropped
const TRAIL_DECAY  = 3.4;          // exponential decay constant for that alpha

// ── SHAPE VARIETY ────────────────────────────────────────────────
// All nodes used to share one sprite, so the field was the same stamp pressed
// 85 times at different scales — a uniformity you can see even through heavy
// overlap. Several falloff profiles, handed out at random, break that up.
// Each sprite is itself a sum of gaussians, not one radial gradient. A single
// gradient is monotonic — brightness only ever falls as you leave the centre —
// so however many of them overlap, every individual blob is a smooth even
// patch. Building each sprite out of several offset sub-kernels of different
// size and weight gives one blob internal lumpiness: local swells and hollows
// that survive being scaled, stretched and turned.
//
// Baked into the texture rather than drawn per node. Drawing six sub-kernels
// live would be 510 image() calls a frame and, at c = 1 where the field already
// overlaps twenty deep, 3.7 G pixels a second of fill. Baked, the runtime cost
// is exactly what it was.
const N_TEX        = 6;            // sprite variants
const SUB_MIN      = 4;            // sub-kernels per sprite
const SUB_MAX      = 8;
const SUB_OFFSET   = 0.26;         // max centre offset, as a fraction of the radius
const SUB_R_MIN    = 0.34;         // sub-kernel radius, as a fraction
const SUB_R_MAX    = 0.70;         // offset + radius stays under 1, or the sprite
                                   // would be clipped square at its own edge
const SUB_K_MIN    = 2.5;          // gaussian tightness
const SUB_K_MAX    = 6.0;
const TEX_PEAK     = 0.95;         // every sprite is rescaled to this peak, so
                                   // variants match the single gradient they
                                   // replace and each other
const TEX_SEED     = 1337;         // fixed, so the sprites are the same every load
// Edge break-up. A gaussian ends on a mathematically exact circle; ink does
// not. A high-frequency noise mask bites into the outer band of each sprite so
// the boundary frays instead of closing cleanly. Built once as an alpha mask
// and cached — perturbing pixels on every re-tint would be 393k operations in
// whichever frame the tint happened to change, which is a visible hitch.
const EDGE_START   = 0.52;         // where the fraying begins, as a fraction of R
const EDGE_AMT     = 0.85;         // how deeply the noise can bite at the rim
const EDGE_FREQ    = 0.075;        // noise frequency in sprite pixels — high, so the
                                   // edge reads as whiskers rather than as lobes
const TEX_STEPS    = 32;           // c is quantised this finely for re-tinting;
                                   // the fog colour moves 176→242, so a step is
                                   // about two levels — invisible, and it means
                                   // the sprites are rebuilt a few times a
                                   // gesture instead of sixty times a second
// Anisotropy. A perfectly circular kernel reads as geometry; ink in water does
// not spread evenly in every direction. Each node gets a fixed base ellipticity
// and orientation, then both drift on low-frequency noise. Stretching and
// turning are not translation, so none of this reintroduces the tail — the
// centre never moves.
const ASP_MIN      = 0.62;         // base aspect ratio (w:h) range
const ASP_MAX      = 1.55;
const ANISO_AMT    = 0.45;         // how far the aspect drifts from its base
const ANISO_ROT    = 0.9;          // radians of orientation drift
const ANISO_SPD    = 0.0016;       // noise step per frame — very slow

// ── TOUCH MARK + PROMPT ──────────────────────────────────────────
// Not a ring. A drawn circle is exact geometry in an image that has none, and
// it read as an instrument's readout rather than as part of the material. The
// mark is now the same frayed sprite the field is built from, so its edge is
// already irregular — a brief bright patch instead of a measured radius.
const MARK_R_LOW   = 40;           // patch radius at c = 0  (open, searching)
const MARK_R_HIGH  = 16;           // at c = 1 (closed in)
const MARK_A_LOW   = 60;           // patch alpha at c = 0  (0..255)
const MARK_A_HIGH  = 120;          // at c = 1
const MARK_LOBES   = 3;            // overlapping offset copies — one sprite is
                                   // still roundish; three at slight offsets
                                   // give the patch a lopsided outline
const MARK_SPREAD  = 0.30;         // how far the lobes sit off centre, as a
                                   // fraction of the radius
// Rings, used by the idle beacon only. Once a hand is down there is no drawn
// line anywhere on the screen — the whole image is accumulated light, and the
// touch mark is the frayed patch above. The ring is what the work shows while
// it is waiting to be touched, and it goes as soon as it is answered.
const RING_MUL     = 1.02;         // ring radius, as a multiple of the beacon patch
const RING_OUTER   = 1.45;         // outer ring, as a multiple of the inner
// Scintillation. A hand held still makes the patch twinkle — each lobe on its
// own noise lane and at its own rate, so the mark flickers unevenly the way a
// point of light does seen through air, rather than pulsing as one piece.
// Scaled by stability, so it is stillness itself that lights it: move and the
// patch goes flat and steady, stop and it comes alive. The field's whole
// argument is that waiting is rewarded, and this is the smallest place that
// can be said.
const TWINKLE_AMT  = 0.75;         // depth at full stillness (0 = off)
const TWINKLE_SPD  = 0.035;        // noise step per frame — reads as scintillation
const TIP_SIZE     = 15;           // "MOVE OR HOLD TO EXPLORE" type size
// Idle beacon, shown before the first touch — the same mark, breathing.
const IDLE_PERIOD  = 210;          // frames per breath (~3.5s at 60fps)
const IDLE_R_LOW   = 22;           // patch radius at the bottom of the breath
const IDLE_R_HIGH  = 40;           // at the top — the width a touch opens at
const IDLE_A       = 78;           // peak patch alpha
const IDLE_TXT_A   = 78;           // peak text alpha

let glowTexes = [];   // one p5.Graphics per falloff profile, re-tinted each frame

// ── WEBSOCKET ─────────────────────────────────────────────────────
let ws = null;

function connectWS() {
  const dot = document.getElementById('ws-dot');
  dot.className = 'try';
  try {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);
    ws.onopen    = () => { dot.className = 'on'; };
    ws.onclose   = () => { dot.className = 'off'; setTimeout(connectWS, 2000); };
    ws.onerror   = () => { dot.className = 'off'; };
  } catch (e) {
    setTimeout(connectWS, 2000);
  }
}

function sendTouchData(eventName) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  const currentDuration = isTouching ? (millis() - touchStartT) / 1000 : duration;

  ws.send(JSON.stringify({
    event:      eventName,
    isTouching,
    x:          +touchX.toFixed(4),
    y:          +touchY.toFixed(4),
    duration:   +currentDuration.toFixed(3),
    speed:      +Math.min(rawSpeed / SPEED_MAX, 1).toFixed(3),
    stability:  +stability.toFixed(3),
    agitation:  +agitation.toFixed(3),
    clickCount,
    c:          +cValue.toFixed(4),
    state:      stateName,
    timestamp:  Date.now(),
  }));
}

// ── TOUCH STATE ───────────────────────────────────────────────────
let isTouching    = false;
let touchX        = 0.5, touchY = 0.5;
let duration      = 0;
let rawSpeed      = 0;
let stability     = 0;
let agitation     = 0;
let clickCount    = 0;
let lastClickTime = 0;
let lastMoveTime  = 0;
let touchStartT   = 0;
let cValue        = 0;
let stateName     = 'autonomous';

const C_SMOOTH = 0.06;
const C_DECAY  = 0.012;

const STATE_LABELS = {
  autonomous:  'AUTONOMOUS DIFFUSION',
  disturbance: 'HUMAN DISTURBANCE',
  search:      'LATENT SEARCH',
  return_:     'TEMPORARY RETURN',
  rediffusion: 'RE-DIFFUSION',
};

const STATE_COLORS = {
  autonomous:  '#1a1a22',
  disturbance: '#221010',
  search:      '#101622',
  return_:     '#141e1e',
  rediffusion: '#0e0e14',
};

// ── DENSITY FIELD ─────────────────────────────────────────────────
// Positions are normalised (0..1) and fixed for the life of the page, so a
// window resize re-lays the same field rather than rebuilding a different one.
let nodes = [];

function buildField() {
  nodes = [];
  const centres = [];
  for (let i = 0; i < N_CLUSTER; i++) {
    // Wider than the old 0.12–0.88: centres were never allowed near an edge, so
    // the field always sat in from the frame by the same margin.
    centres.push({ x: random(0.06, 0.94), y: random(0.06, 0.94) });
  }
  for (let i = 0; i < N_NODE; i++) {
    // Random membership rather than i % N_CLUSTER. Round-robin gave every
    // cluster exactly the same node count, which is a regularity you can see.
    const ci = floor(random(N_CLUSTER));
    const cc = centres[ci];

    let hx, hy, rank;
    if (random() < STRAY_FRAC) {
      // A stray: anywhere on the canvas, and treated as periphery so that it
      // burns off as the field gathers. These are what keep the clusters from
      // reading as a countable set of discs.
      hx = random(0.02, 0.98);
      hy = random(0.02, 0.98);
      rank = random(0.7, 1);
    } else {
      // Gaussian offset, not uniform: dense at the centre and thinning outward
      // is what makes a cluster read as a soft hot spot rather than a disc.
      const ox = randomGaussian(0, CLUSTER_SD);
      const oy = randomGaussian(0, CLUSTER_SD);
      hx = constrain(cc.x + ox, 0.02, 0.98);
      hy = constrain(cc.y + oy, 0.02, 0.98);
      rank = min(sqrt(ox * ox + oy * oy) / (CLUSTER_SD * 2.2), 1);
    }

    nodes.push({
      hx, hy,             // home — fixed for the life of the page
      cx: hx, cy: hy,     // current — eased toward a state-dependent target
      cl:   ci,                                   // which cluster it belongs to
      size: random(NODE_SIZE_MIN, NODE_SIZE_MAX),
      amul: random(NODE_A_VAR_MIN, NODE_A_VAR_MAX),
      // 0 at the heart of a cluster, 1 at its edge. Drives the weighting that
      // gathers the field, and how far a node travels when it converges.
      rank,
      ph:   random(TWO_PI),
      heat: 0,
      tex:  floor(random(N_TEX)),                 // which sprite variant
      asp:  random(ASP_MIN, ASP_MAX),             // base ellipticity
      rot:  random(TWO_PI),                       // base orientation
      seed: random(1000),                         // its own lane in the noise field
    });
  }
}

// Call inside blendMode(ADD): overlapping glows sum into continuous fog, and it
// is the amount of overlap — not any drawn outline — that reads as density.
function drawField(c) {
  const baseR = lerp(NODE_R_LOW, NODE_R_HIGH, c);
  const baseA = lerp(NODE_A_LOW, NODE_A_HIGH, c);
  const mx = touchX * width;
  const my = touchY * height;

  // Dispersal runs on its own clock. c is already falling; this reads how far
  // through the fall the field is, and turns that into growth and fade rather
  // than into speed — a released field should look like it is thinning out,
  // not like it is running away.
  const dispersing = stateName === 'rediffusion';
  const disperse   = dispersing ? constrain(1 - c, 0, 1) : 0;
  const rMul = 1 + disperse * DISPERSE_GROW;
  const aMul = 1 - disperse * DISPERSE_FADE;

  // How far toward the attractor this frame's c is asking for. Squared so that
  // nothing moves at all through the early, uncertain part of a hold and the
  // gathering only becomes legible once the gesture has committed.
  const pull = c * c * CONVERGE;
  const searching = stateName === 'search';

  // One flicker value per cluster, computed once a frame rather than per node.
  const clusterTw = [];
  for (let i = 0; i < N_CLUSTER; i++) {
    clusterTw.push(1 + CLUS_TWINKLE * constrain(
      (noise(i * 57.3, frameCount * CLUS_TW_SPD * (1 + i * 0.17)) - 0.5) * NOISE_STRETCH,
      -1, 1));
  }

  for (const n of nodes) {
    // Target: home, drawn toward the attractor by c, and — while the system is
    // searching — wandering slowly around wherever that leaves it.
    let tx = lerp(n.hx, ATTRACT_X, pull);
    let ty = lerp(n.hy, ATTRACT_Y, pull);
    if (searching) {
      tx += (noise(n.seed + 11, frameCount * DRIFT_SPD) - 0.5) * DRIFT_AMT;
      ty += (noise(n.seed + 23, frameCount * DRIFT_SPD) - 0.5) * DRIFT_AMT;
    }
    n.cx += (tx - n.cx) * POS_EASE;
    n.cy += (ty - n.cy) * POS_EASE;

    const x = n.cx * width;
    const y = n.cy * height;

    if (isTouching) {
      const d = dist(x, y, mx, my);
      if (d < HEAT_R) n.heat = min(1, n.heat + HEAT_RISE * (1 - d / HEAT_R));
    }
    n.heat = max(0, n.heat - HEAT_FALL);

    // At c = 0 the weighting is nearly flat, so the field is an even haze. At
    // c = 1 it falls off sharply with rank, so the cluster hearts carry almost
    // everything and their edges go dark.
    const w      = lerp(1 - 0.25 * n.rank, pow(1 - n.rank, 2) * 1.9, c);
    const breath = 1 + BREATH_AMT * sin(frameCount * BREATH_SPD + n.ph);
    // Rate scaled by size: a node 1.6x wider shimmers about half as fast, so
    // large and small never fall into step.
    const twSpd  = NODE_TW_SPD * (1.5 - n.size * 0.5);
    const twinkle = clusterTw[n.cl] * (1 + NODE_TWINKLE * constrain(
      (noise(n.seed + 71, frameCount * twSpd) - 0.5) * NOISE_STRETCH, -1, 1));
    let   a      = (baseA * n.amul * w * breath * twinkle + n.heat * HEAT_A) * aMul;

    // Agitation makes the field boil rather than scatter: the nodes hold their
    // positions and their brightness wavers. Driven by noise, not random(),
    // because a fresh random value every frame on a cleared canvas strobes.
    if (agitation > 0.4) {
      a *= 1 + (noise(n.ph * 7, frameCount * 0.05) - 0.5) * agitation * 1.2;
    }
    if (a <= 0.4) continue;

    const d = baseR * n.size * (1 + n.heat * HEAT_GROW) * rMul * 2;

    // Ellipticity and orientation drift on their own slow noise lanes. Width
    // and height are derived so that w * h stays d * d — otherwise a node
    // stretching one way would also brighten, and the drift would read as a
    // pulse rather than as a shape changing.
    const asp = n.asp * (1 + (noise(n.seed, frameCount * ANISO_SPD) - 0.5) * ANISO_AMT);
    const rot = n.rot + (noise(n.seed + 37, frameCount * ANISO_SPD) - 0.5) * ANISO_ROT;
    const k   = sqrt(asp);

    drawingContext.globalAlpha = min(a, 255) / 255;
    push();
    translate(x, y);
    rotate(rot);
    image(glowTexes[n.tex], 0, 0, d * k, d / k);
    pop();
  }
}

// ── TOUCH MARK ────────────────────────────────────────────────────
// Several offset copies of a frayed sprite. Call inside blendMode(ADD).
// `shimmer` is 0 for a steady patch, up to TWINKLE_AMT for a twinkling one.
function drawMark(x, y, r, a, phase, shimmer) {
  for (let i = 0; i < MARK_LOBES; i++) {
    const ang = phase + (i / MARK_LOBES) * TWO_PI;
    const off = r * MARK_SPREAD;
    // Separate lanes and slightly different rates: shared timing would read as
    // one object breathing, which is the opposite of what twinkling is.
    const tw = shimmer > 0
      ? 1 + shimmer * constrain(
          (noise(i * 31.7, frameCount * TWINKLE_SPD * (1 + i * 0.23)) - 0.5) * NOISE_STRETCH,
          -1, 1)
      : 1;
    drawingContext.globalAlpha = max(0, (a / MARK_LOBES) * tw) / 255;
    push();
    translate(x + cos(ang) * off, y + sin(ang) * off);
    rotate(ang);
    image(glowTexes[i % N_TEX], 0, 0, r * 2, r * 2);
    pop();
  }
}

// Two concentric strokes, drawn in BLEND — a stroke under ADD dissolves into
// the field it is meant to sit against.
function drawRings(x, y, r, a) {
  noFill();
  strokeWeight(1);
  stroke(242, 242, 242, a);
  circle(x, y, r * 2);
  stroke(242, 242, 242, a * 0.34);
  circle(x, y, r * 2 * RING_OUTER);
  noStroke();
}

// ── TRAIL ─────────────────────────────────────────────────────────
let residue  = [];
let lastResX = -999, lastResY = -999;

function spawnResidue() {
  if (!isTouching) { lastResX = -999; lastResY = -999; return; }
  const mx = touchX * width;
  const my = touchY * height;
  if (dist(mx, my, lastResX, lastResY) < TRAIL_MIN_D) return;
  residue.push({ x: mx, y: my, born: millis(), tex: floor(random(N_TEX)),
                 rot: random(TWO_PI) });
  if (residue.length > TRAIL_MAX) residue.shift();
  lastResX = mx; lastResY = my;
}

// Call inside blendMode(ADD).
function drawTrail() {
  const now = millis();

  for (let i = residue.length - 1; i >= 0; i--) {
    const p = residue[i];
    const t = (now - p.born) / 1000 / TRAIL_LIFE;
    if (t >= 1) { residue.splice(i, 1); continue; }
    const r = lerp(TRAIL_R0, TRAIL_R1, t);        // spreads
    const a = TRAIL_A0 * Math.exp(-TRAIL_DECAY * t);  // and thins, exponentially
    if (a <= 0.4) continue;
    drawingContext.globalAlpha = a / 255;
    push();
    translate(p.x, p.y);
    rotate(p.rot);
    image(glowTexes[p.tex], 0, 0, r * 2, r * 2);
    pop();
  }

  // The head last, so it sits over its own trail rather than under it.
  if (isTouching) {
    drawingContext.globalAlpha = HEAD_A / 255;
    image(glowTexes[0], touchX * width, touchY * height, HEAD_R * 2, HEAD_R * 2);
  }
}

// ── GLOW SPRITE ───────────────────────────────────────────────────
// One radial-gradient texture, built once and re-tinted per frame. Drawing a
// real gradient per node per frame would cost thousands of operations a
// second; this costs one fill.
// A small deterministic generator, so the sprites are identical on every load
// and the field has one fixed set of shapes rather than a new set each refresh.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Geometry only — built once. The colour is applied later, when c changes.
let texSpecs = [];

function buildTexSpecs() {
  const rng = mulberry32(TEX_SEED);
  texSpecs = [];
  for (let i = 0; i < N_TEX; i++) {
    const n = floor(SUB_MIN + rng() * (SUB_MAX - SUB_MIN + 1));
    const subs = [];
    let wsum = 0;
    for (let j = 0; j < n; j++) {
      // The first sub-kernel sits at the centre so every sprite still has a
      // core; the rest scatter around it and make the swells.
      const off = j === 0 ? 0 : SUB_OFFSET;
      const w = 0.35 + rng() * 0.65;
      wsum += w;
      subs.push({
        ox: (rng() - 0.5) * 2 * off,
        oy: (rng() - 0.5) * 2 * off,
        r:  SUB_R_MIN + rng() * (SUB_R_MAX - SUB_R_MIN),
        k:  SUB_K_MIN + rng() * (SUB_K_MAX - SUB_K_MIN),
        w,
      });
    }
    for (const sub of subs) sub.w /= wsum;

    // Normalising by the weight sum alone leaves each sprite peaking somewhere
    // between 0.53 and 0.75, because the sub-kernels are offset and never all
    // contribute at one point — so a composite sprite would come out a third
    // dimmer than the single gradient it replaces, and unevenly so between
    // variants. Rescale on the measured maximum instead: the sprites end up
    // equally bright at their brightest, and the internal relief is untouched
    // because every weight is scaled by the same factor.
    let peak = 0;
    for (let gx = -1; gx <= 1; gx += 0.05) {
      for (let gy = -1; gy <= 1; gy += 0.05) {
        let a = 0;
        for (const sub of subs) {
          const d = Math.hypot(gx - sub.ox, gy - sub.oy) / sub.r;
          if (d >= 1) continue;
          const base = Math.exp(-sub.k);
          a += sub.w * (Math.exp(-sub.k * d * d) - base) / (1 - base);
        }
        if (a > peak) peak = a;
      }
    }
    if (peak > 0) for (const sub of subs) sub.w *= TEX_PEAK / peak;

    texSpecs.push(subs);
  }
}

// One alpha mask per sprite, built once. White in the core, frayed at the rim.
let edgeMasks = [];

function buildEdgeMasks() {
  edgeMasks = [];
  const R = GLOW_TEX / 2;
  for (let i = 0; i < N_TEX; i++) {
    const g = createGraphics(GLOW_TEX, GLOW_TEX);
    const ctx = g.drawingContext;
    const img = ctx.createImageData(GLOW_TEX, GLOW_TEX);
    const data = img.data;
    // Each sprite gets its own region of the noise field, so the six masks are
    // different rather than six copies of one edge.
    const off = i * 500;
    for (let y = 0; y < GLOW_TEX; y++) {
      for (let x = 0; x < GLOW_TEX; x++) {
        const dx = (x - R) / R;
        const dy = (y - R) / R;
        const rr = sqrt(dx * dx + dy * dy);
        let a = 1;
        if (rr > EDGE_START) {
          // Ramped, so the core stays perfectly smooth and only the outer band
          // is eaten into — noise across the whole sprite would read as dirt.
          const t = (rr - EDGE_START) / (1 - EDGE_START);
          const n = noise(x * EDGE_FREQ + off, y * EDGE_FREQ + off);
          a = 1 - min(t, 1) * EDGE_AMT * (1 - n) * 2;
        }
        const idx = (y * GLOW_TEX + x) * 4;
        data[idx] = data[idx + 1] = data[idx + 2] = 255;
        data[idx + 3] = constrain(a, 0, 1) * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    edgeMasks.push(g);
  }
}

let texStep = -1;   // which quantised c the sprites are currently tinted for

function paintGlowTex(c) {
  const step = round(constrain(c, 0, 1) * (TEX_STEPS - 1));
  if (step === texStep) return;      // nothing to do on most frames
  texStep = step;

  const t = step / (TEX_STEPS - 1);
  const col = [
    lerp(FOG_LOW[0], FOG_HIGH[0], t),
    lerp(FOG_LOW[1], FOG_HIGH[1], t),
    lerp(FOG_LOW[2], FOG_HIGH[2], t),
  ].map((v) => Math.round(v));
  const rgb = `${col[0]},${col[1]},${col[2]}`;
  const R = GLOW_TEX / 2;

  for (let i = 0; i < glowTexes.length; i++) {
    const tex = glowTexes[i];
    const ctx = tex.drawingContext;
    tex.clear();
    // Sub-kernels add rather than paint over each other — that is what makes an
    // overlap a swell instead of the topmost one simply winning.
    ctx.globalCompositeOperation = 'lighter';

    for (const sub of texSpecs[i]) {
      const cx = R + sub.ox * R;
      const cy = R + sub.oy * R;
      const rr = sub.r * R;
      const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      // exp(-k t^2), rescaled so it reaches exactly 0 at the rim. Without the
      // rescale every sub-kernel would end on a small non-zero value and the
      // sprite would show a faint disc edge.
      const base = Math.exp(-sub.k);
      for (let sIdx = 0; sIdx <= 8; sIdx++) {
        const st = sIdx / 8;
        const a  = sub.w * (Math.exp(-sub.k * st * st) - base) / (1 - base);
        g.addColorStop(st, `rgba(${rgb},${Math.max(a, 0).toFixed(4)})`);
      }
      ctx.fillStyle = g;
      // Only the sub-kernel's own box, not the whole sprite.
      ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
    }
    // Keep only what the mask lets through. One composite per sprite, so the
    // frayed edge costs nothing beyond the re-tint that was happening anyway.
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(edgeMasks[i].elt, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }
}

// ── SETUP ─────────────────────────────────────────────────────────
function setup() {
  const cnv = createCanvas(windowWidth, windowHeight - HUD_H);
  cnv.parent('sketch-container');
  background(0);
  colorMode(RGB, 255, 255, 255, 255);
  imageMode(CENTER);
  buildTexSpecs();
  buildEdgeMasks();
  for (let i = 0; i < N_TEX; i++) {
    glowTexes.push(createGraphics(GLOW_TEX, GLOW_TEX));
  }
  paintGlowTex(0);
  lastMoveTime = millis();
  buildField();
  connectWS();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - HUD_H);
}

// ── DRAW ──────────────────────────────────────────────────────────
function draw() {
  // A full clear. The old semi-transparent wipe existed to leave a fading copy
  // of the previous frame behind fast-moving particles; nothing here travels
  // anywhere near its own radius in a frame, so that copy would only be a
  // smear waiting to happen.
  blendMode(BLEND);
  drawingContext.globalAlpha = 1;
  noStroke();
  background(0);

  paintGlowTex(cValue);
  spawnResidue();

  // The idle beacon breathes on one envelope shared by its mark and its words,
  // so they arrive as a single thing — the mark shows what a touch will look
  // like, the words say what to do. Cosine rather than the old
  // frameCount % 120 < 60, which switched between two frames and read as a
  // blink. Computed here because the mark is drawn in the additive pass and the
  // text in the normal one.
  const idle = !isTouching && cValue < 0.1;
  const env  = idle
    ? 0.5 - 0.5 * cos((frameCount % IDLE_PERIOD) / IDLE_PERIOD * TWO_PI)
    : 0;

  // ── additive pass: everything made of light ──
  blendMode(ADD);
  noTint();

  drawField(cValue);
  drawTrail();

  // The touch mark, over its own trail. Contracts and brightens as c rises, so
  // it closes in on the point as the ink closes in on itself.
  if (isTouching) {
    drawMark(
      touchX * width, touchY * height,
      lerp(MARK_R_LOW, MARK_R_HIGH, cValue),
      lerp(MARK_A_LOW, MARK_A_HIGH, cValue),
      frameCount * 0.006,
      TWINKLE_AMT * stability      // still hand → twinkling; moving hand → flat
    );
  } else if (idle) {
    drawMark(width / 2, height / 2,
             lerp(IDLE_R_LOW, IDLE_R_HIGH, env), IDLE_A * env,
             frameCount * 0.004, TWINKLE_AMT);   // nothing is moving, so it twinkles
  }

  // ── back to normal blending for the things with edges ──
  blendMode(BLEND);
  drawingContext.globalAlpha = 1;

  // Rings belong to the idle screen only. Once a hand is down the image is all
  // accumulated light and nothing else — no drawn line anywhere on it. The ring
  // is what the work shows when it is waiting, and it goes the moment it is
  // answered.
  if (idle) {
    drawRings(width / 2, height / 2,
              lerp(IDLE_R_LOW, IDLE_R_HIGH, env) * RING_MUL,
              IDLE_A * env);
  }

  if (idle) {
    fill(200, 200, 200, IDLE_TXT_A * env);
    noStroke();
    textSize(TIP_SIZE);
    textAlign(CENTER, CENTER);
    // Tracking suits an instruction that has to read as the system's voice
    // rather than as a caption. Ignored by browsers that don't support it.
    drawingContext.letterSpacing = '0.2em';
    text('MOVE OR HOLD TO EXPLORE', width / 2, height / 2);
    drawingContext.letterSpacing = '0px';
  }

  updateState();
}

// ── INPUT ─────────────────────────────────────────────────────────
function keyPressed() {
  if (key === 'f' || key === 'F') {
    fullscreen(!fullscreen());
    return false;
  }
}

function mousePressed() {
  startTouch(mouseX / width, mouseY / height);
  return false;
}
function mouseDragged() {
  moveTouch(mouseX / width, mouseY / height);
  return false;
}
function mouseReleased() {
  endTouch();
  return false;
}
function touchStarted() {
  if (touches.length > 0) startTouch(touches[0].x / width, touches[0].y / height);
  return false;
}
function touchMoved() {
  if (touches.length > 0) moveTouch(touches[0].x / width, touches[0].y / height);
  return false;
}
function touchEnded() {
  endTouch();
  return false;
}

function startTouch(nx, ny) {
  isTouching    = true;
  touchX = nx;  touchY = ny;
  touchStartT   = millis();
  rawSpeed      = 0;
  const now     = Date.now();
  clickCount    = (now - lastClickTime < 380) ? clickCount + 1 : 1;
  lastClickTime = now;
  lastMoveTime  = millis();
  duration      = 0;
  sendTouchData('down');
}

function moveTouch(nx, ny) {
  if (!isTouching) return;
  const dt = (millis() - lastMoveTime) / 1000;
  if (dt > 0) {
    // Measured against touchX/touchY, which still hold the previous position at
    // this point in the function. A separate prevX/prevY pair used to carry it,
    // but it was assigned from touchX *before* touchX was updated, so it lagged
    // by two events while dt spanned one — every reading after the first came
    // out at exactly twice the real speed. That inflated stability toward zero,
    // inflated agitation, and tripped the disturbance state at half the
    // intended movement rate.
    const dx = (nx - touchX) * width;
    const dy = (ny - touchY) * height;
    rawSpeed = sqrt(dx * dx + dy * dy) / dt;
  }
  touchX = nx;  touchY = ny;
  lastMoveTime = millis();
  sendTouchData('move');
}

function endTouch() {
  isTouching = false;
  rawSpeed   = 0;
  sendTouchData('up');
}

// ── STATE + HUD ───────────────────────────────────────────────────
function updateState() {
  duration = isTouching ? (millis() - touchStartT) / 1000 : 0;

  // A finger held still fires no move events, so rawSpeed would otherwise stay
  // frozen at whatever it last measured — the system would never notice that the
  // gesture had stopped, stability could not recover, and a hold that began with
  // movement could never reach a high c. Decaying it here is what lets "stop and
  // wait" read as stillness, so the field slows and gathers instead of churning.
  if (isTouching && millis() - lastMoveTime > 60) rawSpeed *= 0.90;

  const normSpd = min(rawSpeed / SPEED_MAX, 1);
  stability = isTouching ? max(0, 1 - normSpd) : 0;

  // clickCount is still counted and still reported to TouchDesigner, but it no
  // longer feeds agitation. Repeated tapping used to hold a floor of 0.35 under
  // agitation for the rest of the hold, so a gesture that began with taps could
  // never fully settle however still the hand became. Agitation now reads
  // movement alone, which is the only thing that should keep the ink disturbed.
  agitation = isTouching
    ? normSpd
    : max(0, agitation - 0.02);

  // Weights sum to 1.0 so a long, still, calm hold drives cTarget → 1.0,
  // which lets full_axis_video (index = c * 480) reach its final frame.
  const cTarget = isTouching
    ? min(max(min(duration / 18, 1) * 0.7 + stability * 0.3 - agitation * 0.2, 0), 1)
    : 0;

  cValue = isTouching
    ? cValue + (cTarget - cValue) * C_SMOOTH
    : max(0, cValue - C_DECAY);

  const decaying = !isTouching && cValue > 0.05;
  let sn;
  if      (decaying)                                             sn = 'rediffusion';
  else if (agitation > 0.55 || normSpd > 0.65)                  sn = 'disturbance';
  else if (isTouching && cValue >= 0.75 && stability > 0.7)     sn = 'return_';
  else if (isTouching && cValue >= 0.3)                         sn = 'search';
  else                                                           sn = 'autonomous';

  if (sn !== stateName) {
    stateName = sn;
    const el = document.getElementById('state-txt');
    el.textContent = STATE_LABELS[sn];
    el.style.color = STATE_COLORS[sn];
    document.getElementById('sys-state').textContent = STATE_LABELS[sn];
  }

  document.getElementById('v-c').textContent = cValue.toFixed(2);
  document.getElementById('v-s').textContent = stability.toFixed(2);
  document.getElementById('v-a').textContent = agitation.toFixed(2);
  document.getElementById('v-d').textContent = duration.toFixed(1) + 's';

  // System HUD: fades in while touching, lingers through the decay
  const sysHud = document.getElementById('sys-hud');
  sysHud.classList.toggle('visible', isTouching || cValue > 0.05);
  document.getElementById('sys-c').textContent = cValue.toFixed(2);
  document.getElementById('sys-s').textContent = stability.toFixed(2);
  document.getElementById('sys-a').textContent = agitation.toFixed(2);
  document.getElementById('sys-d').textContent = duration.toFixed(1) + 's';
}

// ── SEND TO TD ────────────────────────────────────────────────────
setInterval(() => {
  sendTouchData('frame');
}, 1000 / SEND_FPS);
