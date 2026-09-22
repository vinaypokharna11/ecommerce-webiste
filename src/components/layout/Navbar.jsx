'use client';

// ============================================================
// IMPORTS
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
import { useAuth } from '@/context/AuthContext';

/**
 * Navbar
 *
 * Floating header with navigation tabs, responsive mobile drawer,
 * direct WhatsApp support link, and shopping bag counter.
 */
export const Navbar = ({
  cartCount: propCartCount = 0,
  wishlistCount: propWishlistCount = 0,
  activeTab = 'home',
  onNavClick,
  onExploreClick,
  user: propUser,
  isLogoHidden = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;

  // Fallback counters if rendered on standalone routes without props
  const [localCartCount, setLocalCartCount] = useState(propCartCount);
  const [localWishlistCount, setLocalWishlistCount] = useState(propWishlistCount);

  useEffect(() => {
    setLocalCartCount(propCartCount);
  }, [propCartCount]);

  useEffect(() => {
    setLocalWishlistCount(propWishlistCount);
  }, [propWishlistCount]);

  // Read client-side storage for cart/wishlist count if not passed as prop
  useEffect(() => {
    if (propCartCount === 0 && typeof window !== 'undefined') {
      try {
        const userId = currentUser?.id || currentUser?._id || currentUser?.email;
        const savedCart = userId
          ? localStorage.getItem(`nakoda_cart_${userId}`) || localStorage.getItem('nakoda_cart_v2')
          : localStorage.getItem('nakoda_cart_v2');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          const count = Object.values(parsed).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
          if (count > 0) setLocalCartCount(count);
        }
      } catch (e) {}
    }
  }, [propCartCount, currentUser]);

  const cartCount = propCartCount || localCartCount;
  const wishlistCount = propWishlistCount || localWishlistCount;
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
  const handlePrefetch = (id) => {
    try {
      const targetUrl = id === 'home' ? '/' : `/?tab=${id}`;
      router.prefetch(targetUrl);
    } catch (e) {}
  };

  const handleLinkClick = (id, label) => {
    setIsVisible(true);
    setIsMobileMenuOpen(false);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('nakoda:scroll-to-top'));
    }

    // If on homepage and onNavClick is provided, switch tabs in-place
    if (pathname === '/' && onNavClick) {
      onNavClick(id, label);
      return;
    }

    // Universal navigation fallback for all pages and routes
    const targetUrl = id === 'home' ? '/' : `/?tab=${id}`;
    router.push(targetUrl);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim() && onExploreClick) {
      onExploreClick('all');
      setSearchOpen(false);
    }
  };

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
            onMouseEnter={() => handlePrefetch('home')}
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
                  onMouseEnter={() => handlePrefetch(item.id)}
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
              onMouseEnter={() => handlePrefetch('profile')}
              className={`hidden xl:flex w-10 h-10 sm:w-11 sm:h-11 rounded-full items-center justify-center transition-colors cursor-pointer ${activeTab === 'profile'
                ? 'bg-[#1D1D1F] text-white'
                : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                }`}
              aria-label="User Account Profile"
              title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign In / Account'}
            >
              <User className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => handleLinkClick('wishlist', 'Wishlist')}
              onMouseEnter={() => handlePrefetch('wishlist')}
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
              onMouseEnter={() => handlePrefetch('cart')}
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

      {/* Mobile Animated Dropdown Drawer & Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay for outside tap */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-xs z-35 lg:hidden"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`fixed inset-x-0 ${scrolled ? 'top-[49px] xs:top-[54px] sm:top-[60px]' : 'top-[56px] xs:top-[62px] sm:top-[82px]'
                } z-40 bg-white/95 backdrop-blur-2xl border-b border-black/[0.08] shadow-xl lg:hidden p-4 sm:p-5 space-y-3 max-h-[calc(100vh-60px)] overflow-y-auto`}
            >
              {/* Mobile User Profile Link */}
              <div
                onClick={() => handleLinkClick('profile', 'Profile')}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] cursor-pointer active:scale-[0.99] transition-transform min-h-[48px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-[#1D1D1F] block truncate">
                      {currentUser ? currentUser.name : 'Account Profile'}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#86868B] block truncate">
                      {currentUser ? currentUser.email : 'Sign in to track orders'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-[#1D1D1F] border border-black/5 shrink-0 shadow-xs">
                  {currentUser ? 'View' : 'Sign In'}
                </span>
              </div>

              {/* Mobile Wishlist Link */}
              <div
                onClick={() => handleLinkClick('wishlist', 'Wishlist')}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] cursor-pointer active:scale-[0.99] transition-transform min-h-[48px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <Heart className="w-4.5 h-4.5" fill={wishlistCount > 0 ? 'currentColor' : 'none'} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-[#1D1D1F] block truncate">
                      Saved Wishlist
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#86868B] block truncate">
                      {wishlistCount} {wishlistCount === 1 ? 'item saved' : 'items saved'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-[#1D1D1F] border border-black/5 shrink-0 shadow-xs">
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
                      className={`min-h-[44px] py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-medium text-left transition-all flex items-center cursor-pointer ${isActive
                        ? 'bg-[#1D1D1F] text-white font-semibold shadow-xs'
                        : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] active:bg-[#dedee3]'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
