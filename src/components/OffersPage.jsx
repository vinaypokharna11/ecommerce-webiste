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
import { HERO_ASSETS } from '../data/mockData';
import { useCatalog } from '../context/CatalogContext';

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
      className="relative bg-white rounded-[26px] border border-black/[0.04] p-5 sm:p-6 shadow-neu-card hover:shadow-neu-card-hover transition-all duration-300 flex flex-col justify-between"
    >
      {offer.popular && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#171717] text-white text-[10px] font-bold shadow-sm">
            <Zap className="w-2.5 h-2.5 fill-[#9FD842] text-[#9FD842]" />
            Trending
          </span>
        </div>
      )}

      <div>
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#EEEEEC] flex items-center justify-center text-xl shrink-0 shadow-xs">
            {offer.icon || '🎁'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-xl font-extrabold text-[#171717]">{offer.title}</span>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#F3FCDA] text-[#709E1E]">
                {offer.subtitle}
              </span>
            </div>
            <p className="text-xs text-[#777777] leading-relaxed">{offer.description}</p>
          </div>
        </div>

        {/* Coupon Code Pill */}
        <div className="flex items-center justify-between p-2.5 px-3.5 rounded-full bg-[#EEEEEC] border border-black/5 mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[#171717]" />
            <span className="font-mono font-extrabold text-[#171717] text-xs tracking-wider">
              {offer.code}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-90 ${
              copied
                ? 'bg-[#171717] text-white'
                : 'bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] shadow-sm'
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
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-black/[0.04]">
        <button
          onClick={onExplore}
          className="flex-1 py-2 rounded-full bg-[#171717] text-white hover:bg-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Shop Now</span>
        </button>

        <button
          onClick={handleShopOnWhatsApp}
          className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100 shrink-0"
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
    <section className="pt-20 md:pt-28 pb-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#171717] tracking-tight leading-tight mb-2">
            Exclusive Deals & Offers
          </h1>
          <p className="text-xs sm:text-sm text-[#777777]">
            Copy any promo coupon code and apply it during checkout or order directly on WhatsApp.
          </p>
        </div>

        {/* Hero Promo Banner */}
        <div className="mb-10 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#AEE64C] via-[#9FD842] to-[#88CB27] p-6 sm:p-8 text-[#171717] shadow-neu-card relative">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#171717] text-white text-[10px] font-extrabold uppercase tracking-wide">
                Flash Deals
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Up to 40% OFF Weekend Collection
              </h2>
              <p className="text-xs text-[#2D3A16] max-w-md font-medium">
                Save big on premium apparel, footwear, and accessories. Valid while stocks last.
              </p>
            </div>

            <button
              onClick={onExploreCatalog}
              className="px-6 py-3 rounded-full bg-[#171717] text-white hover:bg-black font-extrabold text-xs flex items-center gap-2 shadow-neu-btn-dark active:scale-95 transition-all shrink-0"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Coupon Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
