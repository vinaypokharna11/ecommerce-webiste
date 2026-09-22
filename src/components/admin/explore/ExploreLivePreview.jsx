'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { InfiniteMenu } from '@/components/ui/InfiniteMenu';

export const ExploreLivePreview = ({
  formData,
  previewCollections,
  setActiveViewMode,
}) => {
  return (
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
  );
};
