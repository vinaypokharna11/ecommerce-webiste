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
  Check, 
  ChevronRight,
  MousePointerClick
} from 'lucide-react';
import Image from 'next/image';
import { ClothCanvas } from './ClothCanvas';
import { RealisticHand } from './RealisticHand';
import { STORE_CONFIG } from '../data/mockData';

export const FabricScrollReveal = ({
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

  // Scroll listener with lerp interpolation
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

    // 60 FPS Damping Loop
    const updateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.001) {
        currentProgressRef.current += diff * 0.12; // Smooth lerp
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

  // Fallback products if not provided
  const prod1 = topProduct || {
    id: 'prod-linen',
    name: 'Handcrafted Pure Linen Heritage Shirt',
    categoryName: 'Clothing',
    price: 1899,
    oldPrice: 2499,
    image: '/assets/images/cat_linen_shirt.jpg',
    description: '100% organic breathable linen weave with natural coconut buttons and relaxed drape.',
  };

  const prod2 = revealedProduct || {
    id: 'prod-backpack',
    name: 'Nakoda Signature Urban Leather Backpack',
    categoryName: 'Accessories',
    price: 2499,
    oldPrice: 3299,
    image: '/assets/images/prod_backpack.jpg',
    description: 'Handcrafted water-resistant vegan leather with padded laptop sleeve and gold-tone zippers.',
  };

  // Phase milestones for UI state
  const isGripping = scrollProgress > 0.35 && scrollProgress < 0.85;
  const isRevealed = scrollProgress > 0.65;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[260vh] md:h-[300vh] bg-gradient-to-b from-[#FAF9F5] via-[#F4F2EC] to-[#ECEAE2]"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 py-6 md:py-8 overflow-hidden">
        
        {/* ── Top Header & Progress Scrub bar ── */}
        <div className="w-full max-w-5xl flex items-center justify-between z-20 pt-16 md:pt-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171717] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#9FD842]" />
              <span>Interactive Physical Experience</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
              Scroll to Pull & Reveal the Collection
            </h2>
          </div>

          {/* Interactive Progress Indicator */}
          <div className="hidden sm:flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-black/5 shadow-sm">
            <span className="text-[11px] font-bold text-[#777777]">
              {scrollProgress < 0.4 ? '1. Hand Reaching' : scrollProgress < 0.8 ? '2. Pulling Fabric' : '3. Product Revealed'}
            </span>
            <div className="w-24 h-2 bg-[#EEEEEC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#9FD842] transition-all duration-75"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Center Stage: Physical Fabric & Revealed Product ── */}
        <div className="relative w-full max-w-4xl flex-1 flex items-center justify-center my-auto z-10">
          <div className="relative w-full max-w-md sm:max-w-lg aspect-[4/5] sm:aspect-[1/1] max-h-[58vh] sm:max-h-[64vh] rounded-[32px] bg-white border border-black/10 shadow-[0_20px_50px_rgba(23,23,23,0.14)] overflow-hidden">
            
            {/* ── LAYER 1 (Underneath Revealed Product) ── */}
            <div className="absolute inset-0 bg-[#FAF9F5] p-6 sm:p-8 flex flex-col justify-between z-0">
              <div className="relative w-full h-[60%] rounded-[24px] overflow-hidden bg-[#EEEEEC] shadow-inner">
                <Image
                  src={prod2.image || '/assets/images/prod_backpack.jpg'}
                  alt={prod2.name}
                  fill
                  className="object-cover"
                  priority
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#9FD842] text-[#171717] text-[10px] font-extrabold tracking-wide uppercase shadow-sm">
                  Exclusive Reveal ⭐
                </span>
              </div>

              {/* Revealed Product Info & One-Click Actions */}
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
                    <span>Add Revealed to Bag</span>
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

            {/* ── LAYER 2 (Deformed Physics Cloth Top Sheet) ── */}
            {!shouldReduceMotion && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                <ClothCanvas
                  progress={scrollProgress}
                  imageSrc={prod1.image}
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Reduced motion static fallback */}
            {shouldReduceMotion && (
              <div
                className="absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none"
                style={{ opacity: Math.max(0, 1 - scrollProgress * 1.5) }}
              >
                <Image
                  src={prod1.image}
                  alt={prod1.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* ── LAYER 3 (Photorealistic Human Hand with Kinematics) ── */}
            {!shouldReduceMotion && (
              <RealisticHand progress={scrollProgress} />
            )}
          </div>
        </div>

        {/* ── Bottom Controls: Scroll Cue & Skip to Catalog ── */}
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
                ? 'Scroll down to pull fabric upward'
                : 'Fabric lifted! Continue scrolling to explore catalog grid'}
            </span>
          </div>

          <button
            onClick={onScrollToCatalog}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#171717] hover:text-white text-[#171717] text-xs font-extrabold border border-black/10 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <span>Skip to Catalog Grid</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
