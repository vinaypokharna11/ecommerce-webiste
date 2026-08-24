import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  LayoutGrid, 
  Sparkles, 
  ShoppingCart, 
  User, 
  ShoppingBag,
  Heart,
  SlidersHorizontal,
  ShieldAlert,
  PhoneCall,
} from 'lucide-react';
import { NAV_ITEMS } from '../data/mockData';

const iconMap = {
  Home,
  LayoutGrid,
  Sparkles,
  ShoppingCart,
  User,
  PhoneCall,
};

export const Navbar = ({ cartCount = 3, onNavClick, activeTab = 'home' }) => {
  return (
    <>
      {/* Desktop Floating Navbar */}
      <header className="fixed top-5 left-0 right-0 z-40 px-4 sm:px-8 max-w-7xl mx-auto hidden md:block">
        <motion.nav 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-nav rounded-full px-6 py-3 flex items-center justify-between shadow-nav transition-all duration-300"
          aria-label="Main Navigation"
        >
          {/* Brand Logo */}
          <a 
            href="#" 
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-lg px-1 py-0.5"
            onClick={(e) => {
              e.preventDefault();
              onNavClick('home', 'ShopEase Home');
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6257FF] to-[#8B5CF6] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(98,87,255,0.35)] group-hover:scale-105 transition-transform duration-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#15152A] group-hover:text-brand-purple transition-colors">
              ShopEase
            </span>
          </a>

          {/* Navigation Items Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#FAF9FF]/80 p-1.5 rounded-full border border-[#EAE6FD]/60">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = activeTab === item.id;
              const isCart = item.id === 'cart';
              const displayCount = isCart ? cartCount : null;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavClick(item.id, item.label)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-250 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                    isActive
                      ? 'bg-[#EDE9FE] text-[#6257FF] shadow-sm'
                      : 'text-[#626276] hover:text-[#15152A] hover:bg-white/80'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="relative">
                    <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-[#6257FF]' : 'text-[#626276] group-hover:text-[#15152A]'
                    }`} />
                    
                    {/* Cart Badge */}
                    {isCart && displayCount > 0 && (
                      <motion.span 
                        key={displayCount}
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        className="absolute -top-2.5 -right-3 bg-gradient-to-r from-[#EC5AC8] to-[#FF4593] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(236,90,200,0.5)] border border-white"
                      >
                        {displayCount}
                      </motion.span>
                    )}
                  </div>

                  <span>{item.label}</span>

                  {/* Active Indicator Underline / Glow */}
                  {isActive && (
                    <motion.div
                      layoutId="activePillIndicator"
                      className="absolute inset-0 rounded-full bg-[#EDE9FE] -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin Panel Quick Access Button */}
          <button
            onClick={() => onNavClick('admin', 'Admin Panel')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-300 shadow-sm ${
              activeTab === 'admin'
                ? 'bg-[#15152A] text-white ring-2 ring-[#6257FF]'
                : 'bg-gradient-to-r from-[#6257FF]/10 to-[#EC5AC8]/10 hover:from-[#6257FF]/20 hover:to-[#EC5AC8]/20 text-[#6257FF] border border-[#EAE6FD]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </button>
        </motion.nav>
      </header>

      {/* Mobile Top Header */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 py-3 bg-white/85 backdrop-blur-lg border-b border-[#EAE6FD] flex items-center justify-between md:hidden">
        <a 
          href="#" 
          className="flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            onNavClick('home', 'ShopEase Home');
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6257FF] to-[#8B5CF6] flex items-center justify-center text-white shadow-sm">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#15152A]">ShopEase</span>
        </a>

        <div className="flex items-center gap-2">
          {/* Admin Mobile Button */}
          <button
            onClick={() => onNavClick('admin', 'Admin Panel')}
            className={`p-2 rounded-full transition-colors text-xs font-bold flex items-center gap-1 ${
              activeTab === 'admin' ? 'bg-[#15152A] text-white' : 'bg-[#FAF9FF] text-[#6257FF] border border-[#EAE6FD]'
            }`}
            title="Admin Panel"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button 
            onClick={() => onNavClick('cart', 'Shopping Cart')}
            className="relative p-2 text-[#15152A] rounded-full hover:bg-purple-50 transition-colors"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingCart className="w-5 h-5 text-[#6257FF]" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-gradient-to-r from-[#EC5AC8] to-[#FF4593] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <nav 
        className="fixed bottom-2.5 left-2 right-2 sm:left-4 sm:right-4 z-40 md:hidden bg-white/95 backdrop-blur-xl border border-[#EAE6FD] rounded-full shadow-[0_10px_35px_rgba(98,87,255,0.18)] p-1 flex items-center justify-between overflow-x-auto no-scrollbar"
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon] || Home;
          const isActive = activeTab === item.id;
          const isCart = item.id === 'cart';
          const displayCount = isCart ? cartCount : null;

          return (
            <button
              key={item.id}
              onClick={() => onNavClick(item.id, item.label)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 sm:px-2.5 rounded-full text-[9px] sm:text-[10px] font-semibold transition-all flex-1 min-w-0 ${
                isActive
                  ? 'bg-[#EDE9FE] text-[#6257FF]'
                  : 'text-[#626276] hover:text-[#15152A]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'text-[#6257FF]' : 'text-[#626276]'}`} />
                {isCart && displayCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-[#EC5AC8] to-[#FF4593] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm border border-white">
                    {displayCount}
                  </span>
                )}
              </div>
              <span className="mt-0.5 truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
