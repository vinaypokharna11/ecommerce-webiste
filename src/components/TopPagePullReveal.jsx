'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowDown, 
  ShoppingBag, 
  Eye, 
  Heart, 
  Tag, 
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

import { STORE_CONFIG } from '../data/mockData';

export const TopPagePullReveal = ({
  topProduct,
  revealedProduct,
  onAddToCart,
  onQuickView,
  onToggleFavorite,
  isFavorite = false,
  onScrollToCatalog,
}) => {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll tracking with smooth 60fps lerp
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollDistance = rect.height - window.innerHeight;
      if (totalScrollDistance <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollDistance));
      targetProgressRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const updateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0008) {
        currentProgressRef.current += diff * 0.14; // Responsive smooth lerp
        setScrollProgress(currentProgressRef.current);
      }
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const prod1 = topProduct || {
    id: 'prod-linen',
    name: 'Heritage Silk & Pure Linen Apparel',
    categoryName: 'Clothing',
    price: 1899,
    oldPrice: 2499,
    image: '/assets/images/cat_linen_shirt.jpg',
    description: 'Handwoven pure breathable linen with textured drape and organic dyes.',
  };

  const prod2 = revealedProduct || {
    id: 'prod-backpack',
    name: 'Nakoda Royal Leather Travel Collection',
    categoryName: 'Accessories',
    price: 2499,
    oldPrice: 3299,
    image: '/assets/images/prod_backpack.jpg',
    description: 'Handcrafted luxury water-resistant leather with gold finish accents.',
  };

  // Upward translation of the pulled page sheet (synchronized to scroll pace)
  // When progress > 0.30 (hand grips top edge), the page sheet is pulled upward
  const pullProgress = Math.max(0, Math.min(1, (scrollProgress - 0.28) / 0.60));
  const sheetTranslateY = -pullProgress * 115; // in % of card height
  const sheetRotate = Math.sin(pullProgress * Math.PI) * -2.5; // subtle organic tilt under load

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[240vh] md:h-[280vh] bg-gradient-to-b from-[#F8F7F2] via-[#F1EFE7] to-[#E9E6DC]"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        
        {/* ── Top Header & Scrub Progress ── */}
        <div className="w-full max-w-5xl flex items-center justify-between z-20 pt-16 md:pt-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#171717] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#9FD842]" />
              <span>Interactive Page Pull Experience</span>
            </div>
              Scroll Down to Reveal Catalog
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-3 bg-white/85 backdrop-blur-md px-4 py-2 rounded-full border border-black/5 shadow-sm">
            <span className="text-[11px] font-bold text-[#777777]">
              {scrollProgress < 0.28 ? '1. Scroll Down' : scrollProgress < 0.88 ? '2. Revealing Catalog' : '3. Revealed'}
            </span>
            <div className="w-24 h-2 bg-[#EEEEEC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#9FD842] transition-all duration-75"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Center Stage: The Pulled Catalog Sheet & Revealed Layer ── */}
        <div className="relative w-full max-w-3xl flex-1 flex items-center justify-center my-auto z-10">
          <div className="relative w-full max-w-md sm:max-w-lg aspect-[4/5] sm:aspect-[1/1] max-h-[58vh] sm:max-h-[64vh] rounded-[32px] bg-white border border-black/10 shadow-[0_22px_55px_rgba(23,23,23,0.18)] overflow-hidden">
            
            {/* ── BASE LAYER (Revealed Product Underneath) ── */}
            <div className="absolute inset-0 bg-[#FAF9F5] p-6 sm:p-8 flex flex-col justify-between z-0">
              <div className="relative w-full h-[62%] rounded-[24px] overflow-hidden bg-[#EEEEEC] shadow-inner">
                <Image
                  src={prod2.image || '/assets/images/prod_backpack.jpg'}
                  alt={prod2.name}
                  fill
                  className="object-cover"
                  priority
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#9FD842] text-[#171717] text-[10px] font-extrabold tracking-wide uppercase shadow-sm">
                  Revealed Spotlight ⭐
                </span>
              </div>

              {/* Product Info */}
              <div className="pt-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
                      {prod2.categoryName}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#171717] leading-snug line-clamp-1">
                      {prod2.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-extrabold text-[#171717]">
                      {STORE_CONFIG.currency}{prod2.price.toLocaleString()}
                    </span>
                    {prod2.oldPrice && (
                      <span className="text-[10px] text-[#A0A0A0] line-through block">
                        {STORE_CONFIG.currency}{prod2.oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onAddToCart && onAddToCart(prod2)}
                    className="flex-1 py-2.5 rounded-full bg-[#171717] hover:bg-black text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#9FD842]" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={() => onQuickView && onQuickView(prod2)}
                    className="p-2.5 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2E0] text-[#171717] transition-colors"
                    title="Quick View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onToggleFavorite && onToggleFavorite(prod2)}
                    className="p-2.5 rounded-full bg-[#EEEEEC] hover:bg-rose-50 text-[#777777] hover:text-rose-500 transition-colors"
                    title="Save to Wishlist"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── TOP LAYER (Physical Sheet being Pulled Upward by the Hand) ── */}
            <div
              className="absolute inset-0 z-10 bg-white p-6 sm:p-8 flex flex-col justify-between rounded-[32px] shadow-lg border border-black/5 will-change-transform"
              style={{
                transform: `translate3d(0, ${sheetTranslateY}%, 0) rotate(${sheetRotate}deg)`,
                transition: 'transform 0.04s ease-out',
              }}
            >
              {/* Dynamic Physical Crease Over Top Edge where Hand Grips */}
              {scrollProgress > 0.25 && scrollProgress < 0.88 && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 pointer-events-none z-20"
                  style={{
                    background: 'radial-gradient(ellipse at center top, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 75%)',
                  }}
                />
              )}

              <div className="relative w-full h-[62%] rounded-[24px] overflow-hidden bg-[#EEEEEC] shadow-sm">
                <Image
                  src={prod1.image || '/assets/images/cat_linen_shirt.jpg'}
                  alt={prod1.name}
                  fill
                  className="object-cover"
                  priority
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#171717] text-white text-[10px] font-extrabold tracking-wide uppercase shadow-sm">
                  Featured Cover Sheet
                </span>
              </div>

              <div className="pt-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
                      {prod1.categoryName}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#171717] leading-snug line-clamp-1">
                      {prod1.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-extrabold text-[#171717]">
                      {STORE_CONFIG.currency}{prod1.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#777777] line-clamp-2">
                  {prod1.description}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ── 3. Real Hand Reaching from Top and Pulling Sheet Up ── */}
        {/* Hand animation removed by request */}

        {/* ── Bottom Navigation Controls ── */}
        <div className="w-full max-w-5xl flex items-center justify-between z-20 pb-2">
          <div className="flex items-center gap-2 text-xs text-[#777777] font-medium">
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[#171717]"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </motion.div>
            <span>
              {scrollProgress < 0.85
                ? 'Scroll down to reveal catalog'
                : 'Page revealed! Continue scrolling to explore catalog grid'}
            </span>
          </div>

          <button
            onClick={onScrollToCatalog}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#171717] hover:text-white text-[#171717] text-xs font-extrabold border border-black/10 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Skip to Catalog Grid</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
