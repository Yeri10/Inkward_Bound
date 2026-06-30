// ── CONFIG ───────────────────────────────────────────────────────
const SEND_FPS  = 30;
const N_PART    = 180;
const HUD_H     = 36;
const SPEED_MAX = 600;

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
let prevX         = 0.5, prevY  = 0.5;
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
    this.y    = random(height - HUD_H);
    this.vx   = 0;
    this.vy   = 0;
    this.nox  = random(1000);
    this.noy  = random(1000);
    this.life = random(0.4, 1.0);
    this.r    = random(1.2, 3.0);
  }

  update(c) {
    const zone       = height - HUD_H;
    const noiseScale = lerp(0.0035, 0.0012, c);
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

  draw(c) {
    const a = lerp(30, 110, c) * this.life;
    const r = this.r + c * 0.8;
    fill(255, 255, 255, a);
    noStroke();
    ellipse(this.x, this.y, r, r);
  }
}

// ── SETUP ─────────────────────────────────────────────────────────
function setup() {
  const cnv = createCanvas(windowWidth, windowHeight - HUD_H);
  cnv.parent('sketch-container');
  background(0);
  colorMode(RGB, 255, 255, 255, 255);
  lastMoveTime = millis();
  for (let i = 0; i < N_PART; i++) particles.push(new Particle());
  connectWS();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - HUD_H);
}

// ── DRAW ──────────────────────────────────────────────────────────
function draw() {
  // Fade trail
  fill(0, 0, 0, lerp(22, 8, cValue));
  noStroke();
  rect(0, 0, width, height);

  noiseT += lerp(0.008, 0.002, cValue);

  for (let pt of particles) {
    pt.update(cValue);
    pt.draw(cValue);
  }

  // Touch ring
  if (isTouching) {
    const mx   = touchX * width;
    const my   = touchY * (height);
    const ring = lerp(40, 8, cValue);
    noFill();
    stroke(255, 255, 255, lerp(15, 40, cValue));
    strokeWeight(0.5);
    ellipse(mx, my, ring * 2, ring * 2);
    fill(255, 255, 255, lerp(20, 70, cValue));
    noStroke();
    ellipse(mx, my, 3, 3);
  }

  // Idle hint
  if (!isTouching && cValue < 0.1 && frameCount % 120 < 60) {
    fill(255, 255, 255, 12);
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
  prevX  = nx;  prevY  = ny;
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
    const dx = (nx - prevX) * width;
    const dy = (ny - prevY) * height;
    rawSpeed = sqrt(dx * dx + dy * dy) / dt;
  }
  prevX = touchX; prevY = touchY;
  touchX = nx;    touchY = ny;
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

  const normSpd = min(rawSpeed / SPEED_MAX, 1);
  stability = isTouching ? max(0, 1 - normSpd) : 0;

  const clickP = min(clickCount / 6, 1);
  agitation = isTouching
    ? min(normSpd * 0.65 + clickP * 0.35, 1)
    : max(0, agitation - 0.02);

  const cTarget = isTouching
    ? min(max(min(duration / 10, 1) * 0.5 + stability * 0.3 - agitation * 0.2, 0), 1)
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
  }

  document.getElementById('v-c').textContent = cValue.toFixed(2);
  document.getElementById('v-s').textContent = stability.toFixed(2);
  document.getElementById('v-a').textContent = agitation.toFixed(2);
  document.getElementById('v-d').textContent = duration.toFixed(1) + 's';
}

// ── SEND TO TD ────────────────────────────────────────────────────
setInterval(() => {
  sendTouchData('frame');
}, 1000 / SEND_FPS);
