'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, MessageCircle, ShoppingCart } from 'lucide-react';
import { STORE_CONFIG } from '../data/mockData';
import { createHelpWhatsAppUrl } from '../utils/whatsapp';

export const FloatingCartBar = ({ 
  cartItems, 
  totalCount, 
  totalAmount, 
  activeTab = 'home',
  onOpenCartModal 
}) => {
  const hasItems = totalCount > 0 && activeTab !== 'cart';
  const whatsappHelpUrl = createHelpWhatsAppUrl();

  return (
    <>
      {/* Floating Bottom Cart Bar for Quick Mobile/Desktop Checkout */}
      <AnimatePresence>
        {hasItems && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 350 }}
            className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-md mx-auto z-[39]"
          >
            <div className="glass-bottom-nav rounded-full p-2 pl-4 flex items-center justify-between shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-white/95">
              
              {/* Left: Items Count & Total */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#171717] text-white flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#777777] block leading-tight">
                    {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
                  </span>
                  <span className="text-sm font-extrabold text-[#171717]">
                    {STORE_CONFIG.currency}{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Right: View Cart Button */}
              <button
                onClick={onOpenCartModal}
                className="px-5 py-2.5 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-xs flex items-center gap-1.5 shadow-neu-btn-accent active:scale-95 transition-all"
              >
                <span>View Cart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Support Widget */}
      <div className={`fixed z-[39] transition-all duration-300 ${
        hasItems 
          ? 'bottom-[130px] md:bottom-6 right-4 md:right-6' 
          : 'bottom-20 md:bottom-6 right-4 md:right-6'
      }`}>
        <a
          href={whatsappHelpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-2 p-3 md:px-4 md:py-2.5 rounded-full bg-[#171717] text-white font-bold text-xs shadow-lg hover:bg-black hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Chat with shop on WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="w-4 h-4 fill-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#9FD842] rounded-full animate-ping" />
          </div>
          <span className="hidden md:inline">Help & Chat</span>
        </a>
      </div>
    </>
  );
};
