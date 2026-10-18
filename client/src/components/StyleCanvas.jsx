import { useEffect, useRef } from 'react';
import { drawOptions, fontsReady, KS, sizeCanvas, styleById } from '../engine';

/**
 * A style's poster frame, drawn live by the engine. It is drawn once the card scrolls into view,
 * and plays silently while `playing` is true (the card is hovered).
 */
export default function StyleCanvas({ styleId, settings, playing = false }) {
  const ref = useRef(null);
  const visible = useRef(false);
  const timeline = useRef(null);

  // poster: draw when first visible, and again when settings change
  useEffect(() => {
    const canvas = ref.current;
    const style = styleById(styleId);
    if (!canvas || !style) return undefined;
    const opts = { ...drawOptions(settings), narration: false, watermark: false };
    timeline.current = { style, opts: { ...opts, _tl: KS().timeline(style, opts) } };
    const draw = () => {
      const box = canvas.parentElement.getBoundingClientRect();
      sizeCanvas(canvas, box.width, box.height);
      KS().renderFrame(canvas.getContext('2d'), canvas.width, canvas.height, style, style.thumbT || 1.5, timeline.current.opts);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || visible.current) return;
      visible.current = true;
      fontsReady.then(draw);
    }, { rootMargin: '200px' });
    visible.current = false;
    io.observe(canvas);
    return () => io.disconnect();
  }, [styleId, settings]);

  // hover: play the timeline from the poster frame
  useEffect(() => {
    if (!playing || !timeline.current) return undefined;
    const canvas = ref.current;
    const { style, opts } = timeline.current;
    const total = opts._tl.total;
    const start = performance.now();
    const t0 = style.thumbT || 1.5;
    let frame;
    const loop = (now) => {
      const t = (t0 + (now - start) / 1000) % total;
      KS().renderFrame(canvas.getContext('2d'), canvas.width, canvas.height, style, t, opts);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      KS().renderFrame(canvas.getContext('2d'), canvas.width, canvas.height, style, t0, opts);
    };
  }, [playing]);

  return <canvas ref={ref} aria-hidden="true" />;
}
