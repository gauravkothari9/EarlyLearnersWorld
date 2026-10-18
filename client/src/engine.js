// Thin helpers around the drawing engine (window.KS, loaded from /js/*.js in index.html).
export const KS = () => window.KS;
export const styleById = (id) => KS()?.STYLES.find((s) => s.id === id);

/** Options for drawing a style the way the user's settings will render it. */
export function drawOptions(settings, seed = 0) {
  return {
    seed,
    name: KS().HOST,
    channel: settings?.channel || 'EarlyLearnersWorld',
    captions: settings?.captions !== false,
    narration: settings?.narration !== false,
    outro: settings?.outro !== false,
    watermark: settings?.watermark !== false,
  };
}

/** Canvas size for a CSS box, sharp on high-DPI screens. */
export function sizeCanvas(canvas, w, h) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
}

// Fredoka is drawn into the frames; wait for it once so the first thumbnails aren't in a fallback font.
export const fontsReady = Promise.race([
  document.fonts?.load('700 64px Fredoka').catch(() => {}),
  new Promise((r) => setTimeout(r, 3000)),
]);
