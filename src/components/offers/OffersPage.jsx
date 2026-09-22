'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Tag, 
  Copy, 
  Check, 
  ArrowRight, 
  Zap, 
  ChevronRight 
} from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';

/**
 * Standard Grid View Coupon Card
 */
const CouponCard = ({ offer, index, onExploreCatalog }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(offer.code)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_34px_rgba(0,0,0,0.08)] transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1"
    >
      {/* Decorative gradient top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${offer.gradient || 'from-[#1D1D1F] to-[#0071E3]'}`} />

      <div>
        {/* Card Header & Badge */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <span className="text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#F5F5F7] text-[#0071E3] border border-black/[0.06] font-sans truncate">
            {offer.subtitle}
          </span>
          {offer.popular && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1D1D1F] text-white text-[10px] sm:text-[11px] font-bold font-sans shrink-0 shadow-xs">
              <Zap className="w-3 h-3 text-[#FFB340] fill-[#FFB340]" />
              Trending
            </span>
          )}
        </div>

        {/* Discount Amount & Description */}
        <div className="flex items-start gap-3 mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/[0.06] flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-inner">
            {offer.icon || '🎁'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-[#1D1D1F] tracking-tight font-sans">
              {offer.title}
            </h3>
            <p className="text-xs text-[#6E6E73] leading-relaxed font-normal mt-0.5 line-clamp-2">
              {offer.description}
            </p>
          </div>
        </div>

        {/* Terms: Expiry & Min Order */}
        <div className="flex items-center justify-between text-[11px] text-[#86868B] font-medium mb-3">
          <span>{offer.expiry || 'Limited Period'}</span>
          {Number(offer.minOrderAmount) > 0 && (
            <span className="font-semibold text-[#1D1D1F]">Min order ₹{offer.minOrderAmount}</span>
          )}
        </div>
      </div>

      {/* Code Box & Actions */}
      <div className="pt-3 border-t border-dashed border-black/[0.1] space-y-3">
        <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 pl-3 rounded-xl bg-[#F5F5F7] border border-black/[0.06]">
          <div className="flex items-center gap-1.5 min-w-0">
            <Tag className="w-3.5 h-3.5 text-[#1D1D1F] shrink-0" />
            <span className="font-mono font-black text-[#1D1D1F] text-xs sm:text-sm tracking-wider truncate">
              {offer.code}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#1D1D1F] hover:bg-black text-white shadow-xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {onExploreCatalog && (
          <button
            onClick={() => onExploreCatalog(offer.category || 'all')}
            className="w-full py-2 rounded-xl bg-transparent hover:bg-black/[0.04] text-[#0071E3] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Explore eligible products</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const OffersPage = ({ onExploreCatalog }) => {
  const { offers = [] } = useCatalog();

  // Public customer view strictly filters out paused, deleted, and expired offers
  const activeOffers = offers.filter((o) => {
    if (o.isDeleted === true || o.status === 'DELETED') return false;
    if (o.status === 'PAUSED' || o.isActive === false) return false;
    if (o.status === 'EXPIRED') return false;
    if (o.endDate && new Date(o.endDate).getTime() < Date.now()) return false;
    return true;
  });

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

        {/* Section Header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-bold text-[#1D1D1F]">Available Coupons</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1D1D1F] text-white">
            {activeOffers.length}
          </span>
        </div>

        {/* Coupons Grid or Empty State */}
        {activeOffers.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-black/[0.06] shadow-sm max-w-lg mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-2xl mx-auto">
              🏷️
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F]">No Active Coupons Right Now</h3>
            <p className="text-xs text-[#6E6E73] max-w-xs mx-auto">
              All promotional deals are currently paused or concluded. Please check back soon for upcoming flash sales and festive offers!
            </p>
            {onExploreCatalog && (
              <button
                onClick={() => onExploreCatalog('all')}
                className="mt-2 px-5 py-2.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
              >
                Browse Catalog
              </button>
            )}
          </div>
        ) : (
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
