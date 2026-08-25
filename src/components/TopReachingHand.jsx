'use client';

import React from 'react';

/**
 * Photorealistic Human Hand reaching down from the TOP of the screen.
 * Reaches down, clamps fingers over the top edge of the catalog page,
 * and pulls the entire page upward in sync with scroll.
 */
export const TopReachingHand = ({ progress = 0, handX = 50 }) => {
  if (progress <= 0.01 || progress >= 0.98) return null;

  // Kinematic calculations for hand descending from top and pulling upward:
  // p: 0.00 - 0.18: Descending from top (y: -15% -> 12%)
  // p: 0.18 - 0.32: Reaching top edge of catalog page & clamping fingers (y: 12% -> 18%)
  // p: 0.32 - 0.85: Locked grip! Pulling upward with the page (y: 18% -> -35%)
  // p: 0.85 - 1.00: Releasing grip & retreating upward offscreen

  let posY = -20; // in % of viewport height
  let gripClamped = 0; // 0 = open, 1 = firmly gripped over edge
  let wristAngle = 2; // slight natural angle
  let opacity = 1;

  if (progress < 0.18) {
    const t = (progress - 0.01) / 0.17;
    posY = -25 + t * 40; // -25% -> 15%
    wristAngle = 5 - t * 4;
    gripClamped = t * 0.2;
    opacity = Math.min(1, t * 1.5);
  } else if (progress < 0.32) {
    const t = (progress - 0.18) / 0.14;
    posY = 15 + t * 4; // reaches edge at ~19%
    gripClamped = 0.2 + t * 0.8; // clamps firmly
    wristAngle = 1 - t * 2;
  } else if (progress < 0.85) {
    const t = (progress - 0.32) / 0.53;
    posY = 19 - t * 50; // pulls upward from 19% to -31%
    gripClamped = 1.0;
    wristAngle = -1 + t * 4; // natural wrist flexion under load
  } else {
    const t = (progress - 0.85) / 0.13;
    posY = -31 - t * 25;
    gripClamped = Math.max(0, 1.0 - t * 2.0); // releases
    opacity = Math.max(0, 1.0 - t * 1.2);
  }

  const fingerCurl = gripClamped * 16;
  const thumbWrap = gripClamped * 12;

  return (
    <div
      className="fixed z-50 pointer-events-none transition-transform duration-75 ease-out will-change-transform"
      style={{
        left: `${handX}%`,
        top: `${posY}%`,
        transform: `translate(-50%, 0) rotate(${wristAngle}deg)`,
        opacity: opacity,
        filter: 'drop-shadow(0 18px 28px rgba(15, 15, 20, 0.45))',
      }}
    >
      {/* Dynamic contact shadow projected downward on page */}
      {progress > 0.15 && progress < 0.88 && (
        <div
          className="absolute left-1/2 -bottom-4 -translate-x-1/2 w-48 h-20 rounded-full bg-black/40 blur-xl pointer-events-none -z-10"
          style={{
            transform: `scale(${0.7 + gripClamped * 0.5}) translate(0, ${gripClamped * 10}px)`,
            opacity: gripClamped * 0.8,
          }}
        />
      )}

      {/* SVG Anatomical Human Hand Reaching Downwards from Top */}
      <svg
        width="280"
        height="380"
        viewBox="0 0 280 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-52 sm:w-64 md:w-76 lg:w-84 h-auto overflow-visible select-none"
      >
        <defs>
          {/* Natural Skin Tone Gradient */}
          <linearGradient id="topSkinBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C07E58" />
            <stop offset="30%" stopColor="#D89E79" />
            <stop offset="70%" stopColor="#E8B998" />
            <stop offset="100%" stopColor="#F5D0B5" />
          </linearGradient>

          {/* Top Knuckle Shading */}
          <linearGradient id="knuckleLight" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFE5D4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E8B998" stopOpacity="0" />
          </linearGradient>

          {/* Deep Crease Gradient */}
          <linearGradient id="creaseShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8A4826" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#5A2A14" stopOpacity="0.9" />
          </linearGradient>

          {/* Fingernail Gradient */}
          <linearGradient id="topNailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5B8A8" />
            <stop offset="60%" stopColor="#FAD0C3" />
            <stop offset="100%" stopColor="#FFEBE4" />
          </linearGradient>
        </defs>

        {/* ── 1. Forearm Extending from Top Edge ── */}
        <path
          d="M105 0 L175 0 C172 65 168 115 178 160 C155 165 125 165 102 160 C112 115 108 65 105 0 Z"
          fill="url(#topSkinBase)"
        />
        {/* Forearm volume highlight */}
        <path
          d="M125 0 L155 0 C152 65 150 115 156 160 C146 162 134 162 124 160 C130 115 128 65 125 0 Z"
          fill="url(#knuckleLight)"
          opacity="0.45"
        />

        {/* ── 2. Back of Hand & Knuckles Row ── */}
        <g id="handBack">
          <path
            d="M95 155 C78 185 85 225 100 245 C125 258 165 258 185 242 C198 220 202 180 185 155 C155 162 125 162 95 155 Z"
            fill="url(#topSkinBase)"
          />
          {/* Knuckle Domes (Index, Middle, Ring, Pinky) */}
          <ellipse cx="112" cy="242" rx="10" ry="7" fill="url(#knuckleLight)" opacity="0.75" />
          <ellipse cx="138" cy="245" rx="11" ry="8" fill="url(#knuckleLight)" opacity="0.85" />
          <ellipse cx="162" cy="242" rx="10" ry="7" fill="url(#knuckleLight)" opacity="0.75" />
          <ellipse cx="182" cy="235" rx="8" ry="6" fill="url(#knuckleLight)" opacity="0.65" />

          {/* Knuckle Joint Creases */}
          <path d="M105 238 Q112 233 120 238" stroke="#8A4826" strokeWidth="1.2" opacity="0.45" />
          <path d="M130 241 Q138 235 147 241" stroke="#8A4826" strokeWidth="1.3" opacity="0.5" />
          <path d="M155 238 Q162 233 170 238" stroke="#8A4826" strokeWidth="1.2" opacity="0.45" />
          <path d="M176 232 Q182 228 188 232" stroke="#8A4826" strokeWidth="1.0" opacity="0.4" />
        </g>

        {/* ── 3. Index Finger (Downward Clamping) ── */}
        <g id="indexFinger" transform={`translate(112, 245) rotate(${-4 + fingerCurl * 0.4})`}>
          <path
            d={`M-8 0 C-10 25 -10 60 -7 85 C-5 96 6 96 9 85 C12 60 10 25 8 0 Z`}
            fill="url(#topSkinBase)"
          />
          {/* Middle joint */}
          <path d="-7 42 Q0 38 7 42" stroke="#8A4826" strokeWidth="1.2" opacity="0.4" />
          <ellipse cx="0" cy="45" rx="7" ry="5" fill="url(#knuckleLight)" opacity="0.7" />
          {/* Fingernail facing viewer as finger hooks over edge */}
          <path d="M-5 74 C-5 82 5 82 5 74 C4 68 -4 68 -5 74 Z" fill="url(#topNailGrad)" />
        </g>

        {/* ── 4. Middle Finger (Primary Pull Grip) ── */}
        <g id="middleFinger" transform={`translate(138, 248) rotate(${fingerCurl * 0.35})`}>
          <path
            d={`M-9 0 C-11 30 -11 70 -8 98 C-5 110 7 110 10 98 C13 70 12 30 9 0 Z`}
            fill="url(#topSkinBase)"
          />
          <path d="-8 48 Q0 43 8 48" stroke="#8A4826" strokeWidth="1.3" opacity="0.45" />
          <ellipse cx="0" cy="52" rx="8" ry="6" fill="url(#knuckleLight)" opacity="0.75" />
          <path d="M-6 86 C-6 95 6 95 6 86 C5 80 -5 80 -6 86 Z" fill="url(#topNailGrad)" />
        </g>

        {/* ── 5. Ring Finger ── */}
        <g id="ringFinger" transform={`translate(162, 245) rotate(${3 + fingerCurl * 0.38})`}>
          <path
            d={`M-8 0 C-10 26 -10 62 -7 88 C-5 98 6 98 9 88 C11 62 10 26 8 0 Z`}
            fill="url(#topSkinBase)"
          />
          <path d="-7 44 Q0 39 7 44" stroke="#8A4826" strokeWidth="1.2" opacity="0.4" />
          <ellipse cx="0" cy="46" rx="7" ry="5" fill="url(#knuckleLight)" opacity="0.7" />
          <path d="M-5 76 C-5 84 5 84 5 76 C4 70 -4 70 -5 76 Z" fill="url(#topNailGrad)" />
        </g>

        {/* ── 6. Pinky Finger ── */}
        <g id="pinkyFinger" transform={`translate(182, 236) rotate(${8 + fingerCurl * 0.45})`}>
          <path
            d={`M-7 0 C-9 20 -8 48 -5 68 C-3 76 5 76 7 68 C9 48 8 20 6 0 Z`}
            fill="url(#topSkinBase)"
          />
          <path d="-6 34 Q0 30 6 34" stroke="#8A4826" strokeWidth="1.0" opacity="0.35" />
          <ellipse cx="0" cy="36" rx="5" ry="4" fill="url(#knuckleLight)" opacity="0.6" />
          <path d="M-4 58 C-4 65 4 65 4 58 C3 53 -3 53 -4 58 Z" fill="url(#topNailGrad)" />
        </g>

        {/* ── 7. Thumb (Positioned to the left, pinching against fingers) ── */}
        <g id="thumb" transform={`translate(88, 195) rotate(${38 - thumbWrap * 1.5})`}>
          <path
            d={`M0 0 C-15 15 -28 35 -38 55 C-44 66 -35 76 -24 68 C-12 55 4 30 14 12 Z`}
            fill="url(#topSkinBase)"
          />
          <ellipse cx="-20" cy="45" rx="7" ry="5" fill="url(#knuckleLight)" opacity="0.7" />
          <path d="M-36 52 C-38 58 -30 64 -24 58 C-26 52 -32 48 -36 52 Z" fill="url(#topNailGrad)" />
        </g>
      </svg>
    </div>
  );
};
