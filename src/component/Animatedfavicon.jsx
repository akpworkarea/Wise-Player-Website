/**
 * animatedFavicon.js
 * ─────────────────────────────────────────────────────────────────────
 * Animated WisePlayer favicon — works in Chrome, Firefox, Edge.
 *
 * Fixes vs v1:
 *   • SIZE 256×256 canvas (browsers pick up full resolution)
 *   • Logo fills ~90% of canvas with proper padding
 *   • SMOOTH sine-wave animation — pure Math.sin, no harsh keyframes
 *   • Each bar oscillates between minScale and maxScale continuously
 *   • Stagger phase offset per bar so wave sweeps left→right
 *   • Manual rounded-rect path (no roundRect API dependency)
 *   • RAF runs every frame — no FPS throttle fighting smoothness
 *
 * Usage in main.jsx:
 *   import { initAnimatedFavicon } from './animatedFavicon';
 *   initAnimatedFavicon();
 */

export function initAnimatedFavicon() {

  // ── Canvas — 256×256 for crisp favicon rendering ──
  const SIZE = 256;
  const canvas = document.createElement("canvas");
  canvas.width  = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");

  // ── Scale factor: viewBox 0–100 → full canvas, no padding ──
  // Logo spans x: 2→98, y: 10→90 in 100×100 space.
  // We fit it tightly to fill the full 256px canvas.
  const S = SIZE / 100;

  const px = x => x * S;
  const py = y => y * S;

  // ── Bar definitions — wider bars (w:12 instead of 9) for favicon clarity ──
  const BARS = [
    { x:  1,   w: 11, hFull: 36, color: "#c0272d", phase: 0.00 },
    { x: 13,   w: 11, hFull: 54, color: "#991c22", phase: 0.13 },
    { x: 25,   w: 11, hFull: 68, color: "#6e1216", phase: 0.26 },
    { x: 37,   w: 11, hFull: 80, color: "#4a0c10", phase: 0.39 },
    { x: 52,   w: 11, hFull: 80, color: "#4a0c10", phase: 0.52 },
    { x: 64,   w: 11, hFull: 68, color: "#6e1216", phase: 0.65 },
    { x: 76,   w: 11, hFull: 54, color: "#991c22", phase: 0.78 },
    { x: 88,   w: 11, hFull: 36, color: "#c0272d", phase: 0.91 },
  ];

  // Triangle points matched to new bar layout
  // Bars end at x=48 (left inner bar x=37+w=11=48), right starts at x=52
  // Triangle sits in centre with halo creating gap from bars
  const HALO      = [[32,14],[32,86],[96,50]];
  const TRI       = [[36,18],[36,82],[92,50]];
  const HIGHLIGHT = [[39,22],[39,50],[64,36]];

  // ── Favicon link ──
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/png";

  // ── Smooth sine wave per bar ──
  // scaleY oscillates between MIN_SCALE and 1.0 using a pure sine.
  // phase offsets create the left→right sweep.
  const PERIOD   = 1.4;   // seconds per full wave cycle — slightly slower = smoother feel
  const MIN_SCALE = 0.25; // bars compress to 25% of their full height at trough

  function barScaleY(t, phase) {
    // sin goes -1..1; map to MIN_SCALE..1
    const sine = Math.sin((2 * Math.PI * t / PERIOD) - (phase * 2 * Math.PI));
    return MIN_SCALE + (1 - MIN_SCALE) * (sine * 0.5 + 0.5);
  }

  // ── Manual rounded rect (no roundRect API needed) ──
  function roundedRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    if (r < 0) r = 0;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Triangle path helper ──
  function triPath(points) {
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      i === 0 ? ctx.moveTo(px(x), py(y)) : ctx.lineTo(px(x), py(y));
    });
    ctx.closePath();
  }

  // ── Draw one frame ──
  function draw(t) {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Draw bars
    BARS.forEach(b => {
      const scale  = barScaleY(t, b.phase);
      const bw     = b.w * S;
      const bh     = b.hFull * S * scale;
      const bx     = px(b.x);
      // always centred on y=50 in viewBox
      const cy     = py(50);
      const by     = cy - bh / 2;
      const radius = Math.min(4.5 * S, bh / 2, bw / 2);

      ctx.fillStyle = b.color;
      roundedRect(ctx, bx, by, bw, bh, radius);
      ctx.fill();
    });

    // Halo — background colour creates clean gap around triangle
    triPath(HALO);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Triangle gradient
    const grad = ctx.createLinearGradient(
      px(38), py(20),
      px(89), py(80)
    );
    grad.addColorStop(0, "#c0272d");
    grad.addColorStop(1, "#800000");

    // Gentle triangle pulse using sine
    const pulse = 0.85 + 0.15 * (Math.sin(2 * Math.PI * t / 2.2) * 0.5 + 0.5);
    ctx.globalAlpha = pulse;
    triPath(TRI);
    ctx.fillStyle = grad;
    ctx.fill();

    // Inner highlight
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#ffffff";
    triPath(HIGHLIGHT);
    ctx.fill();

    ctx.globalAlpha = 1;

    // Swap favicon
    link.href = canvas.toDataURL("image/png");
  }

  // ── Animation loop — full RAF, no throttle ──
  const t0 = performance.now();
  let raf;

  function loop(now) {
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  }

  raf = requestAnimationFrame(loop);

  // Return stop function
  return () => cancelAnimationFrame(raf);
}