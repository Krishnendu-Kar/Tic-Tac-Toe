// Canvas game engines for the Retro Arcade. Each factory returns
// { start, stop, destroy, key } and reports through hooks.onScore / hooks.onGameOver.

const rand = (n) => Math.floor(Math.random() * n);
const BG = '#0b0b0e';

function loop(step) {
  let raf = 0, last = 0, running = false;
  const tick = (t) => {
    if (!running) return;
    const dt = Math.min(48, t - last) || 16;
    last = t;
    step(dt);
    raf = requestAnimationFrame(tick);
  };
  return {
    start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(raf); },
    get running() { return running; }
  };
}

function glow(ctx, color, blur) { ctx.shadowColor = color; ctx.shadowBlur = blur; }
function clear(ctx, cv) { ctx.shadowBlur = 0; ctx.fillStyle = BG; ctx.fillRect(0, 0, cv.width, cv.height); }

/* ------------------------------ SNAKE ------------------------------ */
function snake(cv, h) {
  const ctx = cv.getContext('2d'), C = 30, W = cv.width / C, H = cv.height / C;
  let body, dir, next, food, score, acc, speed, dead;
  const place = () => { let p; do { p = { x: rand(W), y: rand(H) }; } while (body.some(c => c.x === p.x && c.y === p.y)); return p; };
  function reset() {
    body = [{ x: 6, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 9 }];
    dir = { x: 1, y: 0 }; next = dir; score = 0; acc = 0; speed = 115; dead = false;
    food = place(); h.onScore(0); draw();
  }
  function draw() {
    clear(ctx, cv);
    ctx.strokeStyle = 'rgba(255,255,255,.035)';
    for (let x = 0; x <= W; x++) { ctx.beginPath(); ctx.moveTo(x * C, 0); ctx.lineTo(x * C, cv.height); ctx.stroke(); }
    for (let y = 0; y <= H; y++) { ctx.beginPath(); ctx.moveTo(0, y * C); ctx.lineTo(cv.width, y * C); ctx.stroke(); }
    glow(ctx, '#ec4899', 18); ctx.fillStyle = '#ec4899';
    ctx.beginPath(); ctx.arc(food.x * C + C / 2, food.y * C + C / 2, C * 0.32, 0, 7); ctx.fill();
    glow(ctx, '#caff79', 14);
    body.forEach((c, i) => {
      ctx.fillStyle = i === 0 ? '#e8ffcc' : '#caff79';
      ctx.globalAlpha = i === 0 ? 1 : Math.max(.35, 1 - i / (body.length + 6));
      ctx.beginPath(); ctx.roundRect(c.x * C + 3, c.y * C + 3, C - 6, C - 6, 8); ctx.fill();
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }
  function step(dt) {
    acc += dt; if (acc < speed) return; acc = 0; dir = next;
    const head = { x: body[0].x + dir.x, y: body[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= W || head.y >= H || body.some(c => c.x === head.x && c.y === head.y)) {
      dead = true; L.stop(); draw(); h.onGameOver(score); return;
    }
    body.unshift(head);
    if (head.x === food.x && head.y === food.y) { score += 10; h.onScore(score); food = place(); speed = Math.max(58, speed - 3); }
    else body.pop();
    draw();
  }
  const L = loop(step);
  reset();
  return {
    start() { if (dead) reset(); L.start(); },
    stop() { L.stop(); },
    destroy() { L.stop(); },
    key(e) {
      const k = e.key.toLowerCase();
      const m = { arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 }, arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 } }[k];
      if (!m) return false;
      if (m.x !== -dir.x || m.y !== -dir.y) next = m;
      return true;
    }
  };
}

/* ------------------------------ FLAPPY ----------------------------- */
function flappy(cv, h) {
  const ctx = cv.getContext('2d');
  const GAP = 168, PW = 74;
  let y, v, pipes, score, dead, t;
  function reset() { y = cv.height / 2; v = 0; pipes = []; score = 0; dead = false; t = 0; h.onScore(0); draw(); }
  function spawn() { pipes.push({ x: cv.width + 20, gap: 90 + rand(cv.height - GAP - 180), scored: false }); }
  function draw() {
    clear(ctx, cv);
    ctx.fillStyle = 'rgba(255,255,255,.03)';
    for (let i = 0; i < 40; i++) ctx.fillRect((i * 137 + 40) % cv.width, (i * 91) % cv.height, 2, 2);
    glow(ctx, '#eab308', 14); ctx.fillStyle = '#eab308';
    pipes.forEach(p => {
      ctx.beginPath(); ctx.roundRect(p.x, 0, PW, p.gap, 10); ctx.fill();
      ctx.beginPath(); ctx.roundRect(p.x, p.gap + GAP, PW, cv.height - p.gap - GAP, 10); ctx.fill();
    });
    glow(ctx, '#caff79', 20); ctx.fillStyle = '#caff79';
    ctx.beginPath(); ctx.roundRect(120, y - 15, 34, 30, 9); ctx.fill();
    ctx.shadowBlur = 0;
  }
  function step(dt) {
    t += dt;
    v += 0.0019 * dt; y += v * dt;
    if (t > 1500) { t = 0; spawn(); }
    pipes.forEach(p => { p.x -= 0.26 * dt; });
    pipes = pipes.filter(p => p.x > -PW - 10);
    for (const p of pipes) {
      if (!p.scored && p.x + PW < 120) { p.scored = true; score++; h.onScore(score); }
      if (120 + 34 > p.x && 120 < p.x + PW && (y - 15 < p.gap || y + 15 > p.gap + GAP)) return over();
    }
    if (y > cv.height - 15 || y < 15) return over();
    draw();
  }
  function over() { dead = true; L.stop(); draw(); h.onGameOver(score); }
  const L = loop(step);
  const flap = () => { if (!dead && L.running) v = -0.55; };
  cv.addEventListener('pointerdown', flap);
  reset();
  return {
    start() { if (dead) reset(); L.start(); },
    stop() { L.stop(); },
    destroy() { L.stop(); cv.removeEventListener('pointerdown', flap); },
    key(e) { if (e.key === ' ' || e.key === 'ArrowUp') { flap(); return true; } return false; }
  };
}

/* ------------------------------- PONG ------------------------------ */
function pong(cv, h) {
  const ctx = cv.getContext('2d');
  const PH = 96, PW = 14;
  let py, ay, ball, sc, dead;
  function reset() { py = cv.height / 2 - PH / 2; ay = py; sc = { p: 0, a: 0 }; dead = false; serve(1); h.onScore(0); draw(); }
  function serve(dir) { ball = { x: cv.width / 2, y: cv.height / 2, vx: 0.36 * dir, vy: (Math.random() - .5) * 0.34 }; }
  function draw() {
    clear(ctx, cv);
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.setLineDash([10, 14]); ctx.beginPath();
    ctx.moveTo(cv.width / 2, 0); ctx.lineTo(cv.width / 2, cv.height); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = 'bold 54px Outfit, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.textAlign = 'center';
    ctx.fillText(sc.p, cv.width / 2 - 70, 66); ctx.fillText(sc.a, cv.width / 2 + 70, 66);
    glow(ctx, '#caff79', 16); ctx.fillStyle = '#caff79';
    ctx.beginPath(); ctx.roundRect(34, py, PW, PH, 7); ctx.fill();
    glow(ctx, '#ec4899', 16); ctx.fillStyle = '#ec4899';
    ctx.beginPath(); ctx.roundRect(cv.width - 34 - PW, ay, PW, PH, 7); ctx.fill();
    glow(ctx, '#ffffff', 18); ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, 9, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  }
  function step(dt) {
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.y < 9 || ball.y > cv.height - 9) ball.vy *= -1;
    const target = ball.vx > 0 ? ball.y - PH / 2 : cv.height / 2 - PH / 2;
    ay += Math.max(-0.30 * dt, Math.min(0.30 * dt, target - ay));
    ay = Math.max(0, Math.min(cv.height - PH, ay));
    if (ball.x < 34 + PW + 9 && ball.x > 34 && ball.y > py && ball.y < py + PH && ball.vx < 0) {
      ball.vx = Math.abs(ball.vx) * 1.05; ball.vy += ((ball.y - (py + PH / 2)) / PH) * 0.35;
    }
    if (ball.x > cv.width - 34 - PW - 9 && ball.x < cv.width - 34 && ball.y > ay && ball.y < ay + PH && ball.vx > 0) {
      ball.vx = -Math.abs(ball.vx) * 1.05; ball.vy += ((ball.y - (ay + PH / 2)) / PH) * 0.35;
    }
    if (ball.x < 0) { sc.a++; serve(1); }
    if (ball.x > cv.width) { sc.p++; h.onScore(sc.p); serve(-1); }
    if (sc.p >= 11 || sc.a >= 11) { dead = true; L.stop(); draw(); h.onGameOver(sc.p, sc.p > sc.a ? 'win' : 'loss'); return; }
    draw();
  }
  const L = loop(step);
  const move = (e) => { const r = cv.getBoundingClientRect(); py = Math.max(0, Math.min(cv.height - PH, (e.clientY - r.top) * (cv.height / r.height) - PH / 2)); };
  cv.addEventListener('pointermove', move);
  reset();
  return {
    start() { if (dead) reset(); L.start(); },
    stop() { L.stop(); },
    destroy() { L.stop(); cv.removeEventListener('pointermove', move); },
    key(e) {
      if (e.key === 'ArrowUp') { py = Math.max(0, py - 34); return true; }
      if (e.key === 'ArrowDown') { py = Math.min(cv.height - PH, py + 34); return true; }
      return false;
    }
  };
}

