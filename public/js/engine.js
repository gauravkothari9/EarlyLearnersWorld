/* Kids Shorts Studio — drawing engine.
   All drawing happens in "units": origin at frame center, visible height = 1280 units,
   visible width = 720 units (9:16) or ~2276 units (16:9). Feet usually stand on y = G. */
(function () {
  const TAU = Math.PI * 2;
  const G = 400; // ground line in units

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const ease = {
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    elastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
    bounce: (t) => {
      const n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
  };
  function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); }

  // ---------- color ----------
  function hex(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function shade(h, a) {
    const [r, g, b] = hex(h);
    const f = a < 0 ? 0 : 255, p = Math.abs(a);
    const to = (v) => Math.round(v + (f - v) * p).toString(16).padStart(2, '0');
    return '#' + to(r) + to(g) + to(b);
  }
  function rgba(h, a) { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; }

  // ---------- primitives ----------
  function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0.01, r), 0, TAU); }
  function oval(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  function grad3(c, x, y, r, col, light = 0.38, dark = -0.28) {
    const g = c.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.05, x, y, r * 1.15);
    g.addColorStop(0, shade(col, light));
    g.addColorStop(0.5, col);
    g.addColorStop(1, shade(col, dark));
    return g;
  }
  function ball(c, x, y, r, col) { circle(c, x, y, r); c.fillStyle = grad3(c, x, y, r, col); c.fill(); }
  function blob(c, x, y, rx, ry, col, rot = 0) { oval(c, x, y, rx, ry, rot); c.fillStyle = grad3(c, x, y, Math.max(rx, ry), col); c.fill(); }
  function vgrad(c, y0, y1, a, b) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
  function shadow(c, x, y, rx, a = 0.17) { oval(c, x, y, rx, rx * 0.2); c.fillStyle = `rgba(0,0,0,${a})`; c.fill(); }

  const FONT = '"Fredoka", "Arial Rounded MT Bold", "Comic Sans MS", sans-serif';
  function text(c, s, x, y, size, o = {}) {
    const fill = o.fill || '#fff', stroke = o.stroke || '#2b1d4e', sw = o.sw ?? size * 0.17;
    c.save();
    c.font = `${o.weight || 700} ${size}px ${FONT}`;
    c.textAlign = o.align || 'center';
    c.textBaseline = 'middle';
    c.lineJoin = 'round';
    if (o.shadow !== false) {
      c.lineWidth = sw; c.strokeStyle = 'rgba(0,0,0,.28)'; c.fillStyle = 'rgba(0,0,0,.28)';
      if (sw > 0) c.strokeText(s, x, y + size * 0.09);
      c.fillText(s, x, y + size * 0.09);
    }
    if (sw > 0) { c.lineWidth = sw; c.strokeStyle = stroke; c.strokeText(s, x, y); }
    c.fillStyle = fill; c.fillText(s, x, y);
    c.restore();
  }

  // ---------- face parts ----------
  function blinkAt(t, seed = 0) {
    const per = 3.1 + rnd(seed) * 1.3;
    const p = (t + rnd(seed + 1) * per) % per;
    return p < 0.16 ? Math.sin((p / 0.16) * Math.PI) : 0;
  }
  function eye(c, x, y, r, o = {}) {
    const bl = o.blink || 0;
    if (o.happy || o.closed || bl > 0.75) {
      c.beginPath(); c.lineWidth = r * 0.26; c.lineCap = 'round'; c.strokeStyle = '#3a2414';
      if (o.happy) c.arc(x, y + r * 0.35, r * 0.72, Math.PI * 1.15, Math.PI * 1.85);
      else c.arc(x, y - r * 0.15, r * 0.72, Math.PI * 0.15, Math.PI * 0.85);
      c.stroke();
      return;
    }
    const ry = r * (1 - bl);
    oval(c, x, y, r * 0.82, ry); c.fillStyle = '#ffffff'; c.fill();
    c.save(); oval(c, x, y, r * 0.82, ry); c.clip();
    const [lx, ly] = o.look || [0, 0];
    const ix = x + lx * r * 0.28, iy = y + ly * r * 0.28 + r * 0.05;
    circle(c, ix, iy, r * 0.6); c.fillStyle = grad3(c, ix, iy, r * 0.6, o.iris || '#5b3a1e', 0.25, -0.35); c.fill();
    circle(c, ix, iy, r * 0.33); c.fillStyle = '#120a05'; c.fill();
    c.fillStyle = '#fff';
    circle(c, ix - r * 0.2, iy - r * 0.24, r * 0.17); c.fill();
    circle(c, ix + r * 0.18, iy + r * 0.16, r * 0.08); c.fill();
    c.restore();
    c.beginPath(); c.ellipse(x, y, r * 0.82, ry, 0, Math.PI * 1.08, Math.PI * 1.92);
    c.lineWidth = r * 0.13; c.strokeStyle = 'rgba(45,22,10,.6)'; c.stroke();
  }
  function bead(c, x, y, r, bl = 0) {
    if (bl > 0.6) { c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.lineWidth = r * 0.45; c.lineCap = 'round'; c.strokeStyle = '#1d120b'; c.stroke(); return; }
    oval(c, x, y, r, r * (1 - bl)); c.fillStyle = '#1d120b'; c.fill();
    circle(c, x - r * 0.3, y - r * 0.35, r * 0.32); c.fillStyle = '#fff'; c.fill();
  }
  function mouth(c, x, y, w, type = 'smile', open = 1) {
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    if (type === 'smile') {
      c.beginPath(); c.arc(x, y - w * 0.35, w * 0.55, Math.PI * 0.2, Math.PI * 0.8);
      c.lineWidth = w * 0.13; c.strokeStyle = '#7a2f22'; c.stroke();
    } else if (type === 'sad') {
      c.beginPath(); c.arc(x, y + w * 0.4, w * 0.42, Math.PI * 1.22, Math.PI * 1.78);
      c.lineWidth = w * 0.13; c.strokeStyle = '#7a2f22'; c.stroke();
    } else if (type === 'o') {
      oval(c, x, y + w * 0.1, w * 0.2 * (0.6 + open * 0.4), w * 0.26 * (0.6 + open * 0.4)); c.fillStyle = '#6b1f1a'; c.fill();
    } else if (type === 'puff') {
      oval(c, x, y + w * 0.1, w * 0.12, w * 0.12); c.fillStyle = '#6b1f1a'; c.fill();
    } else {
      const h = w * (type === 'grin' ? 0.62 : 0.48) * open + w * 0.06;
      c.beginPath(); c.moveTo(x - w / 2, y);
      c.quadraticCurveTo(x, y + w * 0.1, x + w / 2, y);
      c.bezierCurveTo(x + w * 0.45, y + h * 1.25, x - w * 0.45, y + h * 1.25, x - w / 2, y);
      c.closePath(); c.fillStyle = '#7a1f22'; c.fill();
      c.save(); c.clip();
      oval(c, x, y + h * 1.0, w * 0.3, h * 0.45); c.fillStyle = '#ff7b8a'; c.fill();
      c.fillStyle = '#fff'; c.fillRect(x - w * 0.3, y - 2, w * 0.6, w * 0.09);
      c.restore();
    }
    c.restore();
  }
  function partyHat(c, x, y, h, rot = 0, cols = ['#ff5fa2', '#4cc3ff', '#ffd23f', '#7bd88f']) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.beginPath(); c.moveTo(-h * 0.38, 0); c.lineTo(0, -h); c.lineTo(h * 0.38, 0); c.quadraticCurveTo(0, h * 0.08, -h * 0.38, 0); c.closePath();
    const g = c.createLinearGradient(-h * 0.4, 0, h * 0.4, 0); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#efe2c8');
    c.fillStyle = g; c.fill();
    c.save(); c.clip();
    for (let i = 0; i < 14; i++) { circle(c, (rnd(i) - 0.5) * h * 0.7, -rnd(i + 9) * h, h * 0.055); c.fillStyle = cols[i % cols.length]; c.fill(); }
    c.restore();
    ball(c, 0, -h, h * 0.12, '#ffffff');
    c.restore();
  }
  function cheeks(c, x, y, r) { c.fillStyle = 'rgba(255,110,110,.28)'; oval(c, -x, y, r, r * 0.65); c.fill(); oval(c, x, y, r, r * 0.65); c.fill(); }

  // ---------- characters ----------
  // Baby / kid hero. Feet at (x,y). s = scale. ~290 units tall at s=1.
  function baby(c, x, y, s, o = {}) {
    const t = o.t ?? 0, skin = o.skin || '#ffd3b4', outfit = o.outfit || '#ffe34f', hair = o.hair || '#8b5a3c', shoes = o.shoes || '#86c5ff';
    const ph = o.walk;
    const sw = ph != null ? Math.sin(ph * TAU) : 0;
    const bob = (ph != null ? -Math.abs(Math.cos(ph * TAU)) * 8 : Math.sin(t * 2.6) * 2.5) - (o.jump || 0);
    c.save(); c.translate(x, y);
    if (!o.noShadow) { const k = 1 - Math.min(0.5, (o.jump || 0) / 300); shadow(c, 0, 0, 72 * s * k); }
    c.scale(s * (o.dir || 1), s); c.translate(0, bob);
    if (o.tilt) { c.translate(0, -100); c.rotate(o.tilt); c.translate(0, 100); }
    if (!o.noLegs) {
      for (const sd of [-1, 1]) {
        const k = sw * sd;
        c.save(); c.translate(sd * 22, -64); c.rotate(-k * 0.35);
        blob(c, 0, 26, 15, 30, skin); blob(c, 4, 56, 21, 12, shoes);
        c.restore();
      }
    }
    blob(c, 0, -102, 55, 60, outfit);
    if (o.emblem !== false) {
      c.save(); c.translate(14, -112); c.fillStyle = shade(outfit, -0.35);
      rrect(c, -10, -9, 20, 18, 5); c.fill();
      c.fillStyle = shade(outfit, 0.4); c.fillRect(-6, -3, 12, 3); c.fillRect(-6, 3, 12, 3);
      c.restore();
    }
    const aL = o.armL ?? 0.22 + Math.sin(t * 2.6) * 0.05;
    const aR = o.armR ?? 0.22 + Math.sin(t * 2.6 + 1) * 0.05;
    const arm = (sd, ang) => { c.save(); c.translate(sd * 46, -138); c.rotate(-sd * ang); blob(c, 0, 24, 14, 28, skin); ball(c, 0, 50, 15, skin); c.restore(); };
    arm(-1, aL); arm(1, aR);
    if (o.hold) { c.save(); c.translate(46 + Math.sin(aR) * 50, -138 + Math.cos(aR) * 50); o.hold(c); c.restore(); }
    if (o.holdL) { c.save(); c.translate(-46 - Math.sin(aL) * 50, -138 + Math.cos(aL) * 50); o.holdL(c); c.restore(); }
    babyHead(c, 0, -214, o);
    c.restore();
  }
  function babyHead(c, x, y, o = {}) {
    const t = o.t ?? 0, skin = o.skin || '#ffd3b4', hair = o.hair || '#8b5a3c';
    c.save(); c.translate(x, y); if (o.headTilt) c.rotate(o.headTilt);
    if (o.hairStyle === 'pigtails') { ball(c, -78, -30, 26, hair); ball(c, 78, -30, 26, hair); }
    ball(c, -70, 6, 17, skin); ball(c, 70, 6, 17, skin);
    blob(c, 0, 0, 76, 72, skin);
    c.save(); oval(c, 0, 0, 76, 72); c.clip();
    if (o.hairStyle === 'short' || o.hairStyle === 'pigtails') { blob(c, 0, -62, 92, 44, hair); }
    c.restore();
    if (o.hairStyle === 'curly') {
      for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.05 + i * 0.09); ball(c, Math.cos(a) * 70, Math.sin(a) * 64 - 4, 24, hair); }
      ball(c, -20, -62, 26, hair); ball(c, 18, -66, 24, hair);
    } else if (!o.hairStyle || o.hairStyle === 'tuft') {
      ball(c, -6, -68, 13, hair); ball(c, 9, -72, 11, hair); ball(c, 21, -66, 8, hair);
    }
    if (o.foam) { for (let i = 0; i < 9; i++) ball(c, -60 + i * 15, -60 - Math.sin(i * 1.3) * 14 - (i % 2) * 10, 22, '#ffffff'); }
    cheeks(c, 44, 26, 15);
    const mood = o.mood || 'smile';
    const bl = o.blink ?? blinkAt(t, o.seed || 1);
    const eo = { look: o.look, blink: o.sleepy ? Math.max(bl, 0.55) : bl, happy: o.happyEyes, closed: o.closedEyes, iris: o.iris };
    eye(c, -28, 2, 20, eo); eye(c, 28, 2, 20, eo);
    c.strokeStyle = shade(hair, -0.1); c.lineWidth = 4; c.lineCap = 'round';
    if (mood === 'sad') {
      c.beginPath(); c.moveTo(-42, -28); c.lineTo(-16, -34); c.stroke();
      c.beginPath(); c.moveTo(42, -28); c.lineTo(16, -34); c.stroke();
    } else {
      c.beginPath(); c.arc(-28, -14, 16, Math.PI * 1.25, Math.PI * 1.75); c.stroke();
      c.beginPath(); c.arc(28, -14, 16, Math.PI * 1.25, Math.PI * 1.75); c.stroke();
    }
    ball(c, 0, 22, 6, shade(skin, -0.06));
    const talk = o.talk ? 0.45 + 0.55 * Math.abs(Math.sin(t * 11)) : 1;
    if (mood === 'smile') mouth(c, 0, 42, 26, 'smile');
    else if (mood === 'open') mouth(c, 0, 36, 30, 'open', talk);
    else if (mood === 'grin') mouth(c, 0, 34, 36, 'grin', talk);
    else if (mood === 'sad') mouth(c, 0, 42, 26, 'sad');
    else if (mood === 'o') mouth(c, 0, 36, 30, 'o', talk);
    else if (mood === 'puff') { mouth(c, 0, 36, 30, 'puff'); c.fillStyle = 'rgba(255,120,120,.35)'; oval(c, -36, 30, 20, 16); c.fill(); oval(c, 36, 30, 20, 16); c.fill(); }
    if (mood === 'sad') {
      const ty = 22 + ((t * 60) % 40);
      c.fillStyle = 'rgba(110,190,255,.85)'; oval(c, -34, ty, 6, 9); c.fill();
    }
    if (o.hat) partyHat(c, 14, -60, 80, 0.18);
    if (o.nightcap) {
      c.save(); c.translate(0, -50); c.rotate(-0.15);
      c.beginPath(); c.moveTo(-74, 0); c.quadraticCurveTo(-20, -110, 90, -40); c.quadraticCurveTo(30, -40, 74, 0); c.closePath();
      c.fillStyle = vgrad(c, -100, 0, '#8fb4ff', '#5b7fe0'); c.fill();
      ball(c, 92, -40, 14, '#ffffff');
      rrect(c, -80, -12, 160, 24, 12); c.fillStyle = '#ffffff'; c.fill();
      c.restore();
    }
    c.restore();
  }

  function bear(c, x, y, s, o = {}) {
    const t = o.t ?? 0, fur = o.fur || '#9b6234', light = o.light || '#e2ad78';
    const ph = o.walk; const sw = ph != null ? Math.sin(ph * TAU) : 0;
    const bob = (ph != null ? -Math.abs(Math.cos(ph * TAU)) * 7 : Math.sin(t * 2.2) * 2) - (o.jump || 0);
    c.save(); c.translate(x, y);
    shadow(c, 0, 0, 80 * s);
    c.scale(s * (o.dir || 1), s); c.translate(0, bob);
    for (const sd of [-1, 1]) { const k = sw * sd; c.save(); c.translate(sd * 30, -50); c.rotate(-k * 0.3); blob(c, 0, 22, 27, 32, fur); ball(c, 0, 42, 18, light); c.restore(); }
    blob(c, 0, -100, 64, 68, fur);
    blob(c, 0, -92, 40, 44, light);
    const aL = o.armL ?? 0.3 + Math.sin(t * 2.2) * 0.05, aR = o.armR ?? 0.3 + Math.sin(t * 2.2 + 1) * 0.05;
    const arm = (sd, ang) => { c.save(); c.translate(sd * 56, -140); c.rotate(-sd * ang); blob(c, 0, 26, 19, 34, fur); ball(c, 0, 54, 18, shade(fur, 0.08)); c.restore(); };
    arm(-1, aL); arm(1, aR);
    if (o.hold) { c.save(); c.translate(56 + Math.sin(aR) * 54, -140 + Math.cos(aR) * 54); o.hold(c); c.restore(); }
    c.save(); c.translate(0, -212); if (o.headTilt) c.rotate(o.headTilt);
    for (const sd of [-1, 1]) { ball(c, sd * 56, -50, 26, fur); ball(c, sd * 56, -50, 13, light); }
    blob(c, 0, 0, 74, 66, fur);
    blob(c, 0, 26, 36, 27, light);
    blob(c, 0, 13, 15, 10, '#3a2418');
    const bl = o.blink ?? blinkAt(t, o.seed || 7);
    if (o.happyEyes) { eye(c, -27, -8, 14, { happy: true }); eye(c, 27, -8, 14, { happy: true }); }
    else { bead(c, -27, -8, 10, bl); bead(c, 27, -8, 10, bl); }
    const m = o.mood || 'smile';
    if (m === 'open') mouth(c, 0, 32, 22, 'open', o.talk ? 0.5 + 0.5 * Math.abs(Math.sin(t * 10)) : 1);
    else { c.beginPath(); c.moveTo(0, 22); c.lineTo(0, 30); c.arc(-7, 30, 7, 0, Math.PI * 0.9); c.moveTo(0, 30); c.arc(7, 30, 7, Math.PI, Math.PI * 0.1, true); c.lineWidth = 3.5; c.strokeStyle = '#3a2418'; c.lineCap = 'round'; c.stroke(); }
    if (o.hat) partyHat(c, 14, -54, 76, 0.2);
    c.restore();
    c.restore();
  }

  function hen(c, x, y, s, o = {}) {
    const t = o.t ?? 0, col = o.color || '#c8702e';
    c.save(); c.translate(x, y); shadow(c, 0, 0, 60 * s);
    c.scale(s * (o.dir || 1), s);
    const hop = o.hop ? Math.abs(Math.sin(t * 7)) * 10 : 0; c.translate(0, -hop);
    c.strokeStyle = '#f39c2b'; c.lineWidth = 6; c.lineCap = 'round';
    for (const lx of [-10, 12]) { c.beginPath(); c.moveTo(lx, -30); c.lineTo(lx, 0); c.lineTo(lx + 12, 0); c.moveTo(lx, 0); c.lineTo(lx - 8, 2); c.stroke(); }
    c.translate(0, -30); c.rotate((o.peck || 0) * 0.7); c.translate(0, 30);
    for (let i = 0; i < 3; i++) blob(c, -58, -96 + i * 12, 30, 12, shade(col, -0.2 - i * 0.05), -0.9 + i * 0.35);
    blob(c, 0, -62, 60, 46, col);
    const flap = o.flap ? Math.sin(t * 18) * 0.35 : 0;
    blob(c, -8, -62, 36, 22, shade(col, -0.15), -0.25 + flap);
    blob(c, 30, -92, 26, 32, col);
    ball(c, 40, -114, 30, col);
    ball(c, 28, -144, 10, '#e8322e'); ball(c, 41, -149, 12, '#e8322e'); ball(c, 54, -142, 10, '#e8322e');
    c.beginPath(); c.moveTo(66, -120); c.lineTo(88, -110); c.lineTo(66, -102); c.closePath(); c.fillStyle = '#f7a51c'; c.fill();
    oval(c, 63, -94, 7, 10); c.fillStyle = '#e8322e'; c.fill();
    eye(c, 50, -120, 10, { blink: blinkAt(t, o.seed || 3), iris: '#2a1a0a' });
    c.restore();
  }
  function chick(c, x, y, s, o = {}) {
    const t = o.t ?? 0, seed = o.seed || 0;
    const hop = Math.max(0, Math.sin(t * 9 + seed * 2)) * (o.hop ?? 8);
    c.save(); c.translate(x, y); shadow(c, 0, 0, 26 * s);
    c.scale(s * (o.dir || 1), s); c.translate(0, -hop);
    c.translate(0, -10); c.rotate((o.peck || 0) * 0.6); c.translate(0, 10);
    c.strokeStyle = '#f39c2b'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-6, -6); c.lineTo(-7, 0); c.moveTo(7, -6); c.lineTo(8, 0); c.stroke();
    ball(c, 0, -30, 28, o.color || '#ffd93b');
    blob(c, -10, -28, 13, 9, shade(o.color || '#ffd93b', -0.1), -0.4);
    ball(c, 2, -60, 6, o.color || '#ffd93b');
    c.beginPath(); c.moveTo(22, -36); c.lineTo(34, -32); c.lineTo(22, -28); c.closePath(); c.fillStyle = '#f7891c'; c.fill();
    bead(c, 13, -40, 4.5, blinkAt(t, seed + 5));
    c.restore();
  }

  const CRIT = {
    cow: { body: '#ffffff', head: '#ffffff', ear: '#f4f4f4', inner: '#ffb3c1' },
    pig: { body: '#ffb0c3', head: '#ffb8c8', ear: '#ff9db5', inner: '#ff8aa8' },
    sheep: { body: '#f6f5ef', head: '#4a4553', ear: '#4a4553', inner: '#6b6475' },
    goat: { body: '#f3ece2', head: '#f6efe6', ear: '#efe6da', inner: '#f2b9a8' },
    cat: { body: '#f5a54a', head: '#f7ac55', ear: '#f5a54a', inner: '#ffc0b0' },
    dog: { body: '#d9a56b', head: '#ddab72', ear: '#8a5a33', inner: '#8a5a33' },
  };
  // Front-facing farm animal.
  function critter(c, x, y, s, kind, o = {}) {
    const t = o.t ?? 0, P = CRIT[kind] || CRIT.cow;
    const bob = (o.dance ? -Math.abs(Math.sin(t * Math.PI * (o.dance || 2))) * 22 : Math.sin(t * 2 + (o.seed || 0)) * 2) - (o.jump || 0);
    c.save(); c.translate(x, y); shadow(c, 0, 0, 74 * s);
    c.scale(s * (o.dir || 1), s); c.translate(0, bob);
    if (o.lean) c.rotate(o.lean);
    const hoof = kind === 'cat' || kind === 'dog' ? shade(P.body, 0.25) : '#5a4636';
    for (const lx of [-42, 42]) { blob(c, lx, -34, 14, 30, shade(P.body, -0.12)); }
    for (const lx of [-20, 20]) { blob(c, lx, -34, 16, 34, P.body); blob(c, lx, -4, 17, 10, hoof); }
    if (kind === 'sheep') {
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ball(c, Math.cos(a) * 52, -96 + Math.sin(a) * 42, 30, P.body); }
      blob(c, 0, -96, 56, 48, P.body);
    } else {
      blob(c, 0, -92, 62, 58, P.body);
      if (kind === 'cow') {
        c.save(); oval(c, 0, -92, 62, 58); c.clip(); c.fillStyle = '#2d2a2e';
        oval(c, -40, -110, 26, 20, 0.4); c.fill(); oval(c, 34, -70, 22, 18, -0.3); c.fill(); oval(c, 10, -128, 14, 10); c.fill();
        c.restore();
      }
      if (kind === 'pig' || kind === 'goat' || kind === 'dog' || kind === 'cat') blob(c, 0, -82, 36, 38, shade(P.body, 0.18));
    }
    if (kind === 'cat') { c.save(); c.strokeStyle = shade(P.body, -0.1); c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(50, -60); c.quadraticCurveTo(110, -70 + Math.sin(t * 3) * 20, 90, -150); c.stroke(); c.restore(); }
    if (kind === 'pig') { c.save(); c.strokeStyle = '#ff8fab'; c.lineWidth = 6; c.beginPath(); c.arc(70, -70, 12, Math.PI, TAU * 1.2); c.stroke(); c.restore(); }
    if (kind === 'cow') { c.strokeStyle = '#3b6ef5'; c.lineWidth = 8; c.beginPath(); c.arc(0, -176, 46, Math.PI * 0.25, Math.PI * 0.75); c.stroke(); ball(c, 0, -122, 15, '#ffd23f'); }
    // head
    c.save(); c.translate(0, -180); c.rotate(o.headTilt || Math.sin(t * 2.4 + (o.seed || 0)) * 0.06);
    const earFlap = Math.sin(t * 4 + (o.seed || 0)) * 0.12;
    if (kind === 'pig' || kind === 'cat') {
      for (const sd of [-1, 1]) { c.save(); c.translate(sd * 38, -40); c.rotate(sd * (0.3 + earFlap)); c.beginPath(); c.moveTo(-18, 10); c.lineTo(0, -30); c.lineTo(18, 10); c.closePath(); c.fillStyle = P.ear; c.fill(); c.beginPath(); c.moveTo(-9, 6); c.lineTo(0, -16); c.lineTo(9, 6); c.fillStyle = P.inner; c.fill(); c.restore(); }
    } else if (kind === 'dog') {
      for (const sd of [-1, 1]) blob(c, sd * 60, 6, 18, 40, P.ear, sd * (-0.25 + earFlap));
    } else {
      const ry = kind === 'goat' ? 13 : 11;
      for (const sd of [-1, 1]) { blob(c, sd * 66, -6, 30, ry, P.ear, sd * (0.35 + earFlap)); oval(c, sd * 68, -6, 18, ry * 0.5, sd * (0.35 + earFlap)); c.fillStyle = P.inner; c.fill(); }
    }
    if (kind === 'cow') { ball(c, -32, -50, 11, '#f3e3b3'); ball(c, 32, -50, 11, '#f3e3b3'); }
    if (kind === 'goat') { c.strokeStyle = '#cdbb9a'; c.lineWidth = 11; c.lineCap = 'round'; c.beginPath(); c.moveTo(-22, -42); c.quadraticCurveTo(-36, -76, -12, -80); c.moveTo(22, -42); c.quadraticCurveTo(36, -76, 12, -80); c.stroke(); }
    blob(c, 0, 0, 58, 54, P.head);
    if (kind === 'cow') { c.save(); oval(c, 0, 0, 58, 54); c.clip(); c.fillStyle = '#2d2a2e'; oval(c, 34, -30, 22, 18, 0.3); c.fill(); c.restore(); }
    if (kind === 'sheep') { for (let i = 0; i < 5; i++) ball(c, -32 + i * 16, -46 - (i % 2) * 8, 17, '#f6f5ef'); }
    const bl = o.blink ?? blinkAt(t, (o.seed || 0) + 11);
    const iris = kind === 'cat' ? '#3a9a3a' : '#4a2c16';
    eye(c, -22, -10, 14, { blink: bl, iris, happy: o.happyEyes, look: o.look });
    eye(c, 22, -10, 14, { blink: bl, iris, happy: o.happyEyes, look: o.look });
    const talk = o.talk ? 0.35 + 0.65 * Math.abs(Math.sin(t * 9)) : 0;
    if (kind === 'cow') {
      blob(c, 0, 28, 44, 26, '#ffb6c1');
      oval(c, -14, 26, 5, 7); c.fillStyle = '#b8586a'; c.fill(); oval(c, 14, 26, 5, 7); c.fill();
      if (talk) { oval(c, 0, 46, 14, 8 * talk); c.fillStyle = '#7a1f22'; c.fill(); }
    } else if (kind === 'pig') {
      blob(c, 0, 18, 24, 18, '#ff8fab');
      oval(c, -8, 18, 4, 6); c.fillStyle = '#b84d6a'; c.fill(); oval(c, 8, 18, 4, 6); c.fill();
      if (talk) { oval(c, 0, 42, 12, 8 * talk); c.fillStyle = '#7a1f22'; c.fill(); } else mouth(c, 0, 42, 18, 'smile');
    } else if (kind === 'goat' || kind === 'sheep') {
      blob(c, 0, 22, 24, 18, kind === 'sheep' ? '#5e5869' : '#f9e8de');
      oval(c, -7, 18, 3, 4); c.fillStyle = '#7a4a4a'; c.fill(); oval(c, 7, 18, 3, 4); c.fill();
      if (talk) { oval(c, 0, 34, 9, 7 * talk); c.fillStyle = '#7a1f22'; c.fill(); }
      if (kind === 'goat') { c.beginPath(); c.moveTo(-10, 40); c.lineTo(0, 66); c.lineTo(10, 40); c.fillStyle = '#e7dccb'; c.fill(); }
    } else {
      c.beginPath(); c.moveTo(-7, 10); c.lineTo(7, 10); c.lineTo(0, 18); c.closePath(); c.fillStyle = kind === 'cat' ? '#ff7a90' : '#2b1d14'; c.fill();
      if (talk) mouth(c, 0, 24, 22, 'open', talk); else mouth(c, 0, 30, 22, 'smile');
      if (kind === 'cat') { c.strokeStyle = 'rgba(80,40,20,.6)'; c.lineWidth = 2; for (const sd of [-1, 1]) for (const k of [-1, 1]) { c.beginPath(); c.moveTo(sd * 18, 18 + k * 4); c.lineTo(sd * 52, 14 + k * 10); c.stroke(); } }
    }
    cheeks(c, 36, 18, 10);
    if (o.hat) partyHat(c, 12, -46, 70, 0.2);
    c.restore();
    c.restore();
  }

  function wheel(c, x, y, r, rot = 0, col = '#8b3fd6') {
    ball(c, x, y, r, col);
    circle(c, x, y, r * 0.62); c.fillStyle = grad3(c, x, y, r * 0.62, '#e9e9f3', 0.3, -0.25); c.fill();
    c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = '#a5a5b8'; c.lineWidth = r * 0.1; c.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * r * 0.15, Math.sin(a) * r * 0.15); c.lineTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55); c.stroke(); }
    c.restore();
    ball(c, x, y, r * 0.17, '#d4d4e4');
  }
  // Side-view convertible facing right. Origin at ground under the middle.
  function car(c, x, y, s, o = {}) {
    const col = o.color || '#ffd21f', trim = o.trim || '#b25cf0', t = o.t ?? 0;
    c.save(); c.translate(x, y); shadow(c, 0, 0, 170 * s);
    c.scale(s, s);
    c.save(); c.translate(0, -(o.bounce || 0));
    if (o.tilt) { c.translate(105, -38); c.rotate(o.tilt); c.translate(-105, 38); }
    // windshield
    c.beginPath(); c.moveTo(30, -128); c.lineTo(62, -196); c.lineTo(78, -196); c.lineTo(58, -128); c.closePath();
    c.fillStyle = 'rgba(190,235,255,.75)'; c.fill(); c.strokeStyle = trim; c.lineWidth = 6; c.stroke();
    if (o.driver) { c.save(); c.translate(-40, -60); o.driver(c); c.restore(); }
    // body
    c.beginPath();
    c.moveTo(-170, -70); c.quadraticCurveTo(-176, -132, -126, -134);
    c.lineTo(80, -134); c.quadraticCurveTo(150, -132, 168, -100);
    c.quadraticCurveTo(178, -72, 160, -52); c.lineTo(-160, -52); c.quadraticCurveTo(-172, -56, -170, -70); c.closePath();
    c.fillStyle = vgrad(c, -135, -50, shade(col, 0.35), shade(col, -0.12)); c.fill();
    rrect(c, -176, -66, 352, 24, 12); c.fillStyle = vgrad(c, -66, -42, shade(trim, 0.2), shade(trim, -0.2)); c.fill();
    oval(c, -40, -122, 110, 8); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
    c.strokeStyle = shade(col, -0.25); c.lineWidth = 3; c.beginPath(); c.moveTo(-20, -128); c.lineTo(-20, -70); c.stroke();
    rrect(c, -12, -112, 26, 7, 4); c.fillStyle = shade(col, -0.3); c.fill();
    oval(c, -168, -104, 8, 14); c.fillStyle = '#ff5a5a'; c.fill();
    // face
    const bl = blinkAt(t, 21);
    eye(c, 118, -100, 15, { blink: bl, iris: '#3b6ef5', look: [0.6, 0] });
    eye(c, 148, -100, 13, { blink: bl, iris: '#3b6ef5', look: [0.6, 0] });
    if (o.mood === 'sad') mouth(c, 150, -74, 26, 'sad'); else mouth(c, 150, -76, 30, 'smile');
    // wheels
    const roll = o.roll || 0;
    if (o.missing !== 'rear') wheel(c, -100, -40, 40, roll, trim);
    if (o.missing !== 'front') wheel(c, 105, -40, 40, roll, trim);
    c.restore(); c.restore();
  }

  function fish(c, x, y, s, col, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y + Math.sin(t * 3 + (o.seed || 0)) * 6); c.scale(s * (o.dir || 1), s);
    c.save(); c.translate(-46, 0); c.rotate(Math.sin(t * 9 + (o.seed || 0)) * 0.35);
    c.beginPath(); c.moveTo(6, 0); c.lineTo(-34, -28); c.quadraticCurveTo(-24, 0, -34, 28); c.closePath(); c.fillStyle = shade(col, -0.12); c.fill(); c.restore();
    c.beginPath(); c.moveTo(-14, -28); c.quadraticCurveTo(4, -56, 22, -30); c.fillStyle = shade(col, -0.1); c.fill();
    blob(c, 0, 0, 54, 36, col);
    c.save(); oval(c, 0, 0, 54, 36); c.clip(); c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(-14, -40, 12, 80); c.fillStyle = shade(col, -0.2); c.fillRect(-2, -40, 4, 80); c.restore();
    blob(c, 4, 10, 14, 8, shade(col, -0.15), 0.5);
    eye(c, 26, -8, 11, { blink: blinkAt(t, (o.seed || 0) + 31), iris: '#203a8a' });
    oval(c, 48, 8, 4, 5); c.fillStyle = '#7a1f22'; c.fill();
    c.restore();
  }
  function octopus(c, x, y, s, o = {}) {
    const t = o.t ?? 0, col = o.color || '#c56cf0';
    c.save(); c.translate(x, y + Math.sin(t * 2) * 10); c.scale(s, s);
    c.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const bx = -50 + i * 20, w = Math.sin(t * 3 + i) * 22;
      c.beginPath(); c.moveTo(bx, -40); c.bezierCurveTo(bx + w, 10, bx - w - (i - 2.5) * 10, 50, bx + (i - 2.5) * 22 + w, 90);
      c.lineWidth = 20; c.strokeStyle = shade(col, -0.08); c.stroke();
    }
    if (o.wave) { c.save(); c.lineWidth = 20; c.strokeStyle = shade(col, -0.08); c.beginPath(); c.moveTo(56, -40); c.quadraticCurveTo(110, -60, 100 + Math.sin(t * 10) * 18, -130); c.stroke(); c.restore(); }
    blob(c, 0, -80, 70, 70, col);
    for (let i = 0; i < 4; i++) { circle(c, -40 + i * 26, -122 + (i % 2) * 14, 7); c.fillStyle = shade(col, 0.25); c.fill(); }
    eye(c, -24, -74, 15, { blink: blinkAt(t, 41) }); eye(c, 24, -74, 15, { blink: blinkAt(t, 41) });
    cheeks(c, 44, -54, 11);
    mouth(c, 0, -48, 24, o.talk ? 'open' : 'smile', 0.6 + 0.4 * Math.abs(Math.sin(t * 9)));
    c.restore();
  }
  function crab(c, x, y, s, o = {}) {
    const t = o.t ?? 0, col = '#ff5a4a';
    c.save(); c.translate(x, y); shadow(c, 0, 0, 70 * s); c.scale(s, s);
    c.strokeStyle = shade(col, -0.15); c.lineWidth = 9; c.lineCap = 'round';
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const k = Math.sin(t * 12 + i) * 6; c.beginPath(); c.moveTo(sd * 30, -26 - i * 6); c.lineTo(sd * (60 + i * 6), -18 + k); c.lineTo(sd * (66 + i * 8), 0); c.stroke(); }
    for (const sd of [-1, 1]) {
      const sn = Math.abs(Math.sin(t * 6 + sd)) * 0.5;
      c.save(); c.translate(sd * 58, -64); c.lineWidth = 10; c.beginPath(); c.moveTo(-sd * 20, 14); c.lineTo(0, 0); c.stroke();
      blob(c, sd * 10, -24, 26, 22, col); c.beginPath(); c.moveTo(sd * 10, -24); c.lineTo(sd * 40, -30 - sn * 26); c.lineTo(sd * 40, -18 + sn * 10); c.closePath(); c.fillStyle = '#fff4d9'; c.fill();
      c.restore();
    }
    blob(c, 0, -36, 58, 38, col);
    c.lineWidth = 6; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 16, -64); c.lineTo(sd * 20, -92); c.stroke(); eye(c, sd * 20, -98, 12, { blink: blinkAt(t, 51) }); }
    mouth(c, 0, -30, 24, 'smile');
    c.restore();
  }
  function duck(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); c.rotate(Math.sin(t * 3) * 0.08);
    blob(c, -4, -30, 50, 32, '#ffd22e');
    blob(c, -20, -34, 24, 14, '#f5bd12', -0.3);
    ball(c, 20, -76, 28, '#ffd22e');
    blob(c, 50, -70, 18, 8, '#ff8a1f'); blob(c, 48, -64, 14, 5, '#e86f10');
    eye(c, 30, -84, 9, { blink: blinkAt(t, 61) });
    c.restore();
  }
  function balloon(c, x, y, r, col, o = {}) {
    const t = o.t ?? 0, sway = Math.sin(t * 2 + (o.seed || 0)) * 0.08;
    c.save(); c.translate(x, y); c.rotate(sway);
    c.beginPath(); c.moveTo(0, r * 1.15); c.bezierCurveTo(-r * 0.3, r * 1.8, r * 0.3, r * 2.4, 0, r * 3.2);
    c.strokeStyle = 'rgba(80,80,80,.7)'; c.lineWidth = 2.5; c.stroke();
    c.beginPath(); c.moveTo(-r * 0.12, r * 1.18); c.lineTo(r * 0.12, r * 1.18); c.lineTo(0, r * 1.05); c.closePath(); c.fillStyle = shade(col, -0.2); c.fill();
    blob(c, 0, 0, r * 0.9, r * 1.1, col);
    oval(c, -r * 0.35, -r * 0.45, r * 0.18, r * 0.32, -0.5); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
    if (o.label != null) text(c, String(o.label), 0, 4, r * 0.95, { stroke: shade(col, -0.45), sw: r * 0.12, shadow: false });
    c.restore();
  }
  function starPath(c, x, y, r, rot = 0, pts = 5, inner = 0.48) {
    c.beginPath();
    for (let i = 0; i < pts * 2; i++) { const a = rot - Math.PI / 2 + (i * Math.PI) / pts, rr = i % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath();
  }
  function star(c, x, y, r, col = '#ffd23f', o = {}) {
    c.save(); c.lineJoin = 'round';
    starPath(c, x, y, r, o.rot || 0); c.fillStyle = grad3(c, x, y, r, col); c.fill();
    c.lineWidth = r * 0.12; c.strokeStyle = shade(col, -0.12); c.stroke();
    if (o.face) { const bl = blinkAt(o.t || 0, o.seed || 71); eye(c, x - r * 0.2, y - r * 0.05, r * 0.15, { blink: bl, closed: o.sleep }); eye(c, x + r * 0.2, y - r * 0.05, r * 0.15, { blink: bl, closed: o.sleep }); mouth(c, x, y + r * 0.2, r * 0.25, 'smile'); }
    c.restore();
  }
  function heartPath(c, x, y, r) {
    c.beginPath(); c.moveTo(x, y + r * 0.9);
    c.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.7, y - r * 1.2, x, y - r * 0.45);
    c.bezierCurveTo(x + r * 0.7, y - r * 1.2, x + r * 1.4, y - r * 0.1, x, y + r * 0.9); c.closePath();
  }
  // Shape character with a face. kind: circle | square | triangle | star | heart
  function shapeChar(c, kind, x, y, r, col, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y);
    const sq = o.squash || 0; c.scale(1 + sq, 1 - sq);
    c.lineJoin = 'round';
    if (kind === 'circle') circle(c, 0, 0, r);
    else if (kind === 'square') rrect(c, -r, -r, r * 2, r * 2, r * 0.22);
    else if (kind === 'triangle') { c.beginPath(); c.moveTo(0, -r * 1.1); c.lineTo(r * 1.1, r * 0.8); c.lineTo(-r * 1.1, r * 0.8); c.closePath(); }
    else if (kind === 'star') starPath(c, 0, 0, r * 1.15, 0);
    else heartPath(c, 0, 0, r);
    c.fillStyle = grad3(c, 0, 0, r, col); c.fill();
    c.lineWidth = r * 0.1; c.strokeStyle = shade(col, -0.18); c.stroke();
    const ey = kind === 'triangle' ? r * 0.1 : kind === 'heart' ? -r * 0.15 : -r * 0.12;
    const bl = blinkAt(t, o.seed || 81);
    eye(c, -r * 0.3, ey, r * 0.2, { blink: bl, happy: o.happy }); eye(c, r * 0.3, ey, r * 0.2, { blink: bl, happy: o.happy });
    cheeks(c, r * 0.48, ey + r * 0.28, r * 0.11);
    mouth(c, 0, ey + r * 0.3, r * 0.36, o.talk ? 'open' : 'smile', 0.6 + 0.4 * Math.abs(Math.sin(t * 9)));
    c.restore();
  }
  function sun(c, x, y, r, t = 0, face = true) {
    c.save(); c.translate(x, y); c.rotate(t * 0.4);
    c.fillStyle = '#ffcf33';
    for (let i = 0; i < 12; i++) { c.save(); c.rotate((i / 12) * TAU); c.beginPath(); c.moveTo(-r * 0.16, -r * 1.05); c.lineTo(0, -r * 1.5); c.lineTo(r * 0.16, -r * 1.05); c.fill(); c.restore(); }
    c.restore();
    ball(c, x, y, r, '#ffd84a');
    if (face) { eye(c, x - r * 0.32, y - r * 0.08, r * 0.2, { blink: blinkAt(t, 91) }); eye(c, x + r * 0.32, y - r * 0.08, r * 0.2, { blink: blinkAt(t, 91) }); cheeks(c, r * 0.0, 0, 0); mouth(c, x, y + r * 0.3, r * 0.4, 'smile'); }
  }
  function moon(c, x, y, r, t = 0, o = {}) {
    const g = c.createRadialGradient(x, y, r * 0.8, x, y, r * 2.2); g.addColorStop(0, 'rgba(255,250,200,.35)'); g.addColorStop(1, 'rgba(255,250,200,0)');
    c.fillStyle = g; circle(c, x, y, r * 2.2); c.fill();
    ball(c, x, y, r, '#fff1a8');
    c.fillStyle = 'rgba(220,200,120,.35)';
    circle(c, x + r * 0.4, y - r * 0.45, r * 0.14); c.fill(); circle(c, x - r * 0.5, y + r * 0.45, r * 0.1); c.fill();
    if (o.face !== false) {
      const sl = o.sleep;
      eye(c, x - r * 0.3, y - r * 0.05, r * 0.17, { closed: sl, blink: blinkAt(t, 93) }); eye(c, x + r * 0.3, y - r * 0.05, r * 0.17, { closed: sl, blink: blinkAt(t, 93) });
      c.fillStyle = 'rgba(255,140,140,.3)'; oval(c, x - r * 0.5, y + r * 0.2, r * 0.13, r * 0.08); c.fill(); oval(c, x + r * 0.5, y + r * 0.2, r * 0.13, r * 0.08); c.fill();
      mouth(c, x, y + r * 0.28, r * 0.32, 'smile');
    }
  }
  function apple(c, x, y, r, col = '#ff3b3b') {
    c.save(); c.strokeStyle = '#6b3e1e'; c.lineWidth = r * 0.12; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y - r * 0.75); c.quadraticCurveTo(x + r * 0.05, y - r * 1.1, x + r * 0.15, y - r * 1.25); c.stroke();
    blob(c, x + r * 0.38, y - r * 1.05, r * 0.32, r * 0.15, '#4cbb3c', -0.4);
    blob(c, x - r * 0.3, y, r * 0.75, r * 0.9, col); blob(c, x + r * 0.3, y, r * 0.75, r * 0.9, col);
    oval(c, x - r * 0.35, y - r * 0.4, r * 0.15, r * 0.25, -0.4); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
    c.restore();
  }
  function orange(c, x, y, r) { ball(c, x, y, r, '#ff9a1f'); blob(c, x + r * 0.25, y - r * 0.95, r * 0.3, r * 0.14, '#4cbb3c', -0.3); }
  function grapes(c, x, y, r) {
    const pts = [[0, 0], [-1, -1], [1, -1], [0, -2], [-2, -2], [2, -2], [-1, -3], [1, -3], [0, -4]];
    for (const [px, py] of pts.slice().reverse()) ball(c, x + px * r * 0.42, y - py * -r * 0.42 - r * 0.3, r * 0.3, '#9b4dde');
    blob(c, x + r * 0.2, y - r * 2.35, r * 0.3, r * 0.13, '#4cbb3c', -0.3);
  }
  function leaf(c, x, y, r, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.beginPath(); c.moveTo(0, r); c.quadraticCurveTo(r * 0.9, 0, 0, -r); c.quadraticCurveTo(-r * 0.9, 0, 0, r); c.closePath();
    c.fillStyle = grad3(c, 0, 0, r, '#38c24a'); c.fill();
    c.strokeStyle = '#1f8a2e'; c.lineWidth = r * 0.06; c.beginPath(); c.moveTo(0, r * 1.15); c.lineTo(0, -r * 0.8); c.stroke();
    c.restore();
  }
  function beachBall(c, x, y, r, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    const cols = ['#ff4d4d', '#ffffff', '#3b9cff', '#ffffff', '#ffd23f', '#ffffff'];
    for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r, (i / 6) * TAU, ((i + 1) / 6) * TAU); c.closePath(); c.fillStyle = cols[i]; c.fill(); }
    const g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r); g.addColorStop(0, 'rgba(255,255,255,.45)'); g.addColorStop(0.6, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.25)');
    circle(c, 0, 0, r); c.fillStyle = g; c.fill();
    c.restore();
  }
  function egg(c, x, y, r) {
    c.beginPath(); c.moveTo(x, y - r * 1.25);
    c.bezierCurveTo(x + r * 0.95, y - r * 1.2, x + r, y + r * 0.9, x, y + r * 0.95);
    c.bezierCurveTo(x - r, y + r * 0.9, x - r * 0.95, y - r * 1.2, x, y - r * 1.25); c.closePath();
    c.fillStyle = grad3(c, x, y, r * 1.1, '#fff3dc'); c.fill();
  }
  function bubble(c, x, y, r) {
    circle(c, x, y, r);
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,.15)'); g.addColorStop(0.75, 'rgba(180,230,255,.12)'); g.addColorStop(0.92, 'rgba(255,180,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,.7)');
    c.fillStyle = g; c.fill();
    oval(c, x - r * 0.35, y - r * 0.4, r * 0.22, r * 0.12, -0.6); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill();
  }
  function splat(c, x, y, r, col, seed = 0) {
    c.beginPath();
    const n = 14;
    for (let i = 0; i <= n; i++) { const a = (i / n) * TAU, rr = r * (0.75 + rnd(seed + i) * 0.45); c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fillStyle = grad3(c, x, y, r, col, 0.25, -0.2); c.fill();
    for (let i = 0; i < 6; i++) { const a = rnd(seed + 40 + i) * TAU, d = r * (1.2 + rnd(seed + 60 + i) * 0.5); ball(c, x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.08 + rnd(seed + 80 + i) * 0.1), col); }
  }
  function present(c, x, y, w, col, ribbon = '#ffffff', lid = 0) {
    rrect(c, x - w / 2, y - w * 0.8, w, w * 0.8, w * 0.06); c.fillStyle = vgrad(c, y - w, y, shade(col, 0.2), shade(col, -0.15)); c.fill();
    c.fillStyle = ribbon; c.fillRect(x - w * 0.08, y - w * 0.8, w * 0.16, w * 0.8);
    c.save(); c.translate(0, -lid);
    rrect(c, x - w * 0.56, y - w * 0.95, w * 1.12, w * 0.2, w * 0.05); c.fillStyle = shade(col, 0.1); c.fill();
    c.fillStyle = ribbon; c.fillRect(x - w * 0.08, y - w * 0.95, w * 0.16, w * 0.2);
    blob(c, x - w * 0.16, y - w * 1.02, w * 0.16, w * 0.09, ribbon, 0.4); blob(c, x + w * 0.16, y - w * 1.02, w * 0.16, w * 0.09, ribbon, -0.4);
    c.restore();
  }
  function cake(c, x, y, s, o = {}) {
    const t = o.t ?? 0;
    c.save(); c.translate(x, y); c.scale(s, s);
    oval(c, 0, 0, 170, 26); c.fillStyle = '#f4f4f8'; c.fill();
    rrect(c, -140, -110, 280, 110, 26); c.fillStyle = vgrad(c, -110, 0, '#ffb7d0', '#f48fb1'); c.fill();
    rrect(c, -100, -190, 200, 86, 22); c.fillStyle = vgrad(c, -190, -100, '#ffe9b0', '#f7cf72'); c.fill();
    c.fillStyle = '#ffffff';
    for (const [yy, w] of [[-112, 140], [-192, 100]]) { c.beginPath(); c.moveTo(-w, yy); for (let i = 0; i <= 8; i++) { const xx = -w + (i * 2 * w) / 8; c.quadraticCurveTo(xx - w / 8, yy + 26 + (i % 2) * 10, xx, yy); } c.lineTo(w, yy - 10); c.lineTo(-w, yy - 10); c.closePath(); c.fill(); }
    for (let i = 0; i < 9; i++) ball(c, -120 + i * 30, -50 + (i % 2) * 12, 7, ['#ff4d4d', '#3b9cff', '#ffd23f', '#7bd88f'][i % 4]);
    const n = o.candles || 3;
    for (let i = 0; i < n; i++) {
      const cx = (i - (n - 1) / 2) * 50;
      rrect(c, cx - 8, -260, 16, 70, 5); c.fillStyle = ['#7ad3ff', '#ff6fa8', '#7bd88f', '#ffd23f'][i % 4]; c.fill();
      c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(cx - 8, -250, 16, 6); c.fillRect(cx - 8, -230, 16, 6);
      if (o.lit !== false) {
        const fl = 1 + Math.sin(t * 20 + i * 2) * 0.12;
        const g = c.createRadialGradient(cx, -280, 2, cx, -280, 40); g.addColorStop(0, 'rgba(255,220,120,.6)'); g.addColorStop(1, 'rgba(255,220,120,0)');
        c.fillStyle = g; circle(c, cx, -280, 40); c.fill();
        c.save(); c.translate(cx, -268); c.scale(1, fl); c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(13, -8, 0, 6); c.quadraticCurveTo(-13, -8, 0, -30); c.fillStyle = '#ffb21f'; c.fill();
        c.beginPath(); c.moveTo(0, -18); c.quadraticCurveTo(6, -4, 0, 3); c.quadraticCurveTo(-6, -4, 0, -18); c.fillStyle = '#fff6b0'; c.fill(); c.restore();
      } else if (o.smoke) {
        for (let k = 0; k < 4; k++) { const sp = (o.smoke + k * 0.25) % 1; circle(c, cx + Math.sin(sp * 8 + i) * 10, -270 - sp * 120, 8 + sp * 14); c.fillStyle = `rgba(200,200,210,${0.5 * (1 - sp)})`; c.fill(); }
      }
    }
    c.restore();
  }

  // ---------- particles ----------
  const CONF = ['#ff4d6d', '#ffd23f', '#3bc9ff', '#7bd88f', '#b26bff', '#ff9a1f'];
  function confetti(g, t, n = 90, seed = 0) {
    const c = g.c;
    for (let i = 0; i < n; i++) {
      const r1 = rnd(i + seed), r2 = rnd(i * 3.1 + seed), r3 = rnd(i * 7.7 + seed);
      const x = (r1 * 2 - 1) * g.hw;
      const y = -g.hh - 60 - r3 * 500 + t * (300 + r2 * 300);
      if (y > g.hh + 40 || y < -g.hh - 60) continue;
      c.save(); c.translate(x + Math.sin(t * 2 + i) * 30, y); c.rotate(t * (3 + r2 * 5) + i);
      c.scale(Math.cos(t * 7 + i), 1); c.fillStyle = CONF[i % CONF.length]; c.fillRect(-10, -6, 20, 12);
      c.restore();
    }
  }
  function sparkles(g, t, n = 20, seed = 0, area = null) {
    const c = g.c, a = area || [-g.hw, -g.hh, g.hw * 2, g.hh * 2];
    for (let i = 0; i < n; i++) {
      const x = a[0] + rnd(i + seed) * a[2], y = a[1] + rnd(i * 5.3 + seed) * a[3];
      const k = Math.max(0, Math.sin(t * 4 + i * 1.7));
      if (k < 0.05) continue;
      c.save(); c.globalAlpha = k; starPath(c, x, y, 16 * k + 4, t, 4, 0.3); c.fillStyle = '#fff8c4'; c.fill(); c.restore();
    }
  }
  function risingBubbles(g, t, n = 18, seed = 0, x0 = null, w = null) {
    const c = g.c; x0 = x0 ?? -g.hw; w = w ?? g.hw * 2;
    for (let i = 0; i < n; i++) {
      const sp = 80 + rnd(i + seed) * 120, r = 10 + rnd(i * 2 + seed) * 26;
      const y = g.hh + 60 - ((t * sp + rnd(i * 3 + seed) * 1600) % 1600);
      bubble(c, x0 + rnd(i * 7 + seed) * w + Math.sin(t * 2 + i) * 16, y, r);
    }
  }

  // ---------- scenery ----------
  const SKY_TINT = { sunset: ['#ff8a7a', '#ffd59a'], morning: ['#8fd3ff', '#fff1c9'] };
  function sky(g, top = '#1fb2f2', bot = '#bfefff', y1 = 200) { const c = g.c; const tint = g.v && SKY_TINT[g.v.sky]; if (tint) { top = tint[0]; bot = tint[1]; } c.fillStyle = vgrad(c, -g.hh, y1, top, bot); c.fillRect(-g.hw * 3, -g.hh * 3, g.hw * 6, g.hh * 6); }
  function cloud(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    for (const [px, py, r] of [[-60, 10, 34], [-25, -14, 44], [22, -20, 48], [62, 4, 34], [0, 12, 40]]) { circle(c, px, py, r); c.fillStyle = grad3(c, px, py, r, '#ffffff', 0, -0.1); c.fill(); }
    c.restore();
  }
  function clouds(g, t, y = -400, speed = 14, s = 1) {
    const span = g.hw * 2 + 700, n = 3 + Math.ceil(g.hw / 160);
    for (let i = 0; i < n; i++) {
      const bx = rnd(i * 9.3) * span;
      const x = ((bx + t * speed * (0.6 + rnd(i) * 0.8)) % span) - span / 2;
      cloud(g.c, x, y + rnd(i * 4.1) * 200 - 100, (0.6 + rnd(i * 2.2) * 0.6) * s);
    }
  }
  function tree(c, x, y, s, col = '#3fae49') {
    c.save(); c.translate(x, y); c.scale(s, s);
    rrect(c, -10, -70, 20, 72, 8); c.fillStyle = '#8a5a33'; c.fill();
    for (const [px, py, r] of [[-30, -90, 38], [30, -92, 40], [0, -128, 46], [0, -84, 40]]) ball(c, px, py, r, col);
    c.restore();
  }
  function hedge(g, y, h, col = '#46b64f') {
    const c = g.c;
    for (let x = -g.hw - 40; x < g.hw + 60; x += 46) ball(c, x, y + 10, h * 0.6, col);
    rrect(c, -g.hw * 2, y, g.hw * 4, h, 0); c.fillStyle = vgrad(c, y, y + h, col, shade(col, -0.2)); c.fill();
    for (let i = 0, x = -g.hw; x < g.hw; x += 34, i++) { circle(c, x + rnd(i) * 20, y - 6 + rnd(i * 3) * 30, 6); c.fillStyle = ['#ff5f9e', '#ffffff', '#ff3b3b', '#ffd23f'][i % 4]; c.fill(); }
  }
  function tiles(g, y0, col = '#f7e8c6', line = 'rgba(190,150,100,.28)') {
    const c = g.c;
    c.fillStyle = vgrad(c, y0, g.hh, col, shade(col, 0.25)); c.fillRect(-g.hw * 3, y0, g.hw * 6, g.hh * 3);
    c.strokeStyle = line; c.lineWidth = 3;
    for (let k = 1; k < 14; k++) { const y = y0 + k * k * 6; c.beginPath(); c.moveTo(-g.hw * 3, y); c.lineTo(g.hw * 3, y); c.stroke(); }
    for (let i = -24; i <= 24; i++) { c.beginPath(); c.moveTo(i * 40, y0); c.lineTo(i * 260, y0 + 900); c.stroke(); }
  }
  function slide(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.strokeStyle = '#3b6ef5'; c.lineWidth = 10;
    c.beginPath(); c.moveTo(-60, 0); c.lineTo(-60, -200); c.moveTo(-20, 0); c.lineTo(-20, -200); c.stroke();
    const cols = ['#ff4d4d', '#ffd23f', '#3bc9ff', '#ff6fa8'];
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-20 + i * 12, -200); c.quadraticCurveTo(60 + i * 12, -150, 120 + i * 12, 0); c.lineWidth = 14; c.strokeStyle = cols[i]; c.stroke(); }
    rrect(c, -70, -214, 64, 18, 6); c.fillStyle = '#8a5cf6'; c.fill();
    c.restore();
  }
  function carousel(c, x, y, s, t) {
    c.save(); c.translate(x, y); c.scale(s, s);
    oval(c, 0, -10, 110, 22); c.fillStyle = '#c45af0'; c.fill();
    c.strokeStyle = '#f2c94c'; c.lineWidth = 6;
    for (let i = 0; i < 5; i++) { const xx = Math.sin(t + i * 1.25) * 90; c.beginPath(); c.moveTo(xx, -20); c.lineTo(xx, -170); c.stroke(); blob(c, xx, -80 + Math.sin(t * 3 + i) * 12, 20, 14, ['#ffffff', '#ffb3c7', '#9fd8ff'][i % 3]); }
    c.beginPath(); c.moveTo(-130, -170); c.lineTo(0, -250); c.lineTo(130, -170); c.closePath(); c.fillStyle = '#ff5a5a'; c.fill();
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-130 + i * 65, -170); c.lineTo(0, -250); c.lineTo(-97 + i * 65, -170); c.closePath(); c.fillStyle = '#fff3d6'; c.fill(); }
    ball(c, 0, -258, 14, '#ffd23f');
    c.restore();
  }
  function bgPark(g, t) {
    const c = g.c;
    sky(g, '#16a6ef', '#b4ebff', 150); clouds(g, t, -430);
    for (let i = -14; i <= 14; i++) {
      const x = i * 92, h = 60 + rnd(i + 50) * 100, col = ['#ffb3c7', '#9fd8ff', '#ffe08a', '#b8f0a8', '#d5b8ff'][(i % 5 + 5) % 5];
      rrect(c, x, 130 - h, 72, h, 8); c.fillStyle = col; c.fill();
      c.fillStyle = 'rgba(255,255,255,.7)'; for (let w = 0; w < h - 30; w += 26) { c.fillRect(x + 14, 130 - h + 14 + w, 14, 12); c.fillRect(x + 42, 130 - h + 14 + w, 14, 12); }
    }
    for (let i = -10; i <= 10; i++) tree(c, i * 150 + rnd(i) * 50, 150, 0.85 + rnd(i + 1) * 0.3);
    slide(c, -250, 190, 1); carousel(c, 250, 180, 1, t);
    hedge(g, 150, 60);
    tiles(g, 205);
  }
  function fence(g, y, h = 90, col = '#b07a43') {
    const c = g.c;
    c.fillStyle = shade(col, -0.1); c.fillRect(-g.hw * 2, y - h * 0.7, g.hw * 4, 14); c.fillRect(-g.hw * 2, y - h * 0.3, g.hw * 4, 14);
    for (let x = -g.hw - 40; x < g.hw + 40; x += 44) {
      c.beginPath(); c.moveTo(x - 16, y); c.lineTo(x - 16, y - h); c.lineTo(x, y - h - 18); c.lineTo(x + 16, y - h); c.lineTo(x + 16, y); c.closePath();
      c.fillStyle = vgrad(c, y - h, y, shade(col, 0.15), shade(col, -0.15)); c.fill();
    }
  }
  function barn(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath(); c.moveTo(-150, 0); c.lineTo(-150, -200); c.lineTo(0, -300); c.lineTo(150, -200); c.lineTo(150, 0); c.closePath();
    c.fillStyle = vgrad(c, -300, 0, '#e8463f', '#b8302b'); c.fill();
    c.beginPath(); c.moveTo(-170, -195); c.lineTo(0, -315); c.lineTo(170, -195); c.lineWidth = 16; c.strokeStyle = '#ffffff'; c.stroke();
    rrect(c, -70, -140, 140, 140, 6); c.fillStyle = '#c5362f'; c.fill(); c.lineWidth = 10; c.strokeStyle = '#ffffff'; c.stroke();
    c.beginPath(); c.moveTo(-70, -140); c.lineTo(70, 0); c.moveTo(70, -140); c.lineTo(-70, 0); c.stroke();
    circle(c, 0, -220, 26); c.fillStyle = '#ffffff'; c.fill(); circle(c, 0, -220, 18); c.fillStyle = '#8fd3ff'; c.fill();
    c.restore();
  }
  function coop(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    rrect(c, -120, -170, 240, 170, 8); c.fillStyle = vgrad(c, -170, 0, '#f2c27a', '#d39a4f'); c.fill();
    c.strokeStyle = 'rgba(120,70,20,.35)'; c.lineWidth = 3; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(-120, -170 + i * 28); c.lineTo(120, -170 + i * 28); c.stroke(); }
    c.beginPath(); c.moveTo(-145, -160); c.lineTo(0, -250); c.lineTo(145, -160); c.closePath(); c.fillStyle = '#d9443c'; c.fill();
    rrect(c, -40, -120, 80, 100, 6); c.fillStyle = '#3a2412'; c.fill();
    c.beginPath(); c.moveTo(-36, -20); c.lineTo(36, -20); c.lineTo(70, 40); c.lineTo(0, 40); c.closePath(); c.fillStyle = '#e3b26a'; c.fill();
    c.restore();
  }
  function bgFarm(g, t, o = {}) {
    const c = g.c;
    sky(g, '#2db5f5', '#d6f3ff', 200); clouds(g, t, -420);
    for (let i = -6; i <= 6; i++) blob(c, i * 260, 230, 220, 140, '#8fd16b');
    for (let i = -10; i <= 10; i++) tree(c, i * 170 + rnd(i + 3) * 60, 190, 1.0 + rnd(i + 2) * 0.4, '#2f9a3d');
    if (o.barn) barn(c, o.barnX ?? -210, 250, 1);
    if (o.coop) coop(c, o.coopX ?? 0, 300, 1.1);
    if (!o.noFence) fence(g, 270);
    c.fillStyle = vgrad(c, 260, 300, '#5cc04f', '#47a83c'); c.fillRect(-g.hw * 3, 262, g.hw * 6, 34);
    c.fillStyle = vgrad(c, 290, g.hh, '#e1b682', '#c99a62'); c.fillRect(-g.hw * 3, 290, g.hw * 6, g.hh);
    for (let i = 0; i < 40; i++) { oval(c, (rnd(i) * 2 - 1) * g.hw, 320 + rnd(i * 3) * 300, 8 + rnd(i * 5) * 8, 4 + rnd(i * 5) * 3); c.fillStyle = 'rgba(140,100,60,.25)'; c.fill(); }
  }
  function bgRoom(g, t, wall = '#ffe1ec', floor = '#e9b97f', o = {}) {
    const c = g.c;
    c.fillStyle = vgrad(c, -g.hh, 260, shade(wall, 0.2), wall); c.fillRect(-g.hw * 3, -g.hh * 3, g.hw * 6, g.hh * 3 + 260);
    c.fillStyle = rgba(shade(wall, -0.25), 0.25);
    for (let i = -30; i < 30; i++) for (let j = -12; j < 6; j++) { circle(c, i * 70 + (j % 2) * 35, j * 70, 8); c.fill(); }
    if (o.window) {
      const wx = o.windowX ?? 0;
      rrect(c, wx - 150, -420, 300, 300, 18); c.fillStyle = o.night ? vgrad(c, -420, -120, '#0e1a4f', '#3d3a8c') : vgrad(c, -420, -120, '#3ab8f5', '#c8f0ff'); c.fill();
      if (o.night) { moon(c, wx + 60, -330, 44, t, { sleep: true }); for (let i = 0; i < 8; i++) star(c, wx - 120 + rnd(i) * 150, -400 + rnd(i + 4) * 200, 7 + rnd(i) * 5, '#fff6b0'); }
      else cloud(c, wx - 40, -300, 0.7);
      c.lineWidth = 16; c.strokeStyle = '#ffffff'; rrect(c, wx - 150, -420, 300, 300, 18); c.stroke();
      c.beginPath(); c.moveTo(wx, -420); c.lineTo(wx, -120); c.moveTo(wx - 150, -270); c.lineTo(wx + 150, -270); c.lineWidth = 10; c.stroke();
    }
    c.fillStyle = '#ffffff'; c.fillRect(-g.hw * 3, 250, g.hw * 6, 22);
    c.fillStyle = vgrad(c, 270, g.hh, floor, shade(floor, -0.15)); c.fillRect(-g.hw * 3, 270, g.hw * 6, g.hh * 2);
    c.strokeStyle = rgba(shade(floor, -0.4), 0.3); c.lineWidth = 3;
    for (let k = 0; k < 10; k++) { const y = 270 + k * k * 5 + k * 18; c.beginPath(); c.moveTo(-g.hw * 3, y); c.lineTo(g.hw * 3, y); c.stroke(); }
    if (o.rug !== false) { oval(c, 0, 450, 360, 70); c.fillStyle = rgba(o.rug || '#8fd3ff', 0.7); c.fill(); }
  }
  function bunting(g, t, y = -330) {
    const c = g.c, cols = CONF;
    for (let row = 0; row < 2; row++) {
      const yy = y + row * 120, span = g.hw * 2 + 100;
      c.strokeStyle = '#8a6a5a'; c.lineWidth = 3; c.beginPath();
      const pts = [];
      for (let i = 0; i <= 40; i++) { const x = -span / 2 + (i / 40) * span, yv = yy + Math.sin((i / 40) * Math.PI * 3) * 40 + 40; pts.push([x, yv]); c.lineTo(x, yv); }
      c.stroke();
      for (let i = 1; i < 40; i += 2) { const [x, yv] = pts[i], sw = Math.sin(t * 3 + i) * 0.1; c.save(); c.translate(x, yv); c.rotate(sw); c.beginPath(); c.moveTo(-18, 0); c.lineTo(18, 0); c.lineTo(0, 40); c.closePath(); c.fillStyle = cols[(i + row) % cols.length]; c.fill(); c.restore(); }
    }
  }
  function bgParty(g, t) {
    bgRoom(g, t, '#ffd7e8', '#e7b67c', { rug: '#ffe08a' });
    bunting(g, t);
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) balloon(g.c, sd * (g.hw - 70 - i * 50), -60 - i * 70, 46, CONF[(i + (sd > 0 ? 3 : 0)) % 6], { t, seed: i + sd });
  }
  function bgNight(g, t, o = {}) {
    const c = g.c;
    c.fillStyle = vgrad(c, -g.hh, 300, '#0b1445', '#433f95'); c.fillRect(-g.hw * 3, -g.hh * 3, g.hw * 6, g.hh * 6);
    for (let i = 0; i < 90; i++) { const x = (rnd(i) * 2 - 1) * g.hw, y = -g.hh + rnd(i * 3) * 900, k = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)); c.globalAlpha = k; starPath(c, x, y, 3 + rnd(i * 7) * 6, 0, 4, 0.4); c.fillStyle = '#fff8d0'; c.fill(); }
    c.globalAlpha = 1;
    if (o.moon !== false) moon(c, o.moonX ?? 0, o.moonY ?? -320, o.moonR ?? 110, t, { sleep: o.sleep });
    for (let i = -6; i <= 6; i++) blob(c, i * 260, 360, 220, 140, '#22306b');
    c.fillStyle = vgrad(c, 330, g.hh, '#1c2a62', '#141d48'); c.fillRect(-g.hw * 3, 330, g.hw * 6, g.hh);
  }
  function bgSea(g, t) {
    const c = g.c;
    c.fillStyle = vgrad(c, -g.hh, g.hh, '#57dcff', '#0a4fa8'); c.fillRect(-g.hw * 3, -g.hh * 3, g.hw * 6, g.hh * 6);
    c.save(); c.globalAlpha = 0.12; c.fillStyle = '#ffffff';
    for (let i = -6; i <= 6; i++) { const x = i * 180 + Math.sin(t * 0.6 + i) * 40; c.beginPath(); c.moveTo(x - 30, -g.hh); c.lineTo(x + 30, -g.hh); c.lineTo(x + 200, g.hh); c.lineTo(x + 60, g.hh); c.closePath(); c.fill(); }
    c.restore();
    for (let i = -8; i <= 8; i++) blob(c, i * 220, 330, 140, 90, '#2a6fb8');
    c.fillStyle = vgrad(c, 320, g.hh, '#f6dc9a', '#e2bf72');
    c.beginPath(); c.moveTo(-g.hw * 3, 340); for (let x = -g.hw * 3; x <= g.hw * 3; x += 60) c.lineTo(x, 340 + Math.sin(x * 0.01) * 16); c.lineTo(g.hw * 3, g.hh * 2); c.lineTo(-g.hw * 3, g.hh * 2); c.closePath(); c.fill();
    for (let i = -10; i <= 10; i++) {
      const x = i * 120 + rnd(i) * 60, h = 160 + rnd(i * 3) * 140;
      c.beginPath(); c.moveTo(x, 360);
      for (let k = 1; k <= 8; k++) c.lineTo(x + Math.sin(t * 2 + k * 0.6 + i) * 18 * (k / 8), 360 - (h * k) / 8);
      c.lineWidth = 18; c.lineCap = 'round'; c.strokeStyle = i % 2 ? '#2fbf71' : '#1fa35e'; c.stroke();
    }
    for (let i = -6; i <= 6; i++) { ball(c, i * 210 + 90, 380, 26, '#ff7aa8'); ball(c, i * 210 + 120, 372, 18, '#ff9cbf'); }
    risingBubbles(g, t, 14, 3);
  }
  function bgDisco(g, t, beat) {
    const c = g.c;
    c.fillStyle = vgrad(c, -g.hh, 300, '#1a0638', '#5b2a9e'); c.fillRect(-g.hw * 3, -g.hh * 3, g.hw * 6, g.hh * 6);
    c.save(); c.globalCompositeOperation = 'lighter';
    const cols = ['#ff3d9a', '#3dd6ff', '#ffe23d', '#7dff6b'];
    for (let i = 0; i < 4; i++) {
      const a = Math.sin(t * 1.4 + i * 1.6) * 0.6, sx = (i - 1.5) * 260;
      c.save(); c.translate(sx, -g.hh); c.rotate(a);
      const gr = c.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, rgba(cols[i], 0.55)); gr.addColorStop(1, rgba(cols[i], 0));
      c.beginPath(); c.moveTo(-20, 0); c.lineTo(20, 0); c.lineTo(200, 1300); c.lineTo(-200, 1300); c.closePath(); c.fillStyle = gr; c.fill(); c.restore();
    }
    c.restore();
    c.save(); c.translate(0, -470);
    c.strokeStyle = '#aaa'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -200); c.lineTo(0, -70); c.stroke();
    circle(c, 0, 0, 70); c.fillStyle = '#c9c9d9'; c.fill(); c.save(); c.clip();
    for (let i = -6; i < 6; i++) for (let j = -6; j < 6; j++) { const k = Math.sin(t * 6 + i * 1.3 + j * 2.1); c.fillStyle = k > 0.6 ? '#ffffff' : k > 0 ? '#e6e6f2' : '#9a9ab0'; c.fillRect(i * 13 + ((t * 30) % 13), j * 13, 12, 12); }
    c.restore(); c.restore();
    const bi = Math.floor(beat);
    for (let r = 0; r < 6; r++) for (let i = -16; i <= 16; i++) {
      const y = 260 + r * 70 + r * r * 4, w = 120 + r * 20;
      const on = (i + r + bi) % 3 === 0;
      c.fillStyle = on ? cols[(i + r + bi + 40) % 4] : '#2a1250';
      c.globalAlpha = on ? 0.85 : 1; c.fillRect(i * w - w / 2 + 2, y, w - 4, 66 + r * 6); c.globalAlpha = 1;
    }
  }
  function bgStudio(g, t, c1 = '#ffe36e', c2 = '#ff9f43') {
    const c = g.c;
    const gr = c.createRadialGradient(0, -60, 50, 0, -60, Math.max(g.hw, g.hh) * 1.3); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
    c.fillStyle = gr; c.fillRect(-g.hw * 3, -g.hh * 3, g.hw * 6, g.hh * 6);
    c.save(); c.translate(0, -60); c.rotate(t * 0.15); c.fillStyle = 'rgba(255,255,255,.14)';
    for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 2600, (i / 16) * TAU, ((i + 0.5) / 16) * TAU); c.closePath(); c.fill(); }
    c.restore();
    for (let i = 0; i < 16; i++) { const x = (rnd(i) * 2 - 1) * g.hw, y = (rnd(i * 4) * 2 - 1) * g.hh + Math.sin(t + i) * 20; c.globalAlpha = 0.35; ball(c, x, y, 8 + rnd(i * 9) * 14, '#ffffff'); c.globalAlpha = 1; }
  }
  function bgBath(g, t) {
    const c = g.c;
    c.fillStyle = '#d8f3ff'; c.fillRect(-g.hw * 3, -g.hh * 3, g.hw * 6, g.hh * 6);
    c.strokeStyle = '#b5e2f5'; c.lineWidth = 4;
    for (let x = -g.hw * 3; x < g.hw * 3; x += 90) { c.beginPath(); c.moveTo(x, -g.hh * 3); c.lineTo(x, g.hh * 3); c.stroke(); }
    for (let y = -g.hh * 3; y < g.hh * 3; y += 90) { c.beginPath(); c.moveTo(-g.hw * 3, y); c.lineTo(g.hw * 3, y); c.stroke(); }
    c.fillStyle = '#ffffff'; c.fillRect(-g.hw * 3, 300, g.hw * 6, g.hh * 2);
    c.strokeStyle = '#e3e8ee'; for (let x = -g.hw * 3; x < g.hw * 3; x += 120) { c.beginPath(); c.moveTo(x, 300); c.lineTo(x * 1.6, g.hh); c.stroke(); }
    rrect(c, -g.hw + 40, -480, 200, 140, 20); c.fillStyle = '#ffffff'; c.fill(); rrect(c, -g.hw + 54, -466, 172, 112, 14); c.fillStyle = '#bfe8fb'; c.fill();
  }
  function tub(c, x, y, s, front) {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (!front) {
      oval(c, 0, -230, 300, 50); c.fillStyle = '#e6eef5'; c.fill();
      oval(c, 0, -226, 270, 36); c.fillStyle = '#7fd4ff'; c.fill();
    } else {
      c.beginPath(); c.moveTo(-300, -230); c.quadraticCurveTo(-300, -10, -200, 0); c.lineTo(200, 0); c.quadraticCurveTo(300, -10, 300, -230); c.closePath();
      c.fillStyle = vgrad(c, -230, 0, '#ffffff', '#d7e2ec'); c.fill();
      for (const sd of [-1, 1]) { blob(c, sd * 220, 6, 26, 14, '#f2c94c'); }
      for (let i = 0; i < 16; i++) ball(c, -270 + i * 36, -232 - Math.sin(i * 1.7) * 14, 26 + (i % 3) * 6, '#ffffff');
    }
    c.restore();
  }
  function crib(c, x, y, s, front) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const col = '#f0c9a0';
    if (!front) {
      rrect(c, -260, -320, 520, 40, 14); c.fillStyle = col; c.fill();
      rrect(c, -230, -160, 460, 60, 20); c.fillStyle = '#ffffff'; c.fill();
    } else {
      rrect(c, -260, -120, 520, 30, 12); c.fillStyle = shade(col, -0.05); c.fill();
      for (let x2 = -240; x2 <= 240; x2 += 40) { rrect(c, x2 - 7, -300, 14, 200, 6); c.fillStyle = col; c.fill(); }
      rrect(c, -270, -310, 540, 26, 12); c.fillStyle = shade(col, 0.1); c.fill();
      for (const sd of [-1, 1]) { rrect(c, sd * 270 - 16, -330, 32, 330, 12); c.fillStyle = shade(col, -0.1); c.fill(); }
    }
    c.restore();
  }
  function submarine(c, x, y, s, t, inside) {
    c.save(); c.translate(x, y + Math.sin(t * 2) * 10); c.scale(s, s); c.rotate(Math.sin(t * 1.5) * 0.04);
    rrect(c, -40, -150, 90, 60, 14); c.fillStyle = '#f7b500'; c.fill();
    c.strokeStyle = '#d18f00'; c.lineWidth = 10; c.beginPath(); c.moveTo(20, -150); c.lineTo(20, -200); c.lineTo(50, -200); c.stroke();
    blob(c, 0, -40, 200, 100, '#ffc81f');
    c.save(); c.translate(-210, -40); c.rotate(t * 12); c.fillStyle = '#ff8a1f'; for (let i = 0; i < 3; i++) { c.rotate(TAU / 3); oval(c, 0, -26, 10, 26); c.fill(); } c.restore();
    for (const px of [-110, 110]) { circle(c, px, -40, 34); c.fillStyle = '#9fe3ff'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#d18f00'; c.stroke(); }
    circle(c, 0, -46, 62); c.fillStyle = '#bff0ff'; c.fill();
    c.save(); circle(c, 0, -46, 56); c.clip(); if (inside) inside(c); c.restore();
    c.lineWidth = 12; c.strokeStyle = '#d18f00'; circle(c, 0, -46, 62); c.stroke();
    oval(c, -24, -78, 16, 9, -0.5); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill();
    c.restore();
  }
  function chest(c, x, y, s, open, t) {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (open > 0) { const g2 = c.createRadialGradient(0, -110, 10, 0, -110, 260 * open); g2.addColorStop(0, 'rgba(255,240,140,.9)'); g2.addColorStop(1, 'rgba(255,240,140,0)'); c.fillStyle = g2; circle(c, 0, -110, 260 * open); c.fill(); for (let i = 0; i < 7; i++) ball(c, -60 + i * 20, -100 - (i % 2) * 14, 16, '#ffd23f'); }
    rrect(c, -110, -100, 220, 100, 12); c.fillStyle = vgrad(c, -100, 0, '#a8642c', '#7a4318'); c.fill();
    c.fillStyle = '#f2c94c'; c.fillRect(-110, -60, 220, 14); c.fillRect(-12, -100, 24, 100);
    c.save(); c.translate(-open * 30, -100 - open * 70); c.rotate(-open * 0.35);
    c.beginPath(); c.moveTo(-110, 0); c.quadraticCurveTo(0, -90, 110, 0); c.closePath(); c.fillStyle = vgrad(c, -80, 0, '#c07a3a', '#8a4d1c'); c.fill();
    c.fillStyle = '#f2c94c'; c.fillRect(-12, -66, 24, 66);
    c.restore();
    c.restore();
  }
  function hand(c, x, y, s, rot = 0, skin = '#ffd3b4') {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    blob(c, -120, 0, 120, 44, skin);
    blob(c, 10, 0, 60, 52, skin);
    for (let i = 0; i < 4; i++) blob(c, 58, -34 + i * 22, 30, 11, skin, 0.1);
    blob(c, 10, -50, 34, 14, skin, -0.7);
    c.restore();
  }
  function bag(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath(); c.moveTo(-26, -40); c.quadraticCurveTo(-40, 30, 0, 34); c.quadraticCurveTo(40, 30, 26, -40); c.closePath();
    c.fillStyle = grad3(c, 0, 0, 40, '#c99a62'); c.fill();
    c.strokeStyle = '#7a5a2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(-24, -36); c.lineTo(24, -36); c.stroke();
    c.restore();
  }

  // ---------- captions / overlays ----------
  function caption(g, str, tl, o = {}) {
    if (!str) return;
    const c = g.c, size = o.size || 70, maxW = Math.min(g.hw * 2 * 0.86, 1300);
    c.save(); c.font = `700 ${size}px ${FONT}`;
    const raw = str.split(/\s+/).filter(Boolean);
    const words = raw.map((w) => ({ w: w.replace(/\*/g, ''), hi: /\*/.test(w) }));
    const lines = []; let line = [], lw = 0; const space = c.measureText(' ').width;
    for (const w of words) { const ww = c.measureText(w.w).width; if (line.length && lw + space + ww > maxW) { lines.push({ line, lw }); line = []; lw = 0; } w.width = ww; lw += (line.length ? space : 0) + ww; line.push(w); }
    if (line.length) lines.push({ line, lw });
    c.restore();
    const y0 = (o.y ?? -g.hh + 190) - ((lines.length - 1) * size * 1.12) / 2;
    let k = 0;
    lines.forEach((L, li) => {
      let x = -L.lw / 2;
      for (const w of L.line) {
        const appear = ease.back(seg(tl, k * 0.07, k * 0.07 + 0.22));
        if (appear > 0) {
          c.save(); c.translate(x + w.width / 2, y0 + li * size * 1.12); c.scale(appear, appear);
          text(c, w.w, 0, 0, size, { fill: w.hi ? (g.v && g.v.hi) || '#ffe23d' : '#ffffff', stroke: '#2b1d4e', sw: size * 0.2 });
          c.restore();
        }
        x += w.width + space; k++;
      }
    });
  }

  window.KS = window.KS || {};
  Object.assign(window.KS, {
    TAU, G, clamp, lerp, seg, ease, rnd, shade, rgba, hex,
    circle, oval, rrect, ball, blob, vgrad, grad3, shadow, text, FONT,
    eye, bead, mouth, blinkAt, partyHat, cheeks,
    baby, babyHead, bear, hen, chick, critter, car, wheel, fish, octopus, crab, duck, balloon, star, starPath, heartPath, shapeChar,
    sun, moon, apple, orange, grapes, leaf, beachBall, egg, bubble, splat, present, cake, hand, bag,
    CONF, confetti, sparkles, risingBubbles, cloud, clouds, tree, hedge, tiles, fence, barn, coop, sky,
    bgPark, bgFarm, bgRoom, bgParty, bgNight, bgSea, bgDisco, bgStudio, bgBath, tub, crib, submarine, chest, bunting,
    caption,
  });
})();
