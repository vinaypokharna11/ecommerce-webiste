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
    let tickerFn = null;
    let isMounted = true;

    async function initScroll() {
      if (!isMounted) return;

      lenis = new Lenis({
        duration: 0.9,
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

      try {
        const { default: gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        if (!isMounted) return;

        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);

        tickerFn = (time) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(tickerFn);
        gsap.ticker.lagSmoothing(0);

        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 150);
      } catch (e) {
        let rafId;
        function fallbackRaf(time) {
          lenis?.raf(time);
          rafId = requestAnimationFrame(fallbackRaf);
        }
        rafId = requestAnimationFrame(fallbackRaf);
      }
    }

    initScroll();

    return () => {
      isMounted = false;
      if (tickerFn) {
        import('gsap').then(({ default: gsap }) => {
          gsap.ticker.remove(tickerFn);
        }).catch(() => {});
      }
      if (lenis) {
        lenis.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  // Scroll to top and refresh ScrollTrigger on route changes
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    const timer = setTimeout(() => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh();
      }).catch(() => {});
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <SmoothScrollContext.Provider value={lenisRef.current}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export default SmoothScrollProvider;
