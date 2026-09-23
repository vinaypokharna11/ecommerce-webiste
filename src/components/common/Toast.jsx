'use client';

import React from 'react';
import SwipeToast from '../ui/SwipeToast';
import { CheckCircle2, AlertCircle, Sparkles, Heart, Check } from 'lucide-react';

export const Toast = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-4 sm:right-6 z-[9999999] flex flex-col items-end gap-2 pointer-events-none max-w-[calc(100vw-32px)] sm:max-w-sm w-full"
    >
      {toasts.map((toast) => {
        const isCart = toast.type === 'cart' || (toast.title && toast.title.toLowerCase().includes('bag'));
        const isHeart = toast.type === 'heart' || (toast.title && toast.title.toLowerCase().includes('wishlist'));
        const isError =
          toast.type === 'error' ||
          (toast.title &&
            (toast.title.includes('⚠️') ||
              toast.title.toLowerCase().includes('out of stock') ||
              toast.title.toLowerCase().includes('error')));

        let fuseColor = '#0071E3'; // Apple blue
        let icon = <Sparkles className="w-4 h-4 text-[#0071E3]" />;

        if (isError) {
          fuseColor = '#FF453A';
          icon = <AlertCircle className="w-4 h-4 text-[#FF453A]" />;
        } else if (isCart) {
          fuseColor = '#34C759';
          icon = <Check className="w-4 h-4 text-[#34C759] stroke-[2.5]" />;
        } else if (isHeart) {
          fuseColor = '#F43F5E';
          icon = <Heart className="w-4 h-4 text-[#F43F5E] fill-current" />;
        } else if (toast.type === 'success') {
          fuseColor = '#34C759';
          icon = <CheckCircle2 className="w-4 h-4 text-[#34C759]" />;
        }

        return (
          <div key={toast.id} className="pointer-events-auto w-full flex justify-end">
            <SwipeToast
              inline
              title={toast.title}
              description={toast.message || ''}
              icon={icon}
              background="#1D1D1F"
              color="#F5F5F7"
              fuseColor={fuseColor}
              width={360}
              radius={14}
              duration={3800}
              slideMs={350}
              pauseOnHover={true}
              closeButton={true}
              dismissible={true}
              onClose={() => onDismiss && onDismiss(toast.id)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
