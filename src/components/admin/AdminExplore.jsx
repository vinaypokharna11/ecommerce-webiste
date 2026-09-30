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
import { DEFAULT_EXPLORE_SECTION } from '@/data/constants';
import { uploadToCloudinary } from '../../lib/uploadClient';
import { InfiniteMenu } from '@/components/ui/InfiniteMenu';
import { ExploreSectionSettings } from './explore/ExploreSectionSettings';
import { ExploreCardList } from './explore/ExploreCardList';
import { ExploreLivePreview } from './explore/ExploreLivePreview';
import { ExploreEditModal } from './explore/ExploreEditModal';
import { ExploreDeleteModal, ExploreResetModal } from './explore/ExploreConfirmModals';

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
  const {
    exploreSection,
    updateExploreSection,
    fetchExploreSection,
    createCollection,
    updateCollection,
    deleteCollection,
    reorderCollections,
    toggleCollectionVisibility,
    categories,
    getAuthHeaders,
  } = useCatalog();

  // Local Form State
  const [formData, setFormData] = useState(() => {
    return exploreSection || {
      title: 'Explore Our Collections',
      subtitle: 'Find exactly what you’re looking for across our curated lifestyle, grocery, apparel, and travel categories.',
      enabled: true,
      collections: [],
    };
  });

  const [collections, setCollections] = useState(() => {
    return Array.isArray(exploreSection?.collections) ? exploreSection.collections : [];
  });

  const isSavingRef = useRef(false);
  const [inFlightIds, setInFlightIds] = useState(new Set());

  // Fetch admin-level collections (including hidden ones) on mount
  useEffect(() => {
    if (fetchExploreSection) {
      fetchExploreSection({ admin: true });
    }
  }, [fetchExploreSection]);

  // Sync with context if external changes happen
  useEffect(() => {
    if (exploreSection && !isSavingRef.current) {
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

  // Central Persistence Function: saves section metadata
  const handleSaveAll = async () => {
    isSavingRef.current = true;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const payload = {
        title: formData.title || 'Explore Our Collections',
        subtitle: formData.subtitle || '',
        enabled: formData.enabled !== false,
      };
      const result = await updateExploreSection(payload);
      if (result && result.success !== false) {
        setStatusMessage({
          type: 'success',
          text: 'Explore section settings saved live across the store!',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result?.error || 'Failed to save settings.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'An unexpected error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        isSavingRef.current = false;
      }, 600);
      setTimeout(() => {
        setStatusMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 4000);
    }
  };

  // Reset to default collections
  const handleResetDefaults = async () => {
    setResetConfirmOpen(false);
    setIsSaving(true);
    try {
      const result = await updateExploreSection({ action: 'reset_defaults' });
      if (result && result.success !== false) {
        if (result.exploreSection) {
          setFormData(result.exploreSection);
          setCollections(result.exploreSection.collections || []);
        }
        setStatusMessage({
          type: 'success',
          text: 'Restored factory default explore collections.',
        });
      } else {
        setStatusMessage({ type: 'error', text: result?.error || 'Failed to reset defaults.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Failed to reset defaults.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Move Collection Up/Down with immediate atomic reordering
  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= collections.length) return;
    const colId = collections[index]?.id;
    if (!colId || inFlightIds.has(colId)) return;

    setInFlightIds((prev) => new Set(prev).add(colId));
    const prevCollections = [...collections];

    // Optimistic local reorder
    const updated = [...collections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    setCollections(reordered);

    const orderedIds = reordered.map((c) => c.id);
    const res = await reorderCollections(orderedIds);

    setInFlightIds((prev) => {
      const next = new Set(prev);
      next.delete(colId);
      return next;
    });

    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to reorder collections' });
      setCollections(prevCollections);
    }
  };

  // Toggle active status for card with immediate persistence
  const handleToggleActive = async (id) => {
    if (!id || inFlightIds.has(id)) return;
    setInFlightIds((prev) => new Set(prev).add(id));

    // Optimistic local toggle
    setCollections((prev) =>
      prev.map((col) => (col.id === id ? { ...col, isActive: !col.isActive } : col))
    );

    const res = await toggleCollectionVisibility(id);

    setInFlightIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to update visibility' });
      // Rollback
      setCollections((prev) =>
        prev.map((col) => (col.id === id ? { ...col, isActive: !col.isActive } : col))
      );
    }
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

  // Save Modal Card (Add or Edit)
  const handleSaveModalCard = async (e) => {
    e.preventDefault();
    if (!modalName.trim()) {
      setModalError('Collection Name is required');
      return;
    }
    if (!modalCategoryId) {
      setModalError('Target Category is required');
      return;
    }

    setIsSaving(true);
    setModalError('');

    try {
      if (editingCard) {
        const updateData = {
          name: modalName.trim(),
          categoryId: modalCategoryId,
          target: modalCategoryId,
          image: modalImage || '/assets/images/prod_backpack.jpg',
          badge: modalBadge.trim(),
          isActive: modalIsActive,
        };
        const res = await updateCollection(editingCard.id, updateData);
        if (res.success) {
          setIsModalOpen(false);
          setStatusMessage({
            type: 'success',
            text: `Collection "${modalName.trim()}" updated successfully!`,
          });
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          setModalError(res.error || 'Failed to update collection');
        }
      } else {
        const createData = {
          name: modalName.trim(),
          categoryId: modalCategoryId,
          target: modalCategoryId,
          image: modalImage || '/assets/images/prod_backpack.jpg',
          badge: modalBadge.trim(),
          isActive: modalIsActive,
        };
        const res = await createCollection(createData);
        if (res.success) {
          setIsModalOpen(false);
          setStatusMessage({
            type: 'success',
            text: `Collection "${modalName.trim()}" created successfully!`,
          });
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          setModalError(res.error || 'Failed to create collection');
        }
      }
    } catch (err) {
      setModalError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Card with atomic gap-free reordering
  const handleDeleteCard = async (id) => {
    if (!id || inFlightIds.has(id)) return;
    setInFlightIds((prev) => new Set(prev).add(id));
    setDeleteConfirmId(null);

    const prevList = [...collections];
    // Optimistic removal
    setCollections((prev) =>
      prev.filter((c) => c.id !== id).map((c, idx) => ({ ...c, order: idx + 1 }))
    );

    const res = await deleteCollection(id);

    setInFlightIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to delete collection' });
      setCollections(prevList);
    } else {
      setStatusMessage({ type: 'success', text: 'Collection deleted successfully.' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Filter and sort active collections for preview
  const previewCollections = collections
    .filter((c) => c.isActive !== false && !c.isDeleted)
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
          <ExploreSectionSettings
            formData={formData}
            setFormData={setFormData}
            handleSaveAll={handleSaveAll}
            isSaving={isSaving}
          />

          {/* 2. Collection Cards List */}
          <ExploreCardList
            collections={collections}
            categories={categories}
            handleOpenAdd={handleOpenAdd}
            handleOpenEdit={handleOpenEdit}
            handleMove={handleMove}
            handleToggleActive={handleToggleActive}
            setDeleteConfirmId={setDeleteConfirmId}
          />
        </div>
      ) : (
        /* ── 3. LIVE STOREFRONT PREVIEW ── */
        <ExploreLivePreview
          formData={formData}
          previewCollections={previewCollections}
          setActiveViewMode={setActiveViewMode}
        />
      )}

      {/* ── MODAL: Add / Edit Collection Card ── */}
      <ExploreEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCard={editingCard}
        modalName={modalName}
        setModalName={setModalName}
        modalCategoryId={modalCategoryId}
        setModalCategoryId={setModalCategoryId}
        modalBadge={modalBadge}
        setModalBadge={setModalBadge}
        modalImage={modalImage}
        setModalImage={setModalImage}
        modalIsActive={modalIsActive}
        setModalIsActive={setModalIsActive}
        modalError={modalError}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        handleFileUpload={handleFileUpload}
        handleSaveModalCard={handleSaveModalCard}
        presetImages={PRESET_IMAGES}
        categories={categories}
      />

      {/* ── CONFIRMATION MODAL: Delete Card ── */}
      <ExploreDeleteModal
        deleteConfirmId={deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteCard}
      />

      {/* ── CONFIRMATION MODAL: Reset to Defaults ── */}
      <ExploreResetModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetDefaults}
      />

    </div>
  );
};

export default AdminExplore;
