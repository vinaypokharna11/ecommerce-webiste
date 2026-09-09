'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Tag, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Zap,
  ShoppingBag,
  MessageCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { HERO_ASSETS } from '@/data/mockData';
import { useCatalog } from '@/context/CatalogContext';

const CouponCard = ({ offer, index, storeConfig, onExplore }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(offer.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShopOnWhatsApp = () => {
    const msg = `Hi ${storeConfig.name}! I'd like to use the code *${offer.code}* for ${offer.title} ${offer.subtitle}. Can you help me place an order?`;
    window.open(`https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[26px] border border-black/[0.05] p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Top Meta Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#0071E3] border border-black/[0.06] font-sans">
            {offer.subtitle}
          </span>
          {offer.popular && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1D1D1F] text-white text-[10px] font-semibold tracking-wide font-sans shrink-0">
              <Zap className="w-2.5 h-2.5 text-[#FFB340] fill-[#FFB340]" />
              Trending Deal
            </span>
          )}
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/[0.06] flex items-center justify-center text-lg sm:text-xl shrink-0">
            {offer.icon || '🎁'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F] tracking-tight font-sans truncate mb-0.5">
              {offer.title}
            </h3>
            <p className="text-xs text-[#6E6E73] leading-relaxed font-normal line-clamp-2">{offer.description}</p>
          </div>
        </div>

        {/* Coupon Code Pill */}
        <div className="flex items-center justify-between p-2 sm:p-2.5 px-3 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/[0.06] mb-4 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Tag className="w-3.5 h-3.5 text-[#1D1D1F] shrink-0" />
            <span className="font-mono font-bold text-[#1D1D1F] text-[11px] sm:text-xs tracking-wider truncate">
              {offer.code}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0 ${
              copied
                ? 'bg-[#1D1D1F] text-white'
                : 'bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 stroke-[3]" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-black/[0.06]">
        <button
          onClick={onExplore}
          className="flex-1 py-2 sm:py-2.5 rounded-full bg-[#1D1D1F] text-white hover:bg-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer tracking-wide"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Shop Collection</span>
        </button>

        <button
          onClick={handleShopOnWhatsApp}
          className="p-2 sm:p-2.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-200 shrink-0 cursor-pointer"
          title="Order with code on WhatsApp"
        >
          <MessageCircle className="w-4 h-4 fill-emerald-600/20" />
        </button>
      </div>
    </motion.div>
  );
};

export const OffersPage = ({ onExploreCatalog }) => {
  const { offers, storeConfig } = useCatalog();

  return (
    <section className="pt-20 sm:pt-28 pb-28 sm:pb-24 min-h-screen bg-[#FBFBFD] text-[#1D1D1F]">
      <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1D1D1F] tracking-tight font-sans leading-tight mb-2">
            Exclusive Deals & Offers
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] font-normal">
            Apply any promo code during checkout or inquire instantly on WhatsApp.
          </p>
        </div>

        {/* Hero Promo Banner */}
        <div className="mb-8 sm:mb-10 overflow-hidden rounded-2xl sm:rounded-[2rem] bg-gradient-to-r from-[#1D1D1F] via-[#2D2D30] to-[#1D1D1F] p-4.5 xs:p-6 sm:p-10 text-white shadow-xl border border-black/10 relative">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
            <div className="text-left space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#0071E3] border border-white/15 text-[10px] font-bold uppercase tracking-wider font-sans">
                Curated Privilege
              </span>
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold leading-tight font-sans">
                Up to 40% OFF Multi-Category Special
              </h2>
              <p className="text-xs sm:text-sm text-[#A1A1A6] max-w-md font-normal">
                Save big on spinner trolleys, lifestyle bags, jewelry, authentic papads, combed cotton undergarments & electronics.
              </p>
            </div>

            <button
              onClick={onExploreCatalog}
              className="w-full md:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white text-[#1D1D1F] hover:bg-neutral-100 font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4 text-[#1D1D1F]" />
            </button>
          </div>
        </div>

        {/* Coupon Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
          {offers.map((offer, index) => (
            <CouponCard
              key={offer.id || index}
              offer={offer}
              index={index}
              storeConfig={storeConfig}
              onExplore={onExploreCatalog}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersPage;
