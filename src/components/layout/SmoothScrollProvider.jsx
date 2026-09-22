'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

const SmoothScrollContext = createContext(null);

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    let lenis = null;
    let rafId = null;
    let isMounted = true;

    try {
      lenis = new Lenis({
        duration: 0.85,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0,
        syncTouch: false,
        infinite: false,
      });

      lenisRef.current = lenis;
      if (typeof window !== 'undefined') {
        window.__lenis = lenis;
      }

      function onRaf(time) {
        if (!isMounted || !lenis) return;
        lenis.raf(time);
        rafId = requestAnimationFrame(onRaf);
      }
      rafId = requestAnimationFrame(onRaf);
    } catch (e) {
      console.warn('Lenis smooth scroll failed to initialize', e);
    }

    return () => {
      isMounted = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (lenis) {
        if (typeof window !== 'undefined' && window.__lenis === lenis) {
          window.__lenis = null;
        }
        lenis.destroy();
        lenisRef.current = null;
      }
    };
  }, [isAdmin]);

  // Clean, debounced scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  // Instant scroll-to-top handler for tab switches & popstate navigation
  useEffect(() => {
    let resetTimer = null;
    const handleScrollToTop = () => {
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(0, { immediate: true });
        }
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      }, 10);
    };

    window.addEventListener('nakoda:scroll-to-top', handleScrollToTop, { passive: true });
    return () => {
      if (resetTimer) clearTimeout(resetTimer);
      window.removeEventListener('nakoda:scroll-to-top', handleScrollToTop);
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={lenisRef.current}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export default SmoothScrollProvider;
