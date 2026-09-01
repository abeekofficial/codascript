"use client";

// CodaScript — animated space background built from the real reference artwork.
// The legend panel and all text/code-glyph overlays were cropped/inpainted out;
// the astronaut+laptop was cut out into its own layer so it can float independently.
// A JS-driven "cover" scale keeps the background and the astronaut layer perfectly
// aligned at any viewport size (the same math the CSS `background-size: cover`
// keyword uses internally, applied to both layers together).

import { useEffect, useRef, useMemo, type CSSProperties } from "react";

const IMG_W = 1521;
const IMG_H = 1536;

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = { x: number; y: number; r: number; dur: number; delay: number };

function buildStars(count: number, seed: number): Star[] {
  const rand = mulberry32(seed);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: +(rand() * IMG_W).toFixed(1),
      y: +(rand() * IMG_H * 0.55).toFixed(1),
      r: +(rand() * 1.3 + 0.4).toFixed(2),
      dur: +(rand() * 3 + 2).toFixed(2),
      delay: +(-rand() * 6).toFixed(2),
    });
  }
  return stars;
}

const SHOOTING_STARS = [
  { x1: 1420, y1: 140, x2: 1500, y2: 105, w: 2.5, dur: 8.4, delay: 0.6 },
  { x1: 1050, y1: 70, x2: 1130, y2: 35, w: 2, dur: 9.6, delay: 4.1 },
  { x1: 200, y1: 620, x2: 280, y2: 580, w: 2, dur: 10.4, delay: 2.3 },
];

export default function SpaceBackground() {
  const innerRef = useRef<HTMLDivElement>(null);
  const stars = useMemo(() => buildStars(50, 7), []);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const layout = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.max(vw / IMG_W, vh / IMG_H);
      el.style.transform = `translateX(-50%) scale(${scale})`;
    };
    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, []);

  return (
    <div className="space-bg" aria-hidden="true">
      <div ref={innerRef} className="space-bg-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="space-bg-layer" src="/space-bg/space-bg.png" alt="" />

        <svg
          className="space-bg-layer"
          viewBox={`0 0 ${IMG_W} ${IMG_H}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="sbShootGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#BFF5D9" stopOpacity="0" />
              <stop offset="100%" stopColor="#BFF5D9" stopOpacity="1" />
            </linearGradient>
          </defs>
          <g>
            {stars.map((s, i) => (
              <circle
                key={i}
                className="sb-star"
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill="#CFFFE6"
                style={
                  {
                    "--d": `${s.dur}s`,
                    "--delay": `${s.delay}s`,
                  } as CSSProperties
                }
              />
            ))}
          </g>
          <g stroke="url(#sbShootGrad)" strokeLinecap="round" fill="none">
            {SHOOTING_STARS.map((s, i) => (
              <line
                key={i}
                className="sb-shoot"
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                strokeWidth={s.w}
                style={
                  {
                    "--sd": `${s.dur}s`,
                    "--sdelay": `${s.delay}s`,
                  } as CSSProperties
                }
              />
            ))}
          </g>
        </svg>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="space-bg-astro" src="/space-bg/astronaut.png" alt="" />
      </div>
    </div>
  );
}
