'use client';

// ============================================================
// IMPORTS
// ============================================================
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { createHelpWhatsAppUrl } from '@/utils/whatsapp';

/**
 * HeroSection
 * 
 * Apple-inspired storefront hero banner.
 * Dynamically tailored to fit cleanly within standard desktop/laptop
 * viewports (e.g. 1366x768, 1440x900, 1536x730, 1920x1080) without
 * awkward cutoff, while fluidly stacking on tablets and mobile screens.
 */
export const HeroSection = ({
  onExploreClick,
  onNavClick,
  cartCount = 0,
  user = null,
  activeTab = 'home',
}) => {
  const whatsappUrl = createHelpWhatsAppUrl();

  return (
    <section 
      id="hero-section" 
      data-testid="hero-section"
      className="relative w-full min-h-[calc(100vh-4.25rem)] lg:h-[calc(100vh-4.25rem)] lg:min-h-[560px] lg:max-h-[850px] bg-gradient-to-b from-white via-[#FBFBFD] to-[#F5F5F7] py-8 sm:py-12 lg:py-0 px-4 sm:px-8 lg:px-12 flex items-center justify-center overflow-hidden"
    >
      {/* Background Soft Apple Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-[#0071E3]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center relative z-10 my-auto">
        
        {/* Left Column: Headline, Subtext, and CTAs (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5 xl:space-y-6">
          
          {/* Main Display Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-1.5"
          >
            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-5xl 2xl:text-6xl font-bold tracking-tight text-[#1D1D1F] leading-[1.12] font-sans">
              Everything you need. <br />
              <span className="text-[#3A3A3C] font-normal">
                Curated with premium care.
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-base lg:text-sm xl:text-base 2xl:text-lg text-[#3A3A3C] font-normal max-w-lg xl:max-w-xl leading-relaxed"
          >
            From lightweight spinner trolleys and handcrafted imitation jewelry to authentic sun-dried papads, organic undergarments, and top electronics.
          </motion.p>

          {/* Action CTAs: Always side-by-side with responsive scaling from mobile to desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-3.5 pt-1 flex-nowrap"
          >
            <button
              onClick={() => onExploreClick && onExploreClick('all')}
              className="btn-apple-primary px-2.5 xs:px-3.5 sm:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 text-[11px] xs:text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap shrink-0"
            >
              <span>Explore All Catalog</span>
              <ArrowRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </button>

            <button
              onClick={() => onNavClick && onNavClick('offers', 'Offers')}
              className="btn-apple-secondary px-2.5 xs:px-3.5 sm:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 text-[11px] xs:text-xs sm:text-sm font-semibold flex items-center justify-center whitespace-nowrap shrink-0"
            >
              <span>Today's Exclusive Deals</span>
            </button>
          </motion.div>

        </div>

        {/* Right Column: 2x2 Showcase Floating Cards (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-2.5 sm:gap-3.5 xl:gap-4 relative">
          
          {/* Card 1: Spinner Trolley */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => onExploreClick && onExploreClick('bags-luggage')}
            className="apple-card p-2 sm:p-3 xl:p-4 rounded-xl sm:rounded-2xl xl:rounded-3xl flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div className="relative aspect-[4/3] sm:aspect-square w-full max-h-[110px] xs:max-h-[125px] sm:max-h-[135px] xl:max-h-[160px] 2xl:max-h-[190px] rounded-lg sm:rounded-xl xl:rounded-2xl overflow-hidden bg-[#F5F5F7] mb-1.5 sm:mb-2 xl:mb-3">
              <Image
                src="/assets/images/prod_trolley.jpg"
                alt="Cabin Spinner Trolley"
                fill
                priority
                className="object-cover group-hover:scale-106 transition-transform duration-500"
              />
              <span className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] xl:text-[10px] font-bold bg-black text-white shadow-xs">
                BESTSELLER
              </span>
            </div>
            <div>
              <span className="text-[8px] sm:text-[9px] xl:text-[10px] font-bold uppercase tracking-wider text-[#86868B] block truncate">
                Bags & Trolleys
              </span>
              <h3 className="text-[11px] sm:text-xs xl:text-sm font-semibold text-[#1D1D1F] line-clamp-1 group-hover:text-[#0071E3] transition-colors leading-snug">
                Cabin Spinner Suitcase
              </h3>
              <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.5 xl:mt-1">
                <span className="text-[11px] sm:text-xs xl:text-sm font-bold text-[#1D1D1F]">₹3,499</span>
                <span className="text-[9px] sm:text-[10px] text-[#86868B] line-through">₹5,499</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Royal Jewelry */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => onExploreClick && onExploreClick('jewelry')}
            className="apple-card p-2 sm:p-3 xl:p-4 rounded-xl sm:rounded-2xl xl:rounded-3xl flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div className="relative aspect-[4/3] sm:aspect-square w-full max-h-[110px] xs:max-h-[125px] sm:max-h-[135px] xl:max-h-[160px] 2xl:max-h-[190px] rounded-lg sm:rounded-xl xl:rounded-2xl overflow-hidden bg-[#F5F5F7] mb-1.5 sm:mb-2 xl:mb-3">
              <Image
                src="/assets/images/nakoda/hero.jpg"
                alt="Royal Polki Choker"
                fill
                priority
                className="object-cover group-hover:scale-106 transition-transform duration-500"
              />
              <span className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] xl:text-[10px] font-bold bg-[#FF9500] text-white shadow-xs">
                LUXURY
              </span>
            </div>
            <div>
              <span className="text-[8px] sm:text-[9px] xl:text-[10px] font-bold uppercase tracking-wider text-[#86868B] block truncate">
                Jewelry & Heirlooms
              </span>
              <h3 className="text-[11px] sm:text-xs xl:text-sm font-semibold text-[#1D1D1F] line-clamp-1 group-hover:text-[#0071E3] transition-colors leading-snug">
                Polki & Emerald Choker
              </h3>
              <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.5 xl:mt-1">
                <span className="text-[11px] sm:text-xs xl:text-sm font-bold text-[#1D1D1F]">₹4,299</span>
                <span className="text-[9px] sm:text-[10px] text-[#86868B] line-through">₹5,999</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Gourmet Papad */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={() => onExploreClick && onExploreClick('food-grocery')}
            className="apple-card p-2 sm:p-3 xl:p-4 rounded-xl sm:rounded-2xl xl:rounded-3xl flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div className="relative aspect-[4/3] sm:aspect-square w-full max-h-[110px] xs:max-h-[125px] sm:max-h-[135px] xl:max-h-[160px] 2xl:max-h-[190px] rounded-lg sm:rounded-xl xl:rounded-2xl overflow-hidden bg-[#F5F5F7] mb-1.5 sm:mb-2 xl:mb-3">
              <Image
                src="/assets/images/prod_papad.jpg"
                alt="Handcrafted Spiced Papad"
                fill
                priority
                className="object-cover group-hover:scale-106 transition-transform duration-500"
              />
              <span className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] xl:text-[10px] font-bold bg-[#34C759] text-white shadow-xs">
                FRESH CRISP
              </span>
            </div>
            <div>
              <span className="text-[8px] sm:text-[9px] xl:text-[10px] font-bold uppercase tracking-wider text-[#86868B] block truncate">
                Papad & Snacks
              </span>
              <h3 className="text-[11px] sm:text-xs xl:text-sm font-semibold text-[#1D1D1F] line-clamp-1 group-hover:text-[#0071E3] transition-colors leading-snug">
                Spiced Urad Dal Papad
              </h3>
              <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.5 xl:mt-1">
                <span className="text-[11px] sm:text-xs xl:text-sm font-bold text-[#1D1D1F]">₹299</span>
                <span className="text-[9px] sm:text-[10px] text-[#86868B] line-through">₹450</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Organic Innerwear */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            onClick={() => onExploreClick && onExploreClick('undergarments')}
            className="apple-card p-2 sm:p-3 xl:p-4 rounded-xl sm:rounded-2xl xl:rounded-3xl flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div className="relative aspect-[4/3] sm:aspect-square w-full max-h-[110px] xs:max-h-[125px] sm:max-h-[135px] xl:max-h-[160px] 2xl:max-h-[190px] rounded-lg sm:rounded-xl xl:rounded-2xl overflow-hidden bg-[#F5F5F7] mb-1.5 sm:mb-2 xl:mb-3">
              <Image
                src="/assets/images/prod_innerwear.jpg"
                alt="Organic Cotton Undergarments"
                fill
                priority
                className="object-cover group-hover:scale-106 transition-transform duration-500"
              />
              <span className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] xl:text-[10px] font-bold bg-[#0071E3] text-white shadow-xs">
                100% COTTON
              </span>
            </div>
            <div>
              <span className="text-[8px] sm:text-[9px] xl:text-[10px] font-bold uppercase tracking-wider text-[#86868B] block truncate">
                Undergarments
              </span>
              <h3 className="text-[11px] sm:text-xs xl:text-sm font-semibold text-[#1D1D1F] line-clamp-1 group-hover:text-[#0071E3] transition-colors leading-snug">
                Cotton Trunks (Pack of 3)
              </h3>
              <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.5 xl:mt-1">
                <span className="text-[11px] sm:text-xs xl:text-sm font-bold text-[#1D1D1F]">₹799</span>
                <span className="text-[9px] sm:text-[10px] text-[#86868B] line-through">₹1,299</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default HeroSection;
