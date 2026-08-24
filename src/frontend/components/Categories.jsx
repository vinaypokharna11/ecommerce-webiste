import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Headphones, 
  Shirt, 
  Armchair, 
  Sparkles, 
  Watch, 
  LayoutGrid,
  Footprints,
  Gift,
  ShoppingBag,
  Zap,
  Tag,
  Flame,
  ChevronRight
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';

const iconMap = {
  Headphones,
  Shirt,
  Armchair,
  Sparkles,
  Watch,
  LayoutGrid,
  Footprints,
  Gift,
  ShoppingBag,
  Zap,
  Tag,
  Flame,
};

export const Categories = ({ onCategoryClick, onViewAllClick }) => {
  const { categories } = useCatalog();
  const [selectedCat, setSelectedCat] = useState(null);

  const handleClick = (cat) => {
    setSelectedCat(cat.id);
    onCategoryClick(cat);
  };

  // Include an "Explore All" pill at the end for clean design
  const displayCategories = [
    ...categories,
    {
      id: 'all',
      name: 'More',
      icon: 'LayoutGrid',
      color: '#626276',
      accentBg: 'bg-[#F8F7FC]',
      iconColor: 'text-[#626276]',
    },
  ];

  return (
    <section className="py-10 sm:py-14" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h2 
              id="categories-heading" 
              className="text-2xl sm:text-3xl font-extrabold text-[#15152A] tracking-tight"
            >
              Categories
            </h2>
          </div>

          <button
            onClick={onViewAllClick}
            className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-[#6257FF] hover:text-[#4F46E5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-lg px-2 py-1"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-250 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Categories Grid / Horizontal Scroll for Mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-4 sm:gap-6">
          {displayCategories.map((category, index) => {
            const Icon = iconMap[category.icon] || LayoutGrid;
            const isSelected = selectedCat === category.id;

            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                onClick={() => handleClick(category)}
                className="group flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-3xl p-2 transition-transform active:scale-95"
              >
                {/* Circular Container */}
                <div 
                  className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-white flex items-center justify-center border border-[#EAE6FD] shadow-[0_8px_25px_rgba(98,87,255,0.06)] group-hover:shadow-[0_15px_35px_rgba(98,87,255,0.18)] group-hover:border-[#8B5CF6]/40 transition-all duration-300 group-hover:scale-105 relative ${
                    isSelected ? 'ring-2 ring-brand-purple shadow-[0_0_25px_rgba(98,87,255,0.25)]' : ''
                  }`}
                >
                  {/* Subtle Inner Tint */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full ${category.accentBg || 'bg-[#F5F3FF]'} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${category.iconColor || 'text-[#6257FF]'} transition-transform duration-300 group-hover:rotate-6`} />
                  </div>
                </div>

                {/* Category Label */}
                <span className="mt-3 text-xs sm:text-sm font-semibold text-[#15152A] group-hover:text-brand-purple transition-colors text-center truncate max-w-[100px]">
                  {category.name}
                </span>
              </motion.button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
