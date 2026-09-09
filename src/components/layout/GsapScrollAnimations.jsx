'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function GsapScrollAnimations({ children }) {
  const containerRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;

    let ctx = null;
    let isMounted = true;

    async function initAnimations() {
      try {
        const { default: gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        if (!isMounted) return;

        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          // 1. Single reveal items (fade up smoothly)
          const revealItems = gsap.utils.toArray('.gsap-reveal');
          revealItems.forEach((el) => {
            gsap.fromTo(
              el,
              { opacity: 0, y: 35 },
              {
                opacity: 1,
                y: 0,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 88%',
                  toggleActions: 'play none none none',
                },
              }
            );
          });

          // 2. Staggered card containers (Category grids, benefits, product showcases)
          const staggerContainers = gsap.utils.toArray('.gsap-stagger-cards');
          staggerContainers.forEach((container) => {
            const cards = container.children;
            if (cards && cards.length > 0) {
              gsap.fromTo(
                cards,
                { opacity: 0, y: 30, scale: 0.96 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.65,
                  stagger: 0.08,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: container,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                  },
                }
              );
            }
          });

          // 3. Parallax sections (PromoBanner, Hero accents)
          const parallaxItems = gsap.utils.toArray('.gsap-parallax');
          parallaxItems.forEach((el) => {
            gsap.fromTo(
              el,
              { y: -20 },
              {
                y: 25,
                ease: 'none',
                scrollTrigger: {
                  trigger: el,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1.2,
                },
              }
            );
          });
        }, containerRef);

        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 200);
      } catch (err) {}
    }

    initAnimations();

    return () => {
      isMounted = false;
      if (ctx) ctx.revert();
    };
  }, [pathname]);

  return <div ref={containerRef} className="contents">{children}</div>;
}

export default GsapScrollAnimations;
