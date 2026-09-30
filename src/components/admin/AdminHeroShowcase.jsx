'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
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
  X,
  RefreshCw,
  Image as ImageIcon,
  Tag,
  LayoutGrid
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { DEFAULT_HERO_SHOWCASE } from '@/data/constants';
import { uploadToCloudinary } from '../../lib/uploadClient';

// Quick image presets available in the app
const PRESET_IMAGES = [
  { label: 'Cabin Trolley Suitcase', url: '/assets/images/prod_trolley_wide.jpg' },
  { label: 'Polki & Emerald Choker', url: '/assets/images/nakoda/hero.jpg' },
  { label: 'Spiced Urad Dal Papad', url: '/assets/images/prod_papad.jpg' },
  { label: 'Cotton Trunks (Innerwear)', url: '/assets/images/prod_innerwear.jpg' },
  { label: 'Wireless Headphones', url: '/assets/images/prod_headphones.jpg' },
  { label: 'Denim Jacket', url: '/assets/images/prod_denim_jacket.jpg' },
  { label: 'Casual Sneakers', url: '/assets/images/prod_sneakers.jpg' },
  { label: 'Succulent Plant', url: '/assets/images/hero_plant.jpg' },
  { label: 'Backpack', url: '/assets/images/prod_backpack.jpg' },
];

const BADGE_COLOR_PRESETS = [
  { label: 'Classic Black', bg: 'bg-black', text: 'text-white' },
  { label: 'Amber Gold', bg: 'bg-[#FF9500]', text: 'text-white' },
  { label: 'Fresh Green', bg: 'bg-[#34C759]', text: 'text-white' },
  { label: 'Electric Blue', bg: 'bg-[#0071E3]', text: 'text-white' },
  { label: 'Royal Purple', bg: 'bg-[#AF52DE]', text: 'text-white' },
  { label: 'Rose Red', bg: 'bg-[#FF2D55]', text: 'text-white' },
];

