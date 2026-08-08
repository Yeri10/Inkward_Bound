// ── CONFIG ───────────────────────────────────────────────────────
const SEND_FPS  = 30;
const N_PART    = 130;   // fewer than the old dot field: each particle is now a wide glow
const HUD_H     = 36;
// Halved from 600 when the speed measurement below was corrected. rawSpeed used
// to come out at exactly twice the real value, and 600 had been tuned by hand
// against that inflated figure — so 300 against the true reading reproduces the
// previous feel exactly, and the `speed` field sent to TouchDesigner is
// numerically unchanged. The difference is that the threshold now means what it
// says: 300 px/s is the movement rate that counts as fully agitated.
const SPEED_MAX = 300;

// ── FOG LOOK (tuning block) ──────────────────────────────────────
// Everything visual is gathered here so the look can be tuned without
// touching the physics or the data pipeline below.
const GLOW_TEX     = 128;          // pre-rendered glow sprite resolution
const GLOW_R_LOW   = 17;           // glow radius at c = 0  (fine, broken-up mist)
const GLOW_R_HIGH  = 38;           // glow radius at c = 1  (thick, merging cloud)
const GLOW_A_LOW   = 16;           // per-particle alpha at c = 0  (0..255)
const GLOW_A_HIGH  = 30;           // per-particle alpha at c = 1
// Monochrome. The per-particle value is deliberately far below white: under ADD
// blending, overlapping glows accumulate toward white only where particles
// actually cluster, while sparse regions stay a dim grey. That tonal spread IS
// the density read — the image is built out of overlap, not out of colour.
const FOG_LOW      = [176, 176, 176];   // c = 0  — dimmer, finer mist
const FOG_HIGH     = [242, 242, 242];   // c = 1  — denser, closer to white
const TRAIL_LIFE   = 1.2;          // touch-residue lifetime, seconds (0.8–1.5)
const TRAIL_GAIN   = 1.18;         // residue sits ~18% brighter than the base fog
const TRAIL_MAX    = 220;          // pool cap
const TRAIL_MIN_D  = 6;            // min px travelled before dropping a new residue

let glowTex = null;   // p5.Graphics: white radial falloff, re-tinted each frame

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

// ── PARTICLES ─────────────────────────────────────────────────────
let particles = [];
let noiseT    = 0;

class Particle {
  constructor() {
    this.x    = random(width);
    this.y    = random(height);
    this.vx   = 0;
    this.vy   = 0;
    this.nox  = random(1000);
    this.noy  = random(1000);
    this.life = random(0.4, 1.0);
    this.r    = random(1.2, 3.0);   // retained: seeds per-particle glow size variance
  }

  // Physics is unchanged from the dot-field version — the noise flow, the centre
  // pull, the touch push/pull inversion and the agitation jitter all stay.
  // Only the rendering below became a density field instead of a point.
  update(c) {
    // The canvas is already created at (windowHeight - HUD_H), so its height
    // excludes the HUD bar. Subtracting HUD_H again here used to shrink the
    // particle field by a further 36px and offset it from the touch ring drawn
    // in draw(), which uses the full canvas height.
    const zone       = height;
    // Higher noise frequency than the dot field (~1.7x): the fog reads as raw
    // and finely broken rather than smoothly rendered — a system-internal view.
    const noiseScale = lerp(0.0060, 0.0022, c);
    const spd        = lerp(2.8, 0.4, c);
    const noiseSpeed = lerp(0.012, 0.003, c);

    const angle = noise(
      this.x * noiseScale + this.nox,
      this.y * noiseScale + this.noy,
      noiseT
    ) * TWO_PI * 2.5;

    const nx = cos(angle) * spd;
    const ny = sin(angle) * spd;

    // Center pull
    const pcx  = width  * 0.5;
    const pcy  = zone   * 0.5;
    const dx   = pcx - this.x;
    const dy   = pcy - this.y;
    const dist = sqrt(dx * dx + dy * dy) + 0.001;
    const pull = lerp(0.0, 0.035, c * c);

    // Touch influence
    let tx = 0, ty = 0;
    if (isTouching) {
      const mx  = touchX * width;
      const my  = touchY * zone;
      const tdx = this.x - mx;
      const tdy = this.y - my;
      const td  = sqrt(tdx * tdx + tdy * tdy) + 0.001;
      const inf = min(120 / (td * 0.8), 2.5);
      const dir = lerp(1, -0.3, c);
      tx = (tdx / td) * inf * dir;
      ty = (tdy / td) * inf * dir;
    }

    this.vx = this.vx * 0.82 + nx + (dx / dist) * pull * dist * 0.01 + tx;
    this.vy = this.vy * 0.82 + ny + (dy / dist) * pull * dist * 0.01 + ty;

    if (agitation > 0.4) {
      this.vx += randomGaussian(0, agitation * 1.5);
      this.vy += randomGaussian(0, agitation * 1.5);
    }

    this.x += this.vx;
    this.y += this.vy;
    this.nox += noiseSpeed;
    this.noy += noiseSpeed;

    // Wrap
    if (this.x < -10)        this.x = width + 5;
    if (this.x > width + 10) this.x = -5;
    if (this.y < -10)        this.y = zone + 5;
    if (this.y > zone + 10)  this.y = -5;
  }

