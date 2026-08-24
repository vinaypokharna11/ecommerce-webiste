import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import { HERO_ASSETS } from '../data/mockData';

export const HeroSection = ({ onExploreClick }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate normalized mouse coordinates from center of screen (-1 to 1)
      const { innerWidth, innerHeight } = window;
      if (innerWidth >= 768) {
        const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
        const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
        setMousePos({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background Radial Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 ambient-glow-purple rounded-full pointer-events-none -z-10 blur-3xl" />
      <div className="absolute top-1/3 right-10 w-80 h-80 ambient-glow-pink rounded-full pointer-events-none -z-10 blur-3xl" />
      <div className="absolute bottom-10 left-1/4 w-72 h-72 ambient-glow-lavender rounded-full pointer-events-none -z-10 blur-3xl" />

      {/* Decorative SVG Curved Rings in background */}
      <div className="absolute right-0 top-1/4 w-[600px] h-[600px] -z-10 opacity-30 pointer-events-none hidden lg:block">
        <svg viewBox="0 0 500 500" className="w-full h-full animate-spin-slow">
          <circle cx="250" cy="250" r="210" fill="none" stroke="url(#ringGrad)" strokeWidth="1.5" strokeDasharray="6 12" />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6257FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EC5AC8" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-6 z-10 text-left">
            {/* Announcement Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0FB] border border-[#FCD6F2] shadow-sm mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#EC5AC8] fill-current" />
              <span className="text-xs font-bold tracking-wide text-[#EC5AC8]">
                Welcome to ShopEase
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] mb-6 text-[#15152A]"
            >
              <span className="block gradient-text-hero">Shop Smart.</span>
              <span className="block gradient-text-hero">Live Better.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-[#626276] leading-relaxed max-w-lg mb-8 font-normal"
            >
              Explore amazing products, exclusive offers and best deals – all in one place.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={onExploreClick}
                className="gradient-btn-primary group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-base shadow-btn transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#6257FF]/30"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            </motion.div>
          </div>

          {/* Right Column: 3D Product Visual Composition */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[420px] sm:min-h-[500px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative w-full max-w-[540px] aspect-square flex items-center justify-center"
            >
              {/* Soft Ambient Center Glow Disc */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#6257FF]/10 via-[#8B5CF6]/15 to-[#EC5AC8]/10 rounded-full blur-2xl transform scale-90" />

              {/* Main Object: Purple Shopping Bag */}
              <motion.div
                style={{
                  x: mousePos.x * 8,
                  y: mousePos.y * 8,
                }}
                className="relative z-20 w-[62%] sm:w-[60%] animate-float-gentle"
              >
                <div className="relative group">
                  <img
                    src={HERO_ASSETS.bag}
                    alt="ShopEase Best Quality Bag"
                    className="w-full h-auto object-contain rounded-3xl drop-shadow-[0_20px_40px_rgba(98,87,255,0.22)] select-none pointer-events-none"
                    loading="eager"
                  />
                </div>
              </motion.div>

              {/* Floating Element 1: Pink Headphones (Right) */}
              <motion.div
                style={{
                  x: mousePos.x * 14,
                  y: mousePos.y * 14,
                }}
                className="absolute right-0 sm:-right-4 top-[22%] w-[38%] sm:w-[36%] z-30 animate-float-alt"
              >
                <div className="relative group">
                  <img
                    src={HERO_ASSETS.headphones}
                    alt="Pastel Pink Headphones"
                    className="w-full h-auto object-contain rounded-2xl drop-shadow-[0_15px_30px_rgba(236,90,200,0.25)] select-none pointer-events-none"
                    loading="eager"
                  />
                </div>
              </motion.div>

              {/* Floating Element 2: Potted Plant / Succulent on Pedestal (Top Left) */}
              <motion.div
                style={{
                  x: mousePos.x * -10,
                  y: mousePos.y * -10,
                }}
                className="absolute left-[4%] top-[10%] w-[30%] sm:w-[28%] z-15 animate-float-gentle"
              >
                <div className="relative group">
                  <img
                    src={HERO_ASSETS.plant}
                    alt="Succulent in Pastel Pot on Pedestal"
                    className="w-full h-auto object-contain rounded-2xl drop-shadow-[0_12px_24px_rgba(98,87,255,0.18)] select-none pointer-events-none"
                    loading="eager"
                  />
                </div>
              </motion.div>

              {/* Floating Element 3: Smartwatch on Pedestal (Bottom Left) */}
              <motion.div
                style={{
                  x: mousePos.x * -16,
                  y: mousePos.y * -16,
                }}
                className="absolute left-[8%] bottom-[6%] w-[32%] sm:w-[30%] z-30 animate-float-pulse"
              >
                <div className="relative group">
                  <img
                    src={HERO_ASSETS.smartwatch}
                    alt="Smartwatch on Pedestal"
                    className="w-full h-auto object-contain rounded-2xl drop-shadow-[0_16px_32px_rgba(98,87,255,0.22)] select-none pointer-events-none"
                    loading="eager"
                  />
                </div>
              </motion.div>

              {/* Floating Heart Notification Pill */}
              <motion.div
                style={{
                  x: mousePos.x * 12,
                  y: mousePos.y * 12,
                }}
                className="absolute top-[8%] left-[45%] z-40 animate-float-pulse"
              >
                <div className="glass-heart-pill flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg border border-white/80">
                  <Heart className="w-6 h-6 text-[#EC5AC8] fill-current animate-pulse" />
                </div>
              </motion.div>

              {/* Floating Sparkles & Soft Glow Spheres */}
              <div className="absolute top-[20%] left-[25%] w-3 h-3 rounded-full bg-[#EC5AC8] animate-sparkle shadow-[0_0_10px_#EC5AC8]" />
              <div className="absolute bottom-[25%] right-[15%] w-4 h-4 rounded-full bg-[#6257FF] animate-sparkle shadow-[0_0_12px_#6257FF]" style={{ animationDelay: '1.2s' }} />
              <div className="absolute top-[40%] right-[30%] w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-sparkle shadow-[0_0_8px_#8B5CF6]" style={{ animationDelay: '0.6s' }} />

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
