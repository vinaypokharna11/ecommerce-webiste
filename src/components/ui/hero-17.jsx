'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Hero 17 - Premium Responsive E-Commerce Hero Block
 * 
 * Unified 2x2 Grid Architecture:
 * - Desktop (>= 1024px / lg): Two-column layout:
 *   - Left: Headline, body copy, CTA action buttons, and trust proposition strip
 *   - Right: Symmetrical 2x2 product showcase grid (Suitcase, Choker, Papad, Innerwear)
 *   - Guaranteed 100vh screen fit with zero vertical overflow
 * 
 * - Mobile & Tablet (< 1024px): Centered vertical flow:
 *   - Top: Centered headline, body, action buttons, and trust pills
 *   - Bottom: Expansive 2x2 product showcase grid with responsive max-widths:
 *     Mobile (up to 480px), iPad (up to 680px), Desktop (up to 560px-640px)
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
  const displayProducts = products.slice(0, 4);

  return (
    <section
      id="hero-section"
      data-testid="hero-section"
      className={`relative w-full min-h-[calc(100dvh-56px)] xs:min-h-[calc(100dvh-62px)] sm:min-h-[calc(100dvh-82px)] lg:h-[calc(100dvh-82px)] lg:max-h-[calc(100dvh-82px)] bg-white py-4 xs:py-5 sm:py-6 md:py-8 lg:py-4 px-3.5 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 flex items-center justify-center overflow-hidden box-border select-none ${className}`}
    >
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[950px] h-[650px] bg-gradient-to-tr from-[#0071E3]/8 via-neutral-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1680px] h-full mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-6 md:gap-7 lg:gap-8 xl:gap-14 items-center justify-center relative z-10">
        
        {/* ── Left Column: Headline, Body Copy, Action Buttons, Trust Strip ── */}
        <div className="w-full lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2.5 xs:space-y-3 sm:space-y-3.5 md:space-y-4 shrink-0 max-w-xl md:max-w-2xl lg:max-w-none mx-auto lg:mx-0">
          
          {/* Main Display Headline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="space-y-0.5 sm:space-y-1"
          >
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold tracking-tight text-[#1D1D1F] leading-[1.12] font-sans">
              {headline} <br />
              <span className="text-[#3A3A3C] font-normal">
                {subheadline}
              </span>
            </h1>
          </motion.div>

          {/* Subtitle / Body text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="text-xs sm:text-sm md:text-[15px] lg:text-sm xl:text-base text-[#3A3A3C] font-normal max-w-lg md:max-w-xl lg:max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-none"
          >
            {body}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 md:gap-4 pt-0.5 sm:pt-1 flex-nowrap"
          >
            <button
              onClick={primaryCta.onClick}
              className="px-4 xs:px-5 sm:px-6 md:px-7 py-2 xs:py-2.5 sm:py-2.5 md:py-3.5 lg:py-3 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs sm:text-sm md:text-[15px] font-semibold shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{primaryCta.label}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
            </button>

            <button
              onClick={secondaryCta.onClick}
              className="px-4 xs:px-5 sm:px-6 md:px-7 py-2 xs:py-2.5 sm:py-2.5 md:py-3.5 lg:py-3 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-xs sm:text-sm md:text-[15px] font-semibold transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer border border-black/[0.06]"
            >
              <span>{secondaryCta.label}</span>
            </button>
          </motion.div>
        </div>

        {/* ── Right Column: 2x2 Product Showcase Grid (Unified across Desktop & Tablet) ── */}
        <div className="w-full lg:col-span-6 flex flex-col items-center justify-center relative lg:h-full">
          <div className="grid grid-cols-2 gap-4 sm:gap-4 md:gap-5 lg:gap-4 xl:gap-4.5 w-full max-w-[320px] xs:max-w-[370px] sm:max-w-[430px] md:max-w-[520px] lg:max-w-[460px] xl:max-w-[480px] 2xl:max-w-[510px] mx-auto lg:mx-0 lg:ml-auto">
            {displayProducts.map((item, index) => (
              <motion.div
                key={`prod-2x2-${item.id || index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.045 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                onClick={() => item.onClick && item.onClick()}
                className="relative z-10 hover:z-20 aspect-square w-full rounded-2xl sm:rounded-3xl md:rounded-[28px] lg:rounded-2xl xl:rounded-3xl overflow-hidden bg-[#F5F5F7] border border-black/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.15)] cursor-pointer group select-none flex flex-col justify-between"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  priority
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 340px, 300px"
                  className={`${item.imageFit === 'contain' ? 'object-contain' : 'object-cover'} object-center scale-100 group-hover:scale-108 transition-transform duration-500 ease-out`}
                />


                {/* Cinematic Bottom Gradient Overlay with Product Info */}
                <div className="relative z-10 p-2 sm:p-2.5 md:p-3.5 lg:p-2 xl:p-2.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end text-white">
                  <span className="text-[7.5px] sm:text-[8.5px] md:text-[11px] lg:text-[8px] xl:text-[9.5px] font-bold uppercase tracking-wider text-white/80 block truncate">
                    {item.category}
                  </span>
                  <h3 className="text-[10px] xs:text-[11px] sm:text-xs md:text-[15px] lg:text-xs xl:text-sm font-bold !text-white line-clamp-1 md:line-clamp-2 drop-shadow-xs leading-snug">
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
