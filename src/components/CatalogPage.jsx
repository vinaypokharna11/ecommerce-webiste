'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  ChevronDown, 
  Sparkles, 
  LayoutGrid, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';
import { FilterDrawer } from './FilterDrawer';
import { QuickViewModal } from './QuickViewModal';

import { createProductWhatsAppUrl } from '../utils/whatsapp';
import { CATALOG_CATEGORIES } from '../data/mockData';

export const CatalogPage = ({ 
  cartItems = {}, 
  wishlist = {}, 
  initialCategory = 'all',
  onAddToCart, 
  onUpdateQuantity, 
  onToggleFavorite,
  onInquire,
  onNotify
}) => {
  const { products, storefrontCategories, storeConfig } = useCatalog();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [sortBy, setSortBy] = useState('popular');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Advanced Filters
  const [filters, setFilters] = useState({
    category: initialCategory || 'all',
    maxPrice: 5000,
    inStockOnly: false,
    minDiscount: 0,
    minRating: 0,
  });

  useEffect(() => {
    if (initialCategory) {
      const cat = initialCategory === 'fashion' ? 'clothing' : initialCategory === 'more' ? 'all' : initialCategory;
      setSelectedCategory(cat);
      setFilters((prev) => ({ ...prev, category: cat }));
    }
  }, [initialCategory]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setFilters((prev) => ({ ...prev, category: catId }));
  };

  const handleUpdateFilters = (newFilters) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      if (newFilters.category !== undefined) {
        setSelectedCategory(newFilters.category);
      }
      return updated;
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setFilters({
      category: 'all',
      maxPrice: 5000,
      inStockOnly: false,
      minDiscount: 0,
      minRating: 0,
    });
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCat = product.categoryName?.toLowerCase().includes(q) || product.category?.toLowerCase().includes(q);
        const matchesTags = product.tags && product.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesTags) return false;
      }

      if (filters.category !== 'all') {
        if (filters.category === 'clothing' && product.category === 'clothing') return true;
        if (filters.category === 'footwear' && product.category === 'footwear') return true;
        if (product.category !== filters.category) return false;
      }

      if (product.price > filters.maxPrice) return false;
      if (filters.inStockOnly && product.stockStatus === 'out_of_stock') return false;
      if (filters.minDiscount > 0 && (!product.discountPercent || product.discountPercent < filters.minDiscount)) return false;
      if (filters.minRating > 0 && product.rating < filters.minRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
      if (sortBy === 'newest') return (b.createdAt || b.id || '').localeCompare(a.createdAt || a.id || '');
      return 0;
    });
  }, [products, searchQuery, filters, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.maxPrice < 5000) count++;
    if (filters.inStockOnly) count++;
    if (filters.minDiscount > 0) count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  const handleWhatsAppInquiry = (product) => {
    const url = createProductWhatsAppUrl(product, storeConfig.whatsappNumber);
    window.open(url, '_blank');
    if (onNotify) onNotify('info', 'Connecting to WhatsApp', `Opening direct chat for ${product.name}`);
  };

  const spotlightTopProduct = products.find((p) => p.category === 'clothing') || products[0];
  const spotlightRevealedProduct = products.find((p) => p.category === 'accessories' || p.isPopular) || products[1];

  const handleScrollToGrid = () => {
    const gridElem = document.getElementById('catalog-grid');
    if (gridElem) {
      gridElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">


      {/* ── Main Catalog Browsing Section ── */}
      <section id="catalog-grid" className="relative pt-16 md:pt-20 pb-20 overflow-hidden min-h-screen">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          
          {/* 1. Catalog Header */}
          <div className="text-center max-w-xl mx-auto mb-6">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#171717] tracking-tight leading-tight mb-2"
            >
              Explore Our Products
            </motion.h1>
            <p className="text-xs sm:text-sm text-[#777777] font-medium">
              Find everything available in our shop, all in one place.
            </p>
          </div>

        {/* 2. Elevated Search Bar */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="neu-search-box flex items-center justify-between px-4 py-2.5 sm:py-3 bg-white">
            <div className="flex items-center gap-3 flex-1">
              <Search className="w-5 h-5 text-[#A0A0A0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="what are you looking for?"
                className="w-full bg-transparent text-sm text-[#171717] placeholder:text-[#A0A0A0] focus:outline-none font-medium"
              />
            </div>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="w-7 h-7 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] flex items-center justify-center transition-colors mr-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="w-9 h-9 rounded-full bg-[#EEEEEC] hover:bg-[#9FD842] flex items-center justify-center text-[#171717] transition-all active:scale-95 shadow-sm"
              aria-label="Filter"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Category Horizontal Pills */}
        <div className="mb-6 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-2.5 min-w-max">
            {storefrontCategories.map((category) => {
              const isSelected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#9FD842] text-[#171717] shadow-sm ring-2 ring-[#9FD842]/30'
                      : 'bg-white text-[#777777] hover:text-[#171717] hover:bg-[#EEEEEC] border border-black/5'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-black/10 text-[#171717]' : 'bg-[#EEEEEC] text-[#777777]'
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Controls Row: Filter Trigger + Sort + Count */}
        <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-black/[0.06] flex-wrap">
          {/* Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 shadow-sm text-xs font-bold text-[#171717] hover:bg-[#EEEEEC] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#171717]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#9FD842] text-[#171717] text-[10px] font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Product Count & Sort */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-[#777777] font-medium hidden sm:inline">
              Showing <strong className="text-[#171717]">{filteredProducts.length}</strong> products
            </span>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 rounded-full bg-white border border-black/5 text-xs font-bold text-[#171717] shadow-sm focus:outline-none focus:border-[#9FD842] cursor-pointer"
              >
                <option value="popular">Sort: Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
                <option value="rating">Top Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#777777] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 5. Active Filter Chips */}
        {(activeFilterCount > 0 || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className="text-xs text-[#A0A0A0] font-bold">Active:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EEEEEC] text-[#171717]">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9FD842]/20 text-[#171717] border border-[#9FD842]/40">
                {storefrontCategories.find(c => c.id === filters.category)?.name}
                <button onClick={() => handleCategorySelect('all')} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.maxPrice < 5000 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EEEEEC] text-[#171717]">
                Under {storeConfig.currency}{filters.maxPrice.toLocaleString()}
                <button onClick={() => handleUpdateFilters({ maxPrice: 5000 })} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EEEEEC] text-[#171717]">
                In Stock Only
                <button onClick={() => handleUpdateFilters({ inStockOnly: false })} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#709E1E] hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* 6. Product Grid: responsive full width */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-6">
            {filteredProducts.map((product) => {
              const currentQty = cartItems[product.id]?.quantity || 0;
              const isFav = !!wishlist[product.id];

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={currentQty}
                  isFavorite={isFav}
                  onAddToCart={onAddToCart}
                  onUpdateQuantity={onUpdateQuantity}
                  onToggleFavorite={onToggleFavorite}
                  onQuickView={setQuickViewProduct}
                  onWhatsAppInquiry={handleWhatsAppInquiry}
                  onInquire={onInquire}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white rounded-[28px] border border-black/5 shadow-neu-card max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#EEEEEC] text-[#171717] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#171717] mb-1">
              We couldn't find that product
            </h3>
            <p className="text-xs text-[#777777] max-w-xs mx-auto mb-5">
              Try adjusting your search terms or clearing active filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-[#9FD842] text-[#171717] font-bold text-xs shadow-sm hover:bg-[#8EC731]"
            >
              Browse All Products
            </button>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onUpdateFilters={handleUpdateFilters}
        onResetFilters={handleResetFilters}
        totalResultsCount={filteredProducts.length}
      />

      {/* Quick View Details Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={onAddToCart}
          cartQuantity={cartItems[quickViewProduct.id]?.quantity || 0}
          onUpdateQuantity={onUpdateQuantity}
          isFavorite={!!wishlist[quickViewProduct.id]}
          onToggleFavorite={onToggleFavorite}
        />
      )}
      </section>
    </div>
  );
};
