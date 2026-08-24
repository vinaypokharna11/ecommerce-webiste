import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderPlus,
  Edit3,
  Trash2,
  Package,
  Layers,
  Sparkles,
  Shirt,
  Footprints,
  Headphones,
  Watch,
  Armchair,
  ShoppingBag,
  LayoutGrid,
  Gift,
  Zap,
  Tag,
  Flame,
  X,
  Check,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { ICON_OPTIONS, COLOR_PRESETS } from './adminConstants';

const iconMap = {
  Headphones,
  Shirt,
  Footprints,
  Watch,
  Armchair,
  Sparkles,
  Gift,
  ShoppingBag,
  LayoutGrid,
  Zap,
  Tag,
  Flame,
};

export const AdminCategories = ({ onNavigateToProducts }) => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useCatalog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Shirt');
  const [colorPreset, setColorPreset] = useState(COLOR_PRESETS[0]);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setIcon('Shirt');
    setColorPreset(COLOR_PRESETS[0]);
    setDescription('');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.id);
    setIcon(cat.icon || 'LayoutGrid');
    const matchedColor = COLOR_PRESETS.find((c) => c.color === cat.color) || COLOR_PRESETS[0];
    setColorPreset(matchedColor);
    setDescription(cat.description || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = 'Category name is required';
    if (!slug.trim()) errs.slug = 'Category Slug/ID is required';
    
    // Check slug collision
    if (!editingCategory && categories.some((c) => c.id === slug.trim())) {
      errs.slug = 'A category with this ID already exists';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      id: slug.trim(),
      name: name.trim(),
      icon,
      color: colorPreset.color,
      accentBg: colorPreset.bg,
      iconColor: colorPreset.text,
      description: description.trim(),
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, payload);
    } else {
      addCategory(payload);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#15152A] tracking-tight">
            Categories Management
          </h1>
          <p className="text-xs sm:text-sm text-[#626276] mt-0.5">
            Organize catalog products into visual categories, icon badges, and storefront filters
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl gradient-btn-primary text-white font-bold text-xs sm:text-sm shadow-btn hover:scale-105 active:scale-95 transition-all"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* ── Category Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || LayoutGrid;
          const assignedProducts = products.filter((p) => p.category === category.id);
          const itemCount = assignedProducts.length;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-[#EAE6FD] p-6 shadow-[0_4px_20px_rgba(98,87,255,0.04)] hover:shadow-[0_12px_35px_rgba(98,87,255,0.12)] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Icon + Category Badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${category.accentBg || 'bg-[#F5F3FF]'} flex items-center justify-center border border-[#EAE6FD] shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-7 h-7 ${category.iconColor || 'text-[#6257FF]'}`} />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(category)}
                      className="p-2 rounded-xl text-[#6257FF] bg-[#F5F3FF] hover:bg-[#EDE9FE] transition-colors"
                      title="Edit Category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(category)}
                      className="p-2 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Slug */}
                <h3 className="text-lg font-extrabold text-[#15152A] group-hover:text-[#6257FF] transition-colors">
                  {category.name}
                </h3>
                <span className="text-[11px] font-mono text-[#8E8EA0] block mb-2">
                  ID: {category.id}
                </span>

                <p className="text-xs text-[#626276] line-clamp-2 mb-4 leading-relaxed">
                  {category.description || 'General catalog category for store products.'}
                </p>
              </div>

              {/* Card Footer: Product Count & Filter Action */}
              <div className="pt-4 border-t border-[#EAE6FD] flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9FF] border border-[#EAE6FD] text-xs font-bold text-[#15152A]">
                  <Package className="w-3.5 h-3.5 text-[#6257FF]" />
                  {itemCount} Products
                </span>

                <button
                  onClick={() => onNavigateToProducts && onNavigateToProducts(category.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#6257FF] hover:text-[#4F46E5] group/btn"
                >
                  <span>View Items</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Add / Edit Category Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-[#15152A]/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EAE6FD] shadow-2xl z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#EAE6FD] bg-gradient-to-r from-white via-[#FAF9FF] to-[#F5F3FF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6257FF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#15152A]">
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </h3>
                    <p className="text-xs text-[#626276]">Configure category icon, color accents, and slug</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF9FF] text-[#626276] flex items-center justify-center hover:bg-[#F0EEFF]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Footwear, Home Decor, Electronics"
                    className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
                  />
                  {errors.name && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Category ID / Slug *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    disabled={!!editingCategory}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. footwear"
                    className={`w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm font-mono text-[#15152A] focus:outline-none focus:border-[#6257FF] ${
                      editingCategory ? 'bg-slate-50 opacity-70 cursor-not-allowed' : 'bg-white'
                    }`}
                  />
                  {errors.slug && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.slug}</p>}
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Select Category Icon
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 rounded-2xl border border-[#EAE6FD] bg-[#FAF9FF]">
                    {ICON_OPTIONS.map((opt) => {
                      const IconComp = iconMap[opt.name] || LayoutGrid;
                      const isSelected = icon === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setIcon(opt.name)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-[#EDE9FE] border-[#6257FF] text-[#6257FF] shadow-xs'
                              : 'bg-white border-[#EAE6FD] text-[#626276] hover:bg-slate-50'
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Palette Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Theme Color Accent
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLOR_PRESETS.map((preset) => {
                      const isSelected = colorPreset.color === preset.color;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setColorPreset(preset)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'ring-2 ring-[#6257FF] border-[#6257FF] bg-white shadow-xs'
                              : 'border-[#EAE6FD] bg-[#FAF9FF] opacity-80 hover:opacity-100'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full shadow-xs"
                            style={{ backgroundColor: preset.color }}
                          />
                          <span>{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short summary for this category..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EAE6FD] text-xs text-[#15152A] focus:outline-none focus:border-[#6257FF] resize-none"
                  />
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-[#EAE6FD] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#626276] hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold shadow-btn hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {categoryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCategoryToDelete(null)}
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
                Delete Category?
              </h3>
              <p className="text-xs text-[#626276] max-w-xs mx-auto mb-6">
                Are you sure you want to delete <strong className="text-[#15152A]">"{categoryToDelete.name}"</strong>? Products under this category won't be deleted, but may need to be reassigned.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setCategoryToDelete(null)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-[#626276] hover:bg-[#FAF9FF]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md"
                >
                  Yes, Delete Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
