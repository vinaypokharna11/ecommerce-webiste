'use client';

// ============================================================
// IMPORTS
// ============================================================
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { STORE_CONFIG } from '@/data/constants';
import { formatPrice } from '@/utils/formatPrice';

/**
 * FloatingCartBar
 *
 * Mobile sticky bottom floating indicator showing active cart total
 * and quick-action checkout trigger.
 */
export const FloatingCartBar = ({ 
  cartItems, 
  totalCount, 
  totalAmount, 
  activeTab = 'home',
  onOpenCartModal 
}) => {
  const hasItems = totalCount > 0 && activeTab !== 'cart';

  return (
    <AnimatePresence>
      {hasItems && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 350 }}
          className="fixed bottom-5 inset-x-3 sm:inset-x-4 max-w-md mx-auto z-40"
        >
          <div className="rounded-full p-1.5 pl-3.5 sm:p-2 sm:pl-5 flex items-center justify-between shadow-[0_16px_40px_rgba(0,0,0,0.14)] bg-white/95 backdrop-blur-2xl border border-black/[0.08]">
            
            {/* Left: Items Count & Total */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center shadow-xs shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-[#86868B] block leading-tight truncate">
                  {totalCount} {totalCount === 1 ? 'Item in Bag' : 'Items in Bag'}
                </span>
                <span className="text-xs sm:text-sm font-sans font-bold text-[#1D1D1F] truncate block">
                  {formatPrice(totalAmount, STORE_CONFIG.currency)}
                </span>
              </div>
            </div>

            {/* Right: View Bag Button */}
            <button
              onClick={onOpenCartModal}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs font-sans tracking-wide flex items-center gap-1.5 sm:gap-2 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <span>View Bag</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCartBar;
