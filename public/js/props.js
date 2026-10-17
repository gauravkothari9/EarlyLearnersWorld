/* Extra characters, props and backgrounds used by styles 13–52, plus the ITEMS registry
   (id -> word + centered drawing) that the generic scene kits use. */
(function () {
  const K = window.KS;
  const { TAU, circle, oval, rrect, ball, blob, vgrad, grad3, shadow, shade, rgba, eye, bead, mouth, blinkAt, cheeks, rnd, starPath, text } = K;

  // ---------- fruit & veg ----------
  function banana(c, x, y, r) {
    c.save(); c.translate(x, y); c.rotate(-0.4);
    c.beginPath(); c.moveTo(-r, -r * 0.2); c.quadraticCurveTo(0, r * 1.1, r, -r * 0.3); c.quadraticCurveTo(0, r * 0.5, -r, -r * 0.2); c.closePath();
    c.fillStyle = grad3(c, 0, r * 0.2, r, '#ffd84a'); c.fill();
    c.strokeStyle = '#c99a1c'; c.lineWidth = r * 0.05; c.stroke();
    ball(c, r * 0.98, -r * 0.3, r * 0.07, '#6b4a1e'); ball(c, -r, -r * 0.2, r * 0.06, '#6b4a1e');
    c.restore();
  }
  function strawberry(c, x, y, r) {
    c.beginPath(); c.moveTo(x - r * 0.85, y - r * 0.45); c.bezierCurveTo(x - r * 0.9, y + r * 0.4, x - r * 0.2, y + r * 1.05, x, y + r * 1.05);
    c.bezierCurveTo(x + r * 0.2, y + r * 1.05, x + r * 0.9, y + r * 0.4, x + r * 0.85, y - r * 0.45); c.quadraticCurveTo(x, y - r * 0.85, x - r * 0.85, y - r * 0.45); c.closePath();
    c.fillStyle = grad3(c, x, y, r, '#ff3b4f'); c.fill();
    c.fillStyle = '#ffe9a8'; for (let i = 0; i < 14; i++) { oval(c, x + (rnd(i) - 0.5) * r * 1.3, y - r * 0.2 + rnd(i + 7) * r * 1.0, r * 0.04, r * 0.07); c.fill(); }
    for (let i = 0; i < 5; i++) blob(c, x + (i - 2) * r * 0.22, y - r * 0.6, r * 0.22, r * 0.09, '#3fb34f', (i - 2) * 0.5);
  }
  function watermelon(c, x, y, r) {
    c.beginPath(); c.moveTo(x - r, y - r * 0.2); c.arc(x, y - r * 0.2, r, 0, Math.PI); c.closePath(); c.fillStyle = '#2f9e44'; c.fill();
    c.beginPath(); c.moveTo(x - r * 0.88, y - r * 0.2); c.arc(x, y - r * 0.2, r * 0.88, 0, Math.PI); c.closePath(); c.fillStyle = '#ffffff'; c.fill();
    c.beginPath(); c.moveTo(x - r * 0.8, y - r * 0.2); c.arc(x, y - r * 0.2, r * 0.8, 0, Math.PI); c.closePath(); c.fillStyle = grad3(c, x, y, r, '#ff4f6b', 0.2, -0.1); c.fill();
    c.fillStyle = '#2b1d14'; for (let i = 0; i < 7; i++) { const a = 0.4 + i * 0.36; oval(c, x + Math.cos(a) * r * 0.5, y - r * 0.2 + Math.sin(a) * r * 0.45, r * 0.04, r * 0.07, a); c.fill(); }
  }
  function pear(c, x, y, r) {
    c.save(); c.strokeStyle = '#6b3e1e'; c.lineWidth = r * 0.1; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y - r * 0.95); c.lineTo(x + r * 0.1, y - r * 1.25); c.stroke(); c.restore();
    blob(c, x, y - r * 0.5, r * 0.45, r * 0.5, '#b5d93a'); blob(c, x, y + r * 0.25, r * 0.75, r * 0.7, '#b5d93a');
    blob(c, x + r * 0.32, y - r * 1.1, r * 0.25, r * 0.11, '#3fb34f', -0.4);
  }
  function cherries(c, x, y, r) {
    c.save(); c.strokeStyle = '#3f8a2e'; c.lineWidth = r * 0.08; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - r * 0.45, y + r * 0.2); c.quadraticCurveTo(x - r * 0.2, y - r * 0.6, x + r * 0.1, y - r * 1.0); c.moveTo(x + r * 0.45, y + r * 0.3); c.quadraticCurveTo(x + r * 0.3, y - r * 0.5, x + r * 0.1, y - r * 1.0); c.stroke(); c.restore();
    ball(c, x - r * 0.45, y + r * 0.45, r * 0.42, '#d6162f'); ball(c, x + r * 0.45, y + r * 0.55, r * 0.42, '#d6162f');
    blob(c, x + r * 0.35, y - r * 1.0, r * 0.3, r * 0.12, '#3fb34f', -0.3);
  }
  function lemon(c, x, y, r) { blob(c, x, y, r * 0.95, r * 0.72, '#ffe14a'); ball(c, x + r * 0.95, y, r * 0.12, '#f5cd1a'); ball(c, x - r * 0.95, y, r * 0.12, '#f5cd1a'); }
  function carrot(c, x, y, r) {
    for (let i = -1; i <= 1; i++) blob(c, x + i * r * 0.18, y - r * 1.0, r * 0.12, r * 0.38, '#3fb34f', i * 0.35);
    c.beginPath(); c.moveTo(x - r * 0.4, y - r * 0.7); c.quadraticCurveTo(x, y - r * 0.85, x + r * 0.4, y - r * 0.7); c.lineTo(x + r * 0.05, y + r * 1.1); c.lineTo(x - r * 0.05, y + r * 1.1); c.closePath();
    c.fillStyle = grad3(c, x, y - r * 0.2, r, '#ff8a1f'); c.fill();
    c.strokeStyle = 'rgba(160,70,0,.35)'; c.lineWidth = r * 0.04; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x - r * 0.3 + i * 0.05 * r, y - r * 0.4 + i * r * 0.35); c.lineTo(x - r * 0.05, y - r * 0.38 + i * r * 0.35); c.stroke(); }
  }
  function broccoli(c, x, y, r) {
    rrect(c, x - r * 0.18, y - r * 0.1, r * 0.36, r * 1.0, r * 0.12); c.fillStyle = vgrad(c, y, y + r, '#9fd86a', '#6fb544'); c.fill();
    for (const [px, py, rr] of [[-0.45, -0.25, 0.4], [0.45, -0.25, 0.4], [0, -0.55, 0.45], [-0.2, -0.1, 0.35], [0.2, -0.1, 0.35]]) ball(c, x + px * r, y + py * r, rr * r, '#3e9e3a');
  }
  function tomato(c, x, y, r) { blob(c, x, y, r, r * 0.88, '#ff3b2f'); for (let i = 0; i < 5; i++) blob(c, x + Math.cos(i * 1.256) * r * 0.22, y - r * 0.82 + Math.sin(i * 1.256) * r * 0.1, r * 0.25, r * 0.08, '#3fb34f', i * 1.256); oval(c, x - r * 0.35, y - r * 0.35, r * 0.15, r * 0.25, -0.5); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill(); }
  function corn(c, x, y, r) {
    blob(c, x - r * 0.35, y + r * 0.2, r * 0.3, r * 0.9, '#5cc04f', 0.25); blob(c, x + r * 0.35, y + r * 0.2, r * 0.3, r * 0.9, '#5cc04f', -0.25);
    blob(c, x, y - r * 0.1, r * 0.4, r * 0.95, '#ffd23f');
    c.fillStyle = 'rgba(200,140,0,.35)'; for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { circle(c, x - r * 0.2 + j * r * 0.2, y - r * 0.7 + i * r * 0.25, r * 0.07); c.fill(); }
  }
  function pumpkin(c, x, y, r) {
    for (const k of [-0.55, 0.55, -0.25, 0.25, 0]) blob(c, x + k * r, y, r * 0.5, r * 0.8, k === 0 ? '#ff9a1f' : '#ff8a12');
    rrect(c, x - r * 0.08, y - r * 1.0, r * 0.16, r * 0.3, r * 0.05); c.fillStyle = '#5a7a2a'; c.fill();
  }
  function peas(c, x, y, r) {
    c.save(); c.translate(x, y); c.rotate(-0.2);
    c.beginPath(); c.moveTo(-r, 0); c.quadraticCurveTo(0, -r * 0.7, r, 0); c.quadraticCurveTo(0, r * 0.7, -r, 0); c.closePath(); c.fillStyle = grad3(c, 0, 0, r, '#56c443'); c.fill();
    for (let i = -2; i <= 2; i++) ball(c, i * r * 0.35, 0, r * 0.17, '#8ee05a');
    c.restore();
  }

  // ---------- vehicles (side view, facing right, origin = ground under middle) ----------
  function vFace(c, x, y, r, t, col = '#3b6ef5') { const bl = blinkAt(t, 211); eye(c, x - r * 0.5, y, r * 0.45, { blink: bl, iris: col, look: [0.6, 0] }); eye(c, x + r * 0.5, y, r * 0.4, { blink: bl, iris: col, look: [0.6, 0] }); mouth(c, x + r * 0.1, y + r * 0.85, r * 0.9, 'smile'); }
  function bus(c, x, y, s, o = {}) {
    const t = o.t ?? 0, col = o.color || '#ffc21f';
    c.save(); c.translate(x, y); shadow(c, 0, 0, 190 * s); c.scale(s, s); c.translate(0, -(o.bounce || 0));
    rrect(c, -190, -230, 380, 190, 30); c.fillStyle = vgrad(c, -230, -40, shade(col, 0.25), shade(col, -0.15)); c.fill();
    for (let i = 0; i < 4; i++) { rrect(c, -170 + i * 72, -205, 58, 60, 10); c.fillStyle = '#bfeaff'; c.fill(); }
    rrect(c, 120, -205, 52, 140, 8); c.fillStyle = '#bfeaff'; c.fill(); c.strokeStyle = shade(col, -0.35); c.lineWidth = 4; c.beginPath(); c.moveTo(146, -205); c.lineTo(146, -65); c.stroke();
    c.fillStyle = '#2b2b2b'; c.fillRect(-190, -110, 300, 12);
    rrect(c, 170, -90, 30, 20, 6); c.fillStyle = '#fff6b0'; c.fill();
    vFace(c, 88, -120, 26, t);
    wheel3(c, -120, -40, 40, o.roll || 0); wheel3(c, 110, -40, 40, o.roll || 0);
    c.restore();
  }
  function wheel3(c, x, y, r, rot, rim = '#d9d9e6') { ball(c, x, y, r, '#2f2f3a'); circle(c, x, y, r * 0.55); c.fillStyle = rim; c.fill(); c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#9a9ab0'; for (let i = 0; i < 4; i++) { c.rotate(TAU / 4); c.fillRect(-r * 0.06, 0, r * 0.12, r * 0.5); } c.restore(); ball(c, x, y, r * 0.15, '#bbbbcc'); }
  function train(c, x, y, s, o = {}) {
    const t = o.t ?? 0, col = o.color || '#e8463f';
    c.save(); c.translate(x, y); shadow(c, 0, 0, 200 * s); c.scale(s, s);
    for (let i = 0; i < 4; i++) { const sp = (t * 0.8 + i / 4) % 1; circle(c, 90 - sp * 120, -270 - sp * 160, 22 + sp * 30); c.fillStyle = `rgba(240,240,250,${0.8 * (1 - sp)})`; c.fill(); }
    rrect(c, 70, -270, 40, 70, 8); c.fillStyle = '#2b2b3a'; c.fill();
    rrect(c, -40, -200, 220, 130, 50); c.fillStyle = vgrad(c, -200, -70, shade(col, 0.25), shade(col, -0.2)); c.fill();
    rrect(c, -190, -290, 160, 220, 18); c.fillStyle = vgrad(c, -290, -70, shade('#3b6ef5', 0.2), shade('#3b6ef5', -0.2)); c.fill();
    rrect(c, -205, -305, 190, 30, 12); c.fillStyle = '#2b2b3a'; c.fill();
    rrect(c, -165, -260, 110, 80, 12); c.fillStyle = '#bfeaff'; c.fill();
    c.beginPath(); c.moveTo(180, -70); c.lineTo(225, -20); c.lineTo(180, -20); c.closePath(); c.fillStyle = '#ffd23f'; c.fill();
    c.fillStyle = '#2b2b3a'; c.fillRect(-200, -70, 400, 20);
    vFace(c, 150, -150, 26, t);
    for (const wx of [-150, -60, 40, 130]) wheel3(c, wx, -38, wx < -50 ? 42 : 34, o.roll || 0, '#ff5a5a');
    c.restore();
  }
  function fireTruck(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y); shadow(c, 0, 0, 200 * s); c.scale(s, s);
    rrect(c, -200, -170, 270, 120, 16); c.fillStyle = vgrad(c, -170, -50, '#ff5a4a', '#c8251c'); c.fill();
    rrect(c, 60, -220, 140, 170, 26); c.fillStyle = vgrad(c, -220, -50, '#ff5a4a', '#c8251c'); c.fill();
    rrect(c, 110, -200, 70, 60, 10); c.fillStyle = '#bfeaff'; c.fill();
    const ext = o.ladder || 0;
    c.save(); c.translate(-150, -180); c.rotate(-ext * 0.9);
    c.strokeStyle = '#d9d9e6'; c.lineWidth = 9; c.beginPath(); c.moveTo(0, -12); c.lineTo(260 + ext * 200, -12); c.moveTo(0, 12); c.lineTo(260 + ext * 200, 12); c.stroke();
    c.lineWidth = 6; for (let i = 0; i < 9 + ext * 7; i++) { c.beginPath(); c.moveTo(i * 30, -12); c.lineTo(i * 30, 12); c.stroke(); }
    c.restore();
    const on = Math.floor(t * 6) % 2;
    rrect(c, 100, -240, 60, 22, 10); c.fillStyle = on ? '#3b9cff' : '#ff3b3b'; c.fill();
    if (o.siren) { c.save(); c.globalAlpha = 0.35; circle(c, 130, -230, 70); c.fillStyle = on ? '#3b9cff' : '#ff3b3b'; c.fill(); c.restore(); }
    c.fillStyle = '#ffffff'; c.fillRect(-200, -100, 400, 10);
    vFace(c, 150, -110, 22, t);
    wheel3(c, -130, -40, 40, o.roll || 0); wheel3(c, 130, -40, 40, o.roll || 0);
    c.restore();
  }
  function tractor(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y); shadow(c, 0, 0, 170 * s); c.scale(s, s);
    rrect(c, -40, -150, 190, 90, 20); c.fillStyle = vgrad(c, -150, -60, '#5ccf4a', '#2f9e2f'); c.fill();
    rrect(c, -140, -260, 120, 200, 16); c.fillStyle = vgrad(c, -260, -60, '#5ccf4a', '#2f9e2f'); c.fill();
    rrect(c, -122, -240, 84, 80, 10); c.fillStyle = '#bfeaff'; c.fill();
    rrect(c, 90, -210, 16, 60, 6); c.fillStyle = '#555'; c.fill();
    for (let i = 0; i < 3; i++) { const sp = (t + i / 3) % 1; circle(c, 98 - sp * 30, -220 - sp * 90, 10 + sp * 16); c.fillStyle = `rgba(120,120,130,${0.6 * (1 - sp)})`; c.fill(); }
    vFace(c, 110, -110, 20, t);
    wheel3(c, -90, -70, 70, o.roll || 0, '#ffd23f'); wheel3(c, 120, -40, 40, o.roll || 0, '#ffd23f');
    c.restore();
  }
  function airplane(c, x, y, s, o = {}) {
    const t = o.t ?? 0, col = o.color || '#3b9cff';
    c.save(); c.translate(x, y + Math.sin(t * 2) * 8); c.scale(s, s); c.rotate(o.tilt || -0.05);
    c.beginPath(); c.moveTo(-170, -10); c.lineTo(-215, -95); c.lineTo(-170, -95); c.lineTo(-120, -20); c.closePath(); c.fillStyle = shade(col, -0.1); c.fill();
    blob(c, 0, 0, 190, 52, '#ffffff');
    c.fillStyle = col; c.fillRect(-170, 5, 330, 12);
    for (let i = 0; i < 5; i++) { circle(c, -110 + i * 46, -10, 12); c.fillStyle = '#9fdcff'; c.fill(); }
    c.beginPath(); c.moveTo(-30, 10); c.lineTo(-90, 110); c.lineTo(-40, 110); c.lineTo(40, 15); c.closePath(); c.fillStyle = col; c.fill();
    vFace(c, 150, -10, 20, t);
    c.restore();
  }
  function boat(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y + Math.sin(t * 2.4) * 8); c.rotate(Math.sin(t * 2) * 0.04); c.scale(s, s);
    c.strokeStyle = '#8a5a33'; c.lineWidth = 10; c.beginPath(); c.moveTo(0, -60); c.lineTo(0, -300); c.stroke();
    c.beginPath(); c.moveTo(10, -290); c.lineTo(150, -90); c.lineTo(10, -90); c.closePath(); c.fillStyle = '#fff6e6'; c.fill();
    c.beginPath(); c.moveTo(-10, -270); c.lineTo(-120, -100); c.lineTo(-10, -100); c.closePath(); c.fillStyle = '#ff6fa8'; c.fill();
    c.beginPath(); c.moveTo(-190, -80); c.lineTo(190, -80); c.quadraticCurveTo(160, 10, 100, 10); c.lineTo(-110, 10); c.quadraticCurveTo(-170, 0, -190, -80); c.closePath();
    c.fillStyle = vgrad(c, -80, 10, '#ff5a4a', '#c8251c'); c.fill();
    c.fillStyle = '#ffffff'; c.fillRect(-180, -66, 360, 10);
    vFace(c, 110, -36, 18, t);
    c.restore();
  }
  function rocket(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y); c.scale(s, s); c.rotate(o.tilt || 0);
    if (o.flame !== false) { const f = 1 + Math.sin(t * 30) * 0.15; c.save(); c.scale(1, f); c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(0, 170, 40, 0); c.closePath(); c.fillStyle = '#ff9a1f'; c.fill(); c.beginPath(); c.moveTo(-22, 0); c.quadraticCurveTo(0, 100, 22, 0); c.closePath(); c.fillStyle = '#fff3a6'; c.fill(); c.restore(); }
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 50, -90); c.lineTo(sd * 100, 10); c.lineTo(sd * 40, -10); c.closePath(); c.fillStyle = '#e8463f'; c.fill(); }
    c.beginPath(); c.moveTo(-55, 0); c.lineTo(-60, -200); c.quadraticCurveTo(0, -360, 60, -200); c.lineTo(55, 0); c.closePath();
    c.fillStyle = (() => { const g = c.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#d9dbe6'); g.addColorStop(0.4, '#ffffff'); g.addColorStop(1, '#b9bccb'); return g; })(); c.fill();
    c.beginPath(); c.moveTo(-50, -250); c.quadraticCurveTo(0, -365, 50, -250); c.closePath(); c.fillStyle = '#e8463f'; c.fill();
    circle(c, 0, -170, 30); c.fillStyle = '#3b6ef5'; c.fill(); circle(c, 0, -170, 22); c.fillStyle = '#9fdcff'; c.fill();
    if (o.inside) { c.save(); circle(c, 0, -170, 22); c.clip(); o.inside(c); c.restore(); }
    else { const bl = blinkAt(t, 241); eye(c, -10, -172, 8, { blink: bl }); eye(c, 10, -172, 8, { blink: bl }); }
    c.restore();
  }
  function helicopter(c, x, y, s, o = {}) {
    const t = o.t ?? 0, col = o.color || '#ffb21f';
    c.save(); c.translate(x, y + Math.sin(t * 3) * 10); c.scale(s, s);
    c.fillStyle = '#555'; c.fillRect(-20, -150, 12, 40);
    c.save(); c.translate(-14, -152); c.scale(Math.cos(t * 30), 1); c.fillStyle = '#444'; c.fillRect(-180, -6, 360, 12); c.restore();
    c.strokeStyle = col; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(-60, -60); c.lineTo(-200, -80); c.stroke();
    c.save(); c.translate(-200, -80); c.rotate(t * 25); c.fillStyle = '#444'; c.fillRect(-4, -36, 8, 72); c.restore();
    blob(c, 0, -60, 100, 70, col);
    oval(c, 40, -80, 48, 34); c.fillStyle = '#bfeaff'; c.fill();
    c.strokeStyle = '#555'; c.lineWidth = 8; c.beginPath(); c.moveTo(-70, 30); c.lineTo(70, 30); c.moveTo(-40, 10); c.lineTo(-40, 30); c.moveTo(40, 10); c.lineTo(40, 30); c.stroke();
    vFace(c, 60, -40, 16, t);
    c.restore();
  }

  // ---------- more animals (front facing, feet at y) ----------
  const C2 = {
    lion: { body: '#f2b552', head: '#f5bf62' }, tiger: { body: '#ff9a3c', head: '#ffa448' }, elephant: { body: '#a9b4c2', head: '#b3bdca' },
    monkey: { body: '#8a5a3c', head: '#93613f' }, zebra: { body: '#f6f6f6', head: '#f8f8f8' }, panda: { body: '#f7f7f2', head: '#fafaf5' },
    bunny: { body: '#f4eef4', head: '#f8f2f8' }, frog: { body: '#5cc94a', head: '#62d04f' }, hippo: { body: '#a493c4', head: '#ac9bcc' },
    giraffe: { body: '#ffd06b', head: '#ffd677' }, penguin: { body: '#2f3242', head: '#2f3242' }, owl: { body: '#a8763e', head: '#b07f45' },
    horse: { body: '#b8784a', head: '#bf8051' },
  };
  function stripes(c, cx, cy, rx, ry, col, n = 5) { c.save(); oval(c, cx, cy, rx, ry); c.clip(); c.fillStyle = col; for (let i = 0; i < n; i++) { const x = cx - rx + (i + 0.5) * (rx * 2 / n); c.beginPath(); c.moveTo(x - 8, cy - ry); c.quadraticCurveTo(x + 12, cy, x - 6, cy + ry); c.lineTo(x + 6, cy + ry); c.quadraticCurveTo(x + 24, cy, x + 8, cy - ry); c.closePath(); c.fill(); } c.restore(); }
  function critter2(c, x, y, s, kind, o = {}) {
    const t = o.t ?? 0, P = C2[kind];
    if (!P) return K.critter(c, x, y, s, kind, o);
    const bob = (o.dance ? -Math.abs(Math.sin(t * Math.PI * o.dance)) * 22 : Math.sin(t * 2 + (o.seed || 0)) * 2) - (o.jump || 0);
    c.save(); c.translate(x, y); shadow(c, 0, 0, 74 * s); c.scale(s * (o.dir || 1), s); c.translate(0, bob);
    const dark = shade(P.body, -0.15), light = shade(P.body, 0.35);
    const neck = kind === 'giraffe' ? 120 : 0;
    if (kind === 'frog') {
      for (const sd of [-1, 1]) blob(c, sd * 46, -10, 34, 14, dark);
      blob(c, 0, -70, 78, 66, P.body); blob(c, 0, -56, 52, 42, '#c9f0a8');
    } else if (kind === 'penguin') {
      for (const sd of [-1, 1]) blob(c, sd * 22, -6, 22, 10, '#ff9a1f');
      blob(c, 0, -110, 66, 104, P.body); blob(c, 0, -96, 46, 82, '#ffffff');
      for (const sd of [-1, 1]) blob(c, sd * 66, -110, 16, 52, P.body, sd * (0.3 + Math.sin(t * 8) * (o.talk ? 0.3 : 0.05)));
    } else if (kind === 'owl') {
      for (const sd of [-1, 1]) blob(c, sd * 16, -6, 14, 8, '#f5a623');
      blob(c, 0, -100, 70, 92, P.body); blob(c, 0, -80, 48, 60, '#f3dcb5');
      c.fillStyle = 'rgba(150,100,50,.35)'; for (let i = 0; i < 9; i++) { oval(c, -24 + (i % 3) * 24, -110 + Math.floor(i / 3) * 26, 7, 4); c.fill(); }
      for (const sd of [-1, 1]) blob(c, sd * 66, -100, 20, 54, dark, sd * 0.15);
    } else {
      for (const lx of [-42, 42]) blob(c, lx, -34, 15, 30, dark);
      for (const lx of [-20, 20]) { blob(c, lx, -34, 17, 34, P.body); blob(c, lx, -4, 18, 10, kind === 'zebra' || kind === 'horse' ? '#3a3036' : kind === 'panda' ? '#2b2b2b' : light); }
      if (kind === 'panda') { for (const lx of [-20, 20, -42, 42]) blob(c, lx, -30, 17, 32, '#2b2b2b'); }
      blob(c, 0, -92, 62, 58, P.body);
      if (kind === 'zebra') stripes(c, 0, -92, 62, 58, '#2b2b2b', 6);
      if (kind === 'tiger') stripes(c, 0, -92, 62, 58, '#3a2414', 5);
      if (kind === 'giraffe') { c.save(); oval(c, 0, -92, 62, 58); c.clip(); c.fillStyle = '#c47a2c'; for (let i = 0; i < 7; i++) { oval(c, -40 + (i % 3) * 40, -130 + Math.floor(i / 3) * 34, 14, 11, i); c.fill(); } c.restore(); }
      if (kind !== 'zebra' && kind !== 'tiger' && kind !== 'giraffe') blob(c, 0, -82, 38, 40, light);
      if (kind === 'panda') { for (const sd of [-1, 1]) blob(c, sd * 54, -110, 20, 34, '#2b2b2b', sd * 0.3); }
      if (kind === 'lion') { c.save(); c.strokeStyle = '#c66b1f'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(56, -60); c.quadraticCurveTo(120, -40, 104, -120 + Math.sin(t * 3) * 10); c.stroke(); ball(c, 104, -124 + Math.sin(t * 3) * 10, 16, '#c66b1f'); c.restore(); }
      if (kind === 'monkey') { c.save(); c.strokeStyle = P.body; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(50, -60); c.bezierCurveTo(120, -60, 110, -160, 80, -150); c.stroke(); c.restore(); }
      if (kind === 'bunny') ball(c, 52, -50, 18, '#ffffff');
      if (kind === 'giraffe') { rrect(c, -22, -150 - neck, 44, neck + 30, 20); c.fillStyle = vgrad(c, -150 - neck, -120, P.body, shade(P.body, -0.05)); c.fill(); c.fillStyle = '#c47a2c'; for (let i = 0; i < 4; i++) { oval(c, -6 + (i % 2) * 12, -170 - i * 30, 9, 7); c.fill(); } }
    }
    // head
    const hy = kind === 'frog' ? -120 : kind === 'penguin' || kind === 'owl' ? -170 : -180 - neck;
    c.save(); c.translate(0, hy); c.rotate(o.headTilt || Math.sin(t * 2.4 + (o.seed || 0)) * 0.06);
    const earFlap = Math.sin(t * 4 + (o.seed || 0)) * 0.12;
    const bl = o.blink ?? blinkAt(t, (o.seed || 0) + 17);
    if (kind === 'lion') { for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; ball(c, Math.cos(a) * 62, Math.sin(a) * 58, 30, i % 2 ? '#c66b1f' : '#d9792a'); } }
    if (kind === 'elephant') { for (const sd of [-1, 1]) { c.save(); c.translate(sd * 70, 0); c.rotate(sd * earFlap); blob(c, 0, 0, 58, 72, P.body); blob(c, sd * 6, 0, 40, 54, '#f2b8c6'); c.restore(); } }
    if (kind === 'bunny') { for (const sd of [-1, 1]) { c.save(); c.translate(sd * 24, -50); c.rotate(sd * (0.15 + earFlap)); blob(c, 0, -50, 20, 62, P.head); blob(c, 0, -46, 10, 46, '#ffc4d6'); c.restore(); } }
    if (kind === 'monkey') { for (const sd of [-1, 1]) { ball(c, sd * 62, 0, 24, P.head); ball(c, sd * 62, 0, 14, '#f2d0a8'); } }
    if (kind === 'panda' || kind === 'tiger' || kind === 'lion' || kind === 'hippo') for (const sd of [-1, 1]) { ball(c, sd * 44, -44, 18, kind === 'panda' ? '#2b2b2b' : P.head); ball(c, sd * 44, -44, 9, kind === 'panda' ? '#444' : '#ffc0b0'); }
    if (kind === 'zebra' || kind === 'giraffe' || kind === 'horse') { for (const sd of [-1, 1]) blob(c, sd * 40, -46, 12, 24, P.head, sd * 0.4); }
    if (kind === 'giraffe') for (const sd of [-1, 1]) { c.fillStyle = '#c47a2c'; c.fillRect(sd * 16 - 4, -78, 8, 30); ball(c, sd * 16, -80, 9, '#8a5a33'); }
    if (kind === 'owl') for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 30, -40); c.lineTo(sd * 52, -78); c.lineTo(sd * 54, -30); c.closePath(); c.fillStyle = dark; c.fill(); }
    if (kind === 'frog') { blob(c, 0, 0, 74, 46, P.head); for (const sd of [-1, 1]) { ball(c, sd * 36, -36, 30, P.head); eye(c, sd * 36, -38, 20, { blink: bl, happy: o.happyEyes, iris: '#2a1a0a' }); } }
    else if (kind === 'owl') { blob(c, 0, 0, 66, 56, P.head); for (const sd of [-1, 1]) { ball(c, sd * 28, -4, 28, '#f3dcb5'); eye(c, sd * 28, -4, 20, { blink: bl, happy: o.happyEyes, iris: '#f5a623' }); } c.beginPath(); c.moveTo(-10, 18); c.lineTo(10, 18); c.lineTo(0, 36); c.closePath(); c.fillStyle = '#f5a623'; c.fill(); }
    else if (kind === 'penguin') { blob(c, 0, 0, 56, 50, P.head); blob(c, 0, 10, 40, 34, '#ffffff'); for (const sd of [-1, 1]) eye(c, sd * 18, -2, 12, { blink: bl, happy: o.happyEyes }); blob(c, 0, 22, 16, 9, '#ff9a1f'); if (o.talk) { oval(c, 0, 30, 10, 6 * (0.4 + 0.6 * Math.abs(Math.sin(t * 9)))); c.fillStyle = '#7a1f22'; c.fill(); } }
    else {
      const hw = kind === 'hippo' ? 70 : 58;
      blob(c, 0, 0, hw, 54, P.head);
      if (kind === 'zebra') stripes(c, 0, 0, hw, 54, '#2b2b2b', 5);
      if (kind === 'tiger') stripes(c, 0, -10, hw, 44, '#3a2414', 4);
      if (kind === 'zebra') { for (let i = 0; i < 5; i++) blob(c, 0, -52 - i * 2, 8, 18, '#2b2b2b', (i - 2) * 0.3); }
      if (kind === 'panda') for (const sd of [-1, 1]) blob(c, sd * 22, -6, 18, 22, '#2b2b2b', sd * -0.4);
      if (kind === 'monkey') blob(c, 0, 10, 46, 40, '#f2d0a8');
      eye(c, -22, -8, 13, { blink: bl, happy: o.happyEyes, iris: kind === 'tiger' || kind === 'lion' ? '#c88a1a' : '#4a2c16' });
      eye(c, 22, -8, 13, { blink: bl, happy: o.happyEyes, iris: kind === 'tiger' || kind === 'lion' ? '#c88a1a' : '#4a2c16' });
      const talk = o.talk ? 0.35 + 0.65 * Math.abs(Math.sin(t * 9)) : 0;
      if (kind === 'elephant') {
        const sw = Math.sin(t * 2) * 0.2 + (o.talk ? -0.6 : 0);
        c.save(); c.strokeStyle = P.head; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 14); c.bezierCurveTo(0, 60, 10 + sw * 40, 90, 30 + sw * 60, 80 + sw * 60); c.stroke(); c.restore();
        if (talk) { oval(c, -22, 34, 10, 8 * talk); c.fillStyle = '#7a1f22'; c.fill(); }
      } else if (kind === 'hippo') {
        blob(c, 0, 28, 58, 32, shade(P.head, 0.15)); for (const sd of [-1, 1]) { oval(c, sd * 18, 18, 6, 4); c.fillStyle = '#5a4a7a'; c.fill(); }
        if (talk) { oval(c, 0, 46, 28, 12 * talk); c.fillStyle = '#7a1f22'; c.fill(); } else mouth(c, 0, 44, 36, 'smile');
      } else if (kind === 'zebra' || kind === 'horse' || kind === 'giraffe') {
        blob(c, 0, 26, 28, 22, kind === 'zebra' ? '#3a3036' : shade(P.head, -0.2)); for (const sd of [-1, 1]) { oval(c, sd * 9, 24, 3, 4); c.fillStyle = '#111'; c.fill(); }
        if (talk) { oval(c, 0, 44, 10, 7 * talk); c.fillStyle = '#7a1f22'; c.fill(); }
      } else if (kind === 'bunny') {
        c.beginPath(); c.moveTo(-6, 12); c.lineTo(6, 12); c.lineTo(0, 19); c.closePath(); c.fillStyle = '#ff8fab'; c.fill();
        c.fillStyle = '#fff'; rrect(c, -8, 26, 16, 12, 3); c.fill(); c.strokeStyle = '#ddd'; c.lineWidth = 1.5; c.stroke();
        if (talk) mouth(c, 0, 22, 18, 'open', talk);
      } else {
        blob(c, 0, 20, 30, 22, light);
        c.beginPath(); c.moveTo(-9, 10); c.lineTo(9, 10); c.lineTo(0, 20); c.closePath(); c.fillStyle = '#2b1d14'; c.fill();
        if (talk) mouth(c, 0, 26, 26, kind === 'lion' || kind === 'tiger' ? 'grin' : 'open', talk); else mouth(c, 0, 32, 22, 'smile');
      }
    }
    if (kind === 'frog') { if (o.talk) mouth(c, 0, 14, 60, 'open', 0.4 + 0.6 * Math.abs(Math.sin(t * 9))); else { c.beginPath(); c.arc(0, -4, 44, 0.25 * Math.PI, 0.75 * Math.PI); c.strokeStyle = '#2b5a1f'; c.lineWidth = 5; c.stroke(); } }
    cheeks(c, 38, 18, 10);
    if (o.hat) K.partyHat(c, 12, -46, 70, 0.2);
    c.restore();
    c.restore();
  }
  function animal(c, kind, x, y, s, o = {}) {
    if (kind === 'hen') return K.hen(c, x, y, s * 1.25, o);
    if (kind === 'chick') return K.chick(c, x, y, s * 2.2, o);
    if (kind === 'duck') return K.duck(c, x, y, s * 1.6, o);
    if (kind === 'bear') return K.bear(c, x, y, s * 0.95, o);
    if (C2[kind]) return critter2(c, x, y, s, kind, o);
    return K.critter(c, x, y, s, kind, o);
  }

  // ---------- small creatures ----------
  function bee(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x + Math.sin(t * 3) * 10, y + Math.sin(t * 5) * 8); c.scale(s * (o.dir || 1), s);
    c.save(); c.globalAlpha = 0.75; for (const sd of [-1, 1]) { c.save(); c.translate(-6, -30); c.rotate(sd * 0.4 + Math.sin(t * 40) * 0.3); oval(c, 0, -26, 18, 30); c.fillStyle = '#e6f6ff'; c.fill(); c.restore(); } c.restore();
    blob(c, 0, 0, 54, 40, '#ffd23f');
    c.save(); oval(c, 0, 0, 54, 40); c.clip(); c.fillStyle = '#2b2b2b'; for (const xx of [-24, 0, 24]) c.fillRect(xx - 7, -40, 14, 80); c.restore();
    ball(c, 50, -6, 24, '#2b2b2b'); eye(c, 56, -10, 9, { blink: blinkAt(t, 301) });
    c.beginPath(); c.moveTo(-54, 0); c.lineTo(-72, 4); c.lineTo(-54, 8); c.closePath(); c.fillStyle = '#2b2b2b'; c.fill();
    c.strokeStyle = '#2b2b2b'; c.lineWidth = 3; c.beginPath(); c.moveTo(56, -28); c.lineTo(64, -50); c.moveTo(46, -28); c.lineTo(46, -52); c.stroke();
    c.restore();
  }
  function butterfly(c, x, y, s, o = {}) {
    const t = o.t ?? 0, col = o.color || '#ff6fa8';
    c.save(); c.translate(x + Math.sin(t * 1.3) * 20, y + Math.sin(t * 2.6) * 14); c.scale(s, s);
    const fl = 0.35 + 0.65 * Math.abs(Math.cos(t * 8));
    c.save(); c.scale(fl, 1);
    for (const sd of [-1, 1]) { blob(c, sd * 46, -26, 46, 40, col, sd * 0.3); blob(c, sd * 36, 30, 32, 28, shade(col, -0.1), -sd * 0.3); ball(c, sd * 50, -30, 12, '#ffffff'); ball(c, sd * 34, 30, 8, '#ffe23d'); }
    c.restore();
    blob(c, 0, 0, 9, 46, '#3a2a4a');
    c.strokeStyle = '#3a2a4a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-3, -44); c.quadraticCurveTo(-14, -70, -22, -76); c.moveTo(3, -44); c.quadraticCurveTo(14, -70, 22, -76); c.stroke();
    c.restore();
  }
  function ladybug(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y); shadow(c, 0, 0, 50 * s); c.scale(s * (o.dir || 1), s);
    c.strokeStyle = '#2b2b2b'; c.lineWidth = 4; for (let i = -1; i <= 1; i++) for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(i * 20, -16); c.lineTo(i * 26 + sd * 4, 0); c.stroke(); }
    ball(c, 54, -32, 24, '#2b2b2b');
    blob(c, 0, -40, 58, 42, '#ff3b30');
    c.strokeStyle = '#2b2b2b'; c.lineWidth = 3; c.beginPath(); c.moveTo(4, -82); c.lineTo(0, 0); c.stroke();
    c.fillStyle = '#2b2b2b'; for (const [px, py, r] of [[-28, -50, 10], [-20, -22, 8], [28, -52, 10], [24, -22, 8], [0, -66, 7]]) { circle(c, px, py, r); c.fill(); }
    eye(c, 62, -36, 8, { blink: blinkAt(t, 311) });
    c.restore();
  }
  function snail(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y); shadow(c, 0, 0, 70 * s); c.scale(s * (o.dir || 1), s);
    c.beginPath(); c.moveTo(-70, 0); c.quadraticCurveTo(-70, -26, -30, -26); c.lineTo(50, -26); c.quadraticCurveTo(70, -26, 72, -60); c.lineTo(92, -60); c.quadraticCurveTo(96, 0, 70, 0); c.closePath(); c.fillStyle = grad3(c, 10, -20, 80, '#c9e57a'); c.fill();
    c.strokeStyle = '#a8c95a'; c.lineWidth = 4; for (const sd of [72, 88]) { c.beginPath(); c.moveTo(sd, -58); c.lineTo(sd + (sd - 80) * 0.5, -90); c.stroke(); ball(c, sd + (sd - 80) * 0.5, -92, 8, '#c9e57a'); }
    eye(c, 76, -76, 0.01); bead(c, 76, -92, 4); bead(c, 94, -92, 4);
    ball(c, -10, -66, 52, '#c8763a');
    c.strokeStyle = '#8a4a1c'; c.lineWidth = 6; c.beginPath(); for (let a = 0; a < TAU * 2.2; a += 0.2) { const r = 6 + a * 6.5; c.lineTo(-10 + Math.cos(a) * r, -66 + Math.sin(a) * r); } c.stroke();
    c.restore();
  }
  function caterpillar(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y); shadow(c, 0, 0, 100 * s); c.scale(s * (o.dir || 1), s);
    for (let i = 5; i >= 0; i--) { const lift = Math.max(0, Math.sin(t * 6 - i * 0.8)) * 16; ball(c, -110 + i * 36, -26 - lift, 28, i % 2 ? '#7bd84a' : '#5cc94a'); }
    const hl = Math.max(0, Math.sin(t * 6 - 6 * 0.8)) * 16;
    ball(c, 112, -40 - hl, 36, '#ffd23f');
    eye(c, 104, -46 - hl, 11, { blink: blinkAt(t, 321) }); eye(c, 128, -46 - hl, 10, { blink: blinkAt(t, 321) });
    mouth(c, 118, -26 - hl, 18, 'smile');
    c.strokeStyle = '#3a2a1a'; c.lineWidth = 3; c.beginPath(); c.moveTo(102, -72 - hl); c.lineTo(94, -96 - hl); c.moveTo(124, -72 - hl); c.lineTo(132, -96 - hl); c.stroke();
    c.restore();
  }
  function ant(c, x, y, s, o = {}) {
    const t = o.t ?? 0, col = o.color || '#3a2a2a';
    c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s);
    c.strokeStyle = col; c.lineWidth = 3; for (let i = -1; i <= 1; i++) for (const sd of [-1, 1]) { const k = Math.sin(t * 16 + i + sd) * 6; c.beginPath(); c.moveTo(i * 12, -18); c.lineTo(i * 16 + k, 0); c.stroke(); }
    ball(c, -26, -20, 14, col); ball(c, 0, -20, 10, col); ball(c, 24, -24, 14, col);
    bead(c, 30, -28, 3); c.beginPath(); c.moveTo(28, -36); c.lineTo(36, -52); c.stroke();
    if (o.carry) { c.save(); c.translate(0, -44); o.carry(c); c.restore(); }
    c.restore();
  }
  function bird(c, x, y, s, o = {}) {
    const t = o.t ?? 0, col = o.color || '#4fb7ff';
    c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s);
    blob(c, -46, -10, 26, 12, shade(col, -0.2), -0.4);
    blob(c, 0, 0, 50, 42, col); blob(c, 6, 12, 30, 24, '#fff3d6');
    c.beginPath(); c.moveTo(46, -10); c.lineTo(70, -2); c.lineTo(46, 6); c.closePath(); c.fillStyle = '#ffb21f'; c.fill();
    eye(c, 26, -14, 10, { blink: blinkAt(t, 331) });
    c.save(); c.translate(-8, -8); c.rotate(-0.4 + Math.sin(t * (o.fly ? 22 : 3)) * (o.fly ? 0.9 : 0.1)); blob(c, -16, -18, 30, 14, shade(col, -0.12), -0.6); c.restore();
    if (o.hold) { c.save(); c.translate(60, 10); o.hold(c); c.restore(); }
    c.restore();
  }
  function whale(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y + Math.sin(t * 1.5) * 8); c.scale(s * (o.dir || 1), s);
    c.save(); c.translate(-150, -20); c.rotate(Math.sin(t * 3) * 0.2); c.beginPath(); c.moveTo(0, 0); c.lineTo(-60, -50); c.quadraticCurveTo(-40, 0, -60, 40); c.closePath(); c.fillStyle = '#3d6fd6'; c.fill(); c.restore();
    blob(c, 0, 0, 160, 90, '#4f86f7'); blob(c, 10, 40, 120, 40, '#cfe3ff');
    eye(c, 90, -20, 14, { blink: blinkAt(t, 341) }); mouth(c, 120, 20, 40, 'smile');
    if (o.spout) for (let i = 0; i < 6; i++) { const sp = (t * 1.2 + i / 6) % 1; circle(c, 40 + (i - 2.5) * 10 * sp * 3, -100 - sp * 120, 10 * (1 - sp) + 4); c.fillStyle = `rgba(180,230,255,${1 - sp})`; c.fill(); }
    c.restore();
  }
  function dino(c, kind, x, y, s, o = {}) {
    const t = o.t ?? 0, col = o.color || { trex: '#5cc94a', longneck: '#7fb8ff', trike: '#ff9a4d', stego: '#c08bff' }[kind] || '#5cc94a';
    const st = o.stomp ? Math.abs(Math.sin(t * 6)) : 0;
    c.save(); c.translate(x, y); shadow(c, 0, 0, 150 * s); c.scale(s * (o.dir || 1), s); c.translate(0, -st * 14);
    const belly = shade(col, 0.35), dk = shade(col, -0.15);
    for (const lx of [-50, 40]) { blob(c, lx, -40, 26, 44, dk); blob(c, lx + 8, -6, 28, 12, dk); }
    c.beginPath(); c.moveTo(-60, -120); c.quadraticCurveTo(-170, -100, -230, -40 + Math.sin(t * 3) * 10); c.quadraticCurveTo(-150, -50, -60, -60); c.closePath(); c.fillStyle = col; c.fill();
    if (kind === 'stego') for (let i = 0; i < 5; i++) { const px = -100 + i * 40; c.beginPath(); c.moveTo(px - 22, -150 + Math.abs(i - 2) * 8); c.lineTo(px, -200 + Math.abs(i - 2) * 14); c.lineTo(px + 22, -150 + Math.abs(i - 2) * 8); c.closePath(); c.fillStyle = '#ff6f6f'; c.fill(); }
    blob(c, 0, -100, 100, 70, col); blob(c, 10, -80, 70, 40, belly);
    for (const lx of [-30, 60]) { blob(c, lx, -46, 28, 46, col); blob(c, lx + 8, -8, 30, 12, dk); }
    let hx = 110, hy = -160;
    if (kind === 'longneck') { c.save(); c.strokeStyle = col; c.lineWidth = 46; c.lineCap = 'round'; c.beginPath(); c.moveTo(60, -130); c.quadraticCurveTo(130, -220, 120, -330); c.stroke(); c.restore(); hx = 140; hy = -340; }
    else if (kind === 'trex') { hx = 110; hy = -190; blob(c, 70, -140, 50, 60, col); for (const ay of [-110, -96]) { c.save(); c.strokeStyle = dk; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(100, ay); c.lineTo(130, ay + 14 + Math.sin(t * 6) * 4); c.stroke(); c.restore(); } }
    else { hx = 110; hy = -130; }
    c.save(); c.translate(hx, hy);
    if (kind === 'trike') { c.beginPath(); c.arc(-20, -10, 70, Math.PI * 0.9, Math.PI * 2.1); c.closePath(); c.fillStyle = shade(col, 0.15); c.fill(); for (const [px, py, l] of [[30, -30, 50], [0, -46, 50], [64, 10, 30]]) { c.beginPath(); c.moveTo(px - 8, py + 6); c.lineTo(px + l * 0.6, py - l); c.lineTo(px + 8, py + 6); c.closePath(); c.fillStyle = '#fff3d6'; c.fill(); } }
    const hr = kind === 'longneck' ? 44 : kind === 'trex' ? 66 : 54;
    blob(c, 10, 0, hr * 1.25, hr, col);
    eye(c, 20, -hr * 0.35, hr * 0.28, { blink: blinkAt(t, 351 + (o.seed || 0)), happy: o.happyEyes });
    const talk = o.talk ? 0.4 + 0.6 * Math.abs(Math.sin(t * 9)) : 0;
    if (talk) mouth(c, hr * 0.7, hr * 0.25, hr * 0.8, 'grin', talk); else mouth(c, hr * 0.7, hr * 0.35, hr * 0.6, 'smile');
    if (kind === 'trex') for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(hr * 0.3 + i * 14, hr * 0.32); c.lineTo(hr * 0.36 + i * 14, hr * 0.48); c.lineTo(hr * 0.42 + i * 14, hr * 0.32); c.fillStyle = '#ffffff'; c.fill(); }
    cheeks(c, 0, 0, 0);
    c.restore();
    c.restore();
  }

  // ---------- instruments ----------
  function drum(c, x, y, r, t = 0, hit = 0) {
    oval(c, x, y + r * 0.6, r, r * 0.3); c.fillStyle = '#b8302b'; c.fill();
    c.fillStyle = vgrad(c, y - r * 0.4, y + r * 0.6, '#ff5a4a', '#c8251c'); c.fillRect(x - r, y - r * 0.4, r * 2, r);
    c.strokeStyle = '#ffd23f'; c.lineWidth = r * 0.05; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(x - r + (i * 2 * r) / 6, y - r * 0.4); c.lineTo(x - r + ((i + 1) * 2 * r) / 6, y + r * 0.6); c.stroke(); }
    oval(c, x, y - r * 0.4, r, r * 0.3); c.fillStyle = '#fff6e6'; c.fill(); c.lineWidth = r * 0.06; c.strokeStyle = '#d9d9e6'; c.stroke();
    for (const sd of [-1, 1]) { c.save(); c.translate(x + sd * r * 0.5, y - r * 0.5 - hit * r * 0.4); c.rotate(sd * -0.6); rrect(c, -r * 0.04, -r * 0.9, r * 0.08, r * 0.9, r * 0.04); c.fillStyle = '#c99a62'; c.fill(); ball(c, 0, -r * 0.9, r * 0.09, '#f2e2c4'); c.restore(); }
  }
  function guitar(c, x, y, r, t = 0, strum = 0) {
    c.save(); c.translate(x, y); c.rotate(-0.5);
    rrect(c, -r * 0.08, -r * 1.6, r * 0.16, r * 1.3, r * 0.04); c.fillStyle = '#8a5a33'; c.fill();
    rrect(c, -r * 0.14, -r * 1.8, r * 0.28, r * 0.24, r * 0.06); c.fillStyle = '#5a3a1e'; c.fill();
    ball(c, 0, -r * 0.15, r * 0.48, '#e89a3c'); ball(c, 0, r * 0.45, r * 0.6, '#e89a3c');
    circle(c, 0, -r * 0.05, r * 0.16); c.fillStyle = '#3a2412'; c.fill();
    rrect(c, -r * 0.2, r * 0.6, r * 0.4, r * 0.08, r * 0.03); c.fillStyle = '#5a3a1e'; c.fill();
    c.strokeStyle = '#f2f2f2'; c.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { const w = strum ? Math.sin(t * 60 + i) * 2 * strum : 0; c.beginPath(); c.moveTo(i * r * 0.025, -r * 1.75); c.quadraticCurveTo(i * r * 0.025 + w, 0, i * r * 0.025, r * 0.64); c.stroke(); }
    c.restore();
  }
  function piano(c, x, y, r, t = 0, press = -1) {
    rrect(c, x - r * 1.3, y - r * 0.7, r * 2.6, r * 1.2, r * 0.12); c.fillStyle = vgrad(c, y - r * 0.7, y + r * 0.5, '#3a3a4a', '#1d1d28'); c.fill();
    const n = 8, w = (r * 2.3) / n;
    for (let i = 0; i < n; i++) { rrect(c, x - r * 1.15 + i * w + 2, y - r * 0.2 + (i === press ? 6 : 0), w - 4, r * 0.65, 6); c.fillStyle = i === press ? '#ffe9a8' : '#ffffff'; c.fill(); }
    for (const i of [0, 1, 3, 4, 5]) { rrect(c, x - r * 1.15 + (i + 1) * w - w * 0.3, y - r * 0.2, w * 0.6, r * 0.38, 4); c.fillStyle = '#1d1d28'; c.fill(); }
  }
  function trumpet(c, x, y, r) {
    c.save(); c.translate(x, y);
    c.strokeStyle = '#f2b81f'; c.lineWidth = r * 0.12; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-r * 1.1, 0); c.lineTo(r * 0.6, 0); c.moveTo(-r * 0.4, 0); c.quadraticCurveTo(-r * 0.4, r * 0.4, 0, r * 0.4); c.lineTo(r * 0.4, r * 0.4); c.quadraticCurveTo(r * 0.6, r * 0.4, r * 0.6, 0); c.stroke();
    c.beginPath(); c.moveTo(r * 0.6, -r * 0.1); c.lineTo(r * 1.2, -r * 0.4); c.lineTo(r * 1.2, r * 0.4); c.lineTo(r * 0.6, r * 0.1); c.closePath(); c.fillStyle = grad3(c, r, 0, r * 0.5, '#ffd84a'); c.fill();
    for (let i = 0; i < 3; i++) { rrect(c, -r * 0.25 + i * r * 0.22, -r * 0.35, r * 0.1, r * 0.35, r * 0.04); c.fillStyle = '#d9a21a'; c.fill(); }
    ball(c, -r * 1.15, 0, r * 0.1, '#d9a21a');
    c.restore();
  }
  function xylophone(c, x, y, r, t = 0, hit = -1) {
    const cols = ['#ff4d4d', '#ff9a1f', '#ffd23f', '#4cd964', '#3b9cff', '#9b4dde'];
    for (let i = 0; i < 6; i++) { const h = r * (1.1 - i * 0.12), bx = x - r * 1.1 + i * r * 0.42; rrect(c, bx, y - h / 2 + (i === hit ? 6 : 0), r * 0.32, h, r * 0.06); c.fillStyle = grad3(c, bx + r * 0.16, y, h / 2, cols[i]); c.fill(); }
    c.fillStyle = '#8a5a33'; c.fillRect(x - r * 1.2, y - r * 0.3, r * 2.4, r * 0.06); c.fillRect(x - r * 1.2, y + r * 0.25, r * 2.4, r * 0.06);
  }
  function maracas(c, x, y, r, t = 0, shake = 0) {
    for (const sd of [-1, 1]) { c.save(); c.translate(x + sd * r * 0.45, y); c.rotate(sd * 0.4 + Math.sin(t * 30) * 0.2 * shake); rrect(c, -r * 0.07, 0, r * 0.14, r * 0.8, r * 0.05); c.fillStyle = '#c99a62'; c.fill(); blob(c, 0, -r * 0.2, r * 0.38, r * 0.48, sd < 0 ? '#ff6fa8' : '#4cd964'); c.restore(); }
  }

  // ---------- objects ----------
  function umbrella(c, x, y, r, col = '#ff4d6d', rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.strokeStyle = '#5a4a5a'; c.lineWidth = r * 0.06; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -r * 0.9); c.lineTo(0, r * 0.7); c.arc(-r * 0.12, r * 0.7, r * 0.12, 0, Math.PI); c.stroke();
    c.beginPath(); c.moveTo(-r, 0); c.quadraticCurveTo(-r, -r, 0, -r); c.quadraticCurveTo(r, -r, r, 0);
    for (let i = 4; i >= 0; i--) { const x0 = -r + i * (r / 2.5); c.quadraticCurveTo(x0 + r * 0.2 + (i === 4 ? 0 : 0), -r * 0.15, x0 + (i === 0 ? 0 : 0), 0); }
    c.closePath(); c.fillStyle = grad3(c, 0, -r * 0.5, r, col); c.fill();
    c.restore();
  }
  function snowman(c, x, y, s, o = {}) {
    const t = o.t ?? 0, parts = o.parts ?? 3;
    c.save(); c.translate(x, y); shadow(c, 0, 0, 100 * s); c.scale(s, s);
    if (parts >= 1) ball(c, 0, -80, 90, '#ffffff');
    if (parts >= 2) { ball(c, 0, -210, 66, '#ffffff'); for (let i = 0; i < 3; i++) ball(c, 0, -240 + i * 30, 8, '#2b2b3a'); for (const sd of [-1, 1]) { c.strokeStyle = '#8a5a33'; c.lineWidth = 7; c.beginPath(); c.moveTo(sd * 60, -220); c.lineTo(sd * 120, -270 + Math.sin(t * 4) * 10 * sd); c.stroke(); } }
    if (parts >= 3) {
      ball(c, 0, -320, 52, '#ffffff');
      eye(c, -18, -330, 10, { blink: blinkAt(t, 361) }); eye(c, 18, -330, 10, { blink: blinkAt(t, 361) });
      if (o.nose !== false) { c.beginPath(); c.moveTo(0, -318); c.lineTo(46, -308); c.lineTo(0, -304); c.closePath(); c.fillStyle = '#ff8a1f'; c.fill(); }
      mouth(c, 0, -296, 26, 'smile');
      rrect(c, -50, -296, 100, 18, 9); c.fillStyle = '#ff4d6d'; c.fill(); rrect(c, 20, -296, 18, 60, 8); c.fill();
      rrect(c, -40, -420, 80, 60, 6); c.fillStyle = '#2b2b3a'; c.fill(); rrect(c, -60, -366, 120, 14, 6); c.fill();
    }
    c.restore();
  }
  function kite(c, x, y, s, col = '#ff4d6d', t = 0) {
    c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2) * 0.15); c.scale(s, s);
    c.beginPath(); c.moveTo(0, -90); c.lineTo(60, 0); c.lineTo(0, 110); c.lineTo(-60, 0); c.closePath(); c.fillStyle = grad3(c, 0, 0, 100, col); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -90); c.lineTo(0, 110); c.moveTo(-60, 0); c.lineTo(60, 0); c.stroke();
    c.strokeStyle = '#555'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 110); for (let i = 1; i <= 6; i++) c.lineTo(Math.sin(t * 4 + i) * 16, 110 + i * 30); c.stroke();
    for (let i = 1; i <= 3; i++) { const by = 110 + i * 50, bx = Math.sin(t * 4 + i * 1.6) * 16; c.beginPath(); c.moveTo(bx - 12, by - 8); c.lineTo(bx + 12, by + 8); c.lineTo(bx + 12, by - 8); c.lineTo(bx - 12, by + 8); c.closePath(); c.fillStyle = K.CONF ? '#ffd23f' : '#ffd23f'; c.fill(); }
    c.restore();
  }
  function flower(c, x, y, s, col = '#ff6fa8', grow = 1, t = 0) {
    if (grow <= 0) return;
    c.save(); c.translate(x, y); c.scale(s, s);
    const h = 160 * Math.min(1, grow * 1.4);
    c.strokeStyle = '#3fae49'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(Math.sin(t * 2) * 10, -h / 2, 0, -h); c.stroke();
    if (grow > 0.3) { const lk = Math.min(1, (grow - 0.3) * 3); K.leaf(c, -24 * lk, -h * 0.4, 26 * lk, -0.9); K.leaf(c, 24 * lk, -h * 0.55, 22 * lk, 0.9); }
    if (grow > 0.6) {
      const b = Math.min(1, (grow - 0.6) * 2.5);
      c.save(); c.translate(0, -h); c.scale(b, b); c.rotate(Math.sin(t * 1.5) * 0.1);
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; blob(c, Math.cos(a) * 34, Math.sin(a) * 34, 28, 22, col, a); }
      ball(c, 0, 0, 26, '#ffd23f'); eye(c, -9, -4, 6, { blink: blinkAt(t, 371) }); eye(c, 9, -4, 6, { blink: blinkAt(t, 371) }); mouth(c, 0, 8, 10, 'smile');
      c.restore();
    }
    c.restore();
  }
  function wateringCan(c, x, y, r, tilt = 0) {
    c.save(); c.translate(x, y); c.rotate(tilt);
    c.strokeStyle = '#3b9cff'; c.lineWidth = r * 0.1; c.beginPath(); c.arc(-r * 0.1, -r * 0.7, r * 0.4, Math.PI, TAU); c.stroke();
    c.beginPath(); c.moveTo(r * 0.5, -r * 0.2); c.lineTo(r * 1.2, -r * 0.8); c.lineWidth = r * 0.14; c.stroke();
    oval(c, r * 1.22, -r * 0.82, r * 0.14, r * 0.08, -0.7); c.fillStyle = '#2f7fd6'; c.fill();
    rrect(c, -r * 0.6, -r * 0.6, r * 1.2, r * 1.0, r * 0.2); c.fillStyle = grad3(c, 0, -r * 0.1, r * 0.7, '#4fb0ff'); c.fill();
    c.restore();
  }
  function sandcastle(c, x, y, s, build = 1) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const col = '#f2c97a';
    if (build > 0) { rrect(c, -150, -110 * Math.min(1, build * 3), 300, 110 * Math.min(1, build * 3), 10); c.fillStyle = vgrad(c, -110, 0, col, shade(col, -0.15)); c.fill(); }
    if (build > 0.33) for (const sx of [-110, 110]) { const k = Math.min(1, (build - 0.33) * 3); rrect(c, sx - 40, -110 - 120 * k, 80, 120 * k, 6); c.fillStyle = col; c.fill(); for (let i = 0; i < 3; i++) c.fillRect(sx - 40 + i * 30, -110 - 120 * k - 20, 20, 22); }
    if (build > 0.66) { const k = Math.min(1, (build - 0.66) * 3); rrect(c, -50, -110 - 170 * k, 100, 170 * k, 6); c.fillStyle = shade(col, 0.08); c.fill(); rrect(c, -20, -60, 40, 60, 20); c.fillStyle = '#b8894a'; c.fill(); if (k >= 1) { c.strokeStyle = '#8a5a33'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -280); c.lineTo(0, -340); c.stroke(); c.beginPath(); c.moveTo(0, -340); c.lineTo(40, -326); c.lineTo(0, -312); c.closePath(); c.fillStyle = '#ff4d6d'; c.fill(); } }
    c.restore();
  }
  function iceCream(c, x, y, r, cols = ['#ffb3cf', '#fff3d6', '#9be8b0']) {
    c.beginPath(); c.moveTo(x - r * 0.55, y - r * 0.2); c.lineTo(x, y + r * 1.2); c.lineTo(x + r * 0.55, y - r * 0.2); c.closePath(); c.fillStyle = vgrad(c, y, y + r, '#e7b06a', '#c98a46'); c.fill();
    c.strokeStyle = 'rgba(140,90,40,.5)'; c.lineWidth = 2; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x + i * r * 0.2, y - r * 0.2); c.lineTo(x + i * r * 0.2 + r * 0.3, y + r * 0.4); c.stroke(); }
    cols.forEach((col, i) => ball(c, x + (i - (cols.length - 1) / 2) * r * 0.3, y - r * 0.45 - i * r * 0.42, r * 0.48, col));
    ball(c, x, y - r * 0.45 - cols.length * r * 0.42, r * 0.14, '#e8322e');
  }
  function toothbrush(c, x, y, r, rot = 0, paste = true) {
    c.save(); c.translate(x, y); c.rotate(rot);
    rrect(c, -r, -r * 0.08, r * 1.6, r * 0.16, r * 0.08); c.fillStyle = '#3bc9ff'; c.fill();
    rrect(c, r * 0.55, -r * 0.3, r * 0.45, r * 0.24, r * 0.05); c.fillStyle = '#ffffff'; c.fill();
    if (paste) { blob(c, r * 0.78, -r * 0.4, r * 0.24, r * 0.1, '#7fe0ff'); blob(c, r * 0.78, -r * 0.46, r * 0.2, r * 0.06, '#ffffff'); }
    c.restore();
  }
  function sandwich(c, x, y, r) {
    for (const [dy, col, h] of [[r * 0.25, '#e9b46a', 0.22], [r * 0.08, '#7bd84a', 0.08], [-r * 0.02, '#ff6b5a', 0.1], [-r * 0.14, '#ffd23f', 0.09], [-r * 0.32, '#e9b46a', 0.24]]) blob(c, x, y + dy, r, r * h, col);
  }
  function house(c, x, y, s, col = '#ffcf8a') {
    c.save(); c.translate(x, y); c.scale(s, s);
    rrect(c, -110, -150, 220, 150, 8); c.fillStyle = vgrad(c, -150, 0, col, shade(col, -0.12)); c.fill();
    c.beginPath(); c.moveTo(-135, -140); c.lineTo(0, -250); c.lineTo(135, -140); c.closePath(); c.fillStyle = '#e8463f'; c.fill();
    rrect(c, -30, -90, 60, 90, 8); c.fillStyle = '#8a5a33'; c.fill();
    for (const sx of [-75, 75]) { rrect(c, sx - 24, -120, 48, 44, 6); c.fillStyle = '#bfeaff'; c.fill(); }
    c.restore();
  }
  function crown(c, x, y, r) {
    c.beginPath(); c.moveTo(x - r, y + r * 0.4); c.lineTo(x - r, y - r * 0.4); c.lineTo(x - r * 0.5, y); c.lineTo(x, y - r * 0.6); c.lineTo(x + r * 0.5, y); c.lineTo(x + r, y - r * 0.4); c.lineTo(x + r, y + r * 0.4); c.closePath();
    c.fillStyle = grad3(c, x, y, r, '#ffd23f'); c.fill();
    ball(c, x, y + r * 0.15, r * 0.12, '#ff4d6d'); ball(c, x - r * 0.55, y + r * 0.18, r * 0.09, '#3b9cff'); ball(c, x + r * 0.55, y + r * 0.18, r * 0.09, '#4cd964');
  }
  function yoyo(c, x, y, r, t = 0) {
    const d = (Math.sin(t * 3) * 0.5 + 0.5) * r * 1.5;
    c.strokeStyle = '#555'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y - r * 1.4); c.lineTo(x, y - r * 1.4 + d); c.stroke();
    c.save(); c.translate(x, y - r * 1.4 + d + r * 0.6); c.rotate(t * 8); ball(c, 0, 0, r * 0.6, '#ff4d6d'); c.fillStyle = '#ffffff'; c.fillRect(-r * 0.6, -r * 0.05, r * 1.2, r * 0.1); c.restore();
  }
  function planet(c, x, y, r, col, o = {}) {
    const t = o.t ?? 0;
    if (o.ring) { c.save(); c.beginPath(); c.ellipse(x, y, r * 1.8, r * 0.45, -0.3, Math.PI, TAU); c.lineWidth = r * 0.18; c.strokeStyle = o.ringCol || '#f2d39a'; c.stroke(); c.restore(); }
    ball(c, x, y, r, col);
    if (o.bands) { c.save(); circle(c, x, y, r); c.clip(); c.fillStyle = 'rgba(160,90,40,.3)'; for (let i = -2; i <= 2; i++) c.fillRect(x - r, y + i * r * 0.32 - r * 0.06, r * 2, r * 0.12); c.restore(); }
    if (o.earth) { c.save(); circle(c, x, y, r); c.clip(); c.fillStyle = '#4cbb3c'; blob(c, x - r * 0.3, y - r * 0.2, r * 0.4, r * 0.3, '#4cbb3c'); blob(c, x + r * 0.4, y + r * 0.3, r * 0.35, r * 0.25, '#4cbb3c'); c.restore(); }
    if (o.face !== false) { const bl = blinkAt(t, 381 + (o.seed || 0)); eye(c, x - r * 0.3, y - r * 0.05, r * 0.17, { blink: bl }); eye(c, x + r * 0.3, y - r * 0.05, r * 0.17, { blink: bl }); mouth(c, x, y + r * 0.3, r * 0.32, o.talk ? 'open' : 'smile', 0.6 + 0.4 * Math.abs(Math.sin(t * 9))); }
    if (o.ring) { c.save(); c.beginPath(); c.ellipse(x, y, r * 1.8, r * 0.45, -0.3, 0, Math.PI); c.lineWidth = r * 0.18; c.strokeStyle = o.ringCol || '#f2d39a'; c.stroke(); c.restore(); }
  }
  function block(c, x, y, size, col, letter, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    rrect(c, -size / 2, -size / 2, size, size, size * 0.14); c.fillStyle = vgrad(c, -size / 2, size / 2, shade(col, 0.15), shade(col, -0.2)); c.fill();
    rrect(c, -size * 0.4, -size * 0.4, size * 0.8, size * 0.8, size * 0.1); c.fillStyle = '#fffaf0'; c.fill();
    text(c, String(letter), 0, size * 0.04, size * (String(letter).length > 2 ? 0.3 : 0.62), { fill: col, stroke: shade(col, -0.35), sw: size * 0.05, shadow: false });
    c.restore();
  }
  function rainbow(c, x, y, r, w = 34, prog = 1) {
    const RB = ['#ff4d4d', '#ff9a1f', '#ffd23f', '#4cd964', '#3b9cff', '#9b4dde'];
    for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(x, y, r - i * w, Math.PI, Math.PI + Math.PI * prog); c.lineWidth = w + 1; c.strokeStyle = RB[i]; c.stroke(); }
    K.cloud(c, x - r + w * 3, y + 10, 0.9 * (r / 300)); K.cloud(c, x + r - w * 3, y + 10, 0.9 * (r / 300));
  }
  function bed(c, x, y, s, o = {}) {
    c.save(); c.translate(x, y); c.scale(s, s);
    rrect(c, -260, -260, 40, 260, 14); c.fillStyle = '#c99a62'; c.fill(); rrect(c, 220, -170, 40, 170, 14); c.fill();
    rrect(c, -230, -130, 470, 80, 20); c.fillStyle = '#ffffff'; c.fill();
    blob(c, -150, -150, 70, 34, '#ffffff');
    if (o.blanket !== false) { rrect(c, -110 + (o.off || 0) * 200, -150, 340, 110, 30); c.fillStyle = vgrad(c, -150, -40, '#8fb4ff', '#5b7fe0'); c.fill(); }
    c.restore();
  }
  function sink(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y); c.scale(s, s);
    rrect(c, -200, -60, 400, 260, 16); c.fillStyle = vgrad(c, -60, 200, '#ffffff', '#dfe8ef'); c.fill();
    oval(c, 0, -60, 170, 34); c.fillStyle = '#cfe9f5'; c.fill();
    c.strokeStyle = '#b9c4cf'; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -80); c.lineTo(0, -170); c.quadraticCurveTo(0, -200, 50, -200); c.stroke();
    if (o.water) { c.save(); c.globalAlpha = 0.7; c.fillStyle = '#7fd4ff'; c.fillRect(44, -196, 12, 140); for (let i = 0; i < 6; i++) { const sp = (t * 3 + i / 6) % 1; circle(c, 50 + Math.sin(i * 3) * 20 * sp, -60 - sp * 30, 6); c.fill(); } c.restore(); }
    c.restore();
  }
  function bowl(c, x, y, r, o = {}) {
    c.beginPath(); c.arc(x, y - r * 0.2, r, 0, Math.PI); c.closePath(); c.fillStyle = grad3(c, x, y, r, o.color || '#7fd4ff'); c.fill();
    oval(c, x, y - r * 0.2, r, r * 0.25); c.fillStyle = '#fff3d6'; c.fill();
    for (let i = 0; i < 8; i++) ball(c, x - r * 0.6 + (i % 4) * r * 0.4, y - r * 0.28 - Math.floor(i / 4) * r * 0.08, r * 0.12, ['#ffb34d', '#ff6b5a', '#ffd23f'][i % 3]);
  }

  // ---------- particles & weather ----------
  function rain(g, t, n = 120, seed = 0) {
    const c = g.c; c.save(); c.strokeStyle = 'rgba(170,210,255,.75)'; c.lineWidth = 4; c.lineCap = 'round';
    for (let i = 0; i < n; i++) { const x = (rnd(i + seed) * 2 - 1) * g.hw * 1.2, sp = 900 + rnd(i * 3) * 500, y = ((t * sp + rnd(i * 7) * 1600) % 1600) - g.hh - 100; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 8, y + 34); c.stroke(); }
    c.restore();
  }
  function snow(g, t, n = 90, seed = 0) {
    const c = g.c;
    for (let i = 0; i < n; i++) { const x = (rnd(i + seed) * 2 - 1) * g.hw * 1.2 + Math.sin(t + i) * 30, sp = 60 + rnd(i * 3) * 90, y = ((t * sp + rnd(i * 7) * 1500) % 1500) - g.hh - 60, r = 4 + rnd(i * 5) * 9; circle(c, x, y, r); c.fillStyle = 'rgba(255,255,255,.92)'; c.fill(); }
  }
  function fallingLeaves(g, t, n = 26, seed = 0) {
    const c = g.c, cols = ['#ff9a1f', '#e8463f', '#ffd23f', '#c8763a'];
    for (let i = 0; i < n; i++) { const x = (rnd(i + seed) * 2 - 1) * g.hw * 1.1 + Math.sin(t * 1.5 + i) * 60, sp = 70 + rnd(i * 3) * 80, y = ((t * sp + rnd(i * 7) * 1500) % 1500) - g.hh - 60; c.save(); c.translate(x, y); c.rotate(t * 2 + i); c.beginPath(); c.moveTo(0, 18); c.quadraticCurveTo(16, 0, 0, -18); c.quadraticCurveTo(-16, 0, 0, 18); c.fillStyle = cols[i % 4]; c.fill(); c.restore(); }
  }
  function windLines(g, t, n = 8) {
    const c = g.c; c.save(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 6; c.lineCap = 'round';
    for (let i = 0; i < n; i++) { const y = -350 + i * 90 + Math.sin(i) * 30, x = ((t * 700 + i * 300) % (g.hw * 2 + 600)) - g.hw - 300; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 80, y - 20, x + 140, y + 20, x + 220, y); c.arc(x + 220, y - 20, 20, Math.PI / 2, -Math.PI, true); c.stroke(); }
    c.restore();
  }
  function puddle(c, x, y, w, t = 0, splash = 0) {
    oval(c, x, y, w, w * 0.18); c.fillStyle = 'rgba(90,150,220,.75)'; c.fill();
    oval(c, x - w * 0.3, y - w * 0.04, w * 0.25, w * 0.04); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill();
    if (splash > 0) for (let i = 0; i < 14; i++) { const a = Math.PI + (i / 13) * Math.PI, d = splash * w * 1.1; oval(c, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.9 - splash * (1 - splash) * 200, 9, 13); c.fillStyle = 'rgba(120,190,255,.85)'; c.fill(); }
  }

  // ---------- backgrounds ----------
  function bgSpace(g, t) {
    const c = g.c;
    const gr = c.createRadialGradient(0, -100, 50, 0, -100, Math.max(g.hw, g.hh) * 1.4); gr.addColorStop(0, '#3a2a8a'); gr.addColorStop(1, '#0a0b2e');
    c.fillStyle = gr; c.fillRect(-g.hw * 3, -g.hh * 3, g.hw * 6, g.hh * 6);
    c.save(); c.globalAlpha = 0.25; blob(c, -g.hw * 0.6, -300, 300, 160, '#ff6fd8'); blob(c, g.hw * 0.6, 200, 300, 180, '#3bc9ff'); c.restore();
    for (let i = 0; i < 120; i++) { const x = (rnd(i) * 2 - 1) * g.hw, y = (rnd(i * 3) * 2 - 1) * g.hh, k = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)); c.globalAlpha = k; starPath(c, x, y, 2 + rnd(i * 7) * 6, 0, 4, 0.4); c.fillStyle = '#fff8d0'; c.fill(); }
    c.globalAlpha = 1;
  }
  function bgJungle(g, t) {
    const c = g.c;
    K.sky(g, '#7fd6a8', '#d9f7c8', 200);
    for (let i = -10; i <= 10; i++) K.tree(c, i * 140 + rnd(i) * 40, 220, 1.3 + rnd(i + 3) * 0.5, i % 2 ? '#2f8f3a' : '#3aa547');
    for (let i = -12; i <= 12; i++) { const x = i * 110 + rnd(i + 9) * 30; c.save(); c.strokeStyle = '#3f8a2e'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, -g.hh); c.quadraticCurveTo(x + Math.sin(t + i) * 20, -400, x + 10, -260 - rnd(i) * 200); c.stroke(); c.restore(); K.leaf(c, x + 10, -250 - rnd(i) * 200, 22, 0.5); }
    for (let i = -12; i <= 12; i++) K.leaf(c, i * 90, 250 + (i % 2) * 20, 70, (i % 2 ? 0.8 : -0.8) + Math.sin(t + i) * 0.05);
    c.fillStyle = vgrad(c, 260, g.hh, '#7fb04a', '#5a8a34'); c.fillRect(-g.hw * 3, 260, g.hw * 6, g.hh * 2);
    for (let i = -12; i <= 12; i++) K.leaf(c, i * 120 + 50, 300, 50, i % 2 ? 1.2 : -1.2);
  }
  function bgBeach(g, t) {
    const c = g.c;
    K.sky(g, '#26b6f7', '#c9f1ff', 120); K.clouds(g, t, -430); K.sun(c, g.hw * 0.55, -420, 70, t);
    c.fillStyle = vgrad(c, 100, 260, '#2fa8e8', '#1e7fcf'); c.fillRect(-g.hw * 3, 100, g.hw * 6, 200);
    c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = -20; i <= 20; i++) { const x = i * 80 + ((t * 40) % 80); oval(c, x, 150 + Math.sin(t * 2 + i) * 6, 26, 5); c.fill(); }
    c.beginPath(); c.moveTo(-g.hw * 3, 250); for (let x = -g.hw * 3; x <= g.hw * 3; x += 40) c.lineTo(x, 250 + Math.sin(x * 0.02 + t * 2) * 10); c.lineTo(g.hw * 3, 280); c.lineTo(-g.hw * 3, 280); c.closePath(); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill();
    c.fillStyle = vgrad(c, 260, g.hh, '#f8dd9a', '#eac476'); c.fillRect(-g.hw * 3, 268, g.hw * 6, g.hh * 2);
    for (let i = 0; i < 20; i++) { oval(c, (rnd(i) * 2 - 1) * g.hw, 320 + rnd(i * 3) * 300, 6, 3); c.fillStyle = 'rgba(180,140,80,.4)'; c.fill(); }
  }
  function bgGarden(g, t) {
    const c = g.c;
    K.sky(g, '#3ab8f5', '#d6f3ff', 200); K.clouds(g, t, -420); K.sun(c, -g.hw * 0.6, -440, 60, t);
    for (let i = -6; i <= 6; i++) blob(c, i * 260, 230, 220, 140, '#8fd16b');
    for (let i = -10; i <= 10; i++) K.tree(c, i * 190 + rnd(i + 5) * 60, 200, 0.9 + rnd(i + 2) * 0.3, '#3aa547');
    c.fillStyle = '#ffffff';
    for (let x = -g.hw - 40; x < g.hw + 40; x += 40) { c.beginPath(); c.moveTo(x - 12, 280); c.lineTo(x - 12, 210); c.lineTo(x, 196); c.lineTo(x + 12, 210); c.lineTo(x + 12, 280); c.closePath(); c.fill(); }
    c.fillRect(-g.hw * 2, 225, g.hw * 4, 10); c.fillRect(-g.hw * 2, 258, g.hw * 4, 10);
    c.fillStyle = vgrad(c, 270, g.hh, '#6fcf4f', '#4aa83a'); c.fillRect(-g.hw * 3, 270, g.hw * 6, g.hh * 2);
    for (let i = 0; i < 40; i++) { const x = (rnd(i) * 2 - 1) * g.hw, y = 300 + rnd(i * 3) * 300; circle(c, x, y, 7); c.fillStyle = ['#ff6fa8', '#ffffff', '#ffd23f', '#b26bff'][i % 4]; c.fill(); }
  }
  function bgSnow(g, t) {
    const c = g.c;
    K.sky(g, '#9fc8f0', '#eef6ff', 200);
    for (let i = -6; i <= 6; i++) blob(c, i * 260, 240, 240, 150, '#f4f8ff');
    for (let i = -9; i <= 9; i++) { const x = i * 170 + rnd(i) * 50; c.save(); c.translate(x, 230); for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-70 + k * 14, -k * 60); c.lineTo(0, -110 - k * 60); c.lineTo(70 - k * 14, -k * 60); c.closePath(); c.fillStyle = '#2f8a5a'; c.fill(); c.beginPath(); c.moveTo(-40 + k * 8, -50 - k * 60); c.lineTo(0, -110 - k * 60); c.lineTo(40 - k * 8, -50 - k * 60); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); } c.fillStyle = '#7a4a2a'; c.fillRect(-10, 0, 20, 30); c.restore(); }
    c.fillStyle = vgrad(c, 260, g.hh, '#ffffff', '#dfe9f5'); c.fillRect(-g.hw * 3, 255, g.hw * 6, g.hh * 2);
    snow(g, t, 70, 4);
  }
  function bgRainy(g, t, o = {}) {
    const c = g.c;
    K.sky(g, o.clear ? '#5cc0f5' : '#7d8ba6', o.clear ? '#d6f3ff' : '#c4ccd9', 200);
    if (!o.clear) for (let i = -6; i <= 6; i++) { c.save(); c.globalAlpha = 0.9; K.cloud(c, i * 240 + ((t * 20) % 240), -470 + (i % 2) * 40, 1.6); c.restore(); }
    for (let i = -6; i <= 6; i++) blob(c, i * 260, 230, 220, 140, o.clear ? '#8fd16b' : '#6fae58');
    for (let i = -10; i <= 10; i++) K.tree(c, i * 190 + rnd(i + 8) * 60, 200, 0.9 + rnd(i + 2) * 0.3, o.clear ? '#3aa547' : '#2f8a3a');
    c.fillStyle = vgrad(c, 260, g.hh, '#6aa84f', '#4a8a3a'); c.fillRect(-g.hw * 3, 255, g.hw * 6, 60);
    c.fillStyle = vgrad(c, 300, g.hh, '#b8a389', '#9a8670'); c.fillRect(-g.hw * 3, 300, g.hw * 6, g.hh * 2);
    if (!o.clear) rain(g, t, 110);
  }
  function bgStreet(g, t, speed = 0) {
    const c = g.c;
    K.sky(g, '#38b6f5', '#d0f1ff', 100); K.clouds(g, t, -440);
    for (let i = -14; i <= 14; i++) { const x = i * 120 - ((t * speed * 0.2) % 120), h = 160 + rnd(i + 40) * 220, col = ['#ffb3c7', '#9fd8ff', '#ffe08a', '#b8f0a8', '#d5b8ff', '#ffc69a'][(i % 6 + 6) % 6]; rrect(c, x, 150 - h, 100, h, 10); c.fillStyle = col; c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; for (let w = 0; w < h - 40; w += 40) { c.fillRect(x + 16, 150 - h + 18 + w, 24, 22); c.fillRect(x + 60, 150 - h + 18 + w, 24, 22); } }
    c.fillStyle = '#d9d2c4'; c.fillRect(-g.hw * 3, 150, g.hw * 6, 70);
    c.fillStyle = vgrad(c, 220, g.hh, '#55555f', '#3f3f48'); c.fillRect(-g.hw * 3, 220, g.hw * 6, g.hh * 2);
    c.fillStyle = '#ffffff'; for (let i = -20; i <= 20; i++) c.fillRect(i * 160 - ((t * speed) % 160), 452, 90, 12);
    c.fillStyle = '#d9d2c4'; c.fillRect(-g.hw * 3, 560, g.hw * 6, 200);
  }
  function bgStage(g, t) {
    const c = g.c;
    c.fillStyle = vgrad(c, -g.hh, 200, '#2a1050', '#5b2a9e'); c.fillRect(-g.hw * 3, -g.hh * 3, g.hw * 6, g.hh * 6);
    c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(0, 200, 20, 0, 200, 420); gr.addColorStop(0, 'rgba(255,240,200,.55)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(-60, -g.hh); c.lineTo(60, -g.hh); c.lineTo(420, 450); c.lineTo(-420, 450); c.closePath(); c.fill(); c.restore();
    for (const sd of [-1, 1]) { c.fillStyle = vgrad(c, -g.hh, g.hh, '#d8263a', '#8a1020'); c.beginPath(); c.moveTo(sd * g.hw * 1.2, -g.hh); c.lineTo(sd * (g.hw - 120), -g.hh); c.quadraticCurveTo(sd * (g.hw - 40), 0, sd * (g.hw - 160), 300); c.lineTo(sd * g.hw * 1.2, 300); c.closePath(); c.fill(); }
    c.fillStyle = '#d8263a'; for (let i = -20; i <= 20; i++) { circle(c, i * 70, -g.hh + 30, 46); c.fill(); }
    c.fillStyle = vgrad(c, 280, g.hh, '#c9883e', '#8a5a2a'); c.fillRect(-g.hw * 3, 280, g.hw * 6, g.hh * 2);
    c.strokeStyle = 'rgba(80,40,10,.35)'; c.lineWidth = 3; for (let k = 0; k < 8; k++) { const y = 280 + k * k * 6 + k * 16; c.beginPath(); c.moveTo(-g.hw * 3, y); c.lineTo(g.hw * 3, y); c.stroke(); }
  }

  // ---------- items registry for kits ----------
  const crit = (kind, s = 1) => (c, t, o = {}) => animal(c, kind, 0, 140 * s, 0.95 * s, Object.assign({ t }, o));
  const I = {};
  const add = (id, word, draw, extra = {}) => (I[id] = Object.assign({ id, word, draw }, extra));
  add('apple', 'Apple', (c) => K.apple(c, 0, 10, 110));
  add('banana', 'Banana', (c) => banana(c, 0, 0, 130));
  add('orange', 'Orange', (c) => K.orange(c, 0, 0, 110));
  add('grapes', 'Grapes', (c) => K.grapes(c, 0, 90, 110));
  add('strawberry', 'Strawberry', (c) => strawberry(c, 0, -20, 120));
  add('watermelon', 'Watermelon', (c) => watermelon(c, 0, 0, 150));
  add('pear', 'Pear', (c) => pear(c, 0, 20, 110));
  add('cherries', 'Cherries', (c) => cherries(c, 0, 10, 110));
  add('lemon', 'Lemon', (c) => lemon(c, 0, 0, 120));
  add('carrot', 'Carrot', (c) => carrot(c, 0, 0, 120));
  add('broccoli', 'Broccoli', (c) => broccoli(c, 0, 0, 130));
  add('tomato', 'Tomato', (c) => tomato(c, 0, 0, 110));
  add('corn', 'Corn', (c) => corn(c, 0, 0, 130));
  add('pumpkin', 'Pumpkin', (c) => pumpkin(c, 0, 20, 110));
  add('peas', 'Peas', (c) => peas(c, 0, 0, 140));
  add('car', 'Car', (c, t) => K.car(c, 0, 90, 0.8, { t, color: '#ff5a5a', trim: '#3b6ef5' }), { sound: 'BEEP BEEP', sfx: 'honk', place: 'road' });
  add('bus', 'Bus', (c, t) => bus(c, 0, 110, 0.75, { t }), { sound: 'HONK HONK', sfx: 'honk', place: 'road' });
  add('train', 'Train', (c, t) => train(c, 0, 130, 0.7, { t, roll: t * 4 }), { sound: 'CHOO CHOO', sfx: 'choo', place: 'road' });
  add('firetruck', 'Fire Truck', (c, t) => fireTruck(c, 0, 120, 0.72, { t, siren: true }), { sound: 'WEE-OO', sfx: 'siren', place: 'road' });
  add('tractor', 'Tractor', (c, t) => tractor(c, 0, 130, 0.75, { t }), { sound: 'PUT PUT', sfx: 'engine', place: 'road' });
  add('airplane', 'Airplane', (c, t) => airplane(c, 0, 0, 0.75, { t }), { sound: 'ZOOM', sfx: 'plane', place: 'sky' });
  add('helicopter', 'Helicopter', (c, t) => helicopter(c, 0, 40, 0.85, { t }), { sound: 'WHIRR', sfx: 'heli', place: 'sky' });
  add('boat', 'Boat', (c, t) => boat(c, 0, 110, 0.65, { t }), { sound: 'TOOT TOOT', sfx: 'horn', place: 'water' });
  add('rocket', 'Rocket', (c, t) => rocket(c, 0, 90, 0.65, { t }), { sound: 'WHOOSH', sfx: 'blastoff', place: 'sky' });
  for (const [k, w, snd, sfx] of [['cow', 'Cow', 'MOO', 'moo'], ['pig', 'Pig', 'OINK', 'oink'], ['sheep', 'Sheep', 'BAA', 'baa'], ['goat', 'Goat', 'MEH', 'baa'], ['cat', 'Cat', 'MEOW', 'meow'], ['dog', 'Dog', 'WOOF', 'woof'], ['hen', 'Hen', 'CLUCK', 'cluck'], ['duck', 'Duck', 'QUACK', 'quack'], ['chick', 'Chick', 'PEEP', 'peep'],
    ['lion', 'Lion', 'ROAR', 'roar'], ['tiger', 'Tiger', 'GRR', 'roar'], ['elephant', 'Elephant', 'PAWOO', 'elephant'], ['monkey', 'Monkey', 'OOH AH', 'monkey'], ['zebra', 'Zebra', 'NEIGH', 'neigh'], ['giraffe', 'Giraffe', 'HUM', 'hum'], ['hippo', 'Hippo', 'GRUNT', 'grunt'], ['panda', 'Panda', 'MUNCH', 'crunch'],
    ['bunny', 'Bunny', 'HOP HOP', 'boing'], ['frog', 'Frog', 'RIBBIT', 'ribbit'], ['penguin', 'Penguin', 'HONK', 'honk'], ['owl', 'Owl', 'HOO HOO', 'hoot'], ['horse', 'Horse', 'NEIGH', 'neigh'], ['bear', 'Bear', 'GROWL', 'grunt']]) {
    add(k, w, k === 'giraffe' ? crit(k, 0.75) : k === 'chick' ? crit(k, 0.9) : crit(k), { sound: snd, sfx, animal: true });
  }
  add('fish', 'Fish', (c, t) => K.fish(c, 0, 0, 2.0, '#ff7a3d', { t }), { sound: 'BLUB BLUB', sfx: 'bubble' });
  add('octopus', 'Octopus', (c, t) => K.octopus(c, 0, 110, 1.0, { t, wave: true }), { sound: 'SPLISH', sfx: 'splash' });
  add('crab', 'Crab', (c, t) => K.crab(c, 0, 60, 1.4, { t }), { sound: 'CLICK CLACK', sfx: 'click' });
  add('whale', 'Whale', (c, t) => whale(c, 0, 0, 0.85, { t, spout: true }), { sound: 'SPLOOSH', sfx: 'splash' });
  add('bee', 'Bee', (c, t) => bee(c, 0, 0, 2.0, { t }), { sound: 'BUZZ', sfx: 'buzz' });
  add('butterfly', 'Butterfly', (c, t) => butterfly(c, 0, 0, 1.6, { t }), { sound: 'FLUTTER', sfx: 'sparkle' });
  add('ladybug', 'Ladybug', (c, t) => ladybug(c, 0, 60, 1.8, { t }), { sound: 'TICK TICK', sfx: 'click' });
  add('snail', 'Snail', (c, t) => snail(c, 0, 70, 1.6, { t }), { sound: 'SLOW', sfx: 'boing' });
  add('caterpillar', 'Caterpillar', (c, t) => caterpillar(c, 0, 50, 1.2, { t }), { sound: 'WIGGLE', sfx: 'boing' });
  add('ant', 'Ant', (c, t) => ant(c, 0, 40, 3.2, { t }), { sound: 'MARCH', sfx: 'click' });
  add('bird', 'Bird', (c, t) => bird(c, 0, 0, 2.0, { t, fly: true }), { sound: 'TWEET', sfx: 'tweet' });
  add('trex', 'T-Rex', (c, t) => dino(c, 'trex', 0, 150, 0.75, { t, stomp: true }), { sound: 'ROAR', sfx: 'roar' });
  add('longneck', 'Long Neck', (c, t) => dino(c, 'longneck', 0, 190, 0.6, { t }), { sound: 'HUMMM', sfx: 'hum' });
  add('trike', 'Triceratops', (c, t) => dino(c, 'trike', 0, 120, 0.8, { t }), { sound: 'STOMP', sfx: 'stomp' });
  add('stego', 'Stegosaurus', (c, t) => dino(c, 'stego', 0, 130, 0.8, { t }), { sound: 'STOMP', sfx: 'stomp' });
  add('drum', 'Drum', (c, t) => drum(c, 0, 20, 120, t, Math.abs(Math.sin(t * 8))), { sound: 'BOOM BOOM', sfx: 'drum' });
  add('guitar', 'Guitar', (c, t) => guitar(c, 0, 40, 110, t, 1), { sound: 'STRUM', sfx: 'strum' });
  add('piano', 'Piano', (c, t) => piano(c, 0, 20, 110, t, Math.floor(t * 4) % 8), { sound: 'PLINK PLONK', sfx: 'piano' });
  add('trumpet', 'Trumpet', (c) => trumpet(c, 0, 0, 120), { sound: 'TA-DA', sfx: 'trumpet' });
  add('xylophone', 'Xylophone', (c, t) => xylophone(c, 0, 0, 120, t, Math.floor(t * 5) % 6), { sound: 'DING DING', sfx: 'xylo' });
  add('maracas', 'Maracas', (c, t) => maracas(c, 0, 0, 120, t, 1), { sound: 'SHAKE', sfx: 'shake' });
  add('ball', 'Ball', (c, t) => K.beachBall(c, 0, 0, 110, t * 2));
  add('kite', 'Kite', (c, t) => kite(c, 0, -60, 1.1, '#ff4d6d', t));
  add('umbrella', 'Umbrella', (c) => umbrella(c, 0, 0, 130, '#ff4d6d'));
  add('icecream', 'Ice Cream', (c) => iceCream(c, 0, 30, 90));
  add('cake', 'Cake', (c, t) => K.cake(c, 0, 120, 0.7, { t }));
  add('star', 'Star', (c, t) => K.star(c, 0, 0, 120, '#ffd23f', { face: true, t }));
  add('moon', 'Moon', (c, t) => K.moon(c, 0, 0, 110, t));
  add('sun', 'Sun', (c, t) => K.sun(c, 0, 0, 90, t));
  add('heart', 'Heart', (c, t) => K.shapeChar(c, 'heart', 0, 0, 110, '#ff6fa8', { t }));
  add('crown', 'Crown', (c) => crown(c, 0, 0, 120));
  add('yoyo', 'Yo-yo', (c, t) => yoyo(c, 0, 60, 90, t));
  add('house', 'House', (c) => house(c, 0, 130, 0.9));
  add('egg', 'Egg', (c) => K.egg(c, 0, 0, 100));
  add('leaf', 'Leaf', (c) => K.leaf(c, 0, 0, 130, 0.3));
  add('flower', 'Flower', (c, t) => flower(c, 0, 130, 1.3, '#ff6fa8', 1, t));
  add('rainbow', 'Rainbow', (c) => rainbow(c, 0, 80, 170, 22, 1));
  add('snowman', 'Snowman', (c, t) => snowman(c, 0, 170, 0.75, { t }));
  add('teddy', 'Teddy', (c, t) => K.bear(c, 0, 140, 0.9, { t }));
  add('present', 'Present', (c) => K.present(c, 0, 90, 180, '#3b9cff', '#ffd23f'));
  add('balloon', 'Balloon', (c, t) => K.balloon(c, 0, -40, 90, '#ff4d6d', { t }));
  add('sandwich', 'Sandwich', (c) => sandwich(c, 0, 0, 120));
  add('fishblue', 'Fish', (c, t) => K.fish(c, 0, 0, 2.0, '#3b8cff', { t }), { sound: 'BLUB BLUB', sfx: 'bubble' });
  add('jellyfish', 'Jellyfish', (c, t) => {
    c.save(); c.translate(0, Math.sin(t * 2) * 10);
    c.lineCap = 'round'; for (let i = 0; i < 5; i++) { const bx = -60 + i * 30; c.beginPath(); c.moveTo(bx, 0); for (let k = 1; k <= 6; k++) c.lineTo(bx + Math.sin(t * 4 + i + k) * 10, k * 24); c.lineWidth = 9; c.strokeStyle = 'rgba(255,140,210,.85)'; c.stroke(); }
    c.beginPath(); c.arc(0, 0, 90, Math.PI, 0); c.quadraticCurveTo(0, 26, -90, 0); c.closePath(); c.fillStyle = grad3(c, 0, -40, 90, '#ff9ad5'); c.fill();
    eye(c, -28, -30, 12, { blink: blinkAt(t, 391) }); eye(c, 28, -30, 12, { blink: blinkAt(t, 391) }); mouth(c, 0, -8, 22, 'smile');
    c.restore();
  });
  add('nest', 'Nest', (c, t) => {
    for (let i = 0; i < 3; i++) K.egg(c, -50 + i * 50, -20 - (i % 2) * 8, 34);
    c.beginPath(); c.arc(0, -10, 120, 0.05 * Math.PI, 0.95 * Math.PI); c.closePath(); c.fillStyle = grad3(c, 0, 20, 120, '#a8743f'); c.fill();
    c.strokeStyle = 'rgba(90,55,20,.6)'; c.lineWidth = 5; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(-110 + i * 25, 0 + (i % 2) * 20); c.lineTo(-80 + i * 25, 40 + (i % 3) * 14); c.stroke(); }
  });
  add('volcano', 'Volcano', (c, t) => {
    c.beginPath(); c.moveTo(-170, 140); c.lineTo(-50, -80); c.lineTo(50, -80); c.lineTo(170, 140); c.closePath(); c.fillStyle = vgrad(c, -80, 140, '#a0703f', '#6b4520'); c.fill();
    c.beginPath(); c.moveTo(-50, -80); c.quadraticCurveTo(-30, -20, -60, 20); c.lineTo(-20, -10); c.lineTo(10, 30); c.lineTo(30, -20); c.quadraticCurveTo(50, -40, 50, -80); c.closePath(); c.fillStyle = '#ff5a2a'; c.fill();
    for (let i = 0; i < 5; i++) { const sp = (t * 0.7 + i / 5) % 1; circle(c, Math.sin(i * 2.1) * 30 * sp, -90 - sp * 140, 20 + sp * 26); c.fillStyle = `rgba(160,160,170,${0.7 * (1 - sp)})`; c.fill(); }
    eye(c, -24, 60, 12, { blink: blinkAt(t, 393) }); eye(c, 24, 60, 12, { blink: blinkAt(t, 393) }); mouth(c, 0, 86, 26, 'smile');
  });
  add('queen', 'Queen', (c) => crown(c, 0, 0, 130));

  function drawItem(c, id, x, y, s, t, o) {
    const it = I[id]; if (!it) return;
    c.save(); c.translate(x, y); c.scale(s, s); it.draw(c, t, o || {}); c.restore();
  }

  Object.assign(K, {
    banana, strawberry, watermelon, pear, cherries, lemon, carrot, broccoli, tomato, corn, pumpkin, peas,
    bus, train, fireTruck, tractor, airplane, boat, rocket, helicopter, wheel3,
    critter2, animal, bee, butterfly, ladybug, snail, caterpillar, ant, bird, whale, dino,
    drum, guitar, piano, trumpet, xylophone, maracas,
    umbrella, snowman, kite, flower, wateringCan, sandcastle, iceCream, toothbrush, sandwich, house, crown, yoyo, planet, block, rainbow, bed, sink, bowl,
    rain, snow, fallingLeaves, windLines, puddle,
    bgSpace, bgJungle, bgBeach, bgGarden, bgSnow, bgRainy, bgStreet, bgStage,
    ITEMS: I, drawItem,
  });
})();
