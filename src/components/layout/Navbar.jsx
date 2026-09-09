'use client';

// ============================================================
// IMPORTS
// ============================================================
import React, { useState, useEffect } from 'react';
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
    <svg viewBox="0 0 448 512" fill="currentColor" className={className} aria-hidden="true">
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // ============================================================
  // SCROLL DETECTION
  // ============================================================
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleLinkClick = (id, label) => {
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
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-black/[0.06] shadow-sm py-2.5'
          : 'bg-[#FBFBFD]/90 backdrop-blur-md border-b border-black/[0.04] py-3.5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">

          {/* Logo & Brand Identity */}
          <button
            id="navbar-brand-logo"
            onClick={() => handleLinkClick('home', 'Home')}
            className={`flex items-center gap-2 sm:gap-2.5 group text-left cursor-pointer focus:outline-none min-w-0 transition-opacity duration-300 ${isLogoHidden ? 'opacity-0' : 'opacity-100'
              }`}
            aria-label="Go to Nakoda Store Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-sm sm:text-white tracking-wider shadow-sm group-hover:scale-105 transition-transform shrink-0">
              N
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-[#1D1D1F] leading-tight whitespace-nowrap">
              {STORE_CONFIG.name}
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-full border border-black/[0.04]">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id, item.label)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${isActive
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
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* Profile Button (Hidden on extra small mobile to save space, accessible in mobile drawer) */}
            <button
              onClick={() => handleLinkClick('profile', 'Profile')}
              className={`hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center transition-colors cursor-pointer ${activeTab === 'profile'
                ? 'bg-[#1D1D1F] text-white'
                : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                }`}
              aria-label="User Account Profile"
              title={user ? `Signed in as ${user.name}` : 'Sign In / Account'}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => handleLinkClick('cart', 'Cart')}
              className={`hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center transition-colors cursor-pointer relative ${wishlistCount > 0 ? 'bg-rose-50 text-rose-500 border border-rose-200' : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                }`}
              aria-label="Wishlist"
              title={`Wishlist (${wishlistCount})`}
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={wishlistCount > 0 ? 'currentColor' : 'none'} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* WhatsApp Direct Chat */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] flex items-center justify-center transition-all cursor-pointer shrink-0"
              aria-label="WhatsApp Us"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>

            {/* Shopping Bag Button with Pill */}
            <button
              onClick={() => handleLinkClick('cart', 'Cart')}
              className="relative px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#1D1D1F] hover:bg-[#000000] text-white flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs font-semibold">{cartCount}</span>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center transition-colors shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Animated Dropdown Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[56px] sm:top-[60px] z-40 bg-white/95 backdrop-blur-2xl border-b border-black/[0.08] shadow-xl md:hidden p-4 sm:p-5 space-y-3 max-h-[calc(100vh-60px)] overflow-y-auto"
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
