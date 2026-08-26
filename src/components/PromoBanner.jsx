'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Tag, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { HERO_ASSETS } from '../data/mockData';

export const PromoBanner = ({ onCheckOffers }) => {
  return (
    <section className="py-8 sm:py-12" aria-label="Special Promotional Offer">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Banner Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#171717] to-[#262626] text-white p-6 sm:p-10 lg:p-12 shadow-neu-card"
        >
          {/* Subtle Organic Mesh Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#9FD842]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Grid Layout */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-left space-y-3">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9FD842] text-[#171717] shadow-sm">
                <Tag className="w-3.5 h-3.5" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Seasonal Drop</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Special Offers Just For You
              </h2>

              {/* Subtext */}
              <p className="text-[#A0A0A0] text-xs sm:text-sm max-w-md font-medium leading-relaxed">
                Up to 30% OFF on selected products across all categories this week.
              </p>

              {/* Button */}
              <div className="pt-2">
                <button
                  onClick={onCheckOffers}
                  className="group inline-flex items-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full bg-[#9FD842] text-[#171717] font-extrabold text-xs sm:text-sm hover:bg-[#8EC731] active:scale-95 transition-all shadow-neu-btn-accent"
                >
                  <span>Check Offers</span>
                  <div className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
              <div className="relative flex items-center justify-center">
                {/* 3D Gift Box / Image */}
                <div className="w-40 sm:w-52 lg:w-60 relative z-10">
                  <Image
                    src={HERO_ASSETS.giftbox}
                    alt="Special Offers"
                    width={240}
                    height={240}
                    className="w-full h-auto object-contain rounded-2xl drop-shadow-lg"
                  />
                </div>

                {/* 30% OFF Pill Badge */}
                <div className="absolute -right-2 top-1/4 z-20 bg-white rounded-2xl p-2.5 sm:p-3.5 shadow-lg border border-black/5 flex flex-col items-center justify-center text-center">
                  <span className="text-xl sm:text-2xl font-extrabold text-[#171717] leading-none">
                    30%
                  </span>
                  <span className="text-[10px] font-extrabold text-[#709E1E] uppercase mt-0.5">
                    OFF
                  </span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
