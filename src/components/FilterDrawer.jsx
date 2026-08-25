import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Check, RotateCcw, Star } from 'lucide-react';
import { CATALOG_CATEGORIES, STORE_CONFIG } from '../data/mockData';

export const FilterDrawer = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  totalResultsCount
}) => {
  if (!isOpen) return null;

  const discountOptions = [
    { label: 'Any', value: 0 },
    { label: '10%+ OFF', value: 10 },
    { label: '20%+ OFF', value: 20 },
    { label: '30%+ OFF', value: 30 },
    { label: '40%+ OFF', value: 40 },
  ];

  const ratingOptions = [
    { label: 'All Ratings', value: 0 },
    { label: '4.0★ & Above', value: 4.0 },
    { label: '4.5★ & Above', value: 4.5 },
    { label: '4.8★ & Above', value: 4.8 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Drawer Window (Floating Glass Panel) */}
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl h-full shadow-2xl border-l border-black/5 z-10 flex flex-col justify-between overflow-hidden"
          aria-label="Filter products"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EEEEEC] flex items-center justify-center text-[#171717]">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#171717]">Filters</h3>
                <p className="text-xs text-[#777777]">Refine catalog products</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] flex items-center justify-center text-[#171717] transition-colors"
              aria-label="Close filter drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-[#171717] block mb-3">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATALOG_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onUpdateFilters({ category: cat.id })}
                    className={`px-3.5 py-2.5 rounded-[16px] text-xs font-bold flex items-center justify-between transition-all active:scale-95 ${
                      filters.category === cat.id
                        ? 'bg-[#9FD842] text-[#171717] shadow-sm'
                        : 'bg-[#EEEEEC] text-[#171717] hover:bg-[#E2E2DE]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      filters.category === cat.id ? 'bg-white text-[#171717]' : 'bg-white/70 text-[#777777]'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#171717]">
                  Max Price
                </label>
                <span className="text-xs font-extrabold text-[#171717] bg-[#F5F5F3] px-2.5 py-1 rounded-full border border-black/5">
                  {STORE_CONFIG.currency}{filters.maxPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={filters.maxPrice}
                onChange={(e) => onUpdateFilters({ maxPrice: Number(e.target.value) })}
                className="w-full accent-[#9FD842] bg-[#EEEEEC] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#A0A0A0] mt-1 font-medium">
                <span>{STORE_CONFIG.currency}500</span>
                <span>{STORE_CONFIG.currency}2,500</span>
                <span>{STORE_CONFIG.currency}5,000</span>
              </div>
            </div>

            {/* Stock Availability */}
            <div>
              <label className="text-xs font-bold text-[#171717] block mb-3">
                Availability
              </label>
              <label className="flex items-center gap-3 p-3 rounded-[16px] bg-[#EEEEEC] hover:bg-[#E2E2DE] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => onUpdateFilters({ inStockOnly: e.target.checked })}
                  className="w-4 h-4 rounded text-[#171717] accent-[#9FD842] focus:ring-0"
                />
                <span className="text-xs font-bold text-[#171717]">
                  In Stock Items Only
                </span>
              </label>
            </div>

            {/* Minimum Discount Filter */}
            <div>
              <label className="text-xs font-bold text-[#171717] block mb-3">
                Discount
              </label>
              <div className="flex flex-wrap gap-2">
                {discountOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateFilters({ minDiscount: opt.value })}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      filters.minDiscount === opt.value
                        ? 'bg-[#9FD842] text-[#171717] shadow-sm'
                        : 'bg-[#EEEEEC] text-[#777777] hover:text-[#171717] hover:bg-[#E2E2DE]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Rating Filter */}
            <div>
              <label className="text-xs font-bold text-[#171717] block mb-3">
                Customer Rating
              </label>
              <div className="space-y-2">
                {ratingOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateFilters({ minRating: opt.value })}
                    className={`w-full px-3.5 py-2 rounded-[14px] text-xs font-bold flex items-center justify-between transition-all ${
                      filters.minRating === opt.value
                        ? 'bg-[#171717] text-white shadow-sm'
                        : 'bg-[#EEEEEC] text-[#171717] hover:bg-[#E2E2DE]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${opt.value > 0 ? 'fill-[#9FD842] text-[#9FD842]' : ''}`} />
                      {opt.label}
                    </span>
                    {filters.minRating === opt.value && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-5 border-t border-black/[0.06] bg-white flex items-center gap-3">
            <button
              onClick={onResetFilters}
              className="flex-1 py-3 px-4 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onClose}
              className="flex-2 py-3 px-6 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-xs flex items-center justify-center gap-2 shadow-neu-btn-accent transition-all active:scale-95"
            >
              <span>Show {totalResultsCount} Items</span>
            </button>
          </div>

        </motion.aside>
      </div>
    </AnimatePresence>
  );
};
