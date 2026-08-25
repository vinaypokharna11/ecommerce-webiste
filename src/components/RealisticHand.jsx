'use client';

import React from 'react';

/**
 * Realistic Human Hand Component with Anatomical Shading & Kinematics.
 * Coordinates and finger articulation are driven dynamically by scroll progress.
 *
 * @param {Object} props
 * @param {number} props.progress - Scroll progress (0.0 to 1.0)
 * @param {Object} props.stageSize - Dimensions of the interactive viewport { width, height }
 */
export const RealisticHand = ({ progress = 0, stageSize = { width: 800, height: 600 } }) => {
  // Phase breakdown
  // 0.00 - 0.15: Offscreen to entering
  // 0.15 - 0.35: Approaching fabric
  // 0.35 - 0.50: Fingers opening -> gripping
  // 0.50 - 0.85: Pulling upward with cloth
  // 0.85 - 1.00: Release and exit

  if (progress <= 0.02 || progress >= 0.98) return null;

  // Normalized Hand Position Calculation
  let handX = 110; // in % of container width
  let handY = 110; // in % of container height
  let handRotation = -18; // degrees
  let gripClose = 0; // 0 = open, 1 = fully closed grip
  let opacity = 1;

  if (progress < 0.15) {
    // Entering from bottom right
    const t = (progress - 0.02) / 0.13;
    handX = 110 - t * 30; // 110% -> 80%
    handY = 110 - t * 35; // 110% -> 75%
    handRotation = -24 + t * 6;
    opacity = t;
  } else if (progress < 0.35) {
    // Approaching fabric grip point (around x: 62%, y: 52%)
    const t = (progress - 0.15) / 0.20;
    handX = 80 - t * 18;  // 80% -> 62%
    handY = 75 - t * 23;  // 75% -> 52%
    handRotation = -18 + t * 4;
    gripClose = t * 0.25; // Fingers prepare to grip
  } else if (progress < 0.50) {
    // Grip closes around fabric
    const t = (progress - 0.35) / 0.15;
    handX = 62;
    handY = 52;
    handRotation = -14 + t * 3;
    gripClose = 0.25 + t * 0.75; // 0.25 -> 1.0 (firm pinch)
  } else if (progress < 0.85) {
    // Upward pulling phase
    const t = (progress - 0.50) / 0.35;
    handX = 62 + t * 6; // Slight natural lateral drift
    handY = 52 - t * 85; // 52% -> -33% (lifts off top)
    handRotation = -11 + t * 8;
    gripClose = 1.0;
  } else {
    // Release and retreat
    const t = (progress - 0.85) / 0.13;
    handX = 68 + t * 25;
    handY = -33 + t * 20;
    handRotation = -3 + t * 15;
    gripClose = Math.max(0, 1.0 - t * 1.5); // opens fingers
    opacity = Math.max(0, 1.0 - t * 0.9);
  }

  // Finger articulation offsets based on gripClose (0.0 to 1.0)
  const indexCurl = gripClose * 18;
  const middleCurl = gripClose * 22;
  const thumbAngle = gripClose * 14;
  const fingerGap = (1 - gripClose) * 6;

  return (
    <div
      className="absolute pointer-events-none z-30 transition-transform duration-75 ease-out will-change-transform"
      style={{
        left: `${handX}%`,
        top: `${handY}%`,
        transform: `translate(-35%, -25%) rotate(${handRotation}deg)`,
        opacity: opacity,
        filter: 'drop-shadow(0 15px 25px rgba(23, 23, 23, 0.42))',
      }}
    >
      {/* Contact Shadow on the cloth */}
      {progress > 0.30 && progress < 0.88 && (
        <div
          className="absolute -left-12 -top-6 w-36 h-28 rounded-full bg-black/35 blur-xl pointer-events-none -z-10"
          style={{
            transform: `scale(${0.8 + gripClose * 0.4}) translate(${gripClose * 8}px, ${gripClose * 6}px)`,
            opacity: gripClose * 0.7,
          }}
        />
      )}

      {/* SVG Anatomical Human Hand with Photorealistic Gradients & Joint Shading */}
      <svg
        width="260"
        height="320"
        viewBox="0 0 260 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-48 sm:w-60 md:w-72 lg:w-80 h-auto overflow-visible select-none"
      >
        <defs>
          {/* Skin Tone Main Gradient */}
          <linearGradient id="skinBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D0B5" />
            <stop offset="35%" stopColor="#E8B998" />
            <stop offset="70%" stopColor="#D89E79" />
            <stop offset="100%" stopColor="#C07E58" />
          </linearGradient>

          {/* Skin Highlight (Knuckles and Top Light) */}
          <linearGradient id="skinHighlight" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#FFE4D1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#E8B998" stopOpacity="0" />
          </linearGradient>

          {/* Deep Crease & Shadow Gradient */}
          <linearGradient id="skinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#965230" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6E341B" stopOpacity="0.85" />
          </linearGradient>

          {/* Fingernail Gradient */}
          <linearGradient id="nailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE0D4" />
            <stop offset="50%" stopColor="#FAD0C3" />
            <stop offset="100%" stopColor="#F5B8A8" />
          </linearGradient>

          {/* Palm Crease Filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── 1. Forearm / Wrist Base ── */}
        <path
          d="M130 320 C145 280 160 230 168 190 C150 185 110 185 92 195 C98 235 110 280 120 320 Z"
          fill="url(#skinBase)"
        />
        {/* Forearm lighting overlay */}
        <path
          d="M135 320 C148 280 160 235 166 195 C156 190 135 190 125 195 C122 235 125 280 128 320 Z"
          fill="url(#skinHighlight)"
          opacity="0.5"
        />

        {/* ── 2. Palm & Knuckles ── */}
        <g id="palmGroup">
          <path
            d="M85 195 C75 160 82 125 105 105 C135 90 170 100 180 130 C188 155 178 185 168 195 C145 190 105 190 85 195 Z"
            fill="url(#skinBase)"
          />
          {/* Palm Knuckle Volume & Shading */}
          <ellipse cx="140" cy="115" rx="35" ry="20" fill="url(#skinHighlight)" opacity="0.6" />
          {/* Subtle Palm Creases */}
          <path d="M102 145 Q125 155 152 140" stroke="#9A5632" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
          <path d="M110 165 Q135 170 160 158" stroke="#9A5632" strokeWidth="1.0" strokeLinecap="round" opacity="0.35" />
        </g>

        {/* ── 3. Pinky Finger ── */}
        <g id="pinkyFinger" transform={`translate(${168 + fingerGap * 1.2}, 135) rotate(${18 - gripClose * 10})`}>
          <path
            d={`M0 0 C8 -15 12 -38 8 -55 C5 -68 -5 -70 -10 -60 C-15 -45 -12 -20 -10 0 Z`}
            fill="url(#skinBase)"
          />
          <path d={`M-8 -58 Q-2 -62 4 -58`} stroke="#C07E58" strokeWidth="1" opacity="0.5" />
        </g>

        {/* ── 4. Ring Finger ── */}
        <g id="ringFinger" transform={`translate(${146 + fingerGap * 0.8}, 115) rotate(${10 - gripClose * 8})`}>
          <path
            d={`M-2 0 C6 -20 10 -55 5 -78 C2 -92 -10 -94 -16 -82 C-22 -62 -18 -28 -14 0 Z`}
            fill="url(#skinBase)"
          />
          {/* Knuckle highlight */}
          <ellipse cx="-5" cy="-40" rx="6" ry="4" fill="url(#skinHighlight)" opacity="0.7" />
          {/* Fingernail */}
          <path d="M-13 -84 C-11 -90 -3 -90 -1 -84 C-2 -78 -12 -78 -13 -84 Z" fill="url(#nailGrad)" />
        </g>

        {/* ── 5. Middle Finger (Primary Lead) ── */}
        <g id="middleFinger" transform={`translate(${122 + fingerGap * 0.4}, 102) rotate(${middleCurl * 0.3})`}>
          <path
            d={`M-3 0 C4 -25 8 -68 3 -94 C0 -108 -14 -110 -20 -98 C-26 -74 -22 -32 -16 0 Z`}
            fill="url(#skinBase)"
          />
          {/* Knuckle creases */}
          <path d="M-17 -48 Q-8 -52 1 -48" stroke="#965230" strokeWidth="1.2" opacity="0.4" />
          <path d="M-18 -75 Q-9 -79 0 -75" stroke="#965230" strokeWidth="1.0" opacity="0.35" />
          <ellipse cx="-8" cy="-52" rx="7" ry="5" fill="url(#skinHighlight)" opacity="0.8" />
          {/* Fingernail */}
          <path d="M-18 -100 C-16 -107 -4 -107 -2 -100 C-3 -93 -17 -93 -18 -100 Z" fill="url(#nailGrad)" />
        </g>

        {/* ── 6. Index Finger (Primary Pinch Grip Point) ── */}
        <g id="indexFinger" transform={`translate(96, 110) rotate(${-6 + indexCurl})`}>
          <path
            d={`M-2 0 C4 -20 8 -55 2 -80 C-1 -92 -14 -94 -18 -82 C-24 -62 -20 -28 -14 0 Z`}
            fill="url(#skinBase)"
          />
          {/* Knuckle creases & volume */}
          <path d="M-16 -40 Q-7 -44 0 -40" stroke="#965230" strokeWidth="1.2" opacity="0.45" />
          <path d="M-16 -65 Q-8 -68 -1 -65" stroke="#965230" strokeWidth="1.0" opacity="0.4" />
          <ellipse cx="-8" cy="-42" rx="6" ry="4" fill="url(#skinHighlight)" opacity="0.8" />
          {/* Fingernail */}
          <path d="M-16 -84 C-14 -90 -4 -90 -2 -84 C-3 -78 -15 -78 -16 -84 Z" fill="url(#nailGrad)" />
        </g>

        {/* ── 7. Thumb (Wraps underneath and pinches against index) ── */}
        <g id="thumbFinger" transform={`translate(74, 155) rotate(${-38 + thumbAngle * 1.8})`}>
          <path
            d={`M0 0 C-15 -12 -38 -28 -52 -44 C-62 -55 -52 -68 -38 -62 C-22 -48 -6 -24 10 -6 Z`}
            fill="url(#skinBase)"
          />
          {/* Thumb joint shading */}
          <path d="M-42 -48 Q-34 -56 -24 -46" stroke="#965230" strokeWidth="1.2" opacity="0.5" />
          <ellipse cx="-34" cy="-45" rx="8" ry="5" fill="url(#skinHighlight)" opacity="0.75" />
          {/* Thumb nail */}
          <path d="M-55 -52 C-58 -60 -48 -66 -42 -58 C-44 -52 -52 -48 -55 -52 Z" fill="url(#nailGrad)" />
        </g>
      </svg>
    </div>
  );
};
