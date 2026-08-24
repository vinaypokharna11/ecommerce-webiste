import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, Sparkles, Heart } from 'lucide-react';

export const Toast = ({ toasts, onDismiss }) => {
  return (
    <div 
      aria-live="polite" 
      className="fixed top-24 right-4 md:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE6FD] shadow-[0_12px_36px_rgba(98,87,255,0.18)]"
          >
            <div className="flex-shrink-0">
              {toast.type === 'cart' && (
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {toast.type === 'heart' && (
                <div className="w-8 h-8 rounded-full bg-pink-50 text-[#EC5AC8] flex items-center justify-center font-bold text-sm">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-8 h-8 rounded-full bg-purple-50 text-[#6257FF] flex items-center justify-center font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-semibold text-[#15152A] leading-snug">{toast.title}</p>
              {toast.message && (
                <p className="text-[#626276] text-xs mt-0.5">{toast.message}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
