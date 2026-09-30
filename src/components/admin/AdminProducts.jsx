'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
  MessageCircle,
  Upload,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { AdminProductModal } from './AdminProductModal';
import { AdminBulkImportModal } from './AdminBulkImportModal';
import { generateProductImportTemplate } from '../../utils/excelTemplate';
import { STORE_CONFIG } from '@/data/constants';
import { createProductWhatsAppUrl } from '../../utils/whatsapp';

export const AdminProducts = ({ onPreviewStore, initialCategory = 'all', onCategoryChange }) => {
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
    clearAllCatalog,
    isLiveConnected,
    storeConfig,
  } = useCatalog();

  const [isWiping, setIsWiping] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in_stock', 'low_stock', 'out_of_stock'

  // Sync category filter if navigating from another tab/card (e.g. Category "View Items")
  useEffect(() => {
    if (initialCategory !== undefined) {
      if (initialCategory === 'all') {
        setSelectedCategory('all');
      } else {
        const catLower = (initialCategory || '').trim().toLowerCase();
        const match = categories.find(
          (c) => (c.id || '').toLowerCase() === catLower || (c.name || '').toLowerCase() === catLower
        );
        setSelectedCategory(match ? match.id : initialCategory);
      }
    }
  }, [initialCategory, categories]);
  const [featuredFilter, setFeaturedFilter] = useState('all'); // 'all', 'featured', 'popular'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc', 'stock-asc', 'rating'
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Selection & Modal State
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState('');

  // Bulk action dropdown state
  const [bulkDiscountVal, setBulkDiscountVal] = useState(20);
  const [bulkCategoryVal, setBulkCategoryVal] = useState('');

  // Filtered & Sorted list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesSku = p.id?.toLowerCase().includes(q);
        const matchesCat = p.categoryName?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
        const matchesTag = p.tags && p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesSku && !matchesCat && !matchesTag) return false;
      }

      // Category filter
      if (selectedCategory && selectedCategory !== 'all') {
        const catLower = selectedCategory.trim().toLowerCase();
        const selectedCatObj = categories.find(
          (c) => (c.id || '').toLowerCase() === catLower || (c.name || '').toLowerCase() === catLower
        );
        const validValues = new Set([catLower]);
        if (selectedCatObj) {
          if (selectedCatObj.id) validValues.add(selectedCatObj.id.toLowerCase());
          if (selectedCatObj.name) validValues.add(selectedCatObj.name.toLowerCase());
        }

        const pCat = (p.category || '').trim().toLowerCase();
        const pCatName = (p.categoryName || '').trim().toLowerCase();

        const matchesCategory = validValues.has(pCat) || validValues.has(pCatName);
        if (!matchesCategory) return false;
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
      return (b.id || '').localeCompare(a.id || '');
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

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      setIsDeleting(true);
      setDeleteError('');
      const res = await deleteProduct(productToDelete.id);
      setIsDeleting(false);
      if (res && res.success === false) {
        setDeleteError(res.error || 'Failed to delete product');
        return;
      }
      setProductToDelete(null);
      setSelectedProductIds((prev) => prev.filter((id) => id !== productToDelete.id));
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    setIsBulkDeleting(true);
    setBulkDeleteError('');
    try {
      const res = await bulkDeleteProducts(selectedProductIds);
      setIsBulkDeleting(false);
      if (res && res.success === false) {
        setBulkDeleteError(res.error || 'Failed to delete selected products');
        return;
      }
      setSelectedProductIds([]);
      setIsBulkDeleteModalOpen(false);
    } catch (err) {
      setIsBulkDeleting(false);
      setBulkDeleteError(err.message || 'Error occurred during bulk deletion');
    }
  };

  const handleWhatsAppTest = (product) => {
    const url = createProductWhatsAppUrl(product, storeConfig?.whatsappNumber || '919876543210');
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              Products Catalog
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold ${
                isLiveConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{isLiveConnected ? 'Real-Time Sync' : 'Connecting Live...'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#777777]">
            Manage items, live stock updates, and pricing
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          <button
              onClick={async () => {
                if (window.confirm('Wipe and delete ALL products, categories, and offers from the active database? This will leave the catalog permanently empty until you add products.')) {
                  setIsWiping(true);
                  await clearAllCatalog();
                  setIsWiping(false);
                }
              }}
              disabled={isWiping}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isWiping ? 'Wiping...' : 'Clear All'}</span>
            </button>

          <button
            type="button"
            onClick={() => generateProductImportTemplate(categories)}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-full bg-white hover:bg-gray-50 text-[#171717] border border-black/10 text-xs font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Download formatted sample Excel template"
          >
            <Download className="w-3.5 h-3.5 text-[#709E1E]" />
            <span>Download Template</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-[#F3FCDA] hover:bg-[#EAF9C0] text-[#547910] border border-[#9FD842]/40 text-xs font-extrabold shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Bulk import products from CSV or Excel"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Import</span>
          </button>


        </div>
      </div>

      {/* ── Active Category Filter Banner (Full Width) ── */}
      {selectedCategory !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-[#F3FCDA] border border-[#9FD842]/50 text-xs text-[#547910] shadow-xs"
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-extrabold text-[#171717]">Showing category:</span>
            <span className="px-3 py-1 rounded-full bg-[#9FD842] text-[#171717] font-extrabold text-xs shadow-xs">
              {categories.find((c) => (c.id || '').toLowerCase() === selectedCategory.toLowerCase() || (c.name || '').toLowerCase() === selectedCategory.toLowerCase())?.name || selectedCategory}
            </span>
            <span className="text-xs text-[#709E1E] font-bold">
              • {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              if (onCategoryChange) onCategoryChange('all');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-black/5 text-[#171717] font-extrabold text-xs border border-black/10 transition-all cursor-pointer shrink-0"
          >
            <span>Show All Categories</span>
          </button>
        </motion.div>
      )}

      {/* ── Search, Filters & View Mode Bar ── */}
      <div className="p-4 sm:p-5 rounded-[28px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          
          {/* Search bar */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, SKU, or tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#EEEEEC] border border-black/5 text-xs sm:text-sm text-[#171717] placeholder-[#888888] focus:bg-white focus:ring-2 focus:ring-[#9FD842] focus:outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                if (onCategoryChange) onCategoryChange(e.target.value);
              }}
              className="w-full px-4 py-2.5 rounded-full bg-[#EEEEEC] border border-black/5 text-xs font-semibold text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#9FD842] cursor-pointer"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => {
                const count = products.filter(
                  (p) =>
                    (p.category || '').toLowerCase() === c.id.toLowerCase() ||
                    (p.categoryName || '').toLowerCase() === (c.name || '').toLowerCase() ||
                    (p.category || '').toLowerCase() === (c.name || '').toLowerCase()
                ).length;
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
              className="w-full px-4 py-2.5 rounded-full bg-[#EEEEEC] border border-black/5 text-xs font-semibold text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#9FD842] cursor-pointer"
            >
              <option value="all">All Stock</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (&lt; 5)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-[#EEEEEC] border border-black/5 text-xs font-semibold text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#9FD842] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-desc">Stock: High to Low</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="lg:col-span-1 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-[#171717] text-white' : 'bg-[#EEEEEC] text-[#777777] hover:text-[#171717]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#171717] text-white' : 'bg-[#EEEEEC] text-[#777777] hover:text-[#171717]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ── Bulk Actions Floating Ribbon (When Selected) ── */}
        {selectedProductIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#171717] text-white shadow-md"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#9FD842] px-2 py-0.5 rounded-full bg-white/10">
                {selectedProductIds.length} Selected
              </span>
              <span className="text-white/60">Apply batch actions:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={() => bulkUpdateStockStatus(selectedProductIds, 'in_stock')}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
              >
                Mark In-Stock
              </button>
              <button
                onClick={() => bulkUpdateStockStatus(selectedProductIds, 'out_of_stock')}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
              >
                Mark Out-of-Stock
              </button>
              <button
                onClick={() => {
                  setBulkDeleteError('');
                  setIsBulkDeleteModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedProductIds.length})</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Catalog Empty State (0 items in DB) ── */}
      {products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-[32px] border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F5F5F7] text-[#777777] flex items-center justify-center mx-auto border border-black/10">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-[#171717]">Your Catalog is Empty</h2>
          <p className="text-xs sm:text-sm text-[#777777] max-w-md mx-auto leading-relaxed">
            No products found. Use <strong>Bulk Import</strong> to upload products via Excel, or use the Download Template to get started.
          </p>
        </div>
      ) : (
        <>
          {/* ── Table View Mode ── */}
          {viewMode === 'table' && (
        <div className="bg-white rounded-[28px] border border-black/10 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EEEEEC]/60 border-b border-black/10 text-[#777777] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-black/20 text-[#171717] focus:ring-[#9FD842] cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-3">Product</th>
                  <th className="py-4 px-3">Category</th>
                  <th className="py-4 px-3">Price</th>
                  <th className="py-4 px-3">Stock Units</th>
                  <th className="py-4 px-3">Badge / Featured</th>
                  <th className="py-4 px-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5 font-medium text-[#171717]">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const isLowStock = product.stockCount > 0 && product.stockCount < 5;
                  const isOutOfStock = product.stockCount === 0 || product.stockStatus === 'out_of_stock';

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-[#EEEEEC]/30 transition-colors ${isSelected ? 'bg-[#F8FDF0]' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(product.id)}
                          className="rounded border-black/20 text-[#171717] focus:ring-[#9FD842] cursor-pointer"
                        />
                      </td>

                      {/* Product details */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#EEEEEC] border border-black/10 p-1 flex items-center justify-center flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-[#171717] truncate max-w-[220px] sm:max-w-xs">
                              {product.name}
                            </h4>
                            <span className="text-[10px] text-[#777777] font-mono">
                              SKU: {product.sku || product.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EEEEEC] text-[#555555]">
                          {product.categoryName || product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-sm text-[#171717]">
                          ₹{product.price?.toLocaleString()}
                        </div>
                        {product.oldPrice && (
                          <div className="text-[10px] text-[#888888] line-through">
                            ₹{product.oldPrice.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Stock units */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={product.stockCount ?? 0}
                            onChange={(e) => updateProductStock(product.id, Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded-lg border border-black/10 bg-[#EEEEEC] text-center font-bold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                          />
                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              Out
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Low
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              In Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Badge / Featured */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {product.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3FCDA] text-[#709E1E] border border-[#9FD842]/30">
                              {product.badge}
                            </span>
                          )}
                          {product.isPopular && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleWhatsAppTest(product)}
                            className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                            title="Test WhatsApp Order Link"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => togglePopular(product.id)}
                            className={`p-2 rounded-full cursor-pointer ${
                              product.isPopular ? 'text-amber-500 bg-amber-50' : 'text-[#AAAAAA] hover:text-amber-500'
                            }`}
                            title="Toggle Homepage Spotlight"
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 rounded-full text-[#777777] hover:text-[#171717] hover:bg-[#EEEEEC] cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => duplicateProduct(product.id)}
                            className="p-2 rounded-full text-[#777777] hover:text-[#171717] hover:bg-[#EEEEEC] cursor-pointer"
                            title="Duplicate Product"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-2 rounded-full text-rose-500 hover:bg-rose-50 cursor-pointer"
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
              <Package className="w-12 h-12 text-[#AAAAAA] mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-[#171717]">No products match your filters</h3>
              <p className="text-xs text-[#777777] mt-1">Try clearing search terms or changing the category filter</p>
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
                className="group relative bg-white rounded-[28px] border border-black/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-square w-full rounded-2xl bg-transparent mb-3 overflow-hidden flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                    {product.badge && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#171717] text-white shadow-xs">
                        {product.badge}
                      </span>
                    )}
                    {product.isPopular && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-[#171717] shadow-xs">
                        ★ Featured
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
                  <span className="text-[10px] font-bold text-[#709E1E] uppercase tracking-wider block">
                    {product.categoryName || product.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#171717] line-clamp-1 mt-0.5">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-base font-extrabold text-[#171717]">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-[#777777]">
                      {product.stockCount ?? 10} in stock
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 mt-3 border-t border-black/10 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleWhatsAppTest(product)}
                      className="p-1.5 rounded-full text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                      title="Test WhatsApp Order Link"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => togglePopular(product.id)}
                      className={`p-1.5 rounded-full cursor-pointer ${
                        product.isPopular ? 'text-amber-500 bg-amber-50' : 'text-[#AAAAAA] hover:text-amber-500'
                      }`}
                      title="Toggle Homepage Spotlight"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="p-1.5 rounded-full text-[#777777] hover:text-[#171717] hover:bg-[#EEEEEC] cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicateProduct(product.id)}
                      className="p-1.5 rounded-full text-[#777777] hover:text-[#171717] hover:bg-[#EEEEEC] cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-1.5 rounded-full text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="Delete Product"
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
        </>
      )}

      {/* ── Product Edit/Create Modal ── */}
      <AdminProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
      />

      {/* ── Bulk Import Modal ── */}
      <AdminBulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
      />

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl border border-black/10 z-10 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#171717] mb-1">
                Delete Product?
              </h3>
              <p className="text-xs text-[#777777] mb-6 leading-relaxed">
                Are you sure you want to remove <strong className="text-[#171717]">"{productToDelete.name}"</strong>? This will immediately remove it from your live customer storefront.
              </p>

              {deleteError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-full bg-[#EEEEEC] text-[#171717] font-bold text-xs hover:bg-[#E2E2DE] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-rose-300 rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Yes, Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Bulk Delete Confirmation Modal ── */}
      <AnimatePresence>
        {isBulkDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isBulkDeleting && setIsBulkDeleteModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl border border-black/10 z-10 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#171717] mb-1">
                Delete {selectedProductIds.length} Selected Products?
              </h3>
              <p className="text-xs text-[#777777] mb-6 leading-relaxed">
                Are you sure you want to permanently remove <strong className="text-[#171717]">{selectedProductIds.length} products</strong> from the catalog? This action will immediately update across all customer screens.
              </p>

              {bulkDeleteError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                  {bulkDeleteError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  disabled={isBulkDeleting}
                  className="flex-1 py-3 rounded-full bg-[#EEEEEC] text-[#171717] font-bold text-xs hover:bg-[#E2E2DE] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBulkDelete}
                  disabled={isBulkDeleting}
                  className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isBulkDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-rose-300 rounded-full animate-spin" />
                      <span>Deleting {selectedProductIds.length}...</span>
                    </>
                  ) : (
                    <span>Yes, Delete All ({selectedProductIds.length})</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
