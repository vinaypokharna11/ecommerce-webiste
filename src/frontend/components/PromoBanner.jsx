import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';
import { HERO_ASSETS } from '../data/mockData';

export const PromoBanner = ({ onCheckOffers }) => {
  return (
    <section className="py-10 sm:py-14" aria-label="Special Promotional Offer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] gradient-promo-banner shadow-[0_20px_50px_rgba(98,87,255,0.28)] p-8 sm:p-12 lg:p-14"
        >
          {/* Background Decorative Rings & Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Grid Layout */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm mb-4">
                <Tag className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-wider">Limited Time Offer</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Special Offer Just for You!
              </h2>

              {/* Subtext */}
              <p className="text-white/85 text-base sm:text-lg mb-8 max-w-md font-normal leading-relaxed">
                Up to 30% OFF on selected items across all categories.
              </p>

              {/* Button */}
              <button
                onClick={onCheckOffers}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-[#6257FF] font-bold text-base shadow-[0_10px_25px_rgba(0,0,0,0.12)] hover:bg-white hover:text-[#4F46E5] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
              >
                <span>Check Offers</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            </div>

            {/* Right Visual: 3D Gift Box & Discount Tag */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
              <div className="relative flex items-center justify-center">
                
                {/* 3D Gift Box Image with float animation */}
                <div className="w-48 sm:w-60 lg:w-72 animate-float-gentle relative z-10">
                  <img
                    src={HERO_ASSETS.giftbox}
                    alt="Promotional Gift Box"
                    className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)] rounded-3xl"
                    loading="lazy"
                  />
                </div>

                {/* 30% OFF Pill Badge */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  className="absolute -right-2 sm:-right-4 top-1/4 z-20 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.2)] border border-white flex flex-col items-center justify-center text-center animate-pulse-subtle"
                >
                  <span className="text-2xl sm:text-4xl font-extrabold text-[#EC5AC8] leading-none">
                    30%
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#6257FF] uppercase tracking-wider mt-0.5">
                    OFF
                  </span>
                </motion.div>

                {/* Sparkle decorative points */}
                <div className="absolute -top-3 left-4 text-white/90 animate-sparkle">
                  <Sparkles className="w-6 h-6 fill-white" />
                </div>
                <div className="absolute -bottom-4 right-10 text-white/80 animate-sparkle" style={{ animationDelay: '1.5s' }}>
                  <Sparkles className="w-5 h-5 fill-white" />
                </div>

              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
