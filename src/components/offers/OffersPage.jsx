'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Zap,
  Clock,
  ChevronRight,
  Layers,
  LayoutGrid,
  ShoppingBag
} from 'lucide-react';
import Image from 'next/image';
import { useCatalog } from '@/context/CatalogContext';
import ScrollStack, { ScrollStackItem } from '@/components/ui/ScrollStack';

/**
 * Standard Grid View Coupon Card
 */
const CouponCard = ({ offer, index, onExploreCatalog }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(offer.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[26px] border border-black/[0.05] p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Top Meta Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5F5F7] text-[#0071E3] border border-black/[0.06] font-sans">
            {offer.subtitle}
          </span>
          {offer.popular && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D1D1F] text-white text-xs font-bold tracking-wide font-sans shrink-0 shadow-xs">
              <Zap className="w-3 h-3 text-[#FFB340] fill-[#FFB340]" />
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
        <div className="flex items-center justify-between p-2 sm:p-2.5 px-3 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/[0.06] gap-2">
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

      {onExploreCatalog && offer.category && (
        <button
          onClick={() => onExploreCatalog(offer.category)}
          className="mt-3 text-[11px] font-semibold text-[#0071E3] hover:underline flex items-center gap-1 self-start"
        >
          <span>Explore eligible products</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
};

/**
 * High-End Stack View Card for ScrollStack
 */
const CouponStackCard = ({ offer, index, onExploreCatalog }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(offer.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="h-full w-full bg-white rounded-3xl sm:rounded-[32px] border border-black/[0.08] shadow-[0_16px_45px_rgba(0,0,0,0.08)] p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
      {/* Decorative gradient header accent line */}
      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${offer.gradient || 'from-[#1D1D1F] to-[#0071E3]'}`} />

      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#0071E3]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Top Meta Info */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5F5F7] text-[#0071E3] border border-black/[0.06] font-sans">
              {offer.subtitle}
            </span>
            {offer.category && (
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/5 text-[#555555]">
                {offer.category}
              </span>
            )}
            {offer.expiry && (
              <span className="text-[11px] text-[#86868B] font-medium hidden sm:inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {offer.expiry}
              </span>
            )}
          </div>

          {offer.popular && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D1D1F] text-white text-xs font-bold tracking-wide font-sans shrink-0 shadow-sm">
              <Zap className="w-3 h-3 text-[#FFB340] fill-[#FFB340]" />
              Trending Deal
            </span>
          )}
        </div>

        {/* Discount Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-inner">
            {offer.icon || '🎁'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-[#1D1D1F] tracking-tight font-sans">
                {offer.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed font-normal mt-1 line-clamp-2 sm:line-clamp-none">
              {offer.description}
            </p>
          </div>
        </div>
      </div>

      {/* Coupon Code Pill and Shop Action */}
      <div className="pt-3.5 border-t border-dashed border-black/[0.1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-2.5 p-2 px-3 sm:px-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <Tag className="w-4 h-4 text-[#1D1D1F] shrink-0" />
            <span className="font-mono font-black text-[#1D1D1F] text-xs sm:text-sm tracking-wider">
              {offer.code}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#1D1D1F] hover:bg-black text-white shadow-xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Code
              </>
            )}
          </button>
        </div>

        {onExploreCatalog && (
          <button
            onClick={() => onExploreCatalog(offer.category || 'all')}
            className="px-4 py-2.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
          >
            <span>Shop Category</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export const OffersPage = ({ onExploreCatalog }) => {
  const { offers = [] } = useCatalog();
  const [viewMode, setViewMode] = useState('stack'); // 'stack' | 'grid'

  const activeOffers = offers.filter(o => o.isActive !== false);

  return (
    <section className="pt-20 sm:pt-28 pb-28 sm:pb-24 min-h-screen bg-[#FBFBFD] text-[#1D1D1F]">
      <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1D1D1F] tracking-tight font-sans leading-tight mb-2">
            Exclusive Deals & Offer Coupons
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] font-normal">
            Apply any coupon code during checkout to enjoy exclusive category discounts.
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
              onClick={() => onExploreCatalog?.('all')}
              className="w-full md:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white text-[#1D1D1F] hover:bg-neutral-100 font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4 text-[#1D1D1F]" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#1D1D1F]">Available Coupons</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1D1D1F] text-white">
              {activeOffers.length}
            </span>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center p-1 rounded-full bg-[#E5E5EA]/70 border border-black/[0.04]">
            <button
              onClick={() => setViewMode('stack')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'stack'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stack View</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>
        </div>

        {/* Coupon Cards Section */}
        {viewMode === 'stack' ? (
          <div className="w-full max-w-2xl mx-auto">
            {/* Helpful scroll hint */}
            <div className="text-center mb-3">
              <span className="text-[11px] font-medium text-[#86868B] inline-flex items-center gap-1.5 bg-black/[0.03] px-3 py-1 rounded-full">
                <span>Scroll down over the stack to flip through cards</span>
                <span className="animate-bounce">↓</span>
              </span>
            </div>

            {/* ScrollStack Container */}
            <div className="h-[620px] sm:h-[680px] rounded-[32px] overflow-hidden border border-black/[0.06] bg-gradient-to-b from-[#F5F5F7]/80 to-white/90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)] relative">
              <ScrollStack
                itemDistance={90}
                itemScale={0.035}
                itemStackDistance={28}
                stackPosition="16%"
                scaleEndPosition="8%"
                baseScale={0.88}
                rotationAmount={0}
                blurAmount={0.5}
                useWindowScroll={false}
                className="h-full w-full"
              >
                {activeOffers.map((offer, index) => (
                  <ScrollStackItem key={offer.id || index} itemClassName="!p-0 !bg-transparent !border-0 !shadow-none">
                    <CouponStackCard
                      offer={offer}
                      index={index}
                      onExploreCatalog={onExploreCatalog}
                    />
                  </ScrollStackItem>
                ))}
              </ScrollStack>
            </div>
          </div>
        ) : (
          /* Classic Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
            {activeOffers.map((offer, index) => (
              <CouponCard
                key={offer.id || index}
                offer={offer}
                index={index}
                onExploreCatalog={onExploreCatalog}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default OffersPage;
