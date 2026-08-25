import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { CATALOG_CATEGORIES } from '../data/mockData';

export const Categories = ({ onCategoryClick, onViewAllClick }) => {
  const { categories } = useCatalog();
  const [selectedCat, setSelectedCat] = useState('all');

  const handleClick = (cat) => {
    setSelectedCat(cat.id);
    onCategoryClick(cat);
  };

  // Merge context categories with rich mockData images
  const displayCategories = (categories && categories.length > 0 ? categories : CATALOG_CATEGORIES).map(cat => {
    const match = CATALOG_CATEGORIES.find(c => c.id === cat.id);
    return {
      ...cat,
      image: match?.image || cat.image,
    };
  });

  return (
    <section className="py-6 sm:py-8" aria-labelledby="categories-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Matches Reference Screen 1) */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 
            id="categories-heading" 
            className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight"
          >
            Categories
          </h2>

          <button
            onClick={onViewAllClick}
            className="text-xs sm:text-sm font-bold text-[#709E1E] hover:text-[#5A8015] transition-colors focus:outline-none flex items-center gap-1"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Scrollable Categories Container */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {displayCategories.map((category, index) => {
            const isSelected = selectedCat === category.id;

            return (
              <motion.button
                key={category.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                onClick={() => handleClick(category)}
                className={`group flex items-center justify-between gap-3 p-2 pl-3.5 sm:pl-4 rounded-[22px] bg-white border transition-all duration-200 shrink-0 cursor-pointer shadow-sm hover:shadow-neu-card active:scale-95 ${
                  isSelected 
                    ? 'border-[#9FD842] ring-2 ring-[#9FD842]/30 bg-[#F8FDF0]' 
                    : 'border-black/[0.04] hover:border-black/10'
                }`}
              >
                {/* Category Name */}
                <div className="text-left">
                  <span className="block text-xs sm:text-sm font-bold text-[#171717] whitespace-nowrap leading-tight group-hover:text-[#709E1E] transition-colors">
                    {category.name}
                  </span>
                </div>

                {/* Right Image Cutout in #EEEEEC Container */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[16px] bg-[#EEEEEC] relative overflow-hidden flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  ) : (
                    <LayoutGrid className="w-5 h-5 text-[#A0A0A0]" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
