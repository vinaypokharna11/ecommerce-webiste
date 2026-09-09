import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Check, RotateCcw, Star } from 'lucide-react';
import { CATALOG_CATEGORIES, STORE_CONFIG } from '@/data/mockData';
import { formatPrice } from '@/utils/formatPrice';

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
          className="relative w-full max-w-full sm:max-w-md bg-white/98 backdrop-blur-2xl h-full shadow-2xl border-l border-black/[0.08] z-10 flex flex-col justify-between overflow-hidden"
          aria-label="Filter products"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-black/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F]">
                <SlidersHorizontal className="w-4 h-4 text-[#0071E3]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1D1D1F]">Filters</h3>
                <p className="text-xs text-[#777777]">Refine catalog products</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] flex items-center justify-center text-[#1D1D1F] transition-colors cursor-pointer"
              aria-label="Close filter drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
            
            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-[#1D1D1F] block mb-2.5 uppercase tracking-wider">
                Category
              </label>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                {CATALOG_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onUpdateFilters({ category: cat.id })}
                    className={`px-3 sm:px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all active:scale-95 cursor-pointer ${
                      filters.category === cat.id
                        ? 'bg-[#1D1D1F] text-white shadow-xs'
                        : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                    }`}
                  >
                    <span className="truncate mr-1">{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                      filters.category === cat.id ? 'bg-white/20 text-white' : 'bg-white text-[#777777]'
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
                <label className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">
                  Max Price
                </label>
                <span className="text-xs font-bold text-[#1D1D1F] bg-[#F5F5F7] px-2.5 py-1 rounded-full border border-black/[0.05]">
                  {formatPrice(filters.maxPrice, STORE_CONFIG.currency)}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={filters.maxPrice}
                onChange={(e) => onUpdateFilters({ maxPrice: Number(e.target.value) })}
                className="w-full accent-[#1D1D1F] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#777777] font-semibold mt-1">
                <span>{STORE_CONFIG.currency}500</span>
                <span>{STORE_CONFIG.currency}5,000</span>
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <div>
                <span className="text-xs font-bold text-[#1D1D1F] block">In Stock Only</span>
                <span className="text-[11px] text-[#777777]">Hide items that are out of stock</span>
              </div>
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => onUpdateFilters({ inStockOnly: e.target.checked })}
                className="w-5 h-5 accent-[#1D1D1F] rounded cursor-pointer"
              />
            </div>

            {/* Discount Level Filter */}
            <div>
              <label className="text-xs font-bold text-[#1D1D1F] block mb-2.5 uppercase tracking-wider">
                Minimum Discount
              </label>
              <div className="grid grid-cols-2 gap-2">
                {discountOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateFilters({ minDiscount: opt.value })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      filters.minDiscount === opt.value
                        ? 'bg-[#1D1D1F] text-white shadow-xs'
                        : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {filters.minDiscount === opt.value && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Rating Filter */}
            <div>
              <label className="text-xs font-bold text-[#1D1D1F] block mb-2.5 uppercase tracking-wider">
                Customer Rating
              </label>
              <div className="space-y-1.5">
                {ratingOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateFilters({ minRating: opt.value })}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      filters.minRating === opt.value
                        ? 'bg-[#1D1D1F] text-white shadow-xs'
                        : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${opt.value > 0 ? 'fill-[#FF9500] text-[#FF9500]' : ''}`} />
                      {opt.label}
                    </span>
                    {filters.minRating === opt.value && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-[#F5F5F7] flex items-center gap-3">
            <button
              onClick={onResetFilters}
              className="flex-1 py-3 px-4 rounded-full bg-white hover:bg-neutral-100 text-[#1D1D1F] font-bold text-xs flex items-center justify-center gap-1.5 border border-black/5 transition-colors active:scale-95 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onClose}
              className="flex-2 py-3 px-6 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Show {totalResultsCount} Items</span>
            </button>
          </div>

        </motion.aside>
      </div>
    </AnimatePresence>
  );
};
