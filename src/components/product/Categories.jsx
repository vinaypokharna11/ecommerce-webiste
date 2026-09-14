'use client';

import React from 'react';
import { useCatalog } from '@/context/CatalogContext';
import { CATALOG_CATEGORIES } from '@/data/mockData';
import { InfiniteMenu } from '@/components/ui/InfiniteMenu';

/**
 * Categories - Explore Our Collections
 * 
 * Powered by React Bits <InfiniteMenu /> component with WebGL 3D interactive
 * rotating sphere grid, arcball momentum drag, and instant catalog navigation.
 */
export const Categories = ({
  onCategoryClick,
  selectedCategory = 'all',
  onExploreCatalog,
}) => {
  const { exploreSection } = useCatalog();

  // If explore section is disabled by admin, do not render
  if (exploreSection?.enabled === false) {
    return null;
  }

  const sectionTitle = exploreSection?.title || 'Explore Our Collections';
  const sectionSubtitle = exploreSection?.subtitle || 'Find exactly what you’re looking for across our curated lifestyle, grocery, apparel, and travel categories.';

  const rawCollections = (exploreSection?.collections && exploreSection.collections.length > 0)
    ? exploreSection.collections
    : CATALOG_CATEGORIES.filter((c) => c.id !== 'all');

  // Filter active and sort by order
  const displayCollections = rawCollections
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleCardClick = (catId) => {
    if (onCategoryClick) {
      onCategoryClick(catId);
    } else if (onExploreCatalog) {
      onExploreCatalog(catId);
    } else if (typeof window !== 'undefined') {
      window.location.href = `/?tab=catalog&category=${encodeURIComponent(catId)}`;
    }
  };

  const menuItems = displayCollections.map((col) => {
    const targetId = col.categoryId || col.id;
    return {
      image: col.image || '/assets/images/prod_backpack.jpg',
      link: `/?tab=catalog&category=${targetId}`,
      title: col.name,
      description: col.badge ? `${col.badge} Collection` : 'Explore curated collection',
      categoryId: targetId,
    };
  });

  return (
    <section
      id="categories-section"
      data-testid="categories-section"
      className="relative w-full bg-[#FBFBFD] py-10 sm:py-16 lg:py-20 px-3.5 sm:px-8 lg:px-12 border-t border-black/[0.05] overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto space-y-6 sm:space-y-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1D1D1F] font-sans">
              {sectionTitle}
            </h2>
            {sectionSubtitle && (
              <p className="text-xs sm:text-base text-[#6E6E73] max-w-xl font-normal">
                {sectionSubtitle}
              </p>
            )}
          </div>
          <p className="text-xs text-[#86868B] flex items-center gap-1.5 font-medium">
            <span>Drag or swipe to rotate 3D collections</span>
          </p>
        </div>

        {/* React Bits InfiniteMenu 3D Interactive Sphere */}
        <div className="w-full h-[460px] xs:h-[500px] sm:h-[580px] lg:h-[620px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-black/[0.08] relative">
          <InfiniteMenu
            items={menuItems}
            scale={1.0}
            backgroundColor="#0B0A12"
            accentColor="#0071E3"
            onItemClick={(item) => {
              const targetId = item?.categoryId || item?.id;
              if (targetId) {
                handleCardClick(targetId);
              } else if (item?.link) {
                if (item.link.startsWith('http')) {
                  window.open(item.link, '_blank');
                } else {
                  window.location.href = item.link;
                }
              }
            }}
          />
        </div>

      </div>
    </section>
  );
};

export default Categories;

