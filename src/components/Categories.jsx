'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronRight, LayoutGrid, Sparkles } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { CATALOG_CATEGORIES } from '../data/mockData';

export const Categories = ({ onCategoryClick, selectedCategory = 'all' }) => {
  const { categories, products } = useCatalog();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = (cat) => {
    onCategoryClick(cat);
  };

  // Merge context categories with dynamic counts and rich mockData images
  const displayCategories = useMemo(() => {
    return CATALOG_CATEGORIES.map(cat => {
      const match = (categories || []).find(c => c.id === cat.id);
      let count = cat.count;
      if (products && products.length > 0) {
        if (cat.id === 'all') {
          count = products.length;
        } else {
          const matchCount = products.filter(
            p => p.category === cat.id || p.categoryName?.toLowerCase() === cat.name?.toLowerCase()
          ).length;
          if (matchCount > 0) count = matchCount;
        }
      }
      return {
        ...cat,
        count: match?.count || count || cat.count || 0,
        image: cat.image || CATALOG_CATEGORIES[0]?.image,
      };
    });
  }, [categories, products]);

  return (
    <section className="py-6 sm:py-8" aria-labelledby="categories-heading">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <h2 
              id="categories-heading" 
              className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight"
            >
              Categories
            </h2>
            {selectedCategory !== 'all' && (
              <span className="text-xs font-semibold text-[#709E1E] bg-[#F3FCDA] px-2.5 py-0.5 rounded-full border border-[#9FD842]/30">
                Filtered
              </span>
            )}
          </div>

          {/* Toggle all categories on Home page instead of switching page */}
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="text-xs sm:text-sm font-bold text-[#709E1E] hover:text-[#5A8015] bg-[#F3FCDA]/80 hover:bg-[#F3FCDA] px-3 py-1 rounded-full border border-[#9FD842]/30 transition-all focus:outline-none flex items-center gap-1 cursor-pointer active:scale-95"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Show less' : `See all (${displayCategories.length})`}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Normal Mode: Horizontal Scrollable Categories */}
        {!isExpanded && (
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {displayCategories.map((category, index) => {
              const isSelected = selectedCategory === category.id;

              return (
                <motion.button
                  key={category.id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
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
                    {category.count && (
                      <span className="text-[10px] text-[#A0A0A0] font-medium block mt-0.5">
                        {category.count} items
                      </span>
                    )}
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
        )}

        {/* Expanded Mode: Full Responsive Grid of All Categories on Home Page */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4 pt-1 pb-2">
                {displayCategories.map((category, index) => {
                  const isSelected = selectedCategory === category.id;

                  return (
                    <motion.button
                      key={`expanded-${category.id || index}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      onClick={() => handleClick(category)}
                      className={`group flex items-center justify-between gap-3 p-3 rounded-[24px] bg-white border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-neu-card hover:-translate-y-0.5 active:scale-95 text-left ${
                        isSelected 
                          ? 'border-[#9FD842] ring-2 ring-[#9FD842]/40 bg-[#F8FDF0]' 
                          : 'border-black/[0.05] hover:border-black/15'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs sm:text-sm font-extrabold text-[#171717] truncate group-hover:text-[#709E1E] transition-colors">
                          {category.name}
                        </span>
                        <span className="text-[11px] text-[#777777] font-medium block mt-0.5">
                          {category.count ? `${category.count} items` : 'Explore'}
                        </span>
                      </div>

                      <div className="w-12 h-12 rounded-[16px] bg-[#EEEEEC] relative overflow-hidden flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform duration-300">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
