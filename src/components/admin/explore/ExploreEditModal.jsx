'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  AlertCircle,
  RefreshCw,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';

export const ExploreEditModal = ({
  isOpen,
  onClose,
  editingCard,
  modalName,
  setModalName,
  modalCategoryId,
  setModalCategoryId,
  modalBadge,
  setModalBadge,
  modalImage,
  setModalImage,
  modalIsActive,
  setModalIsActive,
  modalError,
  isUploading,
  fileInputRef,
  handleFileUpload,
  handleSaveModalCard,
  presetImages = [],
  categories = [],
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
              onClick={onClose}
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
                className="w-full px-3.5 py-2.5 bg-[#FBFBFB] border border-black/10 rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-all font-sans"
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
                className="w-full px-3.5 py-2.5 bg-[#FBFBFB] border border-black/10 rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-all font-sans"
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
                className="w-full px-3.5 py-2.5 bg-[#FBFBFB] border border-black/10 rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-all font-sans"
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
                      className="w-full px-2.5 py-1.5 bg-[#FBFBFB] border border-black/10 rounded-lg text-xs text-[#171717] focus:outline-none focus:border-[#171717] font-sans"
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
                  {presetImages.map((preset) => (
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
                onClick={onClose}
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
    </AnimatePresence>
  );
};
