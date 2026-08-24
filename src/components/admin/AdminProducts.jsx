import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  Copy,
  Star,
  Sparkles,
  Tag,
  Check,
  AlertTriangle,
  ArrowUpDown,
  MoreVertical,
  CheckSquare,
  Square,
  Package,
  Eye,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { AdminProductModal } from './AdminProductModal';
import { STORE_CONFIG } from '../../data/mockData';

export const AdminProducts = ({ onPreviewStore }) => {
  const {
    products,
    categories,
    deleteProduct,
    duplicateProduct,
    togglePopular,
    toggleFeatured,
    updateProductStock,
    bulkUpdateCategory,
    bulkApplyDiscount,
    bulkDeleteProducts,
    bulkUpdateStockStatus,
  } = useCatalog();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in_stock', 'low_stock', 'out_of_stock'
  const [featuredFilter, setFeaturedFilter] = useState('all'); // 'all', 'featured', 'popular'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc', 'stock-asc', 'rating'
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Selection & Modal State
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Bulk action dropdown state
  const [bulkDiscountVal, setBulkDiscountVal] = useState(20);
  const [bulkCategoryVal, setBulkCategoryVal] = useState('');

  // Filtered & Sorted list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.id.toLowerCase().includes(q);
        const matchesCat = p.categoryName?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
        const matchesTag = p.tags && p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesSku && !matchesCat && !matchesTag) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Stock status filter
      if (stockFilter !== 'all') {
        if (stockFilter === 'in_stock' && p.stockStatus !== 'in_stock') return false;
        if (stockFilter === 'low_stock' && p.stockStatus !== 'low_stock') return false;
        if (stockFilter === 'out_of_stock' && p.stockStatus !== 'out_of_stock') return false;
      }

      // Featured / Popular filter
      if (featuredFilter === 'popular' && !p.isPopular) return false;
      if (featuredFilter === 'featured' && !p.isFeatured) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'stock-asc') return (a.stockCount || 0) - (b.stockCount || 0);
      if (sortBy === 'stock-desc') return (b.stockCount || 0) - (a.stockCount || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
      // default: newest / id
      return b.id.localeCompare(a.id);
    });
  }, [products, searchQuery, selectedCategory, stockFilter, featuredFilter, sortBy]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
      setSelectedProductIds((prev) => prev.filter((id) => id !== productToDelete.id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#15152A] tracking-tight">
            Products Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#626276] mt-0.5">
            Manage your store items, stock levels, pricing, badges, and homepage showcases
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl gradient-btn-primary text-white font-bold text-xs sm:text-sm shadow-btn hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* ── Search, Filters & View Mode Bar ── */}
      <div className="p-4 rounded-3xl bg-white border border-[#EAE6FD] shadow-[0_4px_20px_rgba(98,87,255,0.04)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          
          {/* Search bar */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5CF6]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, SKU, or tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-xs sm:text-sm text-[#15152A] placeholder-[#8E8EA0] focus:outline-none focus:border-[#6257FF]"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-xs font-semibold text-[#15152A] focus:outline-none focus:border-[#6257FF] cursor-pointer"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => {
                const count = products.filter((p) => p.category === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="lg:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-xs font-semibold text-[#15152A] focus:outline-none focus:border-[#6257FF] cursor-pointer"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock (5+)</option>
              <option value="low_stock">Low Stock (1-4)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-xs font-semibold text-[#15152A] focus:outline-none focus:border-[#6257FF] cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="discount">Highest Discount</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* View Switch */}
          <div className="lg:col-span-1 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'table' ? 'bg-[#EDE9FE] text-[#6257FF]' : 'text-[#8E8EA0] hover:bg-[#FAF9FF]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-[#EDE9FE] text-[#6257FF]' : 'text-[#8E8EA0] hover:bg-[#FAF9FF]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ── Bulk Actions Ribbon (When items selected) ── */}
        <AnimatePresence>
          {selectedProductIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-[#EAE6FD] flex flex-wrap items-center justify-between gap-3 text-xs overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#6257FF] text-white font-extrabold text-[11px]">
                  {selectedProductIds.length} Selected
                </span>
                <button
                  onClick={() => setSelectedProductIds([])}
                  className="text-xs font-semibold text-[#8E8EA0] hover:text-[#15152A]"
                >
                  Deselect all
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Bulk Discount */}
                <div className="flex items-center gap-1 bg-[#FAF9FF] p-1 rounded-xl border border-[#EAE6FD]">
                  <select
                    value={bulkDiscountVal}
                    onChange={(e) => setBulkDiscountVal(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-[#EC5AC8] outline-none cursor-pointer"
                  >
                    <option value={10}>10% OFF</option>
                    <option value={20}>20% OFF</option>
                    <option value={30}>30% OFF</option>
                    <option value={50}>50% OFF</option>
                  </select>
                  <button
                    onClick={() => bulkApplyDiscount(selectedProductIds, bulkDiscountVal)}
                    className="px-2.5 py-1 rounded-lg bg-[#EC5AC8] text-white font-bold hover:opacity-90"
                  >
                    Apply
                  </button>
                </div>

                {/* Bulk Category Move */}
                <div className="flex items-center gap-1 bg-[#FAF9FF] p-1 rounded-xl border border-[#EAE6FD]">
                  <select
                    value={bulkCategoryVal}
                    onChange={(e) => setBulkCategoryVal(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-[#15152A] outline-none cursor-pointer"
                  >
                    <option value="">Move Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {bulkCategoryVal && (
                    <button
                      onClick={() => {
                        const targetCat = categories.find((c) => c.id === bulkCategoryVal);
                        bulkUpdateCategory(selectedProductIds, bulkCategoryVal, targetCat?.name);
                        setBulkCategoryVal('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#6257FF] text-white font-bold hover:opacity-90"
                    >
                      Move
                    </button>
                  )}
                </div>

                {/* Bulk In Stock */}
                <button
                  onClick={() => bulkUpdateStockStatus(selectedProductIds, 'in_stock', 20)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 border border-emerald-200"
                >
                  Mark In Stock
                </button>

                {/* Bulk Delete */}
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${selectedProductIds.length} products?`)) {
                      bulkDeleteProducts(selectedProductIds);
                      setSelectedProductIds([]);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 border border-rose-200 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Table View Mode ── */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-[#EAE6FD] shadow-[0_4px_20px_rgba(98,87,255,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE6FD] bg-[#FAF9FF] text-[11px] font-bold text-[#8E8EA0] uppercase tracking-wider">
                  <th className="p-4 w-10">
                    <button onClick={handleSelectAll} className="text-[#6257FF]">
                      {selectedProductIds.length > 0 && selectedProductIds.length === filteredProducts.length ? (
                        <CheckSquare className="w-4 h-4 text-[#6257FF]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#C4C4D4]" />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-3">Product</th>
                  <th className="py-4 px-3">Category</th>
                  <th className="py-4 px-3">Price</th>
                  <th className="py-4 px-3">Stock Units</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-3 text-center">Featured</th>
                  <th className="py-4 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6FD]/60 text-xs">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const isLowStock = product.stockCount > 0 && product.stockCount < 5;
                  const isOutOfStock = product.stockCount === 0 || product.stockStatus === 'out_of_stock';

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-[#F9F8FF] transition-colors ${
                        isSelected ? 'bg-[#F3F0FF]/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleSelect(product.id)}
                          className="text-[#6257FF]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#6257FF]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#C4C4D4]" />
                          )}
                        </button>
                      </td>

                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] p-1.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-[#15152A] hover:text-[#6257FF] transition-colors line-clamp-1">
                                {product.name}
                              </h4>
                              {product.badge && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#EDE9FE] text-[#6257FF] border border-[#DDD6FE]">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-[#8E8EA0]">
                              ID: {product.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 font-semibold text-[#626276]">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] text-[11px]">
                          {product.categoryName || product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-[#15152A]">
                          {STORE_CONFIG.currency}{product.price.toLocaleString()}
                        </div>
                        {product.oldPrice && (
                          <div className="text-[11px] text-[#A0A0B2] line-through">
                            {STORE_CONFIG.currency}{product.oldPrice.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Stock Counter Stepper */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateProductStock(product.id, -1, true)}
                            className="w-6 h-6 rounded-lg bg-[#FAF9FF] border border-[#EAE6FD] flex items-center justify-center font-bold text-[#626276] hover:bg-[#EDE9FE] hover:text-[#6257FF]"
                          >
                            -
                          </button>
                          <span className={`w-8 text-center font-bold ${
                            isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-[#15152A]'
                          }`}>
                            {product.stockCount ?? 10}
                          </span>
                          <button
                            onClick={() => updateProductStock(product.id, 1, true)}
                            className="w-6 h-6 rounded-lg bg-[#FAF9FF] border border-[#EAE6FD] flex items-center justify-center font-bold text-[#626276] hover:bg-[#EDE9FE] hover:text-[#6257FF]"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="py-3 px-3">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-200">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                            Low Stock ({product.stockCount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Featured / Popular Toggles */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => togglePopular(product.id)}
                            title={product.isPopular ? 'Remove from Homepage Popular Carousel' : 'Show on Homepage Popular Carousel'}
                            className={`p-1.5 rounded-xl transition-all ${
                              product.isPopular
                                ? 'bg-amber-100 text-amber-600 shadow-xs'
                                : 'text-[#C4C4D4] hover:text-amber-500 hover:bg-amber-50'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${product.isPopular ? 'fill-amber-500' : ''}`} />
                          </button>

                          <button
                            onClick={() => toggleFeatured(product.id)}
                            title={product.isFeatured ? 'Remove Hero Spotlight' : 'Promote to Hero Spotlight'}
                            className={`p-1.5 rounded-xl transition-all ${
                              product.isFeatured
                                ? 'bg-[#EDE9FE] text-[#6257FF] shadow-xs'
                                : 'text-[#C4C4D4] hover:text-[#6257FF] hover:bg-purple-50'
                            }`}
                          >
                            <Sparkles className={`w-4 h-4 ${product.isFeatured ? 'fill-[#6257FF]' : ''}`} />
                          </button>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 rounded-xl text-[#6257FF] hover:bg-[#EDE9FE] transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => duplicateProduct(product.id)}
                            className="p-1.5 rounded-xl text-[#8E8EA0] hover:text-[#15152A] hover:bg-slate-100 transition-colors"
                            title="Duplicate Product"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-[#A0A0B2] mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-[#15152A]">No products match your filters</h3>
              <p className="text-xs text-[#626276] mt-1">Try clearing search terms or changing the category filter</p>
            </div>
          )}
        </div>
      )}

      {/* ── Card Grid View Mode ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const isLowStock = product.stockCount > 0 && product.stockCount < 5;
            const isOutOfStock = product.stockCount === 0 || product.stockStatus === 'out_of_stock';

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white rounded-3xl border border-[#EAE6FD] p-4 shadow-[0_4px_20px_rgba(98,87,255,0.04)] hover:shadow-[0_12px_35px_rgba(98,87,255,0.12)] transition-all flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-br from-[#FAF9FF] via-[#F5F3FF] to-[#FFF0FB] p-4 flex items-center justify-center mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                    {product.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#6257FF] shadow-xs border border-[#EAE6FD]">
                        {product.badge}
                      </span>
                    )}
                    {product.isPopular && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-white shadow-xs">
                        ★ Popular
                      </span>
                    )}
                  </div>

                  {/* Stock tag */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        Out
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                        Low ({product.stockCount})
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider block">
                    {product.categoryName}
                  </span>
                  <h3 className="text-sm font-bold text-[#15152A] line-clamp-1 mt-0.5">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-base font-extrabold text-[#15152A]">
                      {STORE_CONFIG.currency}{product.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-[#626276]">
                      {product.stockCount ?? 10} in stock
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 mt-3 border-t border-[#EAE6FD] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePopular(product.id)}
                      className={`p-1.5 rounded-xl ${
                        product.isPopular ? 'text-amber-500 bg-amber-50' : 'text-[#C4C4D4] hover:text-amber-500'
                      }`}
                      title="Toggle Homepage Popular"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => toggleFeatured(product.id)}
                      className={`p-1.5 rounded-xl ${
                        product.isFeatured ? 'text-[#6257FF] bg-purple-50' : 'text-[#C4C4D4] hover:text-[#6257FF]'
                      }`}
                      title="Toggle Hero Spotlight"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#EDE9FE] text-[#6257FF] text-xs font-bold hover:bg-[#DDD6FE]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Product Create / Edit Modal ── */}
      <AdminProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
      />

      {/* ── Delete Confirmation Dialog ── */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
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
                Delete Product?
              </h3>
              <p className="text-xs text-[#626276] max-w-xs mx-auto mb-6">
                Are you sure you want to remove <strong className="text-[#15152A]">"{productToDelete.name}"</strong>? This will immediately remove it from all storefront catalog pages.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-[#626276] hover:bg-[#FAF9FF]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
