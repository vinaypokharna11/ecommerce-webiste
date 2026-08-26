'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles, ShoppingBag, ShieldCheck, Truck, MessageCircle } from 'lucide-react';
import DriftWall from './DriftWall';
import ScrollExpand from './ScrollExpand';
import { HERO_ASSETS } from '../data/mockData';

// Import all product visual assets for the 3D DriftWall
import prodHeadphones from '../assets/images/prod_headphones.jpg';
import prodSmartwatch from '../assets/images/prod_smartwatch.jpg';
import prodSneakers from '../assets/images/prod_sneakers.jpg';
import prodBackpack from '../assets/images/prod_backpack.jpg';
import promoGiftbox from '../assets/images/promo_giftbox.jpg';
import catLinenShirt from '../assets/images/cat_linen_shirt.jpg';
import catSunglasses from '../assets/images/cat_sunglasses.jpg';
import catSpeaker from '../assets/images/cat_speaker.jpg';
import prodCottonTee from '../assets/images/prod_cotton_tee.jpg';
import prodDenimJacket from '../assets/images/prod_denim_jacket.jpg';
import prodLeatherLoafers from '../assets/images/prod_leather_loafers.jpg';
import prodLeatherWallet from '../assets/images/prod_leather_wallet.jpg';
import prodAromaDiffuser from '../assets/images/prod_aroma_diffuser.jpg';

const DRIFT_ITEMS = [
  { image: HERO_ASSETS.bag, title: 'Luxury Shopper' },
  { image: prodSneakers, title: 'Urban Sneakers' },
  { image: prodSmartwatch, title: 'Apex Smartwatch' },
  { image: prodDenimJacket, title: 'Vintage Denim' },
  { image: catSunglasses, title: 'Polarized Shades' },
  { image: prodLeatherLoafers, title: 'Oxford Loafers' },
  { image: prodHeadphones, title: 'Studio Audio' },
  { image: prodLeatherWallet, title: 'Slim Wallet' },
  { image: catLinenShirt, title: 'Breeze Linen Shirt' },
  { image: promoGiftbox, title: 'Festive Gift Box' },
  { image: prodBackpack, title: 'Heritage Pack' },
  { image: prodAromaDiffuser, title: 'Zen Diffuser' },
  { image: HERO_ASSETS.plant, title: 'Indoor Flora' },
  { image: prodCottonTee, title: 'Heavyweight Tee' },
  { image: catSpeaker, title: 'Acoustic Sound' },
];

export const HeroSection = ({ onExploreClick }) => {
  return (
    <section className="relative w-full">
      <ScrollExpand
        useWindowScroll
        reverse
        startWidth={98}
        startHeight={88}
        startRadius={24}
        endRadius={0}
        scrollDistance={0.65}
        holdDistance={0.08}
        smoothing={1.2}
        scrollHint="Scroll to explore ↓"
        className="w-full"
      >
        {/* Full Viewport Hero Container with DriftWall */}
        <div className="relative w-full h-full bg-[#EEEEEC]/75 border border-black/[0.08] flex items-center justify-center overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08),0_4px_16px_-4px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)]">
          {/* Background 3D DriftWall */}
          <div className="absolute inset-0 w-full h-full pointer-events-auto">
            <DriftWall
              items={DRIFT_ITEMS}
              columns={5}
              tileWidth={210}
              tileHeight={138}
              gap={16}
              radius={18}
              tilt={14}
              turn={-12}
              roll={1}
              perspective={1100}
              depth={100}
              speed={36}
              direction="up"
              variance={0.4}
              parallax={0.5}
              lift={0}
              pauseOnHover={false}
              fade={0.35}
              dim={0.92}
              overlayColor="transparent"
            />
          </div>

          {/* Soft Radial Ambient Gradient behind central card */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 65% 70% at 50% 50%, rgba(245, 245, 243, 0.9) 0%, rgba(245, 245, 243, 0.45) 65%, transparent 100%)',
            }}
          />

          {/* Foreground Content Card with Glassmorphism */}
          <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 text-center flex flex-col items-center justify-center pointer-events-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/5 shadow-sm text-xs font-bold text-[#171717] mb-5 tracking-wide font-sans"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9FD842]" />
              <span>New Season Collection 2026</span>
            </motion.div>

            {/* Main Headline in Plus Jakarta Sans */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#171717] leading-[1.12] tracking-tight mb-4 font-sans"
            >
              Timeless Elegance, <br className="hidden sm:inline" />
              <span className="font-bold text-[#709E1E]">Crafted for You</span>
            </motion.h1>

            {/* Subtitle in Manrope */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-[#666666] max-w-lg mb-8 leading-relaxed font-sans"
            >
              Explore our curated range of premium imitation jewelry, bespoke fashion accessories, and instant WhatsApp ordering in Bangalore.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3.5"
            >
              <button
                onClick={onExploreClick}
                className="group inline-flex items-center gap-3 pl-6 pr-2.5 py-3 rounded-full bg-[#171717] text-white font-bold text-sm shadow-neu-btn-dark hover:bg-black transition-all duration-200 active:scale-95 cursor-pointer font-sans"
              >
                <span>Explore Catalog</span>
                <div className="w-8 h-8 rounded-full bg-white text-[#171717] flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </button>

              <a
                href="https://wa.me/919876543210?text=Hi%20Nakoda%20Imitation,%20I'd%20like%20to%20inquire%20about%20your%20collection"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/90 hover:bg-white text-[#171717] font-bold text-sm border border-black/10 shadow-sm backdrop-blur-md transition-all active:scale-95 font-sans"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp Inquire</span>
              </a>
            </motion.div>

            {/* Trust Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-10 pt-6 border-t border-black/5 text-xs font-semibold text-[#777777] font-sans"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#171717]" />
                <span>Guaranteed Quality</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#171717]" />
                <span>Pan-India Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#171717]" />
                <span>Instant WhatsApp Order</span>
              </div>
            </motion.div>
          </div>
        </div>
      </ScrollExpand>
    </section>
  );
};

export default HeroSection;
