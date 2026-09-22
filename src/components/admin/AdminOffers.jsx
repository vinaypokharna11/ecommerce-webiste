'use client';

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
  AlertTriangle,
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
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [category, setCategory] = useState('all');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('Valid till Sep 30');
  const [endDate, setEndDate] = useState('');
  const [gradientIndex, setGradientIndex] = useState(0);
  const [icon, setIcon] = useState('🎁');
  const [popular, setPopular] = useState(false);
  const [errors, setErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setCode('FESTIVE25');
    setTitle('25% OFF');
    setSubtitle('on All Collections');
    setDiscountPercent(25);
    setMinOrderAmount(0);
    setCategory('all');
    setDescription('Special discount on all jewelry items storewide.');
    setExpiry('Valid till Sep 30');
    setEndDate('');
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
    setMinOrderAmount(offer.minOrderAmount || 0);
    setCategory(offer.category || 'all');
    setDescription(offer.description || '');
    setExpiry(offer.expiry || 'Valid till Sep 30');
    setEndDate(offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '');
    const gIndex = GRADIENT_OPTIONS.findIndex((g) => g.value === offer.gradient);
    setGradientIndex(gIndex >= 0 ? gIndex : 0);
    setIcon(offer.icon || '🎁');
    setPopular(!!offer.popular);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCopyCode = (offerCode) => {
    navigator.clipboard?.writeText(offerCode);
    setCopiedCode(offerCode);
    setTimeout(() => setCopiedCode(null), 2000);
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
      minOrderAmount: Number(minOrderAmount) || 0,
      category,
      description: description.trim(),
      expiry: expiry.trim(),
      endDate: endDate ? new Date(endDate) : null,
      gradient: selectedGrad.value,
      bgLight: selectedGrad.bg,
      textColor: 'text-[#171717]',
      borderColor: 'border-black/10',
      badgeColor: 'bg-[#F3FCDA] text-[#709E1E]',
      icon,
      popular,
      isActive: editingOffer ? editingOffer.isActive !== false : true,
      status: editingOffer ? (editingOffer.isActive !== false ? 'ACTIVE' : 'PAUSED') : 'ACTIVE',
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
    <div className="space-y-6 font-sans">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Offers & Promotions
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-0.5">
            Create promo codes, collection flash sales, and customer discount coupons
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#9FD842]" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* ── Offers Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {offers.filter((o) => !o.isDeleted && o.status !== 'DELETED').map((offer) => {
          const isCopied = copiedCode === offer.code;
          const isExpired = offer.status === 'EXPIRED' || (offer.endDate && new Date(offer.endDate).getTime() < Date.now());
          const isPaused = !isExpired && (offer.status === 'PAUSED' || offer.isActive === false);
          const isActive = !isExpired && !isPaused;

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative bg-white rounded-[28px] border border-black/10 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all group flex flex-col justify-between ${
                !isActive ? 'opacity-70 grayscale-[30%]' : ''
              }`}
            >
              {/* Top gradient band */}
              <div className="h-2 w-full bg-[#171717]" />

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Top Badges & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {offer.popular && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#171717] text-[#9FD842] text-[10px] font-extrabold shadow-xs">
                          <Zap className="w-2.5 h-2.5 fill-[#9FD842]" />
                          Featured Deal
                        </span>
                      )}
                      {isExpired ? (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                          ✕ Expired
                        </span>
                      ) : isPaused ? (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          ⏸ Paused
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#F3FCDA] text-[#709E1E] border border-[#9FD842]/40">
                          ● Active
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleOfferActive(offer.id)}
                        disabled={isExpired}
                        className="p-1.5 rounded-full text-[#777777] hover:bg-[#EEEEEC] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={isExpired ? 'Coupon is expired' : isActive ? 'Pause Offer' : 'Activate Offer'}
                      >
                        {isActive ? <PauseCircle className="w-4 h-4 text-amber-500" /> : <PlayCircle className="w-4 h-4 text-emerald-600" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(offer)}
                        className="p-1.5 rounded-full text-[#777777] hover:text-[#171717] hover:bg-[#EEEEEC] transition-colors cursor-pointer"
                        title="Edit Offer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setOfferToDelete(offer)}
                        className="p-1.5 rounded-full text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Icon + Title */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{offer.icon || '🎁'}</span>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#171717]">
                        {offer.title}
                      </h3>
                      {offer.subtitle && (
                        <span className="text-xs font-semibold text-[#777777] block">
                          {offer.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#666666] line-clamp-2 mb-2 leading-relaxed">
                    {offer.description || 'Special storewide discount available for all customers.'}
                  </p>

                  {/* Usage Counter Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#666666] bg-[#EEEEEC]/70 px-2 py-0.5 rounded-md">
                      Redeemed: <strong className="text-[#171717] font-bold">{offer.usageCount || 0} times</strong>
                    </span>
                  </div>
                </div>

                {/* Footer: Promo Code Box + Expiry */}
                <div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EEEEEC]/60 border border-black/5 mb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#709E1E]" />
                      <span className="font-mono font-extrabold text-sm text-[#171717] tracking-wider">
                        {offer.code}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-[#EEEEEC] text-[#171717] text-[11px] font-bold shadow-xs border border-black/10 transition-all cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#888888] font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {offer.expiry || 'Limited Time'}
                    </span>
                    <span className="font-bold text-[#709E1E]">
                      {offer.discountPercent}% Discount
                    </span>
                  </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] border border-black/10 shadow-2xl z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-black/10 bg-[#F8FDF0]/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#171717] flex items-center justify-center text-[#9FD842] shadow-md">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#171717]">
                      {editingOffer ? 'Edit Offer & Promo' : 'Create New Offer'}
                    </h3>
                    <p className="text-xs text-[#777777]">Set coupon codes, discount rates, and terms</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#EEEEEC] text-[#777777] flex items-center justify-center hover:bg-[#E2E2DE] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. BRIDAL20"
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 text-sm font-mono font-bold text-[#171717] bg-[#EEEEEC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                    />
                    {errors.code && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.code}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                      Discount (%) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 text-sm font-bold text-[#171717] bg-[#EEEEEC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                      Offer Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 20% OFF"
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 text-sm text-[#171717] bg-[#EEEEEC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                    />
                    {errors.title && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. on Kundan Collection"
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 text-sm text-[#171717] bg-[#EEEEEC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                      Applicable Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 text-sm text-[#171717] bg-[#EEEEEC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] cursor-pointer"
                    >
                      <option value="all">All Categories (Storewide)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                      Min Order Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                      placeholder="0 for no minimum"
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 text-sm text-[#171717] bg-[#EEEEEC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                      Expiry Text
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="e.g. Valid till Oct 31"
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 text-sm text-[#171717] bg-[#EEEEEC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                      Calendar End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 text-sm text-[#171717] bg-[#EEEEEC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                    Offer Terms / Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details, restrictions, or minimum order requirements..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-black/10 text-xs text-[#171717] bg-[#EEEEEC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] resize-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FDF0] border border-[#9FD842]/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#171717] block">Mark as Featured Promo Deal</span>
                    <span className="text-[11px] text-[#777777]">Highlighted on the offers showcase</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-[#709E1E] focus:ring-[#9FD842] accent-[#709E1E] cursor-pointer"
                  />
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-[#777777] hover:bg-[#EEEEEC] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#171717] hover:bg-black text-white text-xs font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[#9FD842]" />
                    <span>{editingOffer ? 'Update Offer' : 'Create Offer'}</span>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-6 border border-black/10 shadow-2xl z-10 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#171717] mb-1">
                Delete Promotion Offer?
              </h3>
              <p className="text-xs text-[#777777] max-w-xs mx-auto mb-6">
                Are you sure you want to delete <strong className="text-[#171717]">"{offerToDelete.title}"</strong> (Code: {offerToDelete.code})? Customers will no longer be able to apply this discount.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setOfferToDelete(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#777777] hover:bg-[#EEEEEC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md cursor-pointer"
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
