/**
 * WisePlayerLogo
 * ─────────────────────────────────────────────────────────────────────
 * Faithful SVG recreation of the WisePlayer logo.
 *
 * Structure:
 *   • 8 vertical bars — 4 left + 4 right, tightly packed (no gap between bars)
 *   • Heights fan: outer=short, inner=tallest
 *   • Colors grade: outer=bright red → inner=dark maroon
 *   • Triangle sits ON TOP with a background-coloured HALO polygon drawn
 *     before the triangle fill — this creates the clean gap/space around
 *     the triangle separating it visually from the bars behind it
 *   • Triangle: salmon-coral gradient, rounded feel, inner highlight
 *
 * Props
 * ─────
 *   size      {number}   width & height in px          (default 40)
 *   animate   {boolean}  wave animation on bars         (default false)
 *   bg        {string}   background colour behind logo  (default "#ffffff")
 *                        Pass the exact bg colour so the halo matches.
 *                        e.g. "#111111" for dark panels, "#f4f4f7" for grey
 *   className {string}   extra Tailwind / CSS classes
 *
 * Usage
 * ─────
 *   // Navbar white bg
 *   <WisePlayerLogo size={38} bg="#ffffff" />
 *
 *   // Login dark panel
 *   <WisePlayerLogo size={56} animate bg="#1a1a1a" />
 *
 *   // OTP / Register dark panel
 *   <WisePlayerLogo size={48} animate bg="#1a1a1a" />
 *
 *   // Dashboard sidebar dark
 *   <WisePlayerLogo size={34} bg="#1a1a1a" />
 *
 *   // Grey background card
 *   <WisePlayerLogo size={44} bg="#f4f4f7" />
 */

import React from "react";

let _uid = 0;

const WisePlayerLogo = ({
  size      = 40,
  animate   = false,
  bg        = "#ffffff",
  className = "",
}) => {
  const [uid] = React.useState(() => `wpl${++_uid}`);
  const gid   = `${uid}g`;

  /*
   * BAR DATA — 8 bars, tight pack (gap=1.5px between bars)
   * Bar width = 9, rx = 4.5
   * All bars pivot from their vertical centre at y=50 (100×100 viewBox)
   *
   * LEFT  bars x (outer→inner): 2, 12.5, 23, 33.5
   * RIGHT bars x (inner→outer): 57.5, 68, 78.5, 89
   * Gap between inner-left and inner-right: 57.5 - (33.5+9) = 15px → triangle space
   *
   * Heights (outer→inner): 36, 54, 68, 80
   * Colors  (outer→inner): #c0272d, #991c22, #6e1216, #4a0c10
   *                         all in the #800000 maroon brand family
   */
  const BARS = [
    // LEFT — outer to inner
    { x:  2,   y: 32, h: 36, fill: "#c0272d", delay: "0.00s", px:  6.5 },
    { x: 12.5, y: 23, h: 54, fill: "#991c22", delay: "0.13s", px: 17   },
    { x: 23,   y: 16, h: 68, fill: "#6e1216", delay: "0.26s", px: 27.5 },
    { x: 33.5, y: 10, h: 80, fill: "#4a0c10", delay: "0.39s", px: 38   },
    // RIGHT — inner to outer
    { x: 57.5, y: 10, h: 80, fill: "#4a0c10", delay: "0.52s", px: 62   },
    { x: 68,   y: 16, h: 68, fill: "#6e1216", delay: "0.65s", px: 72.5 },
    { x: 78.5, y: 23, h: 54, fill: "#991c22", delay: "0.78s", px: 83   },
    { x: 89,   y: 32, h: 36, fill: "#c0272d", delay: "0.91s", px: 93.5 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="WisePlayer"
      role="img"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%"   stopColor="#c0272d" />  {/* bright maroon-red top  */}
          <stop offset="100%" stopColor="#800000" />  {/* brand maroon bottom    */}
        </linearGradient>
      </defs>

      {/* Wave animation — injected only when animate=true */}
      {animate && (
        <style>{`
          @keyframes ${uid}w {
            0%  { transform: scaleY(1)   }
            25% { transform: scaleY(.3)  }
            55% { transform: scaleY(.75) }
            80% { transform: scaleY(.15) }
            100%{ transform: scaleY(1)   }
          }
          @keyframes ${uid}t {
            0%,100% { opacity: 1   }
            50%     { opacity: .82 }
          }
        `}</style>
      )}

      {/* ── 8 bars — tightly packed, no gaps ── */}
      {BARS.map((b, i) => (
        <rect
          key={i}
          x={b.x} y={b.y}
          width={9} height={b.h} rx={4.5}
          fill={b.fill}
          style={animate ? {
            animation: `${uid}w 1.1s ease-in-out infinite ${b.delay}`,
            transformOrigin: `${b.px}px 50px`,
          } : undefined}
        />
      ))}

      {/*
       * ── HALO — background-coloured polygon drawn BEFORE triangle fill ──
       * This is the key trick: the halo polygon is the same colour as the
       * background, and is slightly LARGER than the triangle. It sits on top
       * of the bars, creating a clean gap/space around the triangle on all sides.
       * Halo has 4px padding on each side relative to the triangle.
       */}
      <polygon points="34,16 34,84 93,50" fill={bg} />

      {/* ── Triangle — gradient fill on top of halo ── */}
      <polygon
        points="38,20 38,80 89,50"
        fill={`url(#${gid})`}
        style={animate ? {
          animation: `${uid}t 2.4s ease-in-out infinite`,
        } : undefined}
      />

      {/* ── Inner highlight on triangle ── */}
      <polygon
        points="41,23 41,50 65,37"
        fill="rgba(255,255,255,0.20)"
      />
    </svg>
  );
};

export default WisePlayerLogo;