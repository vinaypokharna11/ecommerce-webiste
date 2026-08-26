'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ShoppingBag, PhoneCall } from 'lucide-react';
import './PillNav.css';

/**
 * PillNav Component from React Bits
 * Integrated with the website's signature lime green (#9FD842) palette
 * and slow, luxurious GSAP micro-animations.
 */
const PillNav = ({
  logo,
  logoText = 'Nakoda Imitation',
  logoAlt = 'Logo',
  items = [],
  activeHref,
  onItemClick,
  className = '',
  ease = 'power2.out',
  baseColor = '#9FD842',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#171717',
  pillTextColor = '#171717',
  onMobileMenuClick,
  initialLoadAnimation = true,
}) => {
  const resolvedPillTextColor = pillTextColor ?? '#171717';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector('.pill-label');
        const hoverLabel = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 14, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        // Slow, elegant, silky smooth animation curve
        tl.to(
          circle,
          { scale: 1.25, xPercent: -50, duration: 1.2, ease, overwrite: 'auto' },
          0
        );

        if (label) {
          tl.to(
            label,
            { y: -(h + 10), duration: 1.1, ease, overwrite: 'auto' },
            0
          );
        }

        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 8), opacity: 0 });
          tl.to(
            hoverLabel,
            { y: 0, opacity: 1, duration: 1.1, ease, overwrite: 'auto' },
            0.05
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItemsEl = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0.85, opacity: 0 });
        gsap.to(logoEl, {
          scale: 1,
          opacity: 1,
          duration: 1.25,
          ease: 'power2.out',
        });
      }

      if (navItemsEl) {
        gsap.set(navItemsEl, { opacity: 0, y: -12 });
        gsap.to(navItemsEl, {
          opacity: 1,
          y: 0,
          duration: 1.25,
          delay: 0.25,
          ease: 'power2.out',
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 1.0,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLeave = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.9,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 1.2,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3.5, duration: 0.4, ease: 'power2.out' });
        gsap.to(lines[1], { rotation: -45, y: -3.5, duration: 0.4, ease: 'power2.out' });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.4, ease: 'power2.out' });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.4, ease: 'power2.out' });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: -10, scaleY: 0.96 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.4,
            ease: 'power2.out',
            transformOrigin: 'top center',
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: -10,
          scaleY: 0.96,
          duration: 0.3,
          ease: 'power2.in',
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          },
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoveredPillTextColor,
    ['--pill-text']: resolvedPillTextColor,
  };

  return (
    <div className="pill-nav-container">
      <nav className={`pill-nav ${className}`} aria-label="Primary Navigation" style={cssVars}>
        {/* Brand Logo Pill with Website Green theme */}
        <button
          className="pill-logo"
          onClick={() => onItemClick && onItemClick('home', 'ShopEase Home')}
          aria-label="Home"
          onMouseEnter={handleLogoEnter}
          ref={logoRef}
        >
          <div className="pill-logo-icon" ref={logoImgRef}>
            {logo ? (
              <img src={logo} alt={logoAlt} className="w-full h-full object-contain p-1" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </div>
          <span className="pill-logo-text">{logoText}</span>
        </button>

        {/* Desktop Animated Navigation Items */}
        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => {
              const isActive = activeHref === item.id || activeHref === item.href;
              const Icon = item.icon;

              return (
                <li key={item.id || item.href || `item-${i}`} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className={`pill${isActive ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                    onClick={() => {
                      if (onItemClick) {
                        onItemClick(item.id || item.href, item.label);
                      }
                    }}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={(el) => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        <span>{item.label}</span>
                        {item.badge != null && item.badge > 0 && (
                          <span className="pill-badge">{item.badge}</span>
                        )}
                      </span>
                      <span className="pill-label-hover" aria-hidden="true">
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        <span>{item.label}</span>
                        {item.badge != null && item.badge > 0 && (
                          <span className="pill-badge">{item.badge}</span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Help Button (as shown in reference design) */}
        <button
          type="button"
          className="pill-help-btn desktop-only"
          onClick={() => onItemClick && onItemClick('contact', 'Contact Us')}
          aria-label="Help and Support"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#171717]" />
          <span>Help</span>
        </button>

        {/* Mobile Menu Hamburger Button */}
        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      {/* Mobile Animated Dropdown Popover */}
      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list">
          {items.map((item, i) => {
            const isActive = activeHref === item.id || activeHref === item.href;
            const Icon = item.icon;

            return (
              <li key={item.id || item.href || `mobile-item-${i}`}>
                <button
                  type="button"
                  className={`mobile-menu-link${isActive ? ' is-active' : ''}`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onItemClick) {
                      onItemClick(item.id || item.href, item.label);
                    }
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="pill-badge">{item.badge}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
