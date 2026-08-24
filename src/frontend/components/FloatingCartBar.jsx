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
            className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-lg mx-auto z-[39]"
          >
            <div className="glass-nav rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 flex items-center justify-between shadow-[0_15px_40px_rgba(98,87,255,0.22)] border border-white/90 bg-white/95 backdrop-blur-xl">
              
              {/* Left: Items Count & Total */}
              <div className="flex items-center gap-3 pl-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6257FF] to-[#8B5CF6] text-white flex items-center justify-center shadow-md">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#626276] block">
                    {totalCount} {totalCount === 1 ? 'Item' : 'Items'} in Bag
                  </span>
                  <span className="text-base font-extrabold text-[#15152A]">
                    {STORE_CONFIG.currency}{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Cart Button → navigate to Cart page */}
                <button
                  onClick={onOpenCartModal}
                  className="px-4 sm:px-5 py-2.5 rounded-xl gradient-btn-primary text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">View</span>
                  <span>Cart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Support Widget (Positioned cleanly on Desktop & Mobile) */}
      <div className={`fixed z-[39] transition-all duration-300 ${
        hasItems 
          ? 'bottom-[140px] md:bottom-6 right-4 md:right-6' 
          : 'bottom-20 md:bottom-6 right-4 md:right-6'
      }`}>
        <a
          href={whatsappHelpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-2.5 p-3 md:px-4 md:py-3 rounded-full bg-[#25D366] text-white font-bold text-xs shadow-[0_10px_25px_rgba(37,211,102,0.35)] hover:shadow-[0_12px_30px_rgba(37,211,102,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label="Chat with shop on WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 fill-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          </div>
          <span className="hidden md:inline">Need help? Chat with us</span>
        </a>
      </div>
    </>
  );
};
