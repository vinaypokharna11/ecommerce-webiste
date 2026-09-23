'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronRight, 
  X, 
  ShoppingBag,
  Search,
  Check,
} from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterDrawer } from '@/components/product/FilterDrawer';
import { QuickViewModal } from '@/components/common/QuickViewModal';
import { CATALOG_CATEGORIES } from '@/data/mockData';
import { createProductWhatsAppUrl } from '@/utils/whatsapp';

export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured', prefix: 'Sort: ' },
  { id: 'popular', label: 'Popularity', prefix: 'Sort: ' },
  { id: 'price-low', label: 'Price: Low to High', prefix: 'Price: ' },
  { id: 'price-high', label: 'Price: High to Low', prefix: 'Price: ' },
  { id: 'discount', label: 'Highest Discount', prefix: 'Discount: ' },
  { id: 'rating', label: 'Top Rated', prefix: 'Rating: ' },
  { id: 'newest', label: 'New Arrivals', prefix: 'Sort: ' },
];

export const CatalogPage = ({ 
  cartItems = {},
  wishlist = {}, 
  initialCategory = 'all',
  onAddToCart,
  onUpdateQuantity,
  onUpdateSize,
  onToggleFavorite, 
  onQuickView,
  onInquire,
  onNotify,
}) => {
  const router = useRouter();
  const { products, storefrontCategories } = useCatalog();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    category: initialCategory || 'all',
    maxPrice: 15000,
    inStockOnly: false,
    minDiscount: 0,
    minRating: 0,
  });

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setFilters((prev) => ({ ...prev, category: initialCategory }));
    }
  }, [initialCategory]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setFilters((prev) => ({ ...prev, category: catId }));
  };

  const handleUpdateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    if (newFilters.category !== undefined) {
      setSelectedCategory(newFilters.category);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      maxPrice: 15000,
      inStockOnly: false,
      minDiscount: 0,
      minRating: 0,
    });
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const handleWhatsAppInquiry = (product) => {
    if (onInquire) {
      onInquire(product);
      return;
    }
    const url = createProductWhatsAppUrl(product);
    window.open(url, '_blank');
  };

  // Active categories list
  const activeCategories = (storefrontCategories && storefrontCategories.length > 0)
    ? storefrontCategories
    : CATALOG_CATEGORIES;

  const currentCategoryObj = activeCategories.find((c) => c.id.toLowerCase() === selectedCategory.toLowerCase());
  const categoryDisplayName = currentCategoryObj ? currentCategoryObj.name : (selectedCategory === 'all' ? 'All Products' : selectedCategory);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products
      .filter((product) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = (product.name || '').toLowerCase().includes(q);
          const matchCat = (product.category || '').toLowerCase().includes(q);
          const matchDesc = (product.description || '').toLowerCase().includes(q);
          const matchTags = Array.isArray(product.tags) && product.tags.some(t => String(t).toLowerCase().includes(q));
          if (!matchName && !matchCat && !matchDesc && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (filters.category !== 'all') {
          const pCat = (product.category || '').toLowerCase();
          const fCat = filters.category.toLowerCase();
          if (pCat !== fCat) return false;
        }

        // Price filter
        if (typeof product.price === 'number' && product.price > filters.maxPrice) {
          return false;
        }

        // In-stock filter
        if (filters.inStockOnly && (product.stockStatus === 'out_of_stock' || product.stockCount <= 0)) {
          return false;
        }

        // Discount filter
        if (filters.minDiscount > 0 && (!product.discountPercent || product.discountPercent < filters.minDiscount)) {
          return false;
        }

        // Rating filter
        if (filters.minRating > 0 && (!product.rating || product.rating < filters.minRating)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        }
        if (sortBy === 'price-high') {
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        }
        if (sortBy === 'discount') {
          const discountDiff = (Number(b.discountPercent) || 0) - (Number(a.discountPercent) || 0);
          if (discountDiff !== 0) return discountDiff;
          const aSavings = (a.oldPrice && a.oldPrice > a.price) ? (a.oldPrice - a.price) : 0;
          const bSavings = (b.oldPrice && b.oldPrice > b.price) ? (b.oldPrice - b.price) : 0;
          return bSavings - aSavings;
        }
        if (sortBy === 'rating') {
          const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (Number(b.reviews) || 0) - (Number(a.reviews) || 0);
        }
        if (sortBy === 'newest') {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (bTime !== aTime) return bTime - aTime;
          return String(b.id || '').localeCompare(String(a.id || ''));
        }
        if (sortBy === 'popular') {
          const aPop = Boolean(a.isPopular || a.badge?.toLowerCase().includes('popular') || a.badgeType === 'popular');
          const bPop = Boolean(b.isPopular || b.badge?.toLowerCase().includes('popular') || b.badgeType === 'popular');
          if (bPop !== aPop) return (bPop ? 1 : 0) - (aPop ? 1 : 0);
          const aScore = (Number(a.rating) || 0) * Math.min(Number(a.reviews) || 1, 50);
          const bScore = (Number(b.rating) || 0) * Math.min(Number(b.reviews) || 1, 50);
          if (bScore !== aScore) return bScore - aScore;
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        }
        // Default: 'featured'
        if (Boolean(b.isFeatured) !== Boolean(a.isFeatured)) {
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        }
        if (Boolean(b.isPopular) !== Boolean(a.isPopular)) {
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        }
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      });
  }, [products, filters, searchQuery, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.maxPrice < 15000) count++;
    if (filters.inStockOnly) count++;
    if (filters.minDiscount > 0) count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  return (
    <div id="catalog-grid" className="w-full min-h-screen bg-[#F6F5F0] text-[#1D1D1F]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-24">
        
        {/* ── 1. Breadcrumbs ── */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-xs text-[#86868B] font-sans">
            <li>
              <Link href="/" className="hover:text-[#1D1D1F] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3 text-[#C7C7CC]" />
            </li>
            <li>
              <button 
                type="button" 
                onClick={handleResetFilters} 
                className="hover:text-[#1D1D1F] transition-colors cursor-pointer"
              >
                Catalog
              </button>
            </li>
            {selectedCategory !== 'all' && (
              <>
                <li>
                  <ChevronRight className="w-3 h-3 text-[#C7C7CC]" />
                </li>
                <li className="text-[#1D1D1F] font-medium capitalize truncate max-w-[200px]">
                  {categoryDisplayName}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* ── 2. Category Title & Search Bar Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-5 border-b border-black/[0.06]">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1D1D1F] font-sans tracking-tight">
              {categoryDisplayName}
            </h1>
            <p className="text-xs sm:text-sm text-[#86868B] font-sans mt-1">
              Curated collection of everyday essentials, jewelry and accessories
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-black/[0.08] rounded-full text-xs sm:text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/20 shadow-2xs transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── 3. Category Horizontal Pills ── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 touch-pan-x">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-2 text-xs sm:text-sm rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1D1D1F] text-white font-semibold shadow-xs'
                : 'bg-white text-[#1D1D1F] hover:bg-[#EAEAEA] border border-black/[0.06]'
            }`}
          >
            All Products
          </button>
          {activeCategories.filter(c => c.id !== 'all').map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-4 py-2 text-xs sm:text-sm rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1D1D1F] text-white font-semibold shadow-xs'
                    : 'bg-white text-[#1D1D1F] hover:bg-[#EAEAEA] border border-black/[0.06]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* ── 4. Filter and Sort Control Bar ── */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-black/[0.06] flex-wrap">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.08] hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] transition-colors shadow-2xs cursor-pointer"
              aria-label="Open filter options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#1D1D1F] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Active Filter Chips */}
            {(activeFilterCount > 0 || searchQuery) && (
              <div className="hidden sm:flex items-center gap-2 flex-wrap">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-black/[0.08] text-[#1D1D1F]">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.category !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-black/[0.08] text-[#1D1D1F]">
                    {activeCategories.find(c => c.id === filters.category)?.name}
                    <button onClick={() => handleCategorySelect('all')} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[#0071E3] hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Right: Product Count & Sort */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-[#86868B] font-normal hidden sm:inline">
              Showing <strong className="text-[#1D1D1F] font-semibold">{filteredProducts.length}</strong> products
            </span>

            {/* Custom Interactive Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                id="catalog-sort-button"
                data-testid="catalog-sort-button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 pl-3.5 pr-3 py-2 rounded-full bg-white border border-black/[0.08] hover:border-black/20 text-xs font-semibold text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-black/10 cursor-pointer shadow-2xs transition-all select-none"
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
              >
                <span>{(() => {
                  const opt = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];
                  return `${opt.prefix}${opt.label}`;
                })()}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${isSortOpen ? 'rotate-180 text-[#1D1D1F]' : ''}`} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-black/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.14)] py-1.5 z-40 overflow-hidden"
                    role="listbox"
                    aria-label="Sort products"
                  >
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortBy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSortBy(opt.id);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#F5F5F7] text-[#1D1D1F] font-bold'
                              : 'text-[#444444] hover:bg-[#F5F5F7]/70 hover:text-[#1D1D1F]'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Accessible hidden select for screen readers and automated tests */}
              <select
                aria-hidden="true"
                tabIndex={-1}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sr-only"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.prefix}{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Active Filter Chips */}
        {(activeFilterCount > 0 || searchQuery) && (
          <div className="sm:hidden flex items-center gap-2 flex-wrap mb-6">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-black/[0.08] text-[#1D1D1F]">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-black/[0.08] text-[#1D1D1F]">
                {activeCategories.find(c => c.id === filters.category)?.name}
                <button onClick={() => handleCategorySelect('all')} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#0071E3] hover:underline cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── 5. Product Grid ── */}
        {products && products.length === 0 ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-3 space-y-3">
                <div className="aspect-[4/5] w-full bg-[#F0F0F2] rounded-xl" />
                <div className="h-4 bg-[#F0F0F2] rounded w-3/4" />
                <div className="h-4 bg-[#F0F0F2] rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div 
            data-testid="catalog-products-grid"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6"
          >
            {filteredProducts.map((product) => {
              const currentCartItem = cartItems[product.id];
              const currentQty = currentCartItem?.quantity || 0;
              const currentSize = currentCartItem?.selectedSize || null;
              const currentColor = currentCartItem?.selectedColor || null;
              const isFav = !!wishlist[product.id];

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={currentQty}
                  selectedSize={currentSize}
                  selectedColor={currentColor}
                  isFavorite={isFav}
                  onAddToCart={onAddToCart}
                  onUpdateQuantity={onUpdateQuantity}
                  onUpdateSize={onUpdateSize}
                  onToggleFavorite={onToggleFavorite}
                  onQuickView={onQuickView || setQuickViewProduct}
                  onWhatsAppInquiry={handleWhatsAppInquiry}
                  onNotify={onNotify}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 px-4 max-w-sm mx-auto bg-white rounded-3xl border border-black/[0.06] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#F7F7F8] flex items-center justify-center mx-auto mb-4 text-[#86868B]">
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F] mb-1">
              No products found
            </h3>
            <p className="text-xs text-[#86868B] mb-6">
              Try adjusting your search query or reset category filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-[#1D1D1F] text-white text-xs font-semibold rounded-full hover:bg-black transition-colors"
            >
              View All Products
            </button>
          </div>
        )}
      </div>

      {/* Filter Drawer Modal */}
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
          onNotify={onNotify}
        />
      )}
    </div>
  );
};

export default CatalogPage;
