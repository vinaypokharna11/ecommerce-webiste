'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export function ProductGallery({ image, images = [], name, badge }) {
  const allImages = Array.isArray(images) && images.length > 0
    ? images
    : (image ? [image] : ['/assets/images/prod_backpack.jpg']);

  const [activeImage, setActiveImage] = useState(allImages[0]);

  // Sync if props change
  useEffect(() => {
    if (allImages.length > 0) {
      setActiveImage(allImages[0]);
    }
  }, [image, JSON.stringify(images)]);

  return (
    <div className="space-y-4">
      {/* Main Active Image Showcase */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#F5F5F7] border border-black/5 shadow-inner group">
        <Image
          src={activeImage || '/assets/images/prod_backpack.jpg'}
          alt={name || 'Product Image'}
          fill
          priority
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 500px"
        />
        {badge && (
          <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-[#171717] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md z-10">
            {badge}
          </div>
        )}
      </div>

      {/* Multiple Images Gallery Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          {allImages.map((imgUrl, i) => {
            const isSelected = activeImage === imgUrl;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(imgUrl)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#F5F5F7] transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'border-[#171717] ring-2 ring-[#9FD842]/60 scale-105 shadow-sm'
                    : 'border-black/10 hover:border-black/30 opacity-70 hover:opacity-100'
                }`}
                title={`View photo ${i + 1}`}
              >
                <Image
                  src={imgUrl}
                  alt={`${name} - thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
