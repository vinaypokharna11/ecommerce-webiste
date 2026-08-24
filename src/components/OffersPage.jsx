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
  Gift,
  Clock,
  ChevronRight
} from 'lucide-react';
import { HERO_ASSETS } from '../data/mockData';
import { useCatalog } from '../context/CatalogContext';

const CouponCard = ({ offer, index, storeConfig }) => {
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className={`relative bg-white rounded-3xl border ${offer.borderColor || 'border-[#EAE6FD]'} overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_35px_rgba(98,87,255,0.14)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between`}
    >
      {offer.popular && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EC5AC8] text-white text-[10px] font-bold shadow-md">
            <Zap className="w-2.5 h-2.5 fill-white" />
            Most Popular
          </span>
        </div>
      )}

      {/* Top gradient band */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${offer.gradient || 'from-[#6257FF] to-[#8B5CF6]'}`} />

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl ${offer.bgLight || 'bg-[#F5F3FF]'} border ${offer.borderColor || 'border-[#EAE6FD]'} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
              {offer.icon || '🎁'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={`text-2xl font-extrabold text-[#15152A]`}>{offer.title}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${offer.badgeColor || 'bg-[#EDE9FE] text-[#6257FF]'}`}>
                  {offer.subtitle}
                </span>
              </div>
              <p className="text-xs text-[#626276] leading-relaxed">{offer.description}</p>
            </div>
          </div>

          {/* Coupon code row */}
          <div className={`flex items-center justify-between p-3 rounded-2xl ${offer.bgLight || 'bg-[#F5F3FF]'} border ${offer.borderColor || 'border-[#EAE6FD]'} border-dashed mb-4`}>
            <div className="flex items-center gap-2">
              <Tag className={`w-4 h-4 text-[#6257FF]`} />
              <span className="font-mono font-extrabold text-[#15152A] text-sm tracking-widest">
                {offer.code}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-90 ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : `bg-gradient-to-r ${offer.gradient || 'from-[#6257FF] to-[#8B5CF6]'} text-white hover:opacity-90`
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
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
        </div>

        {/* Validity + Shop Now */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#EAE6FD]/60">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8E8EA0] font-medium">
            <Clock className="w-3.5 h-3.5" />
            {offer.expiry || 'No Expiry'}
          </div>
          <button
            onClick={handleShopOnWhatsApp}
            className="flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:text-[#128C7E] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            Shop on WhatsApp
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const OffersPage = ({ onExploreCatalog }) => {
  const { offers, storeConfig } = useCatalog();
  const activeOffers = offers.filter((o) => o.isActive !== false);

  return (
    <section className="relative pt-24 pb-28 md:pt-32 md:pb-32 overflow-hidden min-h-screen">
      {/* Ambient glows */}
      <div className="absolute top-20 right-10 w-96 h-96 ambient-glow-purple rounded-full pointer-events-none -z-10 blur-3xl" />
      <div className="absolute bottom-40 -left-20 w-80 h-80 ambient-glow-pink rounded-full pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl gradient-promo-banner p-6 sm:p-8 mb-10 shadow-[0_15px_50px_rgba(98,87,255,0.25)]"
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            {/* Left content */}
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm mb-4 text-white text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Limited Time Deals
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2">
                Big Savings
                <br />
                <span className="text-[#FFD6F0]">Just for You!</span>
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-sm mb-6">
                Up to 50% OFF on selected products across all categories. Use the codes below to unlock your savings!
              </p>
              <button
                onClick={onExploreCatalog}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#6257FF] font-bold text-sm shadow-md hover:scale-105 transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: big 50% OFF badge + gift box */}
            <div className="relative flex-shrink-0 flex items-center justify-center">
              <div className="relative w-40 sm:w-48">
                <img
                  src={HERO_ASSETS.giftbox}
                  alt="Gift Box Offer"
                  className="w-full h-auto object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                />
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-white flex flex-col items-center justify-center shadow-xl"
                >
                  <span className="text-2xl font-extrabold text-[#EC5AC8] leading-none">50%</span>
                  <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider">OFF</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Section heading: Top Offers ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#15152A]">Top Active Offers</h2>
            <p className="text-sm text-[#626276] mt-0.5">Copy the code & paste at checkout or send on WhatsApp</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF0FB] border border-[#FCD6F2] text-xs font-bold text-[#EC5AC8]">
            <Gift className="w-3.5 h-3.5" />
            {activeOffers.length} Active Deals
          </span>
        </div>

        {/* ── Offer Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {activeOffers.map((offer, index) => (
            <CouponCard key={offer.id} offer={offer} index={index} storeConfig={storeConfig} />
          ))}
        </div>

        {/* ── WhatsApp CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE6FD] shadow-[0_4px_20px_rgba(98,87,255,0.06)] text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-7 h-7 text-[#25D366] fill-[#25D366]/20" />
          </div>
          <h3 className="text-lg font-extrabold text-[#15152A] mb-2">Want a Custom Deal?</h3>
          <p className="text-sm text-[#626276] max-w-sm mx-auto mb-5">
            Chat directly with {storeConfig.name} on WhatsApp to ask about exclusive offers, bundle deals, and bulk pricing.
          </p>
          <a
            href={`https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent("Hi! I'd like to know about your current special offers and deals.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366] text-white font-bold text-sm shadow-md hover:bg-[#20bd5a] hover:scale-105 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            Chat with Us on WhatsApp
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

      </div>
    </section>
  );
};
