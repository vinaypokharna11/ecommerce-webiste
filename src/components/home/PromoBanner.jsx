'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Sparkles } from 'lucide-react';
import Image from 'next/image';

export const PromoBanner = ({ onCheckOffers }) => {
  return (
    <section className="py-8 sm:py-14 bg-[#FBFBFD]" aria-label="Special Promotional Offer">
      <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">

        {/* Apple Style Keynote Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-[#1D1D1F] text-white p-5 sm:p-10 lg:p-14 shadow-2xl border border-white/10"
        >
          {/* Ambient Apple Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0071E3]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Grid Layout */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-sans font-medium text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FF9500]" />
                <span>Limited Time Season Curation</span>
              </div>

              <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-sans">
                Save up to 35% on everything you love.
              </h2>

              <p className="text-white/90 text-xs sm:text-white max-w-lg font-normal leading-relaxed">
                Enjoy festival discounts on cabin spinner trolleys, handcrafted heirloom jewelry, authentic papads, and organic cotton essentials.
              </p>

              <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  onClick={onCheckOffers}
                  className="w-full sm:w-auto justify-center px-6 py-3 rounded-full bg-white text-[#1D1D1F] font-semibold text-xs sm:text-sm hover:bg-[#F5F5F7] transition-all hover:scale-105 shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore All Offers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-xs sm:text-sm text-white/80 font-medium">Free shipping on orders above ₹999</span>
              </div>
            </div>

            {/* Right Visual Collage */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-64 sm:w-80 aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
                <Image
                  src="/assets/images/prod_trolley.jpg"
                  alt="Special Offers Showcase"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default PromoBanner;
