'use client';

import React from 'react';
import { Eye, EyeOff, Save } from 'lucide-react';

export const ExploreSectionSettings = ({
  formData,
  setFormData,
  handleSaveAll,
  isSaving,
}) => {
  return (
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

      {/* Save Button */}
      <div className="flex justify-end pt-2 border-t border-black/5">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
