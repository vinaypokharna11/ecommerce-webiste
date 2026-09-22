'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw } from 'lucide-react';

export const ExploreDeleteModal = ({
  deleteConfirmId,
  onClose,
  onConfirm,
}) => {
  if (!deleteConfirmId) return null;

  return (
    <AnimatePresence>
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
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777777] hover:bg-[#F5F5F3] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(deleteConfirmId)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
            >
              Yes, Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const ExploreResetModal = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777777] hover:bg-[#F5F5F3] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#171717] text-white hover:bg-black transition-colors shadow-xs cursor-pointer"
            >
              Yes, Restore Defaults
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
