'use client';

import React from 'react';
import { Hero17 } from '@/components/ui/hero-17';

/**
 * HeroSection
 * 
 * Powered by React Bits Pro "Hero 17" block (@reactbits-pro/hero-17).
 * Two-column e-commerce hero with promo pill, bold headline, body copy,
 * and stacked product image grid (1 featured top + 3 bottom side-by-side).
 */
export const HeroSection = ({
  onExploreClick,
  onNavClick,
  cartCount = 0,
  user = null,
  activeTab = 'home',
}) => {
  const products = [
    {
      id: 'trolley',
      title: 'Cabin Spinner Suitcase',
      category: 'BAGS & TROLLEYS',
      price: '₹3,499',
      oldPrice: '₹5,499',
      badge: 'BESTSELLER',
      badgeBg: 'bg-black',
      image: '/assets/images/prod_trolley.jpg',
      imageFit: 'contain',
      onClick: () => onExploreClick && onExploreClick('bags-luggage'),
    },
    {
      id: 'jewelry',
      title: 'Polki & Emerald Choker',
      category: 'JEWELRY & HEIRLOOMS',
      price: '₹4,299',
      oldPrice: '₹5,999',
      badge: 'LUXURY',
      badgeBg: 'bg-[#FF9500]',
      image: '/assets/images/nakoda/hero.jpg',
      onClick: () => onExploreClick && onExploreClick('jewelry'),
    },
    {
      id: 'papad',
      title: 'Spiced Urad Dal Papad',
      category: 'PAPAD & SNACKS',
      price: '₹299',
      oldPrice: '₹450',
      badge: 'FRESH CRISP',
      badgeBg: 'bg-[#34C759]',
      image: '/assets/images/prod_papad.jpg',
      onClick: () => onExploreClick && onExploreClick('food-grocery'),
    },
    {
      id: 'innerwear',
      title: 'Cotton Trunks (Pack of 3)',
      category: 'UNDERGARMENTS',
      price: '₹799',
      oldPrice: '₹1,299',
      badge: '100% COTTON',
      badgeBg: 'bg-[#0071E3]',
      image: '/assets/images/prod_innerwear.jpg',
      onClick: () => onExploreClick && onExploreClick('undergarments'),
    },
  ];

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