export const AdminHeroShowcase = () => {
  const { heroShowcase, updateHeroShowcase, categories, getAuthHeaders } = useCatalog();

  const [cards, setCards] = useState(() => {
    return Array.isArray(heroShowcase) && heroShowcase.length > 0
      ? heroShowcase
      : DEFAULT_HERO_SHOWCASE;
  });

  const isSavingRef = useRef(false);

  useEffect(() => {
    if (Array.isArray(heroShowcase) && heroShowcase.length > 0 && !isSavingRef.current) {
      setCards(heroShowcase);
    }
  }, [heroShowcase]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'preview'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null); // null for add, object for edit
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Modal Form State
  const [modalTitle, setModalTitle] = useState('');
  const [modalCategory, setModalCategory] = useState('');
  const [modalBadge, setModalBadge] = useState('');
  const [modalBadgeBg, setModalBadgeBg] = useState('bg-black');
  const [modalImage, setModalImage] = useState('');
  const [modalImageFit, setModalImageFit] = useState('cover');
  const [modalLinkCategory, setModalLinkCategory] = useState('all');
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Central persistence
  const persistCards = async (updatedCards) => {
    isSavingRef.current = true;
    setIsSaving(true);
    setStatusMessage(null);

    const ordered = updatedCards.map((c, idx) => ({
      ...c,
      order: idx,
    }));

    setCards(ordered);

    try {
      const res = await updateHeroShowcase(ordered);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Hero showcase cards saved & synced successfully!' });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to save hero showcase cards.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating cards.' });
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const openAddModal = () => {
    setEditingCard(null);
    setModalTitle('');
    setModalCategory('FEATURED COLLECTION');
    setModalBadge('NEW');
    setModalBadgeBg('bg-black');
    setModalImage('/assets/images/prod_trolley_wide.jpg');
    setModalImageFit('cover');
    setModalLinkCategory('all');
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setEditingCard(card);
    setModalTitle(card.title || '');
    setModalCategory(card.category || '');
    setModalBadge(card.badge || '');
    setModalBadgeBg(card.badgeBg || 'bg-black');
    setModalImage(card.image || '');
    setModalImageFit(card.imageFit || 'cover');
    setModalLinkCategory(card.linkCategory || 'all');
    setModalIsActive(card.isActive !== false);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    if (!modalTitle.trim()) {
      setModalError('Card title is required.');
      return;
    }
    if (!modalImage.trim()) {
      setModalError('Image URL or selection is required.');
      return;
    }

    let updated;
    if (editingCard) {
      updated = cards.map((c) =>
        c.id === editingCard.id
          ? {
              ...c,
              title: modalTitle.trim(),
              category: (modalCategory.trim() || 'FEATURED').toUpperCase(),
              badge: modalBadge.trim().toUpperCase(),
              badgeBg: modalBadgeBg,
              image: modalImage.trim(),
              imageFit: modalImageFit,
              linkCategory: modalLinkCategory,
              isActive: modalIsActive,
            }
          : c
      );
    } else {
      const newCard = {
        id: `hero-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: modalTitle.trim(),
        category: (modalCategory.trim() || 'FEATURED').toUpperCase(),
        badge: modalBadge.trim().toUpperCase(),
        badgeBg: modalBadgeBg,
        image: modalImage.trim(),
        imageFit: modalImageFit,
        linkCategory: modalLinkCategory,
        isActive: modalIsActive,
        order: cards.length,
      };
      updated = [...cards, newCard];
    }

    setIsModalOpen(false);
    await persistCards(updated);
  };

  const handleDeleteCard = async (id) => {
    const updated = cards.filter((c) => c.id !== id);
    setDeleteConfirmId(null);
    await persistCards(updated);
  };

  const handleToggleActive = async (id) => {
    const updated = cards.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    await persistCards(updated);
  };

  const handleMoveCard = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const copy = [...cards];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    await persistCards(copy);
  };

  const handleResetDefaults = async () => {
    setResetConfirmOpen(false);
    await persistCards(DEFAULT_HERO_SHOWCASE);
  };

  // Image Upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setModalError('');
    try {
      const url = await uploadToCloudinary(file);
      if (url) {
        setModalImage(url);
      } else {
        setModalError('Failed to upload image. Please enter a URL instead.');
      }
    } catch (err) {
      setModalError(err.message || 'Image upload error.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const activeCards = cards.filter((c) => c.isActive !== false);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16 font-sans">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-black/[0.08] shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-xs font-bold uppercase tracking-wider">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Hero 2x2 Showcase</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Homepage Hero Showcase Cards
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] max-w-2xl leading-relaxed">
            Perform full CRUD operations on the 4 hero product cards: update photos, badges, category labels, titles, and target links with real-time homepage sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab(activeTab === 'cards' ? 'preview' : 'cards')}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-black/10 text-xs sm:text-sm font-semibold text-[#1D1D1F] hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#0071E3]" />
            <span>{activeTab === 'cards' ? 'Live Grid Preview' : 'Back to Card List'}</span>
          </button>

          <button
            onClick={() => setResetConfirmOpen(true)}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-black/10 text-xs font-semibold text-[#6E6E73] hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset to initial 4 product cards"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Status / Alert Banner */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 sm:p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tab View: Cards Manager or Live Preview */}
      {activeTab === 'preview' ? (
        /* ── Live 2x2 Interactive Grid Preview ── */
        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-black/[0.08] shadow-sm flex flex-col items-center">
          <div className="text-center mb-6 max-w-md">
            <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F]">
              Live 2x2 Hero Showcase Preview
            </h3>
            <p className="text-xs text-[#6E6E73] mt-1">
              Displays exactly as visitors see it on the homepage hero section. Test hover zoom and interactive styling.
            </p>
          </div>

          <div className="w-full max-w-[480px] p-5 bg-[#FBFBFD] rounded-3xl border border-black/5 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full aspect-square max-w-[440px]">
              {(activeCards.length > 0 ? activeCards : cards).slice(0, 4).map((item, idx) => (
                <motion.div
                  key={`preview-${item.id || idx}`}
                  whileHover={{ scale: 1.045 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  onClick={() => openEditModal(item)}
                  className="relative z-10 hover:z-20 aspect-square w-full rounded-2xl overflow-hidden bg-[#F5F5F7] border border-black/[0.08] shadow-sm hover:shadow-xl cursor-pointer group select-none flex flex-col justify-between"
                  title="Click to edit this card"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="220px"
                    className={`${item.imageFit === 'contain' ? 'object-contain' : 'object-cover'} object-center scale-100 group-hover:scale-108 transition-transform duration-500 ease-out`}
                  />

                  {/* Top Badge */}
                  {item.badge && (
                    <div className="relative z-10 p-2.5 self-start">
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-white ${item.badgeBg || 'bg-black/65'} backdrop-blur-md border border-white/15 shadow-xs`}>
                        {item.badge}
                      </span>
                    </div>
                  )}

                  {/* Bottom Gradient Overlay */}
                  <div className="relative z-10 mt-auto w-full p-2.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end text-white">
                    <span className="text-[7.5px] font-bold uppercase tracking-wider text-white/80 block truncate">
                      {item.category}
                    </span>
                    <h4 className="text-[11px] font-bold !text-white line-clamp-1 drop-shadow-xs leading-snug">
                      {item.title}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Cards CRUD List & Grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {cards.map((card, index) => (
            <div
              key={card.id || index}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                card.isActive !== false
                  ? 'bg-white border-black/[0.08] shadow-sm hover:shadow-md'
                  : 'bg-neutral-50/70 border-dashed border-black/15 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3.5 sm:gap-4">
                
                {/* Thumbnail Preview */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 shrink-0 border border-black/10">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="96px"
                    className={`${card.imageFit === 'contain' ? 'object-contain' : 'object-cover'} object-center`}
                  />
                  {card.badge && (
                    <div className="absolute top-1 left-1 z-10">
                      <span className={`px-1.5 py-0.5 rounded-full text-[6.5px] font-extrabold uppercase text-white ${card.badgeBg || 'bg-black'} shadow-xs`}>
                        {card.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Information */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full">
                      Card #{index + 1}
                    </span>
                    <button
                      onClick={() => handleToggleActive(card.id)}
                      className="text-xs text-[#6E6E73] hover:text-[#1D1D1F] flex items-center gap-1 cursor-pointer"
                      title={card.isActive !== false ? 'Deactivate Card' : 'Activate Card'}
                    >
                      {card.isActive !== false ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] font-medium text-emerald-700">Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="text-[11px] font-medium text-neutral-500">Hidden</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F] truncate" title={card.title}>
                    {card.title}
                  </h3>

                  <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider truncate">
                    {card.category || 'NO CATEGORY'}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-xs text-[#6E6E73]">
                    <LinkIcon className="w-3 h-3 text-[#0071E3] shrink-0" />
                    <span className="truncate">Links to: <strong>{card.linkCategory || 'all'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3.5 border-t border-black/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveCard(index, 'up')}
                    className="p-1.5 rounded-lg border border-black/10 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[#1D1D1F]"
                    title="Move Card Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === cards.length - 1}
                    onClick={() => handleMoveCard(index, 'down')}
                    className="p-1.5 rounded-lg border border-black/10 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[#1D1D1F]"
                    title="Move Card Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => openEditModal(card)}
                    className="px-3 py-1.5 rounded-xl border border-black/10 text-xs font-semibold text-[#1D1D1F] hover:bg-neutral-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0071E3]" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(card.id)}
                    className="px-2.5 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Delete Card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit / Add Card Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-black/10 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-7 relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/5 mb-5">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1D1D1F]">
                    {editingCard ? 'Edit Showcase Card' : 'Add New Showcase Card'}
                  </h3>
                  <p className="text-xs text-[#6E6E73]">
                    Configure card imagery, titles, badges, and explore category links.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-[#6E6E73] hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleModalSave} className="space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-1">
                    Card Title *
                  </label>
                  <input
                    type="text"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="e.g. Cabin Spinner Suitcase"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    required
                  />
                </div>

                {/* Category Subtitle */}
                <div>
                  <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-1">
                    Category Subtitle Label
                  </label>
                  <input
                    type="text"
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value)}
                    placeholder="e.g. BAGS & TROLLEYS"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                {/* Badge Text & Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-1">
                      Badge Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={modalBadge}
                      onChange={(e) => setModalBadge(e.target.value)}
                      placeholder="e.g. BESTSELLER, LUXURY"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-1">
                      Badge Style
                    </label>
                    <select
                      value={modalBadgeBg}
                      onChange={(e) => setModalBadgeBg(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                    >
                      {BADGE_COLOR_PRESETS.map((preset) => (
                        <option key={preset.bg} value={preset.bg}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Selection & URL */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">
                    Product Image *
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={modalImage}
                      onChange={(e) => setModalImage(e.target.value)}
                      placeholder="Enter image URL or choose preset"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                      required
                    />
                    
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl border border-black/15 hover:bg-neutral-100 text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0071E3]" />
                      <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                    </button>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Preset Quick Chips */}
                  <div className="pt-1">
                    <span className="text-[11px] text-[#6E6E73] block mb-1.5">Quick image library:</span>
                    <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto">
                      {PRESET_IMAGES.map((p) => (
                        <button
                          key={p.url}
                          type="button"
                          onClick={() => setModalImage(p.url)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            modalImage === p.url
                              ? 'bg-[#0071E3] text-white border-[#0071E3]'
                              : 'bg-neutral-100 text-[#1D1D1F] border-transparent hover:border-black/20'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target Link Category & Image Fit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-1">
                      Click Destination (Category)
                    </label>
                    <select
                      value={modalLinkCategory}
                      onChange={(e) => setModalLinkCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                    >
                      <option value="all">All Catalog</option>
                      <option value="bags-luggage">Bags & Trolleys</option>
                      <option value="jewelry">Jewelry & Watches</option>
                      <option value="food-grocery">Papad & Grocery</option>
                      <option value="undergarments">Undergarments</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Fashion & Apparel</option>
                      <option value="footwear">Footwear & Shoes</option>
                      <option value="home-living">Home & Living</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-1">
                      Image Scale Fit
                    </label>
                    <select
                      value={modalImageFit}
                      onChange={(e) => setModalImageFit(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                    >
                      <option value="cover">Cover (Fill & Crop - Recommended)</option>
                      <option value="contain">Contain (Fit Whole Image Inside)</option>
                    </select>
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="modalIsActive"
                    checked={modalIsActive}
                    onChange={(e) => setModalIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0071E3] focus:ring-[#0071E3] border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="modalIsActive" className="text-xs font-bold text-[#1D1D1F] cursor-pointer">
                    Card is active and visible on the storefront
                  </label>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-black/5 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-black/15 text-xs font-bold text-[#1D1D1F] hover:bg-neutral-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingCard ? 'Save Changes' : 'Create Card'}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-black/10 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#1D1D1F]">Delete Showcase Card?</h4>
              <p className="text-xs text-[#6E6E73]">
                Are you sure you want to remove this card from the hero showcase?
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl border border-black/15 text-xs font-semibold text-[#1D1D1F] hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCard(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer shadow-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Defaults Confirmation Dialog */}
      <AnimatePresence>
        {resetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-black/10 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#1D1D1F]">Reset to Default 4 Cards?</h4>
              <p className="text-xs text-[#6E6E73]">
                This will restore the original Trolley, Choker, Papad, and Innerwear showcase cards.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setResetConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/15 text-xs font-semibold text-[#1D1D1F] hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetDefaults}
                  className="px-4 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0077ED] cursor-pointer shadow-sm"
                >
                  Reset Defaults
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminHeroShowcase;
