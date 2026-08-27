'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollExpand.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ScrollExpand = ({
  src = '',
  mediaType = 'image',
  poster = '',
  alt = '',
  title = '',
  scrollHint = '',
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 0.8,
  holdDistance = 0.1,
  smoothing = 1.2,
  overlayScrim = 0.45,
  useWindowScroll = true,
  enabled = true,
  reverse = false,
  children,
  className = '',
  style,
  ...rest
}) => {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const mediaRef = useRef(null);
  const titleRef = useRef(null);
  const overlayRef = useRef(null);
  const scrimRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const track = trackRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!track || !stage || !frame) return;

    // Register plugin safely
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia(rootRef);

    // Desktop/Tablet (>= 768px): Full scroll expand/shrink animation
    mm.add('(min-width: 768px)', () => {
      // Set initial clip-path
      if (reverse) {
        // Reverse mode: starts at 100% full screen, shrinks to startWidth/startHeight
        frame.style.clipPath = `inset(0% 0% 0% 0% round ${endRadius}px)`;
      } else {
        // Standard mode: starts at startWidth/startHeight, expands to 100%
        const ix = Math.max(0, (100 - startWidth) / 2);
        const iy = Math.max(0, (100 - startHeight) / 2);
        frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${startRadius}px)`;
      }

      const progressState = { progress: 0 };
      const scrollSpan = () => Math.max(300, window.innerHeight * scrollDistance);

      const st = ScrollTrigger.create({
        trigger: track,
        start: 'top top',
        end: () => `+=${scrollSpan()}`,
        pin: stage,
        pinSpacing: true,
        scrub: typeof smoothing === 'number' ? smoothing : 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress; // 0 to 1
          progressState.progress = p;

          // Compute effective expansion factor e (0 = small resting box, 1 = full screen)
          const e = reverse ? 1 - p : p;

          const w = startWidth + (100 - startWidth) * e;
          const h = startHeight + (100 - startHeight) * e;
          const ix = Math.max(0, (100 - w) / 2);
          const iy = Math.max(0, (100 - h) / 2);
          const r = reverse
            ? endRadius + (startRadius - endRadius) * p
            : startRadius + (endRadius - startRadius) * p;

          frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

          if (mediaRef.current) {
            const scale = mediaZoom + (1 - mediaZoom) * e;
            mediaRef.current.style.transform = `scale(${scale})`;
          }

          if (scrimRef.current) {
            scrimRef.current.style.opacity = `${overlayScrim * e}`;
          }

          if (hintRef.current) {
            hintRef.current.style.opacity = `${Math.max(0, 1 - p * 2.5)}`;
            hintRef.current.style.transform = `translate3d(0, ${p * 15}px, 0)`;
          }

          if (titleRef.current) {
            if (reverse) {
              titleRef.current.style.opacity = `${Math.max(0, 1 - p * 2)}`;
            } else {
              const out = Math.min(1, Math.max(0, (p - 0.4) / 0.48));
              titleRef.current.style.opacity = `${1 - out}`;
              titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0)`;
            }
          }

          if (overlayRef.current && !reverse) {
            const inn = Math.min(1, Math.max(0, (p - 0.68) / 0.32));
            overlayRef.current.style.opacity = `${inn}`;
            overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
          }
        },
      });

      return () => {
        if (st) st.kill();
      };
    });

    // Mobile (< 768px): Keep full size, do NOT decrease size of hero section
    mm.add('(max-width: 767px)', () => {
      frame.style.clipPath = 'none';
      if (hintRef.current) {
        hintRef.current.style.display = 'none';
      }
    });

    return () => {
      mm.revert();
    };
  }, [
    enabled,
    reverse,
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    smoothing,
    overlayScrim,
  ]);

  const media = src ? (
    mediaType === 'video' ? (
      <video
        ref={mediaRef}
        className="scroll-expand__media"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />
    ) : (
      <img ref={mediaRef} className="scroll-expand__media" src={src} alt={alt} draggable={false} />
    )
  ) : null;

  return (
    <div
      ref={rootRef}
      className={`scroll-expand ${className}`.trim()}
      style={style}
      {...rest}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {media}
            {src && <div ref={scrimRef} className="scroll-expand__scrim" />}
            {children ? (
              <div ref={overlayRef} className="scroll-expand__overlay">
                {children}
              </div>
            ) : null}
          </div>
          {title ? (
            <div ref={titleRef} className="scroll-expand__title">
              {title}
            </div>
          ) : null}
          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ScrollExpand;