/* ----------------------------- BREAKOUT ---------------------------- */
function breakout(cv, h) {
  const ctx = cv.getContext('2d');
  const COLS = 9, ROWS = 5, BW = (cv.width - 60) / COLS, BH = 26, PW = 116;
  const COLORS = ['#ec4899', '#a855f7', '#22d3ee', '#caff79', '#f59e0b'];
  let px, ball, bricks, score, lives, dead;
  function reset() {
    px = cv.width / 2 - PW / 2; score = 0; lives = 3; dead = false;
    bricks = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) bricks.push({ r, c, alive: true });
    serve(); h.onScore(0); draw();
  }
  function serve() { ball = { x: cv.width / 2, y: cv.height - 90, vx: 0.28 * (Math.random() < .5 ? 1 : -1), vy: -0.34 }; }
  function draw() {
    clear(ctx, cv);
    bricks.forEach(b => {
      if (!b.alive) return;
      glow(ctx, COLORS[b.r], 12); ctx.fillStyle = COLORS[b.r];
      ctx.beginPath(); ctx.roundRect(30 + b.c * BW + 3, 50 + b.r * (BH + 8), BW - 6, BH, 7); ctx.fill();
    });
    glow(ctx, '#caff79', 16); ctx.fillStyle = '#caff79';
    ctx.beginPath(); ctx.roundRect(px, cv.height - 40, PW, 14, 7); ctx.fill();
    glow(ctx, '#fff', 16); ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, 9, 0, 7); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '600 15px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Lives ' + '●'.repeat(lives), 30, 30);
  }
  function step(dt) {
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.x < 9 || ball.x > cv.width - 9) ball.vx *= -1;
    if (ball.y < 9) ball.vy *= -1;
    if (ball.y > cv.height - 49 && ball.y < cv.height - 32 && ball.x > px && ball.x < px + PW && ball.vy > 0) {
      ball.vy = -Math.abs(ball.vy); ball.vx += ((ball.x - (px + PW / 2)) / PW) * 0.36;
    }
    for (const b of bricks) {
      if (!b.alive) continue;
      const x = 30 + b.c * BW + 3, y = 50 + b.r * (BH + 8);
      if (ball.x > x - 6 && ball.x < x + BW - 0 && ball.y > y - 6 && ball.y < y + BH + 6) {
        b.alive = false; ball.vy *= -1; score += 50 + (ROWS - b.r) * 10; h.onScore(score); break;
      }
    }
    if (!bricks.some(b => b.alive)) { dead = true; L.stop(); draw(); h.onGameOver(score, 'win'); return; }
    if (ball.y > cv.height) {
      lives--;
      if (lives <= 0) { dead = true; L.stop(); draw(); h.onGameOver(score); return; }
      serve();
    }
    draw();
  }
  const L = loop(step);
  const move = (e) => { const r = cv.getBoundingClientRect(); px = Math.max(0, Math.min(cv.width - PW, (e.clientX - r.left) * (cv.width / r.width) - PW / 2)); };
  cv.addEventListener('pointermove', move);
  reset();
  return {
    start() { if (dead) reset(); L.start(); },
    stop() { L.stop(); },
    destroy() { L.stop(); cv.removeEventListener('pointermove', move); },
    key(e) {
      if (e.key === 'ArrowLeft') { px = Math.max(0, px - 40); return true; }
      if (e.key === 'ArrowRight') { px = Math.min(cv.width - PW, px + 40); return true; }
      return false;
    }
  };
}

