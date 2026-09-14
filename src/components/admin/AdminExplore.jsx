'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Plus,
  Save,
  RotateCcw,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  Layers,
  Sparkles,
  X,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { DEFAULT_EXPLORE_SECTION } from '../../data/mockData';
import { uploadToCloudinary } from '../../lib/uploadClient';
import { InfiniteMenu } from '@/components/ui/InfiniteMenu';

// Quick image presets for imitation jewelry & lifestyle
const PRESET_IMAGES = [
  { label: 'Trolley & Luggage', url: '/assets/images/prod_trolley.jpg' },
  { label: 'Jewelry & Watches', url: '/assets/images/nakoda/hero.jpg' },
  { label: 'Papad & Gourmet', url: '/assets/images/prod_papad.jpg' },
  { label: 'Innerwear & Essentials', url: '/assets/images/prod_innerwear.jpg' },
  { label: 'Audio & Headphones', url: '/assets/images/prod_headphones.jpg' },
  { label: 'Denim & Outfits', url: '/assets/images/prod_denim_jacket.jpg' },
  { label: 'Sneakers & Shoes', url: '/assets/images/prod_sneakers.jpg' },
  { label: 'Home Decor & Plant', url: '/assets/images/hero_plant.jpg' },
  { label: 'Backpack & Bags', url: '/assets/images/prod_backpack.jpg' },
];

