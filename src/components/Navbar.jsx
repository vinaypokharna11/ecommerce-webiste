'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  LayoutGrid, 
  Sparkles, 
  ShoppingCart, 
  User, 
  ShoppingBag, 
  PhoneCall
} from 'lucide-react';

export const Navbar = ({ cartCount = 0, onNavClick, activeTab = 'home', user = null }) => {
  const profileLabel = user ? (user.name ? user.name.split(' ')[0] : 'Profile') : 'Profile';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'catalog', label: 'Catalog', icon: LayoutGrid },
    { id: 'offers', label: 'Offers', icon: Sparkles },
    { id: 'contact', label: 'Contact Us', icon: PhoneCall },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'profile', label: profileLabel, icon: User },
  ];

  return (
    <>
      {/* Desktop Floating Pill Navbar */}
      <header className="fixed top-4 left-0 right-0 z-40 px-4 sm:px-6 max-w-5xl mx-auto hidden md:block">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass-nav rounded-full px-5 py-2 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-white/90"
          aria-label="Main Navigation"
        >
          {/* Brand Logo */}
          <a 
            href="#" 
            className="flex items-center gap-2.5 group focus:outline-none rounded-full px-1 py-0.5"
            onClick={(e) => {
              e.preventDefault();
              if (onNavClick) onNavClick('home', 'Nakoda Imitation');
            }}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#171717] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#171717]">
              Nakoda Imitation
            </span>
          </a>

          {/* Navigation Items Pill */}
          <div className="flex items-center gap-1 bg-[#EEEEEF]/70 p-1.5 rounded-full border border-black/5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isCart = item.id === 'cart';
              const displayCount = isCart ? cartCount : null;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavClick && onNavClick(item.id, item.label)}
                  className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all duration-200 group focus:outline-none ${
                    isActive
                      ? 'bg-[#9FD842] text-[#171717] shadow-sm'
                      : 'text-[#666666] hover:text-[#171717] hover:bg-white/80'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${
                      isActive ? 'text-[#171717]' : 'text-[#666666] group-hover:text-[#171717]'
                    }`} />
                    
                    {/* Cart Badge */}
                    {isCart && displayCount > 0 && (
                      <span className="absolute -top-2.5 -right-3.5 bg-[#171717] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                        {displayCount}
                      </span>
                    )}
                  </div>

                  <span>{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activePillIndicatorDesktop"
                      className="absolute inset-0 rounded-full bg-[#9FD842] -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.nav>
      </header>

      {/* Mobile Top Header */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 py-3 bg-[#F5F5F3]/90 backdrop-blur-md border-b border-black/5 flex items-center justify-between md:hidden">
        <a 
          href="#" 
          className="flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            if (onNavClick) onNavClick('home', 'Nakoda Imitation');
          }}
        >
          <div className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center text-white shadow-sm">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#171717]">Nakoda Imitation</span>
        </a>

        <button 
          onClick={() => onNavClick && onNavClick('cart', 'Shopping Cart')}
          className="relative w-9 h-9 rounded-full bg-white shadow-sm border border-black/5 flex items-center justify-center text-[#171717] active:scale-95 transition-transform"
          aria-label={`Cart with ${cartCount} items`}
        >
          <ShoppingCart className="w-4 h-4 text-[#171717]" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#171717] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Floating Bottom Navigation Pill */}
      <nav 
        className="fixed bottom-3 left-3 right-3 z-40 md:hidden max-w-sm mx-auto glass-bottom-nav rounded-full p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-white/90 flex items-center justify-between"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isCart = item.id === 'cart';
          const displayCount = isCart ? cartCount : null;

          if (isActive) {
            return (
              <motion.button
                key={item.id}
                layoutId="activeMobileTab"
                onClick={() => onNavClick && onNavClick(item.id, item.label)}
                className="flex items-center gap-1.5 bg-[#9FD842] text-[#171717] px-3.5 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all"
                aria-current="page"
              >
                <Icon className="w-3.5 h-3.5 text-[#171717]" />
                <span className="whitespace-nowrap">{item.label}</span>
              </motion.button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavClick && onNavClick(item.id, item.label)}
              className="relative p-2 rounded-full text-[#777777] hover:text-[#171717] transition-colors flex items-center justify-center"
              aria-label={item.label}
            >
              <Icon className="w-4 h-4 text-[#777777]" />
              {isCart && displayCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#171717] text-white text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                  {displayCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Navbar;
