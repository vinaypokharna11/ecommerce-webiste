'use client';

// ============================================================
// IMPORTS
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Sparkles,
  PhoneCall,
  LayoutGrid,
  Home,
  ArrowRight
} from 'lucide-react';
import { STORE_CONFIG, NAV_ITEMS } from '@/data/mockData';
import { createHelpWhatsAppUrl } from '@/utils/whatsapp';

/**
 * WhatsAppIcon
 * Lightweight inline SVG representation of the WhatsApp brand icon,
 * eliminating the heavy react-icons dependency.
 */
function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 448 512" width="18" height="18" fill="currentColor" className={className} aria-hidden="true">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

/**
 * Navbar
 *
 * Floating header with navigation tabs, responsive mobile drawer,
 * direct WhatsApp support link, and shopping bag counter.
 */
export const Navbar = ({
  cartCount = 0,
  wishlistCount = 0,
  activeTab = 'home',
  onNavClick,
  onExploreClick,
  user,
  isLogoHidden = false,
}) => {
  // ============================================================
  // STATE
  // ============================================================
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const restTimerRef = useRef(null);
  const isHoveredRef = useRef(false);
  const isMobileMenuOpenRef = useRef(false);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    isMobileMenuOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  // ============================================================
  // SCROLL & REST AUTO-HIDE DETECTION (3s Inactivity)
  // ============================================================
  useEffect(() => {
    const clearRestTimer = () => {
      if (restTimerRef.current) {
        clearTimeout(restTimerRef.current);
        restTimerRef.current = null;
      }
    };

    const startRestTimer = () => {
      clearRestTimer();
      // If hovering or mobile menu is open, do not auto-hide
      if (isMobileMenuOpenRef.current || isHoveredRef.current) return;

      // Only auto-hide after resting if scrolled down past the top zone
      if (window.scrollY > 30) {
        restTimerRef.current = setTimeout(() => {
          if (!isMobileMenuOpenRef.current && !isHoveredRef.current && window.scrollY > 30) {
            setIsVisible(false);
          }
        }, 3000);
      }
    };

    const handleScrollOrActivity = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // Scrolling or user activity brings navbar immediately into view
      setIsVisible(true);

      if (currentScrollY <= 30) {
        clearRestTimer();
      } else {
        startRestTimer();
      }
    };

    const handleMouseMove = (e) => {
      // Reveal navbar when cursor moves to the top edge (within 70px)
      if (e.clientY <= 70) {
        setIsVisible(true);
        startRestTimer();
      }
    };

    window.addEventListener('scroll', handleScrollOrActivity, { passive: true });
    window.addEventListener('wheel', handleScrollOrActivity, { passive: true });
    window.addEventListener('touchmove', handleScrollOrActivity, { passive: true });
    window.addEventListener('touchstart', handleScrollOrActivity, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      clearRestTimer();
      window.removeEventListener('scroll', handleScrollOrActivity);
      window.removeEventListener('wheel', handleScrollOrActivity);
      window.removeEventListener('touchmove', handleScrollOrActivity);
      window.removeEventListener('touchstart', handleScrollOrActivity);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // When hover state or mobile menu opens/closes, adjust rest timer
  useEffect(() => {
    if (isHovered || isMobileMenuOpen) {
      if (restTimerRef.current) {
        clearTimeout(restTimerRef.current);
        restTimerRef.current = null;
      }
      setIsVisible(true);
    } else if (typeof window !== 'undefined' && window.scrollY > 30) {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
      restTimerRef.current = setTimeout(() => {
        if (!isHoveredRef.current && !isMobileMenuOpenRef.current && window.scrollY > 30) {
          setIsVisible(false);
        }
      }, 3000);
    }
  }, [isHovered, isMobileMenuOpen]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleLinkClick = (id, label) => {
    setIsVisible(true);
    if (onNavClick) onNavClick(id, label);
    setIsMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim() && onExploreClick) {
      onExploreClick('all');
      setSearchOpen(false);
    }
  };

  const whatsappUrl = createHelpWhatsAppUrl(STORE_CONFIG.whatsappNumber);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full pointer-events-none'
          } ${scrolled
            ? 'bg-white/85 backdrop-blur-xl border-b border-black/[0.06] shadow-sm py-2.5 sm:py-3.5'
            : 'bg-[#FBFBFD]/90 backdrop-blur-md border-b border-black/[0.04] py-2.5 xs:py-3 sm:py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 flex items-center justify-between gap-2 sm:gap-5">

          {/* Logo & Brand Identity */}
          <button
            id="navbar-brand-logo"
            onClick={() => handleLinkClick('home', 'Home')}
            className={`flex items-center gap-2 sm:gap-2.5 group text-left cursor-pointer focus:outline-none min-w-0 shrink transition-opacity duration-300 ${isLogoHidden ? 'opacity-0' : 'opacity-100'
              }`}
            aria-label="Go to Nakoda Store Home"
          >
            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-sm xs:text-lg sm:text-lg tracking-wider shadow-sm group-hover:scale-105 transition-transform shrink-0">
              N
            </div>
            <span className="text-sm xs:text-base sm:text-lg font-bold tracking-tight text-[#1D1D1F] leading-tight truncate">
              {STORE_CONFIG.name}
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F5F5F7] p-1.5 rounded-full border border-black/[0.04] shrink-0">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id, item.label)}
                  className={`relative px-3.5 xl:px-5 py-2 rounded-full text-xs xl:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${isActive
                    ? 'text-[#1D1D1F] font-semibold'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Search, WhatsApp, Profile, Cart, Hamburger */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 xl:gap-3 shrink-0">

            {/* Profile Button (Visible on extra-large desktop screens; accessible via nav pill or drawer) */}
            <button
              onClick={() => handleLinkClick('profile', 'Profile')}
              className={`hidden xl:flex w-10 h-10 sm:w-11 sm:h-11 rounded-full items-center justify-center transition-colors cursor-pointer ${activeTab === 'profile'
                ? 'bg-[#1D1D1F] text-white'
                : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                }`}
              aria-label="User Account Profile"
              title={user ? `Signed in as ${user.name}` : 'Sign In / Account'}
            >
              <User className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => handleLinkClick('wishlist', 'Wishlist')}
              className={`flex w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full items-center justify-center transition-colors cursor-pointer relative ${
                activeTab === 'wishlist'
                  ? 'bg-rose-500 text-white ring-2 ring-rose-300'
                  : wishlistCount > 0
                  ? 'bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-100'
                  : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
              }`}
              aria-label="Wishlist"
              title={`Wishlist (${wishlistCount})`}
            >
              <Heart
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5"
                fill={activeTab === 'wishlist' || wishlistCount > 0 ? 'currentColor' : 'none'}
              />
              {wishlistCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                    activeTab === 'wishlist' ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'
                  }`}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Button with Pill */}
            <button
              onClick={() => handleLinkClick('cart', 'Cart')}
              className="relative h-8 xs:h-9 sm:h-10 lg:h-11 px-2.5 xs:px-3.5 sm:px-4 lg:px-5 rounded-full bg-[#1D1D1F] hover:bg-[#000000] text-white flex items-center gap-1.5 sm:gap-2.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5" />
              <span className="text-xs sm:text-sm font-semibold">{cartCount}</span>
            </button>


            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Spacer to preserve document layout since header is fixed */}
      <div className="w-full shrink-0 h-[56px] xs:h-[62px] sm:h-[82px]" aria-hidden="true" />

      {/* Mobile Animated Dropdown Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-x-0 ${scrolled ? 'top-[49px] xs:top-[54px] sm:top-[60px]' : 'top-[56px] xs:top-[62px] sm:top-[82px]'
              } z-40 bg-white/95 backdrop-blur-2xl border-b border-black/[0.08] shadow-xl md:hidden p-4 sm:p-5 space-y-3 max-h-[calc(100vh-60px)] overflow-y-auto`}
          >
            {/* Mobile User Profile Link */}
            <div
              onClick={() => handleLinkClick('profile', 'Profile')}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#1D1D1F] block truncate">
                    {user ? user.name : 'Account Profile'}
                  </span>
                  <span className="text-[10px] text-[#86868B] block truncate">
                    {user ? user.email : 'Sign in to track orders'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-[#1D1D1F] border border-black/5 shrink-0 shadow-xs">
                {user ? 'View' : 'Sign In'}
              </span>
            </div>

            {/* Mobile Wishlist Link */}
            <div
              onClick={() => handleLinkClick('wishlist', 'Wishlist')}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" fill={wishlistCount > 0 ? 'currentColor' : 'none'} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#1D1D1F] block truncate">
                    Saved Wishlist
                  </span>
                  <span className="text-[10px] text-[#86868B] block truncate">
                    {wishlistCount} {wishlistCount === 1 ? 'item saved' : 'items saved'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-[#1D1D1F] border border-black/5 shrink-0 shadow-xs">
                View
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleLinkClick(item.id, item.label)}
                    className={`py-3 px-4 rounded-xl text-xs font-medium text-left transition-all ${isActive
                      ? 'bg-[#1D1D1F] text-white font-semibold shadow-xs'
                      : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#86868B]">
              <span>Delivery across India</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] font-medium flex items-center gap-1"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp Order</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
