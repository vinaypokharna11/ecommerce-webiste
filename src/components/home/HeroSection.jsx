'use client';

import React from 'react';
import { Hero17 } from '@/components/ui/hero-17';
import { useCatalog } from '@/context/CatalogContext';
import { DEFAULT_HERO_SHOWCASE } from '@/data/constants';

/**
 * HeroSection
 * 
 * Powered by React Bits Pro "Hero 17" block (@reactbits-pro/hero-17).
 * Two-column e-commerce hero with promo pill, bold headline, body copy,
 * and stacked product image grid (4 customizable showcase cards).
 */
export const HeroSection = ({
  onExploreClick,
  onNavClick,
  cartCount = 0,
  user = null,
  activeTab = 'home',
}) => {
  const { heroShowcase } = useCatalog();

  const sourceProducts = Array.isArray(heroShowcase) && heroShowcase.length > 0
    ? heroShowcase.filter((p) => p.isActive !== false)
    : DEFAULT_HERO_SHOWCASE;

  const products = (sourceProducts.length > 0 ? sourceProducts : DEFAULT_HERO_SHOWCASE).map((item) => ({
    ...item,
    onClick: () => {
      const target = item.linkCategory || item.category || 'all';
      if (onExploreClick) {
        onExploreClick(target);
      }
    },
  }));

  return (
    <Hero17
      headline="Everything you need."
      subheadline="Curated with premium care."
      body="From lightweight spinner trolleys and handcrafted imitation jewelry to authentic sun-dried papads, organic undergarments, and top electronics."
      primaryCta={{
        label: 'Explore All Catalog',
        onClick: () => onExploreClick && onExploreClick('all'),
      }}
      secondaryCta={{
        label: "Today's Exclusive Deals",
        onClick: () => onNavClick && onNavClick('offers', 'Offers'),
      }}
      products={products}
    />
  );
};

export default HeroSection;
