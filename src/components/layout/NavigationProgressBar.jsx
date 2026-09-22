'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationProgressBar
 *
 * Ultra-lightweight (0-dependency) top progress bar that provides instant visual
 * feedback (<20ms) during route changes, tab switches, and internal link clicks.
 */
function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);
  const finishTimerRef = useRef(null);

  const start = () => {
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setIsVisible(true);
    setProgress(25);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(timerRef.current);
          return 85;
        }
        return prev + (prev < 60 ? 15 : 5);
      });
    }, 120);
  };

  const complete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    finishTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 200);
  };

  // Complete progress whenever route or query changes
  useEffect(() => {
    complete();
  }, [pathname, searchParams]);

  // Listen to custom navigation events and link clicks
  useEffect(() => {
    const handleStart = () => start();
    const handleComplete = () => complete();

    window.addEventListener('nakoda:nav-start', handleStart);
    window.addEventListener('nakoda:nav-complete', handleComplete);

    // Intercept clicks on links that trigger client routing
    const handleClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href && !anchor.target && !anchor.hasAttribute('download')) {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          start();
        }
      }
    };

    document.addEventListener('click', handleClick, { passive: true });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      window.removeEventListener('nakoda:nav-start', handleStart);
      window.removeEventListener('nakoda:nav-complete', handleComplete);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] pointer-events-none transition-opacity duration-200"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div
        className="h-full bg-gradient-to-r from-[#0071E3] via-[#4396F7] to-[#0071E3] transition-all duration-200 ease-out shadow-[0_0_8px_rgba(0,113,227,0.6)]"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

export function NavigationProgressBar() {
  return (
    <React.Suspense fallback={null}>
      <ProgressBarInner />
    </React.Suspense>
  );
}

export default NavigationProgressBar;
