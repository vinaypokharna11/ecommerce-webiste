'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Hero 17 - Two-Column E-Commerce Hero Block
 * From React Bits Pro (@reactbits-pro/hero-17)
 * 
 * Features:
 * - Left column: Promo pill, bold display headline, body copy, dual action CTAs
 * - Right column: Stacked product image grid:
 *   - 1 prominent featured image at the top (full width, rounded-3xl)
 *   - 3 smaller product images in a 3-column row beneath it (rounded-2xl, aspect-square)
 */
export function Hero17({
  promoPill = { label: "Curated Lifestyle & Everyday Essentials" },
  headline = "Everything you need.",
  subheadline = "Curated with premium care.",
  body = "From lightweight spinner trolleys and handcrafted imitation jewelry to authentic sun-dried papads, organic undergarments, and top electronics.",
  primaryCta = { label: "Explore All Catalog", onClick: () => {} },
  secondaryCta = { label: "Today's Exclusive Deals", onClick: () => {} },
  products = [],
  className = "",
}) {
  const featuredProduct = products[0];
  const secondaryProducts = products.slice(1, 4);

  return (
    <section
      id="hero-section"
      data-testid="hero-section"
      className={`relative w-full bg-white py-4 sm:py-6 lg:py-8 xl:py-10 px-4 sm:px-8 lg:px-12 flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-[#0071E3]/5 via-neutral-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 xl:gap-14 items-center relative z-10">
        
        {/* ── Left Column: Headline, Body Copy, Action Buttons (6 cols) ── */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-3.5 sm:space-y-5">
          
          {/* Main Display Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-1"
          >
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold tracking-tight text-[#1D1D1F] leading-[1.12] font-sans">
              {headline} <br />
              <span className="text-[#3A3A3C] font-normal">
                {subheadline}
              </span>
            </h1>
          </motion.div>

          {/* Subtitle / Body text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs sm:text-base lg:text-sm xl:text-base text-[#3A3A3C] font-normal max-w-lg xl:max-w-xl leading-relaxed"
          >
            {body}
          </motion.p>

          {/* Action CTAs (Preserves same-row alignment on mobile & desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2 xs:gap-3 sm:gap-3.5 pt-1 sm:pt-2 flex-nowrap"
          >
            <button
              onClick={primaryCta.onClick}
              className="px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-[11px] xs:text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{primaryCta.label}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </button>

            <button
              onClick={secondaryCta.onClick}
              className="px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-[11px] xs:text-xs sm:text-sm font-semibold transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer border border-black/[0.04]"
            >
              <span>{secondaryCta.label}</span>
            </button>
          </motion.div>
        </div>

        {/* ── Right Column: Stacked Product Image Grid (Hero 17 Layout) ── */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-2.5 sm:gap-3.5 relative">
          
          {/* 1) Top Featured Image (Large Full-Width Card) */}
          {featuredProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              onClick={() => featuredProduct.onClick && featuredProduct.onClick()}
              className="relative w-full aspect-[16/9.5] max-h-[290px] xs:max-h-[320px] sm:max-h-[350px] rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group select-none"
            >
              <Image
                src={featuredProduct.image}
                alt={featuredProduct.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 650px"
                className="object-cover object-center scale-104 group-hover:scale-110 transition-transform duration-500 ease-out"
              />

              {/* Cinematic Bottom Gradient Overlay with Clean Product Info */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex items-end justify-between gap-3 text-white transition-opacity duration-300">
                <div className="min-w-0">
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/80 block truncate">
                    {featuredProduct.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-xs leading-snug">
                    {featuredProduct.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2) Bottom Row: 3 Smaller Product Images Side-by-Side */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:gap-3.5">
            {secondaryProducts.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 + index * 0.1 }}
                onClick={() => item.onClick && item.onClick()}
                className="relative aspect-square max-h-[145px] xs:max-h-[160px] sm:max-h-[175px] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group select-none flex flex-col justify-end"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  priority
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 220px"
                  className="object-cover scale-110 group-hover:scale-122 transition-transform duration-500 ease-out"
                />

                {/* Cinematic Bottom Gradient Overlay with Clean Product Info */}
                <div className="relative z-10 p-2 sm:p-2.5 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex flex-col justify-end text-white">
                  <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-white/80 block truncate">
                    {item.category}
                  </span>
                  <h3 className="text-[9.5px] sm:text-[11px] font-bold text-white truncate drop-shadow-xs leading-snug">
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero17;
