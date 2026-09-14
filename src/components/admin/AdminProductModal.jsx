'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Upload,
  Crop,
  SlidersHorizontal,
} from 'lucide-react';
import { ASSET_GALLERY, BADGE_PRESETS } from './adminConstants';
import { useCatalog } from '../../context/CatalogContext';
import { ImageCropperModal } from './ImageCropperModal';
import { uploadToCloudinary } from '../../lib/uploadClient';

const DRAFT_STORAGE_KEY = 'nakoda_admin_product_draft';

const DEFAULT_FORM_STATE = {
  name: '',
  category: 'clothing',
  categoryName: 'Clothing',
  price: 999,
  oldPrice: 1499,
  discountPercent: 33,
  rating: 4.9,
  reviews: 0,
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
    { name: 'Gold Polish', hex: '#D4AF37' },
    { name: 'Silver Tone', hex: '#C0C0C0' },
  ],
  sizes: '',
};

export const AdminProductModal = ({ isOpen, onClose, product = null }) => {
  const { categories, addProduct, updateProduct, storeConfig } = useCatalog();
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'pricing', 'media', 'inventory', 'variants'
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#9FD842');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hasDraftSaved, setHasDraftSaved] = useState(false);

  // Image Cropper & Editor State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState('');
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState(false);

  const isEditing = !!product;

  const prevIsOpenRef = useRef(false);
  const prevProductIdRef = useRef(null);

  // Initialize or restore modal data only when modal opens or target product changes
  // Crucial: background category/product re-fetches (e.g. from switching tabs) will NOT wipe the user's input!
  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      prevProductIdRef.current = null;
      return;
    }

    const justOpened = !prevIsOpenRef.current;
    const productChanged = (product?.id || null) !== prevProductIdRef.current;

    prevIsOpenRef.current = true;
    prevProductIdRef.current = product?.id || null;

    if (justOpened || productChanged) {
      if (product) {
        setFormData({
          ...DEFAULT_FORM_STATE,
          ...product,
          tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
          sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || ''),
          colors: product.colors || [],
          customImageUrl: typeof product.image === 'string' && product.image.startsWith('http') ? product.image : '',
        });
        setHasDraftSaved(false);
      } else {
        // Attempt to restore saved draft from localStorage
        let restored = null;
        try {
          const saved = typeof window !== 'undefined' ? localStorage.getItem(DRAFT_STORAGE_KEY) : null;
          if (saved) {
            restored = JSON.parse(saved);
          }
        } catch (e) {}

        const hasSavedContent = restored && (
          (restored.name && restored.name.trim().length > 0) ||
          (restored.description && restored.description.trim().length > 0) ||
          (restored.customImageUrl && restored.customImageUrl.trim().length > 0) ||
          (restored.tags && restored.tags.trim().length > 0) ||
          (restored.sizes && restored.sizes.trim().length > 0) ||
          (restored.price !== DEFAULT_FORM_STATE.price)
        );

        if (hasSavedContent) {
          const { id: _oldId, _id: _oldMongoId, ...cleanRestored } = restored;
          setFormData({
            ...DEFAULT_FORM_STATE,
            ...cleanRestored,
          });
          setHasDraftSaved(true);
        } else {
          setFormData({
            ...DEFAULT_FORM_STATE,
            category: categories[0]?.id || 'clothing',
            categoryName: categories[0]?.name || 'Clothing',
            image: ASSET_GALLERY[0].src,
          });
          setHasDraftSaved(false);
        }
      }
      setErrors({});
      setSubmitError('');
      setIsSubmitting(false);
      setActiveTab('basic');
    }
  }, [isOpen, product, categories]);

  // Auto-save draft to localStorage whenever user modifies form fields in "Add Product" mode
  useEffect(() => {
    if (!isOpen || isEditing) return;

    const hasContent = (formData.name && formData.name.trim().length > 0) ||
      (formData.description && formData.description.trim().length > 0) ||
      (formData.customImageUrl && formData.customImageUrl.trim().length > 0) ||
      (formData.tags && formData.tags.trim().length > 0) ||
      (formData.sizes && formData.sizes.trim().length > 0) ||
      (formData.price !== DEFAULT_FORM_STATE.price);

    if (hasContent) {
      try {
        const { id: _idStrip, _id: _mongoStrip, ...draftToSave } = formData;
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftToSave));
        setHasDraftSaved(true);
      } catch (e) {}
    }
  }, [formData, isOpen, isEditing]);

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
    setFormData({
      ...DEFAULT_FORM_STATE,
      category: categories[0]?.id || 'clothing',
      categoryName: categories[0]?.name || 'Clothing',
      image: ASSET_GALLERY[0].src,
    });
    setHasDraftSaved(false);
    setErrors({});
  };

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

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const base64 = loadEvt.target.result;
        // Auto-open cropper modal so the admin can frame & adjust immediately
        setImageToCrop(base64);
        setIsCropperOpen(true);
        setFormData((prev) => ({
          ...prev,
          image: base64,
          customImageUrl: '',
        }));
      };
      reader.readAsDataURL(file);
    }
    // Clear input so user can re-select same file if needed
    e.target.value = '';
  };

  const handleOpenCropper = () => {
    const currentImg = formData.customImageUrl?.trim() || formData.image;
    if (currentImg) {
      setImageToCrop(currentImg);
      setIsCropperOpen(true);
    }
  };

  const handleApplyCroppedImage = async (croppedBase64) => {
    setIsCropperOpen(false);
    setFormData((prev) => ({
      ...prev,
      image: croppedBase64,
      customImageUrl: '',
    }));

    setIsUploadingToCloudinary(true);
    try {
      const res = await uploadToCloudinary(croppedBase64, 'nakoda_imitation/products');
      if (res?.url) {
        setFormData((prev) => ({
          ...prev,
          image: res.url,
          customImageUrl: res.url,
        }));
      }
    } catch (err) {
      console.warn('Cloudinary upload notification:', err);
    } finally {
      setIsUploadingToCloudinary(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (formData.price <= 0) errs.price = 'Price must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitError('');
    if (!validate()) {
      setActiveTab('basic');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        oldPrice: Number(formData.oldPrice) || undefined,
        stockCount: Number(formData.stockCount) || 0,
        rating: Number(formData.rating) || 4.9,
        reviews: Number(formData.reviews) || 0,
        image: formData.customImageUrl?.trim() || formData.image,
        tags: typeof formData.tags === 'string'
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : formData.tags,
        sizes: typeof formData.sizes === 'string' && formData.sizes.trim()
          ? formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
      };

      let result;
      if (isEditing) {
        result = await updateProduct(product.id, payload);
      } else {
        delete payload.id;
        delete payload._id;
        result = await addProduct(payload);
      }

      if (result && result.success === false) {
        setSubmitError(result.error || 'Server rejected product submission');
        setIsSubmitting(false);
        return;
      }

      // Success: Clear draft if we were adding a product
      if (!isEditing) {
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch (e) {}
        setHasDraftSaved(false);
      }

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'An unexpected error occurred while saving.');
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Layers },
    { id: 'pricing', label: 'Pricing & Badges', icon: Tag },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package },
    { id: 'media', label: 'Image & Media', icon: ImageIcon },
    { id: 'variants', label: 'Colors & Options', icon: Palette },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-white rounded-[32px] border border-black/10 shadow-[0_25px_70px_rgba(0,0,0,0.22)] overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-black/10 flex items-center justify-between bg-[#F8FDF0]/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#171717] flex items-center justify-center text-[#9FD842] shadow-md shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-[#171717]">
                  {isEditing ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
                </h2>
                {!isEditing && hasDraftSaved && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/60">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Draft Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-[#777777] truncate">
                {isEditing ? `Product SKU: ${product.id}` : 'Fill in the details to publish item on Nakoda Imitation'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isEditing && hasDraftSaved && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="hidden sm:inline-flex items-center text-xs font-semibold text-neutral-500 hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Discard saved draft and start fresh"
              >
                Clear Draft
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="px-6 border-b border-black/10 bg-[#EEEEEC]/40 flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'text-[#555555] hover:text-[#171717] hover:bg-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#9FD842]' : ''}`} />
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
                <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kundan Bridal Necklace Set"
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-black/10 bg-[#EEEEEC]/50'
                  } text-sm text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] shadow-xs`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] shadow-xs cursor-pointer font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                    Search Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. necklace, bridal, kundan, choker"
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Crafted with high-grade brass, antique gold micro-plating, premium synthetic stones..."
                  className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] shadow-xs resize-none"
                />
              </div>

              {/* Home & Showcase Toggles */}
              <div className="p-4 rounded-2xl bg-[#F8FDF0] border border-[#9FD842]/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-[#709E1E] focus:ring-[#9FD842] accent-[#709E1E] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#171717] block">Feature in Homepage Popular Grid</span>
                    <span className="text-[11px] text-[#777777]">Shows right on the front store page</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#709E1E] focus:ring-[#9FD842] accent-[#709E1E] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#171717] block">Mark as Special Spotlight</span>
                    <span className="text-[11px] text-[#777777]">Priority promotion tag</span>
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
                  <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handlePriceChange('price', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm font-bold text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] shadow-xs"
                  />
                  {errors.price && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                    Original / MRP Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.oldPrice || ''}
                    onChange={(e) => handlePriceChange('oldPrice', e.target.value)}
                    placeholder="e.g. 1999"
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                    Discount (%)
                  </label>
                  <div className="px-4 py-3 rounded-2xl bg-[#F3FCDA] border border-[#9FD842]/40 text-sm font-extrabold text-[#709E1E] flex items-center justify-between">
                    <span>{formData.discountPercent || 0}% OFF</span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              </div>


              {/* Badges Section */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-2 uppercase tracking-wider">
                  Product Ribbon Badge
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {BADGE_PRESETS.map((bp) => (
                    <button
                      key={bp.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, badge: bp.label, badgeType: bp.type })}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        formData.badge === bp.label
                          ? 'ring-2 ring-[#171717] bg-[#171717] text-white border-black'
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
                    placeholder="Custom badge text (e.g. HANDMADE, EXCLUSIVE)"
                    className="w-full px-4 py-2.5 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-xs font-bold text-[#171717] uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                  />
                  {formData.badge && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, badge: '', badgeType: '' })}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                    Units in Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockCount}
                    onChange={(e) => handleStockCountChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm font-bold text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                    Stock Status Override
                  </label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm font-bold text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] cursor-pointer"
                  >
                    <option value="in_stock">In Stock (Available)</option>
                    <option value="low_stock">Low Stock (Show Alert)</option>
                    <option value="out_of_stock">Out of Stock (Disabled)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#EEEEEC]/40 border border-black/5 text-xs text-[#777777] leading-relaxed">
                <span className="font-bold text-[#171717] block mb-1">ℹ️ Stock Auto-Calculations</span>
                When stock reaches 0, the item is automatically marked as "Out of Stock" on the storefront with WhatsApp order inquiries still enabled.
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                  Custom Image URL or Photo Upload
                </label>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="url"
                    value={formData.customImageUrl}
                    onChange={(e) => setFormData({ ...formData, customImageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or paste image URL"
                    className="flex-1 min-w-[200px] px-4 py-2.5 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-xs text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                  />
                  <label className="px-4 py-2.5 rounded-2xl bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-black/10 transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenCropper}
                    className="px-4 py-2.5 rounded-2xl bg-[#171717] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
                    title="Open Crop & Photo Studio"
                  >
                    <Crop className="w-3.5 h-3.5 text-[#9FD842]" />
                    <span>Crop / Edit</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-2 uppercase tracking-wider">
                  Or Pick from Gallery Asset Presets
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {ASSET_GALLERY.map((item) => {
                    const isSelected = !formData.customImageUrl && (formData.image === item.src || (formData.image?.src === item.src?.src));
                    return (
                      <div
                        key={item.id}
                        onClick={() => setFormData({ ...formData, image: item.src, customImageUrl: '' })}
                        className={`relative aspect-square rounded-2xl bg-[#EEEEEC] p-2 flex items-center justify-center cursor-pointer border-2 transition-all ${
                          isSelected ? 'border-[#171717] shadow-md scale-105' : 'border-transparent hover:border-black/20'
                        }`}
                      >
                        <img src={item.src} alt={item.name} className="max-h-full max-w-full object-contain" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#171717] text-[#9FD842] flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preview & Studio Edit Action */}
              <div className="p-4 rounded-2xl bg-[#EEEEEC]/30 border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-white border border-black/10 p-2 flex items-center justify-center flex-shrink-0 shadow-xs group">
                    <img
                      src={formData.customImageUrl || formData.image}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#171717] block">Active Product Image</span>
                      {isUploadingToCloudinary ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-extrabold animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                          Uploading to Cloudinary...
                        </span>
                      ) : (formData.customImageUrl || formData.image)?.includes('res.cloudinary.com') ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#F3FCDA] border border-[#9FD842]/40 text-[#5F8C1D] text-[10px] font-extrabold flex items-center gap-1">
                          <span>☁️ Cloudinary CDN</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#F3FCDA] border border-[#9FD842]/30 text-[#709E1E] text-[10px] font-extrabold">
                          Ready
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#777777] block mt-0.5">
                      {isUploadingToCloudinary
                        ? 'Optimizing and syncing photo with Cloudinary...'
                        : 'Displayed on catalog cards, quick view, and detail pages.'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCropper}
                  className="px-4 py-2.5 rounded-2xl bg-[#171717] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 self-start sm:self-auto"
                >
                  <Crop className="w-3.5 h-3.5 text-[#9FD842]" />
                  <span>Crop & Edit Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: VARIANTS */}
          {activeTab === 'variants' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-2 uppercase tracking-wider">
                  Color / Polish Finishes
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Finish Name (e.g. Matte Rose Gold)"
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-xs text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-black/10 cursor-pointer p-0.5"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-4 py-2.5 rounded-2xl bg-[#171717] text-white text-xs font-bold hover:bg-black cursor-pointer shadow-sm"
                  >
                    Add
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {formData.colors.map((col, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEEEEC] border border-black/10 text-xs font-semibold text-[#171717]"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: col.hex }} />
                      <span>{col.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-rose-500 hover:text-rose-700 ml-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                  Available Sizes / Dimensions (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="e.g. 2.4, 2.6, 2.8, Free Size, 18-inch"
                  className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] shadow-xs"
                />
              </div>
            </div>
          )}

        </form>

        {/* Error Notification Banner */}
        {submitError && (
          <div className="mx-6 mb-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="flex-1">{submitError}</span>
            <button
              type="button"
              onClick={() => setSubmitError('')}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-black/10 bg-[#EEEEEC]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            {!isEditing && hasDraftSaved && (
              <button
                type="button"
                onClick={handleClearDraft}
                disabled={isSubmitting}
                className="sm:hidden px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-full cursor-pointer transition-colors"
              >
                Clear Draft
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-[#9FD842] rounded-full animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-[#9FD842]" />
                <span>{isEditing ? 'Save Product Changes' : 'Publish Product to Store'}</span>
              </>
            )}
          </button>
        </div>

      </motion.div>

      {/* Interactive Photo Cropper & Studio Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={imageToCrop}
        onClose={() => setIsCropperOpen(false)}
        onApply={handleApplyCroppedImage}
      />
    </div>
  );
};