  // Rendered as a wide, soft radial falloff rather than a visible disc.
  // Call inside blendMode(ADD): overlapping glows sum into continuous fog,
  // and it is the amount of overlap — not any drawn outline — that reads as density.
  draw(c) {
    let d = lerp(GLOW_R_LOW, GLOW_R_HIGH, c) * 2;
    d *= 0.75 + this.r * 0.12;   // per-particle size variance

    // Agitation destabilises the fog: glow sizes scatter, so the cloud's edge
    // breaks up and churns instead of holding a smooth boundary.
    if (agitation > 0.4) {
      d *= 1 + randomGaussian(0, agitation * 0.22);
      if (d < 4) d = 4;
    }

    const a = lerp(GLOW_A_LOW, GLOW_A_HIGH, c) * this.life;
    drawingContext.globalAlpha = a / 255;
    image(glowTex, this.x, this.y, d, d);
  }
}

// ── TOUCH RESIDUE ─────────────────────────────────────────────────
// A second, independent layer: the path a finger just took keeps glowing for
// ~1.2s on its own clock. It is NOT driven by c — but because a high c slows
// the global trail wipe, the residue simply reads as more persistent up there.
// That contrast is emergent, not hard-coded.
let residue      = [];
let lastResX     = -999, lastResY = -999;

function spawnResidue() {
  if (!isTouching) { lastResX = -999; lastResY = -999; return; }
  const mx = touchX * width;
  const my = touchY * height;
  if (dist(mx, my, lastResX, lastResY) < TRAIL_MIN_D) return;
  residue.push({ x: mx, y: my, born: millis() });
  if (residue.length > TRAIL_MAX) residue.shift();
  lastResX = mx; lastResY = my;
}

function drawResidue(c) {
  const now  = millis();
  const base = lerp(GLOW_A_LOW, GLOW_A_HIGH, c) * TRAIL_GAIN;
  for (let i = residue.length - 1; i >= 0; i--) {
    const age = (now - residue[i].born) / 1000;
    if (age >= TRAIL_LIFE) { residue.splice(i, 1); continue; }
    const k = 1 - age / TRAIL_LIFE;         // independent linear decay
    const d = lerp(GLOW_R_LOW, GLOW_R_HIGH, c) * 2 * (0.45 + 0.55 * k);
    drawingContext.globalAlpha = (base * k * k) / 255;
    image(glowTex, residue[i].x, residue[i].y, d, d);
  }
}

// ── GLOW SPRITE ───────────────────────────────────────────────────
// One radial-gradient texture, built once and re-tinted per frame. Drawing a
// real gradient per particle per frame would cost thousands of operations a
// second; this costs one fill.
function paintGlowTex(c) {
  const col = [
    lerp(FOG_LOW[0], FOG_HIGH[0], c),
    lerp(FOG_LOW[1], FOG_HIGH[1], c),
    lerp(FOG_LOW[2], FOG_HIGH[2], c),
  ].map((v) => Math.round(v));

  const ctx = glowTex.drawingContext;
  glowTex.clear();
  const r = GLOW_TEX / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0.00, `rgba(${col[0]},${col[1]},${col[2]},1)`);
  g.addColorStop(0.22, `rgba(${col[0]},${col[1]},${col[2]},0.52)`);
  g.addColorStop(0.50, `rgba(${col[0]},${col[1]},${col[2]},0.17)`);
  g.addColorStop(0.78, `rgba(${col[0]},${col[1]},${col[2]},0.04)`);
  g.addColorStop(1.00, `rgba(${col[0]},${col[1]},${col[2]},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, GLOW_TEX, GLOW_TEX);
}

// ── SETUP ─────────────────────────────────────────────────────────
function setup() {
  const cnv = createCanvas(windowWidth, windowHeight - HUD_H);
  cnv.parent('sketch-container');
  background(0);
  colorMode(RGB, 255, 255, 255, 255);
  imageMode(CENTER);
  glowTex = createGraphics(GLOW_TEX, GLOW_TEX);
  paintGlowTex(0);
  lastMoveTime = millis();
  for (let i = 0; i < N_PART; i++) particles.push(new Particle());
  connectWS();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - HUD_H);
}

// ── DRAW ──────────────────────────────────────────────────────────
function draw() {
  // Blend order matters. The trail wipe is a dark rectangle, and a dark
  // rectangle adds nothing under ADD — so the wipe must happen in BLEND, and
  // only then does the frame switch to ADD to accumulate light.
  blendMode(BLEND);
  drawingContext.globalAlpha = 1;
  noStroke();
  fill(0, 0, 0, lerp(18, 6, cValue));
  rect(0, 0, width, height);

  noiseT += lerp(0.008, 0.002, cValue);
  paintGlowTex(cValue);
  spawnResidue();

  // ── additive pass: fog ──
  blendMode(ADD);
  noTint();

  drawResidue(cValue);

  for (let pt of particles) {
    pt.update(cValue);
    pt.draw(cValue);
  }

  // Touch point, as a soft core rather than a drawn ring — the fog language
  // has no lines in it.
  if (isTouching) {
    const mx = touchX * width;
    const my = touchY * height;
    const halo = lerp(70, 26, cValue);
    drawingContext.globalAlpha = lerp(0.05, 0.14, cValue);
    image(glowTex, mx, my, halo * 2, halo * 2);
    drawingContext.globalAlpha = lerp(0.20, 0.42, cValue);
    image(glowTex, mx, my, 13, 13);
  }

  // ── back to normal blending for anything with an edge ──
  blendMode(BLEND);
  drawingContext.globalAlpha = 1;

  if (!isTouching && cValue < 0.1 && frameCount % 120 < 60) {
    fill(200, 200, 200, 26);
    noStroke();
    textSize(11);
    textAlign(CENTER, CENTER);
    text('HOLD TO SEARCH', width / 2, height / 2 + 28);
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
