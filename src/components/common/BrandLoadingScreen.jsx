'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BrandLoadingScreen
 *
 * Full-screen loading experience featuring:
 * 1. Centered "N" emblem + letter-by-letter "Nakoda Imitation" wordmark reveal
 * 2. Minimalist progress bar + curated tagline
 * 3. Smooth FLIP morph/fly transition from center into the top-left navbar logo
 * 4. High-performance GPU-accelerated transform easing (cubic-bezier(0.65, 0, 0.35, 1))
 * 5. Full accessibility (aria-live, aria-busy) and prefers-reduced-motion support
 */
export const BrandLoadingScreen = ({ onLanded, onComplete }) => {
  const [phase, setPhase] = useState('revealing'); // 'revealing' | 'ready' | 'flying' | 'landed' | 'completed'
  const [reducedMotion, setReducedMotion] = useState(false);
  const [transformStyle, setTransformStyle] = useState({});

  const sourceRef = useRef(null);
  const progressRef = useRef(null);

  const brandText = 'Nakoda Imitation';
  const letters = Array.from(brandText);

  // Master safety timeout: ensure loading finishes even on network slowdown
  useEffect(() => {
    const safety = setTimeout(() => {
      if (onLanded) onLanded();
      if (onComplete) onComplete();
      setPhase('completed');
    }, 3800);
    return () => clearTimeout(safety);
  }, [onLanded, onComplete]);

  // Check reduced-motion preference and session state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [onLanded, onComplete]);

  // Ready State Trigger: Smooth 1.4s display floor matching progress bar and letters
  useEffect(() => {
    let isCancelled = false;
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1400));

    const checkReady = new Promise((resolve) => {
      if (typeof document !== 'undefined') {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          const onLoad = () => {
            window.removeEventListener('load', onLoad);
            resolve();
          };
          window.addEventListener('load', onLoad);
          const fallbackTimer = setTimeout(() => {
            window.removeEventListener('load', onLoad);
            resolve();
          }, 1200);
        }
      } else {
        resolve();
      }
    });

    Promise.all([minDelay, checkReady]).then(() => {
      if (isCancelled) return;
      setPhase('ready');
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Orchestrate Morph / Fly Animation once ready
  useEffect(() => {
    if (phase !== 'ready') return;

    const markSessionLoaded = () => {
      try {
        sessionStorage.setItem('nakoda_brand_loaded', 'true');
      } catch (e) {}
    };

    if (reducedMotion) {
      if (onLanded) onLanded();
      const fadeTimer = setTimeout(() => {
        setPhase('landed');
        const doneTimer = setTimeout(() => {
          setPhase('completed');
          markSessionLoaded();
          if (onComplete) onComplete();
        }, 150);
        return () => clearTimeout(doneTimer);
      }, 100);
      return () => clearTimeout(fadeTimer);
    }

    // 1. Give sub-elements 160ms to fade out smoothly before flight
    const prepTimer = setTimeout(() => {
      const sourceEl = sourceRef.current;
      const targetEl = document.getElementById('navbar-brand-logo');

      if (!sourceEl || !targetEl) {
        if (onLanded) onLanded();
        setPhase('landed');
        setTimeout(() => {
          setPhase('completed');
          markSessionLoaded();
          if (onComplete) onComplete();
        }, 200);
        return;
      }

      // 2. Exact bounding box measurements
      const sourceRect = sourceEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const sourceCenterX = sourceRect.left + sourceRect.width / 2;
      const sourceCenterY = sourceRect.top + sourceRect.height / 2;

      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      const deltaX = targetCenterX - sourceCenterX;
      const deltaY = targetCenterY - sourceCenterY;
      const scale = targetRect.height / sourceRect.height;

      // 3. Initiate the Smooth Fly Phase with graceful Apple-spring curve
      setPhase('flying');
      setTransformStyle({
        transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`,
        transition: 'transform 650ms cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: 'center center',
        willChange: 'transform',
      });

      // 4. Landed event when fly animation completes seamlessly
      const flightTimer = setTimeout(() => {
        setPhase('landed');
        if (onLanded) onLanded();

        // 5. Fade out background overlay gracefully and unmount
        const completionTimer = setTimeout(() => {
          setPhase('completed');
          markSessionLoaded();
          if (onComplete) onComplete();
        }, 350);

        return () => clearTimeout(completionTimer);
      }, 650);

      return () => clearTimeout(flightTimer);
    }, 160);

    return () => clearTimeout(prepTimer);
  }, [phase, reducedMotion, onLanded, onComplete]);

  if (phase === 'completed') return null;

  const isHidingSubDetails = phase === 'ready' || phase === 'flying' || phase === 'landed';

  return (
    <div
      id="brand-loading-screen"
      role="status"
      aria-live="polite"
      aria-busy={phase !== 'landed'}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none transition-opacity duration-400 ease-out ${
        phase === 'landed' ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      } bg-[#FBFBFD]`}
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, #F5F5F7 100%)',
      }}
    >
      <span className="sr-only">Loading Nakoda Imitation...</span>

      {/* Centered Brand Unit: Icon + Wordmark (The Morph Element) */}
      <div
        ref={sourceRef}
        style={transformStyle}
        className="flex items-center gap-3 sm:gap-4.5 p-2 rounded-3xl"
      >
        {/* Large Rounded-Square Brand Icon */}
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[26px] bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl tracking-wider shadow-2xl shrink-0">
          N
        </div>

        {/* Brand Wordmark (Letter-by-letter reveal) */}
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F] leading-tight flex overflow-hidden whitespace-nowrap">
            {letters.map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.032,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </h1>
        </div>
      </div>

      {/* Sub-elements: Minimal Progress Bar & Tagline (Fades out before flight) */}
      <div
        className={`flex flex-col items-center transition-all duration-200 ${
          isHidingSubDetails ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Sleek Minimal Progress Line */}
        <div className="w-36 sm:w-48 h-[2.5px] bg-black/[0.07] rounded-full overflow-hidden mt-6 sm:mt-7">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: 1.35,
              ease: [0.45, 0, 0.15, 1],
            }}
            className="h-full bg-[#1D1D1F] rounded-full"
          />
        </div>

        {/* Muted Premium Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          className="text-[11px] sm:text-xs text-[#86868B] font-normal tracking-wide mt-3"
        >
          Curated with premium care...
        </motion.p>
      </div>
    </div>
  );
};

export default BrandLoadingScreen;
