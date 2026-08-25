import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { HERO_ASSETS } from '../data/mockData';

export const HeroSection = ({ onExploreClick }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const promoSlides = [
    {
      badge: 'Limited Offer',
      title: 'First Purchase Enjoy a Special Offer',
      desc: 'Get exclusive 30% OFF on all trending items this week.',
      cta: 'Shop Now',
      image: HERO_ASSETS.bag,
    },
    {
      badge: 'New Season',
      title: 'Discover Fresh Urban & Casual Styles',
      desc: 'Handcrafted footwear and premium street-smart apparel.',
      cta: 'Explore All',
      image: HERO_ASSETS.smartwatch,
    },
  ];

  const currentSlide = promoSlides[activeSlide];

  return (
    <section className="pt-24 md:pt-28 pb-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Hero Promo Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#AEE64C] via-[#9FD842] to-[#88CB27] p-6 sm:p-8 lg:p-10 shadow-[0_14px_35px_-8px_rgba(159,216,66,0.35)]">
        {/* Subtle Organic Wave Shapes in Background */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <svg viewBox="0 0 800 400" className="w-full h-full object-cover">
            <path d="M0,100 C150,200 350,0 500,100 C650,200 750,50 800,100 L800,400 L0,400 Z" fill="#FFFFFF" fillOpacity="0.4" />
            <path d="M0,160 C200,80 400,240 600,140 C700,90 750,150 800,120 L800,400 L0,400 Z" fill="#FFFFFF" fillOpacity="0.3" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Text Column */}
          <div className="md:col-span-7 text-left space-y-4">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#171717] text-white text-xs font-bold tracking-wide shadow-sm"
            >
              {currentSlide.badge}
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              key={`title-${activeSlide}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#171717] leading-[1.18] tracking-tight max-w-md"
            >
              {currentSlide.title}
            </motion.h1>

            <p className="text-xs sm:text-sm text-[#2D3A16] max-w-sm font-medium leading-relaxed">
              {currentSlide.desc}
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={onExploreClick}
                className="group inline-flex items-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full bg-[#171717] text-white font-bold text-sm shadow-neu-btn-dark hover:bg-black transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>{currentSlide.cta}</span>
                <div className="w-8 h-8 rounded-full bg-white text-[#171717] flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </button>
            </div>
          </div>

          {/* Right Product / Lifestyle Visual */}
          <div className="md:col-span-5 flex justify-center md:justify-end relative">
            <motion.div 
              key={`img-${activeSlide}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-[24px] overflow-hidden bg-white/30 backdrop-blur-md p-3 shadow-sm flex items-center justify-center"
            >
              <Image 
                src={currentSlide.image}
                alt="Promo Special Offer"
                fill
                className="object-contain p-2 rounded-[20px] drop-shadow-md transition-transform duration-500 hover:scale-105"
                priority
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dot Pagination Indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {promoSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`transition-all duration-300 rounded-full h-2 ${
              activeSlide === idx 
                ? 'w-6 bg-[#9FD842]' 
                : 'w-2 bg-[#D4D4D0] hover:bg-[#A0A0A0]'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
