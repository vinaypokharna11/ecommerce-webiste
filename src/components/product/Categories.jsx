'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { CATALOG_CATEGORIES } from '@/data/mockData';

export const Categories = ({
  onCategoryClick,
  selectedCategory = 'all',
  onExploreCatalog,
}) => {
  // Filter out the 'all' category for the visual category cards
  const displayCategories = CATALOG_CATEGORIES.filter((c) => c.id !== 'all');

  return (
    <section
      id="categories-section"
      data-testid="categories-section"
      className="relative w-full bg-[#FBFBFD] py-12 sm:py-20 lg:py-24 px-3.5 sm:px-8 lg:px-12 border-t border-black/[0.05]"
    >
      <div className="max-w-[1440px] mx-auto space-y-8 sm:space-y-12">
        
        {/* Apple Style Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1D1D1F] font-sans">
              Explore Our Collections
            </h2>
            <p className="text-xs sm:text-base text-[#6E6E73] max-w-xl font-normal">
              Find exactly what you’re looking for across our curated lifestyle, grocery, apparel, and travel categories.
            </p>
          </div>

          <button
            onClick={() => onExploreCatalog && onExploreCatalog('all')}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-[#0071E3] hover:text-[#0077ED] transition-colors self-start md:self-auto group cursor-pointer"
          >
            <span>View All Products</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Apple 4-Column Responsive Grid with Smooth Hover Scale */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {displayCategories.map((cat, idx) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => onCategoryClick && onCategoryClick(cat.id)}
                className={`group relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden bg-white border cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'border-[#1D1D1F] ring-2 ring-[#1D1D1F] shadow-lg'
                    : 'border-black/[0.06] shadow-[0_2px_14px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)] hover:-translate-y-1'
                }`}
              >
                {/* Background Category Image */}
                <Image
                  src={cat.image || '/assets/images/prod_backpack.jpg'}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />

                {/* Soft Apple Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {/* Top Corner Icon/Pill */}
                <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#1D1D1F] group-hover:bg-[#1D1D1F] group-hover:text-white transition-colors shadow-sm">
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 text-white flex flex-col justify-end">
                  <span className="text-[9px] sm:text-[10px] font-sans font-semibold tracking-wider uppercase text-white/80 mb-0.5 sm:mb-1 block">
                    {cat.count} Items
                  </span>
                  <h3 className="text-xs sm:text-base lg:text-lg font-bold tracking-tight text-white leading-tight font-sans line-clamp-1">
                    {cat.name}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Categories;
