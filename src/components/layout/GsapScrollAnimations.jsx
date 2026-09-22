'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

let gsapPromise = null;
function loadGsap() {
  if (!gsapPromise) {
    gsapPromise = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]).then(([gsapModule, stModule]) => {
      const gsap = gsapModule.default || gsapModule;
      const ScrollTrigger = stModule.ScrollTrigger || stModule.default;
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    });
  }
  return gsapPromise;
}

export function GsapScrollAnimations({ children }) {
  const containerRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;

    let ctx = null;
    let isMounted = true;

    // Check if any GSAP target classes exist in container before loading library
    const container = containerRef.current;
    if (!container) return;

    const hasTargets = container.querySelector('.gsap-reveal, .gsap-stagger-cards, .gsap-parallax');
    if (!hasTargets) return;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (!isMounted || !containerRef.current) return;

      ctx = gsap.context(() => {
        const vh = window.innerHeight || 800;

        // 1. Single reveal items (only animate elements below the initial viewport)
        const revealItems = gsap.utils.toArray('.gsap-reveal');
        revealItems.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < vh) {
            // Element is already visible above the fold: ensure opacity 1 without jank
            gsap.set(el, { opacity: 1, y: 0 });
          } else {
            // Element is below the fold: animate in when scrolled into view
            gsap.fromTo(
              el,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 92%',
                  toggleActions: 'play none none none',
                },
              }
            );
          }
        });

        // 2. Staggered card containers
        const staggerContainers = gsap.utils.toArray('.gsap-stagger-cards');
        staggerContainers.forEach((c) => {
          const cards = c.children;
          if (cards && cards.length > 0) {
            const rect = c.getBoundingClientRect();
            if (rect.top < vh) {
              gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
            } else {
              gsap.fromTo(
                cards,
                { opacity: 0, y: 25, scale: 0.98 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.5,
                  stagger: 0.05,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: c,
                    start: 'top 90%',
                    toggleActions: 'play none none none',
                  },
                }
              );
            }
          }
        });

        // 3. Parallax sections
        const parallaxItems = gsap.utils.toArray('.gsap-parallax');
        parallaxItems.forEach((el) => {
          gsap.fromTo(
            el,
            { y: -15 },
            {
              y: 20,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.0,
              },
            }
          );
        });
      }, containerRef);
    }).catch(() => {});

    return () => {
      isMounted = false;
      if (ctx) ctx.revert();
    };
  }, [pathname]);

  return <div ref={containerRef} className="contents">{children}</div>;
}

export default GsapScrollAnimations;