/* -------------------------- SPACE INVADERS ------------------------- */
function space(cv, h) {
  const ctx = cv.getContext('2d');
  const COLS = 8, ROWS = 4, IW = 40, IH = 28;
  let px, inv, bullets, bombs, score, wave, lives, sdir, sspeed, acc, dead, keys;
  function reset() {
    px = cv.width / 2 - 24; score = 0; wave = 1; lives = 3; dead = false; keys = {};
    bullets = []; bombs = []; makeWave(); h.onScore(0); draw();
  }
  function makeWave() {
    inv = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) inv.push({ x: 80 + c * 66, y: 60 + r * 52, alive: true, r });
    sdir = 1; sspeed = 0.035 + wave * 0.012; acc = 0;
  }
  function draw() {
    clear(ctx, cv);
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    for (let i = 0; i < 60; i++) ctx.fillRect((i * 173 + 30) % cv.width, (i * 101 + 17) % cv.height, 2, 2);
    inv.forEach(v => {
      if (!v.alive) return;
      const col = ['#22d3ee', '#a855f7', '#ec4899', '#eab308'][v.r];
      glow(ctx, col, 12); ctx.fillStyle = col;
      ctx.beginPath(); ctx.roundRect(v.x, v.y, IW, IH, 8); ctx.fill();
      ctx.fillStyle = BG; ctx.fillRect(v.x + 10, v.y + 9, 6, 6); ctx.fillRect(v.x + 24, v.y + 9, 6, 6);
    });
    glow(ctx, '#caff79', 16); ctx.fillStyle = '#caff79';
    ctx.beginPath(); ctx.moveTo(px + 24, cv.height - 62); ctx.lineTo(px + 48, cv.height - 26); ctx.lineTo(px, cv.height - 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#caff79'; bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 14));
    ctx.fillStyle = '#ec4899'; bombs.forEach(b => ctx.fillRect(b.x, b.y, 4, 14));
    ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '600 15px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Wave ' + wave + '   Lives ' + '●'.repeat(lives), 24, 28);
  }
  function step(dt) {
    if (keys.left) px = Math.max(0, px - 0.5 * dt);
    if (keys.right) px = Math.min(cv.width - 48, px + 0.5 * dt);
    acc += dt;
    if (acc > 40) {
      acc = 0;
      let flip = false;
      inv.forEach(v => { if (!v.alive) return; v.x += sdir * sspeed * 40; if (v.x < 20 || v.x > cv.width - IW - 20) flip = true; });
      if (flip) { sdir *= -1; inv.forEach(v => { v.y += 18; }); }
      if (Math.random() < 0.06 + wave * 0.01) {
        const live = inv.filter(v => v.alive);
        if (live.length) { const s = live[rand(live.length)]; bombs.push({ x: s.x + IW / 2, y: s.y + IH }); }
      }
    }
    bullets.forEach(b => { b.y -= 0.62 * dt; });
    bombs.forEach(b => { b.y += 0.32 * dt; });
    bullets = bullets.filter(b => b.y > -20); bombs = bombs.filter(b => b.y < cv.height + 20);
    bullets.forEach(b => {
      inv.forEach(v => {
        if (v.alive && b.y < v.y + IH && b.y > v.y && b.x > v.x && b.x < v.x + IW) {
          v.alive = false; b.y = -100; score += 60 - v.r * 5; h.onScore(score);
        }
      });
    });
    for (const b of bombs) {
      if (b.y > cv.height - 62 && b.x > px && b.x < px + 48) {
        b.y = cv.height + 99; lives--;
        if (lives <= 0) { dead = true; L.stop(); draw(); h.onGameOver(score); return; }
      }
    }
    if (inv.some(v => v.alive && v.y > cv.height - 110)) { dead = true; L.stop(); draw(); h.onGameOver(score); return; }
    if (!inv.some(v => v.alive)) { wave++; score += 200; h.onScore(score); makeWave(); }
    draw();
  }
  const L = loop(step);
  reset();
  return {
    start() { if (dead) reset(); L.start(); },
    stop() { L.stop(); keys = {}; },
    destroy() { L.stop(); },
    key(e, up) {
      const k = e.key;
      if (k === 'ArrowLeft') { keys.left = !up; return true; }
      if (k === 'ArrowRight') { keys.right = !up; return true; }
      if (k === ' ' && !up) { if (bullets.length < 3) bullets.push({ x: px + 22, y: cv.height - 66 }); return true; }
      return false;
    }
  };
}

const FACTORIES = { snake, flappy, pong, breakout, space };
export const CANVAS_GAMES = Object.keys(FACTORIES);
export function createGame(id, canvas, hooks) {
  const f = FACTORIES[id];
  return f ? f(canvas, hooks) : null;
}
