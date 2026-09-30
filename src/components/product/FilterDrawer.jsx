'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Check, Search, RotateCcw } from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import { CATALOG_CATEGORIES, STORE_CONFIG } from '@/data/constants';
import { formatPrice } from '@/utils/formatPrice';

export const FilterDrawer = ({
  isOpen,
  onClose,
  filters = {
    category: 'all',
    maxPrice: 15000,
    inStockOnly: false,
    minDiscount: 0,
    minRating: 0,
  },
  onUpdateFilters,
  onResetFilters,
  totalResultsCount = 20,
}) => {
  const { products, storefrontCategories } = useCatalog();
  const [categorySearch, setCategorySearch] = useState('');

  // Compute category counts dynamically based on active products, falling back to CATALOG_CATEGORIES
  const categoriesWithCounts = useMemo(() => {
    const rawCategories =
      storefrontCategories && storefrontCategories.length > 0
        ? storefrontCategories
        : CATALOG_CATEGORIES;

    const counts = { all: products?.length || 20 };
    if (products && products.length > 0) {
      products.forEach((p) => {
        const catId = p.category?.toLowerCase();
        if (catId) {
          counts[catId] = (counts[catId] || 0) + 1;
        }
      });
    }

    return rawCategories.map((c) => ({
      ...c,
      count: c.id === 'all' ? (products?.length || 20) : (counts[c.id.toLowerCase()] ?? c.count ?? 0),
    }));
  }, [products, storefrontCategories]);

  // Filtered categories based on search input inside Category section
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categoriesWithCounts;
    const q = categorySearch.toLowerCase().trim();
    return categoriesWithCounts.filter((c) =>
      c.name.toLowerCase().includes(q)
    );
  }, [categoriesWithCounts, categorySearch]);

  const discountOptions = [
    { label: 'Any', value: 0 },
    { label: '10%+ OFF', value: 10 },
    { label: '20%+ OFF', value: 20 },
    { label: '30%+ OFF', value: 30 },
    { label: '40%+ OFF', value: 40 },
  ];

  // Active filter pills calculation
  const activePills = useMemo(() => {
    const pills = [];

    // Category pill
    if (filters.category && filters.category !== 'all') {
      const match = categoriesWithCounts.find((c) => c.id === filters.category);
      pills.push({
        id: 'category',
        label: match ? match.name : filters.category,
        onRemove: () => onUpdateFilters({ category: 'all' }),
      });
    }

    // Max price pill
    if (filters.maxPrice < 15000) {
      pills.push({
        id: 'maxPrice',
        label: `≤ ${formatPrice(filters.maxPrice, STORE_CONFIG?.currency || '₹')}`,
        onRemove: () => onUpdateFilters({ maxPrice: 15000 }),
      });
    }

    // In-stock pill
    if (filters.inStockOnly) {
      pills.push({
        id: 'inStock',
        label: 'In Stock Only',
        onRemove: () => onUpdateFilters({ inStockOnly: false }),
      });
    }

    // Discount pill
    if (filters.minDiscount > 0) {
      pills.push({
        id: 'discount',
        label: `${filters.minDiscount}%+ OFF`,
        onRemove: () => onUpdateFilters({ minDiscount: 0 }),
      });
    }

    return pills;
  }, [filters, categoriesWithCounts, onUpdateFilters]);

  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const origBodyPosition = document.body.style.position;
    const origBodyTop = document.body.style.top;
    const origBodyWidth = document.body.style.width;
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow || '';
      document.body.style.position = origBodyPosition || '';
      document.body.style.top = origBodyTop || '';
      document.body.style.width = origBodyWidth || '';
      document.body.style.overflow = origBodyOverflow || '';
      window.scrollTo(0, scrollY);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Price slider percentage for linear-gradient track
  const minPrice = 500;
  const maxPriceRange = 15000;
  const pricePercent = Math.min(
    100,
    Math.max(0, ((filters.maxPrice - minPrice) / (maxPriceRange - minPrice)) * 100)
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
        />

        {/* Filter Panel (Slide-up Bottom Sheet on Mobile, Centered Card on Desktop) */}
        <motion.aside
          initial={{ y: '100%', opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-full sm:max-w-[460px] max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-[16px] sm:rounded-[16px] border-t sm:border border-[#E8EBF0] shadow-2xl z-10 flex flex-col overflow-hidden overscroll-contain"
          aria-label="Filter products"
        >
          {/* Mobile Handle Pill */}
          <div className="pt-2.5 pb-1 flex justify-center sm:hidden shrink-0">
            <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
          </div>

          {/* 1. Header Bar */}
          <div className="px-5 py-4 border-b border-[#F0F2F5] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F0F2F5] flex items-center justify-center text-[#1A1E2C] shrink-0">
                <SlidersHorizontal className="w-4 h-4 text-[#1A1E2C] stroke-[1.75]" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1A1E2C] leading-tight">Filters</h3>
                <p className="text-[12px] text-[#8A94A6] leading-tight mt-0.5">Refine catalog products</p>
              </div>
            </div>

            {/* Close Button: Dark circle #1E2433 (32x32px) with white × */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1E2433] hover:bg-[#2A3245] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
              aria-label="Close filters"
            >
              <X className="w-4 h-4 text-white stroke-[2.2]" />
            </button>
          </div>

          {/* 2. Active Filter Pills Row (Slides in when active) */}
          <AnimatePresence>
            {activePills.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden border-b border-[#F0F2F5] bg-[#F9FAFB]/70 shrink-0"
              >
                <div className="px-5 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  {activePills.map((pill) => (
                    <motion.button
                      key={pill.id}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      type="button"
                      onClick={pill.onRemove}
                      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-[#1E2433] hover:bg-[#2A3245] text-white text-[13px] font-medium shrink-0 transition-colors shadow-xs active:scale-95 cursor-pointer"
                    >
                      <span>{pill.label}</span>
                      <X className="w-3 h-3 text-white/80 hover:text-white stroke-[2.5]" />
                    </motion.button>
                  ))}
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="text-[11px] font-semibold text-[#8A94A6] hover:text-[#1A1E2C] px-2 py-1 shrink-0 transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable Body Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 space-y-6">

            {/* 3. Category Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-medium uppercase text-[#8A94A6] tracking-[0.6px]">
                  CATEGORY
                </span>

                {/* Reset & Search controls (Image 2 style) */}
                <div className="flex items-center gap-3">
                  {filters.category !== 'all' && (
                    <button
                      type="button"
                      onClick={() => onUpdateFilters({ category: 'all' })}
                      className="text-[11px] font-medium text-[#8A94A6] hover:text-[#1A1E2C] transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8A94A6]" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search category..."
                      className="w-32 xs:w-36 pl-7 pr-2.5 py-1 text-[11px] rounded-lg bg-[#F9FAFB] border border-[#E8EBF0] text-[#1A1E2C] placeholder:text-[#9BA3AF] focus:bg-white focus:outline-none focus:border-[#1E2433] transition-colors"
                    />
                    {categorySearch && (
                      <button
                        type="button"
                        onClick={() => setCategorySearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-[#1A1E2C]"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Rows (44px height, 1px divider) */}
              <div className="rounded-xl border border-[#F0F2F5] overflow-hidden divide-y divide-[#F0F2F5] bg-white">
                {filteredCategories.map((cat) => {
                  const isChecked = filters.category === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => onUpdateFilters({ category: cat.id })}
                      className={`h-[44px] px-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked ? 'bg-[#F9FAFB]' : 'hover:bg-[#F9FAFB]/60'
                      }`}
                    >
                      {/* Left: Square Checkbox + Category Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-[#1E2433] border border-[#1E2433]'
                              : 'border-[1.5px] border-[#D1D5DB] bg-white'
                          }`}
                        >
                          {isChecked && (
                            <motion.div
                              initial={{ scale: 0.6, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', damping: 15, stiffness: 450 }}
                            >
                              <Check className="w-3 h-3 text-white stroke-[2.8]" />
                            </motion.div>
                          )}
                        </div>
                        <span className="text-[14px] text-[#1A1E2C] truncate font-normal">
                          {cat.name}
                        </span>
                      </div>

                      {/* Right: Count Number */}
                      <span className="text-[13px] text-[#9BA3AF] font-normal shrink-0 pl-2">
                        {cat.count}
                      </span>
                    </div>
                  );
                })}

                {filteredCategories.length === 0 && (
                  <div className="py-6 text-center text-[12px] text-[#9BA3AF]">
                    No categories match &quot;{categorySearch}&quot;
                  </div>
                )}
              </div>
            </div>

            {/* 4. Max Price Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase text-[#8A94A6] tracking-[0.6px]">
                  MAX PRICE
                </span>
                {/* Selected value as dark pill badge */}
                <span className="text-[12px] font-semibold text-white bg-[#1E2433] px-3 py-1 rounded-full shadow-xs">
                  {formatPrice(filters.maxPrice, STORE_CONFIG?.currency || '₹')}
                </span>
              </div>

              <div className="pt-1">
                <input
                  type="range"
                  min={minPrice}
                  max={maxPriceRange}
                  step="250"
                  value={filters.maxPrice}
                  onChange={(e) => onUpdateFilters({ maxPrice: Number(e.target.value) })}
                  style={{
                    background: `linear-gradient(to right, #1E2433 0%, #1E2433 ${pricePercent}%, #E8EBF0 ${pricePercent}%, #E8EBF0 100%)`,
                  }}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none 
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-5 
                    [&::-webkit-slider-thumb]:h-5 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-white 
                    [&::-webkit-slider-thumb]:border-2 
                    [&::-webkit-slider-thumb]:border-[#1E2433] 
                    [&::-webkit-slider-thumb]:shadow-md 
                    [&::-webkit-slider-thumb]:transition-transform 
                    [&::-webkit-slider-thumb]:active:scale-110"
                />

                <div className="flex items-center justify-between text-[11px] text-[#8A94A6] font-medium mt-2">
                  <span>{formatPrice(minPrice, STORE_CONFIG?.currency || '₹')}</span>
                  <span>{formatPrice(maxPriceRange, STORE_CONFIG?.currency || '₹')}</span>
                </div>
              </div>
            </div>

            {/* 5. In Stock Only Row */}
            <div className="py-2 border-y border-[#F0F2F5] flex items-center justify-between min-h-[48px]">
              <div>
                <span className="text-[14px] font-semibold text-[#1A1E2C] block leading-snug">
                  In Stock Only
                </span>
                <span className="text-[12px] text-[#8A94A6] block leading-snug">
                  Hide items that are out of stock
                </span>
              </div>

              {/* iOS-Style Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={filters.inStockOnly}
                onClick={() => onUpdateFilters({ inStockOnly: !filters.inStockOnly })}
                className={`w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer p-0.5 relative shrink-0 ${
                  filters.inStockOnly ? 'bg-[#1E2433]' : 'bg-[#D1D5DB]'
                }`}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`w-5 h-5 rounded-full bg-white shadow-xs ${
                    filters.inStockOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 6. Minimum Discount Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium uppercase text-[#8A94A6] tracking-[0.6px] block">
                MINIMUM DISCOUNT
              </span>

              {/* Checkbox list rows matching Image 2 */}
              <div className="rounded-xl border border-[#F0F2F5] overflow-hidden divide-y divide-[#F0F2F5] bg-white">
                {discountOptions.map((opt) => {
                  const isChecked = filters.minDiscount === opt.value;

                  return (
                    <div
                      key={opt.value}
                      onClick={() => onUpdateFilters({ minDiscount: opt.value })}
                      className={`h-[44px] px-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked ? 'bg-[#F9FAFB]' : 'hover:bg-[#F9FAFB]/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-[#1E2433] border border-[#1E2433]'
                              : 'border-[1.5px] border-[#D1D5DB] bg-white'
                          }`}
                        >
                          {isChecked && (
                            <motion.div
                              initial={{ scale: 0.6, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', damping: 15, stiffness: 450 }}
                            >
                              <Check className="w-3 h-3 text-white stroke-[2.8]" />
                            </motion.div>
                          )}
                        </div>
                        <span className="text-[14px] text-[#1A1E2C] font-normal">
                          {opt.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 7. Sticky CTA Footer */}
          <div className="p-4 border-t border-[#F0F2F5] bg-white shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-[max(16px,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-[12px] bg-[#1E2433] hover:bg-[#141822] active:scale-[0.99] text-white font-semibold text-[14px] transition-all flex items-center justify-center cursor-pointer shadow-sm"
            >
              <motion.span
                key={totalResultsCount}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                Show {totalResultsCount} {totalResultsCount === 1 ? 'product' : 'products'}
              </motion.span>
            </button>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
};

export default FilterDrawer;
