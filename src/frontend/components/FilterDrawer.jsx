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
          className="fixed inset-0 bg-[#15152A]/50 backdrop-blur-sm"
        />

        {/* Drawer Window (Desktop Right, Mobile Bottom/Right) */}
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-md bg-white/95 backdrop-blur-xl h-full shadow-2xl border-l border-[#EAE6FD] z-10 flex flex-col justify-between overflow-hidden"
          aria-label="Filter products"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#EAE6FD] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-[#6257FF]">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#15152A]">Filter Products</h3>
                <p className="text-xs text-[#626276]">Refine results to find exact items</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#FAF9FF] hover:bg-[#F1EFFF] flex items-center justify-center text-[#626276] transition-colors"
              aria-label="Close filter drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#6257FF] block mb-3">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATALOG_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onUpdateFilters({ category: cat.id })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      filters.category === cat.id
                        ? 'bg-[#6257FF] text-white shadow-sm'
                        : 'bg-[#FAF9FF] text-[#15152A] hover:bg-[#F1EFFF] border border-[#EAE6FD]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      filters.category === cat.id ? 'bg-white/20 text-white' : 'bg-[#EAE6FD] text-[#6257FF]'
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
                <label className="text-xs font-bold uppercase tracking-wider text-[#6257FF]">
                  Max Price
                </label>
                <span className="text-sm font-extrabold text-[#15152A]">
                  {STORE_CONFIG.currency}{filters.maxPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="250"
                value={filters.maxPrice}
                onChange={(e) => onUpdateFilters({ maxPrice: Number(e.target.value) })}
                className="w-full h-2 bg-[#EAE6FD] rounded-lg appearance-none cursor-pointer accent-[#6257FF]"
              />
              <div className="flex justify-between text-[11px] text-[#8E8EA0] mt-1 font-medium">
                <span>{STORE_CONFIG.currency}500</span>
                <span>{STORE_CONFIG.currency}2,500</span>
                <span>{STORE_CONFIG.currency}5,000+</span>
              </div>
            </div>

            {/* In Stock Only Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD]">
              <div>
                <span className="text-sm font-bold text-[#15152A] block">In Stock Only</span>
                <span className="text-xs text-[#626276]">Hide items currently sold out</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateFilters({ inStockOnly: !filters.inStockOnly })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  filters.inStockOnly ? 'bg-[#6257FF]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    filters.inStockOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Minimum Discount Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#6257FF] block mb-3">
                Minimum Discount
              </label>
              <div className="flex flex-wrap gap-2">
                {discountOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateFilters({ minDiscount: opt.value })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filters.minDiscount === opt.value
                        ? 'bg-[#EC5AC8] text-white shadow-sm ring-2 ring-pink-200'
                        : 'bg-[#FAF9FF] text-[#626276] hover:bg-[#FFF0FB] border border-[#EAE6FD]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#6257FF] block mb-3">
                Customer Rating
              </label>
              <div className="space-y-2">
                {ratingOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateFilters({ minRating: opt.value })}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      filters.minRating === opt.value
                        ? 'bg-[#EDE9FE] text-[#6257FF] border border-[#8B5CF6]/40'
                        : 'bg-[#FAF9FF] text-[#15152A] hover:bg-[#F1EFFF] border border-[#EAE6FD]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${opt.value > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
                      <span>{opt.label}</span>
                    </div>
                    {filters.minRating === opt.value && <Check className="w-3.5 h-3.5 text-[#6257FF]" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 border-t border-[#EAE6FD] bg-[#FAF9FF]/80 flex items-center gap-3">
            <button
              onClick={onResetFilters}
              className="py-3 px-4 rounded-2xl bg-white border border-[#EAE6FD] text-[#626276] hover:text-[#15152A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-2xl gradient-btn-primary text-white font-bold text-sm shadow-btn hover:scale-[1.02] active:scale-98 transition-all"
            >
              Show {totalResultsCount} Products
            </button>
          </div>

        </motion.aside>
      </div>
    </AnimatePresence>
  );
};