export const AdminExplore = () => {
  const { exploreSection, updateExploreSection, categories } = useCatalog();

  // Local Form State
  const [formData, setFormData] = useState(() => {
    return exploreSection || DEFAULT_EXPLORE_SECTION;
  });

  const [collections, setCollections] = useState(() => {
    return exploreSection?.collections || DEFAULT_EXPLORE_SECTION.collections;
  });

  // Sync with context if external changes happen
  useEffect(() => {
    if (exploreSection) {
      setFormData(exploreSection);
      if (Array.isArray(exploreSection.collections)) {
        setCollections(exploreSection.collections);
      }
    }
  }, [exploreSection]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [activeViewMode, setActiveViewMode] = useState('editor'); // 'editor' | 'preview'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null); // null for add, object for edit
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Modal Card Form State
  const [modalName, setModalName] = useState('');
  const [modalCategoryId, setModalCategoryId] = useState('');
  const [modalImage, setModalImage] = useState('');
  const [modalBadge, setModalBadge] = useState('');
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Save changes to server
  const handleSaveAll = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    const payload = {
      title: formData.title || 'Explore Our Collections',
      subtitle: formData.subtitle || '',
      enabled: formData.enabled !== false,
      collections: collections.map((col, index) => ({
        ...col,
        order: index + 1,
      })),
    };

    try {
      const result = await updateExploreSection(payload);
      if (result && result.success !== false) {
        setStatusMessage({
          type: 'success',
          text: 'Explore section successfully saved and updated across all storefront tabs!',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result?.error || 'Failed to save changes.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setStatusMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 5000);
    }
  };

  // Reset to default collections
  const handleResetDefaults = async () => {
    setResetConfirmOpen(false);
    setIsSaving(true);
    try {
      const res = await fetch('/api/explore', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_defaults' }),
      });
      const data = await res.json();
      if (data.success && data.exploreSection) {
        setFormData(data.exploreSection);
        setCollections(data.exploreSection.collections);
        setStatusMessage({
          type: 'success',
          text: 'Restored factory default explore collections.',
        });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Failed to reset defaults.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Move Collection Up/Down
  const handleMove = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= collections.length) return;
    const updated = [...collections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    // Update order values
    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    setCollections(reordered);
  };

  // Toggle active status for card
  const handleToggleActive = (id) => {
    setCollections((prev) =>
      prev.map((col) => (col.id === id ? { ...col, isActive: !col.isActive } : col))
    );
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingCard(null);
    setModalName('');
    const defaultCat = categories && categories[0] ? categories[0].id : 'bags-luggage';
    setModalCategoryId(defaultCat);
    setModalImage(PRESET_IMAGES[0].url);
    setModalBadge('');
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (col) => {
    setEditingCard(col);
    setModalName(col.name);
    setModalCategoryId(col.categoryId || col.id);
    setModalImage(col.image || '/assets/images/prod_backpack.jpg');
    setModalBadge(col.badge || '');
    setModalIsActive(col.isActive !== false);
    setModalError('');
    setIsModalOpen(true);
  };

  // Handle Image Upload inside Modal
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setModalError('');
    try {
      const res = await uploadToCloudinary(file, 'nakoda_imitation/explore');
      if (res?.url) {
        setModalImage(res.url);
      }
    } catch (err) {
      setModalError('Failed to upload image: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Save Modal Card
  const handleSaveModalCard = (e) => {
    e.preventDefault();
    if (!modalName.trim()) {
      setModalError('Collection Name is required');
      return;
    }
    if (!modalCategoryId) {
      setModalError('Target Category is required');
      return;
    }

    if (editingCard) {
      // Update existing
      setCollections((prev) =>
        prev.map((c) =>
          c.id === editingCard.id
            ? {
                ...c,
                name: modalName.trim(),
                categoryId: modalCategoryId,
                image: modalImage || '/assets/images/prod_backpack.jpg',
                badge: modalBadge.trim(),
                isActive: modalIsActive,
              }
            : c
        )
      );
    } else {
      // Add new
      const newId = `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newCard = {
        id: newId,
        name: modalName.trim(),
        categoryId: modalCategoryId,
        image: modalImage || '/assets/images/prod_backpack.jpg',
        badge: modalBadge.trim(),
        order: collections.length + 1,
        isActive: modalIsActive,
      };
      setCollections((prev) => [...prev, newCard]);
    }

    setIsModalOpen(false);
  };

  // Delete Card
  const handleDeleteCard = (id) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirmId(null);
  };

  // Filter and sort active collections for preview
  const previewCollections = collections
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">

      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-black/10 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#9FD842]/20 text-[#171717] rounded-xl">
              <Compass className="w-5 h-5 text-[#171717]" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717]">
              Explore Collections Manager
            </h1>
          </div>
          <p className="text-sm text-[#777777]">
            Customize the storefront’s 4-column visual collection showcase, image tiles, titles, and category link destinations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#777777] hover:text-[#171717] hover:bg-[#F5F5F3] border border-black/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#171717] text-white hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Collection
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#9FD842] text-[#171717] hover:bg-[#8EC731] transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Status Toast Message ── */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium ${
              statusMessage.type === 'success'
                ? 'bg-[#EBF7D4] border-[#9FD842]/40 text-[#2D5A1E]'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-[#4E8D1D] shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="p-1 rounded-lg hover:bg-black/5 text-[#777777]"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── View Toggle Bar (Editor / Live Preview) ── */}
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveViewMode('editor')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeViewMode === 'editor'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'bg-white text-[#777777] hover:text-[#171717] border border-black/10'
            }`}
          >
            Editor & Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('preview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeViewMode === 'preview'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'bg-white text-[#777777] hover:text-[#171717] border border-black/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Storefront Live Preview
            <span className="px-1.5 py-0.5 rounded-full bg-[#9FD842]/30 text-[#171717] text-[10px] font-bold">
              {previewCollections.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-[#777777] hidden sm:inline-block">
          Auto-syncs live to storefront tabs
        </span>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      {activeViewMode === 'editor' ? (
        <div className="space-y-6">

          {/* 1. Section Header & Visibility Settings */}
          <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#171717]">Section Visibility & Typography</h2>
                <p className="text-xs text-[#777777]">Set the main headline, subtitle, and storefront visibility.</p>
              </div>

              {/* Visibility Switch */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <span className="text-xs font-medium text-[#777777]">
                  {formData.enabled !== false ? (
                    <span className="inline-flex items-center gap-1 text-[#2D5A1E] font-semibold">
                      <Eye className="w-3.5 h-3.5" /> Visible on Storefront
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                      <EyeOff className="w-3.5 h-3.5" /> Hidden from Storefront
                    </span>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={formData.enabled !== false}
                  onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="toggle toggle-success toggle-sm"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Section Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171717]">
                  Section Title (Heading) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Explore Our Collections"
                  className="w-full px-3.5 py-2.5 bg-[#FBFBFB] border border-black/10 rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-all font-sans"
                />
              </div>

              {/* Section Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171717]">
                  Section Subtitle / Description
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Find exactly what you’re looking for..."
                  className="w-full px-3.5 py-2.5 bg-[#FBFBFB] border border-black/10 rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-all font-sans"
                />
              </div>
            </div>
          </div>

          {/* 2. Collection Cards List */}
          <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#171717]">
                  Collection Cards ({collections.length})
                </h2>
                <p className="text-xs text-[#777777]">
                  Drag/reorder cards, assign target categories, edit images, and add promotional badges.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F5F3] hover:bg-[#EEEEEC] text-[#171717] border border-black/10 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Card
              </button>
            </div>

            {/* Cards Table/List */}
            <div className="divide-y divide-black/5">
              {collections.map((col, index) => {
                const categoryObj = (categories || []).find(
                  (c) => c.id === (col.categoryId || col.id)
                );
                const categoryName = categoryObj ? categoryObj.name : col.categoryId || col.id;

                return (
                  <div
                    key={col.id || index}
                    className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      col.isActive === false ? 'opacity-50 bg-[#FBFBFB]' : ''
                    }`}
                  >
                    {/* Left: Drag/Order controls + Thumbnail + Details */}
                    <div className="flex items-center gap-3">
                      {/* Order Controls */}
                      <div className="flex flex-col gap-0.5 text-[#777777]">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'up')}
                          className="p-1 rounded hover:bg-[#EEEEEC] hover:text-[#171717] disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === collections.length - 1}
                          onClick={() => handleMove(index, 'down')}
                          className="p-1 rounded hover:bg-[#EEEEEC] hover:text-[#171717] disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Card Thumbnail */}
                      <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-black/5 border border-black/10 shrink-0">
                        <Image
                          src={col.image || '/assets/images/prod_backpack.jpg'}
                          alt={col.name}
                          fill
                          className="object-cover"
                        />
                        {col.badge && (
                          <div className="absolute top-1 left-1 px-1 rounded bg-black/70 text-white text-[8px] font-bold uppercase">
                            {col.badge}
                          </div>
                        )}
                      </div>

                      {/* Card Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#171717]">{col.name}</h3>
                          {col.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-[#9FD842]/30 text-[#171717] text-[10px] font-semibold uppercase tracking-wider">
                              {col.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-[#777777]">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3 text-[#9FD842]" />
                            Target: <strong className="text-[#171717]">{categoryName}</strong>
                          </span>
                          <span>•</span>
                          <span>Position: #{index + 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Active toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(col.id)}
                        className={`p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          col.isActive !== false
                            ? 'bg-[#EBF7D4] border-[#9FD842]/40 text-[#2D5A1E]'
                            : 'bg-[#EEEEEC] border-black/10 text-[#777777]'
                        }`}
                        title={col.isActive !== false ? 'Card is Active' : 'Card is Hidden'}
                      >
                        {col.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* Edit button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(col)}
                        className="p-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5F5F3] text-[#171717] border border-black/10 transition-colors cursor-pointer"
                        title="Edit Collection"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(col.id)}
                        className="p-2 rounded-xl text-xs font-semibold bg-white hover:bg-rose-50 text-rose-600 border border-black/10 hover:border-rose-200 transition-colors cursor-pointer"
                        title="Delete Collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── 3. LIVE STOREFRONT PREVIEW ── */
        <div className="space-y-4">
          <div className="p-4 bg-[#EBF7D4]/60 border border-[#9FD842]/30 rounded-2xl flex items-center justify-between text-xs text-[#2D5A1E]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4E8D1D]" />
              <span>
                <strong>Storefront Simulation</strong>: This is an exact 1:1 responsive preview of how the &quot;Explore Our Collections&quot; section renders to customers on the homepage.
              </span>
            </div>
            <button
              onClick={() => setActiveViewMode('editor')}
              className="font-bold underline hover:opacity-80 cursor-pointer"
            >
              Back to Editor
            </button>
          </div>

          {/* Render Storefront Mirror */}
          <div className="bg-[#FBFBFD] border border-black/10 rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="max-w-[1440px] mx-auto space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F] font-sans">
                  {formData.title || 'Explore Our Collections'}
                </h2>
                {formData.subtitle && (
                  <p className="text-xs sm:text-base text-[#6E6E73] max-w-xl font-normal">
                    {formData.subtitle}
                  </p>
                )}
              </div>

              {/* React Bits InfiniteMenu 3D Interactive Sphere Preview */}
              <div className="w-full h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-black/10 relative">
                <InfiniteMenu
                  items={previewCollections.map((col) => ({
                    image: col.image || '/assets/images/prod_backpack.jpg',
                    link: '#',
                    title: col.name,
                    description: col.badge ? `${col.badge} Collection` : 'Explore curated collection',
                    categoryId: col.categoryId || col.id,
                  }))}
                  scale={1.0}
                  backgroundColor="#0B0A12"
                  accentColor="#0071E3"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Add / Edit Collection Card ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-[#FBFBFB]">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-[#9FD842]/20 rounded-xl text-[#171717]">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-[#171717]">
                    {editingCard ? 'Edit Collection Card' : 'Add New Collection Card'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-black/5 text-[#777777] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveModalCard} className="p-6 space-y-5 overflow-y-auto">
                {modalError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Collection Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#171717]">
                    Collection Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    placeholder="e.g. Kundan Necklaces, Bags & Trolleys"
                    className="w-full px-3.5 py-2.5 bg-[#FBFBFB] border border-black/10 rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-all"
                  />
                </div>

                {/* Target Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#171717]">
                    Target Category (Filters catalog when clicked) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={modalCategoryId}
                    onChange={(e) => setModalCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FBFBFB] border border-black/10 rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-all"
                  >
                    {(categories || []).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Promotional Badge */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#171717]">
                    Corner Badge Pill (Optional)
                  </label>
                  <input
                    type="text"
                    value={modalBadge}
                    onChange={(e) => setModalBadge(e.target.value)}
                    placeholder="e.g. Popular, Trending, Authentic, New"
                    className="w-full px-3.5 py-2.5 bg-[#FBFBFB] border border-black/10 rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-all"
                  />
                </div>

                {/* Image Selection & Upload */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-[#171717] flex items-center justify-between">
                    <span>Card Image</span>
                    {isUploading && (
                      <span className="text-xs text-[#4E8D1D] flex items-center gap-1 font-medium">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Uploading image...
                      </span>
                    )}
                  </label>

                  {/* Image Preview & Upload Button */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-black/5 border border-black/10 shrink-0">
                      <Image
                        src={modalImage || '/assets/images/prod_backpack.jpg'}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-2 flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full py-2 px-3 rounded-xl border border-black/10 bg-[#F5F5F3] hover:bg-[#EEEEEC] text-xs font-semibold text-[#171717] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Custom Photo
                      </button>

                      <div className="flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-[#777777] shrink-0" />
                        <input
                          type="text"
                          value={modalImage}
                          onChange={(e) => setModalImage(e.target.value)}
                          placeholder="Or paste image URL /assets/..."
                          className="w-full px-2.5 py-1.5 bg-[#FBFBFB] border border-black/10 rounded-lg text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preset Image Options */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-[#777777] font-medium">
                      Or pick from store assets:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setModalImage(preset.url)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            modalImage === preset.url
                              ? 'border-[#9FD842] ring-2 ring-[#9FD842]/30 scale-95'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                          title={preset.label}
                        >
                          <Image src={preset.url} alt={preset.label} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalIsActive}
                      onChange={(e) => setModalIsActive(e.target.checked)}
                      className="checkbox checkbox-sm checkbox-success"
                    />
                    <span className="text-xs font-semibold text-[#171717]">
                      Enable this card on storefront
                    </span>
                  </label>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777777] hover:text-[#171717] hover:bg-[#F5F5F3] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#171717] text-white hover:bg-black transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    {editingCard ? 'Update Card' : 'Add to Collection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CONFIRMATION MODAL: Delete Card ── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-black/10 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#171717]">Delete Collection Card?</h3>
                <p className="text-xs text-[#777777]">
                  Are you sure you want to remove this card from the storefront Explore section?
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777777] hover:bg-[#F5F5F3] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCard(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CONFIRMATION MODAL: Reset to Defaults ── */}
      <AnimatePresence>
        {resetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-black/10 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#9FD842]/20 text-[#171717] flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#171717]">Reset to Default Collections?</h3>
                <p className="text-xs text-[#777777]">
                  This will restore the 8 default collections (Bags, Jewelry, Papad, Undergarments, Electronics, Fashion, Footwear, Home) and default headline.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777777] hover:bg-[#F5F5F3] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#171717] text-white hover:bg-black transition-colors shadow-xs cursor-pointer"
                >
                  Yes, Restore Defaults
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminExplore;
