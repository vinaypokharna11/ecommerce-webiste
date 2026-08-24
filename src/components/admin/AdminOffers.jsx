import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Check,
  Zap,
  Sparkles,
  Clock,
  Gift,
  Percent,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { GRADIENT_OPTIONS } from './adminConstants';

export const AdminOffers = () => {
  const { offers, categories, addOffer, updateOffer, deleteOffer, toggleOfferActive } = useCatalog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [discountPercent, setDiscountPercent] = useState(25);
  const [category, setCategory] = useState('all');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('Valid till Sep 30');
  const [gradientIndex, setGradientIndex] = useState(0);
  const [icon, setIcon] = useState('🎁');
  const [popular, setPopular] = useState(false);
  const [errors, setErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setCode('FESTIVE25');
    setTitle('25% OFF');
    setSubtitle('on All Categories');
    setDiscountPercent(25);
    setCategory('all');
    setDescription('Special festive discount on all products storewide.');
    setExpiry('Valid till Sep 30');
    setGradientIndex(0);
    setIcon('🎁');
    setPopular(false);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingOffer(offer);
    setCode(offer.code);
    setTitle(offer.title);
    setSubtitle(offer.subtitle || '');
    setDiscountPercent(offer.discountPercent || 20);
    setCategory(offer.category || 'all');
    setDescription(offer.description || '');
    setExpiry(offer.expiry || 'Valid till Sep 30');
    const gIndex = GRADIENT_OPTIONS.findIndex((g) => g.value === offer.gradient);
    setGradientIndex(gIndex >= 0 ? gIndex : 0);
    setIcon(offer.icon || '🎁');
    setPopular(!!offer.popular);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCopyCode = (offerCode) => {
    navigator.clipboard.writeText(offerCode).then(() => {
      setCopiedCode(offerCode);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!code.trim()) errs.code = 'Coupon code is required';
    if (!title.trim()) errs.title = 'Offer title is required (e.g. 20% OFF)';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const selectedGrad = GRADIENT_OPTIONS[gradientIndex] || GRADIENT_OPTIONS[0];

    const payload = {
      code: code.toUpperCase().trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      discountPercent: Number(discountPercent) || 0,
      category,
      description: description.trim(),
      expiry: expiry.trim(),
      gradient: selectedGrad.value,
      bgLight: selectedGrad.bg,
      textColor: `text-[${selectedGrad.text}]`,
      borderColor: selectedGrad.border,
      badgeColor: `${selectedGrad.bg} text-[${selectedGrad.text}]`,
      icon,
      popular,
      isActive: editingOffer ? editingOffer.isActive !== false : true,
    };

    if (editingOffer) {
      updateOffer(editingOffer.id, payload);
    } else {
      addOffer(payload);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (offerToDelete) {
      deleteOffer(offerToDelete.id);
      setOfferToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#15152A] tracking-tight">
            Offers & Promotions
          </h1>
          <p className="text-xs sm:text-sm text-[#626276] mt-0.5">
            Create promo codes, category flash sales, and customer discount coupons
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl gradient-btn-primary text-white font-bold text-xs sm:text-sm shadow-btn hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* ── Offers Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {offers.map((offer) => {
          const isCopied = copiedCode === offer.code;
          const isActive = offer.isActive !== false;

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative bg-white rounded-3xl border ${offer.borderColor || 'border-[#EAE6FD]'} overflow-hidden shadow-[0_4px_20px_rgba(98,87,255,0.04)] hover:shadow-[0_12px_35px_rgba(98,87,255,0.12)] transition-all group flex flex-col justify-between ${
                !isActive ? 'opacity-60 grayscale-[40%]' : ''
              }`}
            >
              {/* Top gradient band */}
              <div className={`h-2 w-full bg-gradient-to-r ${offer.gradient || 'from-[#6257FF] to-[#8B5CF6]'}`} />

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Top Badges & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {offer.popular && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EC5AC8] text-white text-[10px] font-bold shadow-xs">
                          <Zap className="w-2.5 h-2.5 fill-white" />
                          Most Popular
                        </span>
                      )}
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isActive ? '● Active' : '○ Paused'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleOfferActive(offer.id)}
                        className="p-1.5 rounded-lg text-[#626276] hover:bg-[#FAF9FF] transition-colors"
                        title={isActive ? 'Pause Offer' : 'Activate Offer'}
                      >
                        {isActive ? <PauseCircle className="w-4 h-4 text-amber-500" /> : <PlayCircle className="w-4 h-4 text-emerald-600" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(offer)}
                        className="p-1.5 rounded-lg text-[#6257FF] hover:bg-[#EDE9FE] transition-colors"
                        title="Edit Offer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setOfferToDelete(offer)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Header info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl ${offer.bgLight || 'bg-[#F5F3FF]'} flex items-center justify-center text-2xl flex-shrink-0 shadow-xs border border-[#EAE6FD]`}>
                      {offer.icon || '🎁'}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-[#15152A]">{offer.title}</span>
                        <span className="text-xs font-bold text-[#8B5CF6]">{offer.subtitle}</span>
                      </div>
                      <p className="text-xs text-[#626276] mt-0.5 line-clamp-2 leading-relaxed">
                        {offer.description}
                      </p>
                    </div>
                  </div>

                  {/* Coupon Code Pill */}
                  <div className={`flex items-center justify-between p-2.5 rounded-2xl ${offer.bgLight || 'bg-[#F5F3FF]'} border border-dashed ${offer.borderColor || 'border-[#EAE6FD]'} mb-3`}>
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#6257FF]" />
                      <span className="font-mono font-extrabold text-[#15152A] text-xs tracking-wider">
                        {offer.code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                        isCopied ? 'bg-emerald-500 text-white' : 'bg-white text-[#6257FF] shadow-xs border border-[#EAE6FD]'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Validity */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-[#8E8EA0] font-medium border-t border-[#EAE6FD]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {offer.expiry || 'No Expiry'}
                  </span>
                  <span className="font-bold text-[#6257FF]">
                    {offer.discountPercent ? `${offer.discountPercent}% Discount` : 'Special Deal'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-[#15152A]/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EAE6FD] shadow-2xl z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[#EAE6FD] bg-gradient-to-r from-white via-[#FAF9FF] to-[#F5F3FF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EC5AC8] to-[#6257FF] flex items-center justify-center text-white shadow-md">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#15152A]">
                      {editingOffer ? 'Edit Offer Coupon' : 'Create Promotional Offer'}
                    </h3>
                    <p className="text-xs text-[#626276]">Publish promo code to the customer Offers page</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF9FF] text-[#626276] flex items-center justify-center hover:bg-[#F0EEFF]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                      Promo Code *
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SUMMER30"
                      className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm font-mono font-bold text-[#15152A] focus:outline-none focus:border-[#6257FF]"
                    />
                    {errors.code && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.code}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm font-bold text-[#15152A] focus:outline-none focus:border-[#6257FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                      Offer Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 30% OFF, FLAT ₹500 OFF"
                      className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
                    />
                    {errors.title && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                      Subtitle / Category Scope
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. on Fashion, on Audio Gear"
                      className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                      Applicable Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
                    >
                      <option value="all">All Products (Storewide)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                      Expiry Text
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="e.g. Valid till Sep 30"
                      className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
                    />
                  </div>
                </div>

                {/* Emoji Icon Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Coupon Icon (Emoji)
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {['🎁', '🎧', '👕', '👟', '🕶️', '🏠', '✨', '🔥', '⚡', '🎉'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setIcon(em)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                          icon === em ? 'ring-2 ring-[#6257FF] bg-[#EDE9FE] border-[#6257FF]' : 'bg-[#FAF9FF] border-[#EAE6FD]'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gradient Style */}
                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Card Theme Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GRADIENT_OPTIONS.map((g, idx) => (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => setGradientIndex(idx)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                          gradientIndex === idx ? 'ring-2 ring-[#6257FF] border-[#6257FF] bg-white' : 'border-[#EAE6FD] bg-[#FAF9FF]'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${g.value}`} />
                        <span className="truncate">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of coupon terms & benefits..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EAE6FD] text-xs text-[#15152A] focus:outline-none focus:border-[#6257FF] resize-none"
                  />
                </div>

                {/* Popular Toggle */}
                <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-[#EC5AC8] accent-[#EC5AC8] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#15152A] block">Mark as "Most Popular" Deal</span>
                    <span className="text-[11px] text-[#8E8EA0]">Highlights the coupon with a vibrant badge</span>
                  </div>
                </label>

                {/* Footer */}
                <div className="pt-4 border-t border-[#EAE6FD] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#626276] hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold shadow-btn hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingOffer ? 'Update Offer' : 'Publish Offer'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {offerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOfferToDelete(null)}
              className="fixed inset-0 bg-[#15152A]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-[#EAE6FD] shadow-2xl z-10 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#15152A] mb-1">
                Delete Offer?
              </h3>
              <p className="text-xs text-[#626276] max-w-xs mx-auto mb-6">
                Are you sure you want to delete coupon <strong className="text-[#15152A]">"{offerToDelete.code}"</strong>? It will no longer appear on the customer Offers page.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setOfferToDelete(null)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-[#626276] hover:bg-[#FAF9FF]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md"
                >
                  Yes, Delete Offer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
