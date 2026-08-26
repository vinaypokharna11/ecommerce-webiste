'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, Sparkles, Heart, Check } from 'lucide-react';

export const Toast = ({ toasts, onDismiss }) => {
  return (
    <div 
      aria-live="polite" 
      className="fixed top-20 right-4 md:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-full bg-white/95 backdrop-blur-md border border-black/5 shadow-glass-modal"
          >
            <div className="flex-shrink-0">
              {toast.type === 'cart' ? (
                <div className="w-7 h-7 rounded-full bg-[#9FD842] text-[#171717] flex items-center justify-center font-bold text-xs shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ) : toast.type === 'heart' ? (
                <div className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold text-xs">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#EEEEEC] text-[#171717] flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 text-xs">
              <p className="font-bold text-[#171717] leading-snug">{toast.title}</p>
              {toast.message && (
                <p className="text-[#777777] text-[11px] mt-0.5">{toast.message}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
