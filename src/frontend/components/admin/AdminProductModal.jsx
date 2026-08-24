import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Tag,
  Star,
  Sparkles,
  DollarSign,
  Package,
  Layers,
  Check,
  Palette,
  AlertCircle
} from 'lucide-react';
import { ASSET_GALLERY, BADGE_PRESETS } from './adminConstants';
import { useCatalog } from '../../context/CatalogContext';

const DEFAULT_FORM_STATE = {
  name: '',
  category: 'electronics',
  categoryName: 'Electronics',
  price: 999,
  oldPrice: 1499,
  discountPercent: 33,
  rating: 4.8,
  reviews: 24,
  badge: 'NEW',
  badgeType: 'new',
  stockStatus: 'in_stock',
  stockCount: 15,
  image: ASSET_GALLERY[0].src,
  customImageUrl: '',
  description: '',
  tags: '',
  isPopular: false,
  isFeatured: false,
  colors: [
    { name: 'Matte Black', hex: '#0F172A' },
    { name: 'Pure White', hex: '#FFFFFF' },
  ],
  sizes: '',
};

export const AdminProductModal = ({ isOpen, onClose, product = null }) => {
  const { categories, addProduct, updateProduct } = useCatalog();
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'pricing', 'media', 'inventory', 'variants'
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#6257FF');
  const [errors, setErrors] = useState({});

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setFormData({
        ...DEFAULT_FORM_STATE,
        ...product,
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
        sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || ''),
        colors: product.colors || [],
        customImageUrl: typeof product.image === 'string' && product.image.startsWith('http') ? product.image : '',
      });
    } else {
      setFormData({
        ...DEFAULT_FORM_STATE,
        category: categories[0]?.id || 'clothing',
        categoryName: categories[0]?.name || 'Clothing',
        image: ASSET_GALLERY[0].src,
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const catObj = categories.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      category: catId,
      categoryName: catObj ? catObj.name : catId,
    }));
  };

  const handlePriceChange = (field, val) => {
    const num = Math.max(0, Number(val) || 0);
    setFormData((prev) => {
      const next = { ...prev, [field]: num };
      if (field === 'price' || field === 'oldPrice') {
        const p = field === 'price' ? num : prev.price;
        const op = field === 'oldPrice' ? num : prev.oldPrice;
        if (op > p && op > 0) {
          next.discountPercent = Math.round(((op - p) / op) * 100);
        } else {
          next.discountPercent = 0;
        }
      }
      return next;
    });
  };

  const handleStockCountChange = (val) => {
    const count = Math.max(0, parseInt(val, 10) || 0);
    let status = 'in_stock';
    if (count === 0) status = 'out_of_stock';
    else if (count < 5) status = 'low_stock';
    setFormData((prev) => ({
      ...prev,
      stockCount: count,
      stockStatus: status,
    }));
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: newColorName.trim(), hex: newColorHex }],
    }));
    setNewColorName('');
  };

  const handleRemoveColor = (index) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (formData.price <= 0) errs.price = 'Price must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setActiveTab('basic');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      oldPrice: Number(formData.oldPrice) || undefined,
      stockCount: Number(formData.stockCount) || 0,
      rating: Number(formData.rating) || 5.0,
      reviews: Number(formData.reviews) || 0,
      image: formData.customImageUrl?.trim() || formData.image,
      tags: typeof formData.tags === 'string'
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : formData.tags,
      sizes: typeof formData.sizes === 'string' && formData.sizes.trim()
        ? formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    if (isEditing) {
      updateProduct(product.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Layers },
    { id: 'pricing', label: 'Pricing & Badges', icon: Tag },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package },
    { id: 'media', label: 'Image & Media', icon: ImageIcon },
    { id: 'variants', label: 'Colors & Sizes', icon: Palette },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#15152A]/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl border border-[#EAE6FD] shadow-[0_25px_70px_rgba(98,87,255,0.22)] overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#EAE6FD] flex items-center justify-between bg-gradient-to-r from-white via-[#FAF9FF] to-[#F5F3FF]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6257FF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#15152A]">
                {isEditing ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
              </h2>
              <p className="text-xs text-[#626276]">
                {isEditing ? `Product SKU: ${product.id}` : 'Fill in the details to publish item on the storefront'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF9FF] hover:bg-[#F0EEFF] text-[#626276] flex items-center justify-center transition-colors border border-[#EAE6FD]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="px-6 border-b border-[#EAE6FD] bg-[#FAF9FF]/60 flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#6257FF] text-white shadow-sm'
                    : 'text-[#626276] hover:text-[#15152A] hover:bg-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Wireless Noise-Canceling Headphones"
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-[#EAE6FD] bg-white'
                  } text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF] shadow-xs`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] bg-white text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF] shadow-xs cursor-pointer font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Search Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. audio, wireless, bluetooth, headphones"
                    className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] bg-white text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF] shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed highlights, material quality, features, dimensions..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] bg-white text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF] shadow-xs resize-none"
                />
              </div>

              {/* Home & Showcase Toggles */}
              <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-[#6257FF] focus:ring-[#6257FF] accent-[#6257FF] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#15152A] block">Feature in Homepage Popular Carousel</span>
                    <span className="text-[11px] text-[#8E8EA0]">Appears on the main landing page showcase</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#EC5AC8] focus:ring-[#EC5AC8] accent-[#EC5AC8] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#15152A] block">Mark as Hero / Special Spotlight</span>
                    <span className="text-[11px] text-[#8E8EA0]">Gives special glowing promotion priority</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & BADGES */}
          {activeTab === 'pricing' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handlePriceChange('price', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] bg-white text-sm font-bold text-[#15152A] focus:outline-none focus:border-[#6257FF] shadow-xs"
                  />
                  {errors.price && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Original / MRP Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.oldPrice || ''}
                    onChange={(e) => handlePriceChange('oldPrice', e.target.value)}
                    placeholder="e.g. 4999"
                    className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] bg-white text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Discount (%)
                  </label>
                  <div className="px-4 py-3 rounded-2xl bg-[#FFF0FB] border border-[#FCD6F2] text-sm font-extrabold text-[#EC5AC8] flex items-center justify-between">
                    <span>{formData.discountPercent || 0}% OFF</span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Rating & Reviews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Initial Rating (1.0 to 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] bg-white text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Review Count
                  </label>
                  <input
                    type="number"
                    value={formData.reviews}
                    onChange={(e) => setFormData({ ...formData, reviews: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] bg-white text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
                  />
                </div>
              </div>

              {/* Badges Section */}
              <div>
                <label className="block text-xs font-bold text-[#15152A] mb-2 uppercase tracking-wider">
                  Product Ribbon Badge
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {BADGE_PRESETS.map((bp) => (
                    <button
                      key={bp.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, badge: bp.label, badgeType: bp.type })}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                        formData.badge === bp.label
                          ? 'ring-2 ring-[#6257FF] bg-[#EDE9FE] text-[#6257FF] border-[#6257FF]'
                          : `${bp.color} opacity-80 hover:opacity-100`
                      }`}
                    >
                      {bp.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value.toUpperCase() })}
                    placeholder="Custom badge text (e.g. FLASH SALE, EXCLUSIVE)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#EAE6FD] text-xs font-bold text-[#15152A]"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, badge: '' })}
                    className="px-3 py-2 rounded-xl text-xs text-rose-600 bg-rose-50 font-bold hover:bg-rose-100"
                  >
                    Clear Badge
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Units in Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockCount}
                    onChange={(e) => handleStockCountChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] bg-white text-sm font-bold text-[#15152A] focus:outline-none focus:border-[#6257FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Stock Status Badge
                  </label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] bg-white text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF] font-semibold"
                  >
                    <option value="in_stock">In Stock (Available)</option>
                    <option value="low_stock">Low Stock (Hurry Alert)</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Quick Stepper */}
              <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#15152A]">Quick Stock Adjuster</h4>
                  <p className="text-[11px] text-[#626276]">Quickly add or remove inventory units</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStockCountChange(Math.max(0, formData.stockCount - 5))}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE6FD] text-xs font-bold text-[#15152A] hover:bg-slate-50"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStockCountChange(Math.max(0, formData.stockCount - 1))}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE6FD] text-xs font-bold text-[#15152A] hover:bg-slate-50"
                  >
                    -1
                  </button>
                  <span className="px-3 text-sm font-extrabold text-[#6257FF]">{formData.stockCount}</span>
                  <button
                    type="button"
                    onClick={() => handleStockCountChange(formData.stockCount + 1)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE6FD] text-xs font-bold text-[#15152A] hover:bg-slate-50"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStockCountChange(formData.stockCount + 10)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE6FD] text-xs font-bold text-[#15152A] hover:bg-slate-50"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & IMAGES */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#15152A] mb-2 uppercase tracking-wider">
                  Select from Pre-loaded Asset Gallery
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-48 overflow-y-auto p-2 border border-[#EAE6FD] rounded-2xl bg-[#FAF9FF]">
                  {ASSET_GALLERY.map((asset) => {
                    const isSelected = formData.image === asset.src && !formData.customImageUrl;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: asset.src, customImageUrl: '' })}
                        className={`group relative aspect-square rounded-xl bg-white p-2 border flex items-center justify-center transition-all overflow-hidden ${
                          isSelected
                            ? 'ring-2 ring-[#6257FF] border-[#6257FF] shadow-sm'
                            : 'border-[#EAE6FD] hover:border-[#8B5CF6]/50'
                        }`}
                      >
                        <img
                          src={asset.src}
                          alt={asset.name}
                          className="max-h-full max-w-full object-contain"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#6257FF]/20 flex items-center justify-center">
                            <span className="w-5 h-5 rounded-full bg-[#6257FF] text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                  Or Provide Custom External Image URL (e.g. Unsplash, Cloudinary)
                </label>
                <input
                  type="url"
                  value={formData.customImageUrl}
                  onChange={(e) => setFormData({ ...formData, customImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] bg-white text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF] shadow-xs"
                />
              </div>

              {/* Live Preview */}
              <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-white border border-[#EAE6FD] p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={formData.customImageUrl || formData.image}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#15152A]">Image Preview</h4>
                  <p className="text-[11px] text-[#626276] mt-0.5">This image will be shown on product cards, catalog lists, and quick views.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VARIANTS & SIZES */}
          {activeTab === 'variants' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                  Available Sizes / Dimensions (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="e.g. S, M, L, XL, XXL or UK 7, UK 8, UK 9"
                  className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] bg-white text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#15152A] mb-2 uppercase tracking-wider">
                  Color Swatches
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {formData.colors.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE6FD] text-xs font-medium shadow-xs"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-[#8E8EA0] hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD]">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-[#EAE6FD] p-1 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Color name (e.g. Midnight Blue)"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#EAE6FD] text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3.5 py-2 rounded-xl bg-[#6257FF] text-white text-xs font-bold hover:bg-[#5044ED] transition-colors"
                  >
                    Add Color
                  </button>
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-[#EAE6FD] bg-[#FAF9FF] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-[#626276] hover:bg-white hover:text-[#15152A] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-2xl gradient-btn-primary text-white text-xs sm:text-sm font-bold shadow-btn hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
