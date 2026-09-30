'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { STORE_CONFIG } from '@/data/constants';
import { useCatalog } from '@/context/CatalogContext';
import { TextScatter, ScatterItem } from '@/components';

export const Footer = ({ onLinkClick }) => {
  const router = useRouter();
  const { storeConfig } = useCatalog();

  const shopDepartments = [
    { label: 'Bags & Trolleys', tabId: 'catalog', cat: 'bags-luggage' },
    { label: 'Jewelry & Watches', tabId: 'catalog', cat: 'jewelry' },
    { label: 'Papad & Gourmet', tabId: 'catalog', cat: 'food-grocery' },
    { label: 'Undergarments & Innerwear', tabId: 'catalog', cat: 'undergarments' },
    { label: 'Electronics & Audio', tabId: 'catalog', cat: 'electronics' },
    { label: 'Footwear & Shoes', tabId: 'catalog', cat: 'footwear' },
  ];

  const quickLinks = [
    { label: 'Home', tabId: 'home' },
    { label: 'Catalog', tabId: 'catalog' },
    { label: 'Saved Wishlist', tabId: 'wishlist' },
    { label: 'Special Offers', tabId: 'offers' },
    { label: 'Contact Us', tabId: 'contact' },
  ];

  const handleItemClick = (label, tabId, cat) => {
    if (onLinkClick) {
      onLinkClick(label, tabId, cat);
    } else {
      const url = cat ? `/?tab=${tabId}&category=${cat}` : (tabId === 'home' ? '/' : `/?tab=${tabId}`);
      router.push(url);
    }
  };

  return (
    <footer className="bg-[#F5F5F7] text-[#1D1D1F] border-t border-black/[0.08] pt-12 sm:pt-16 pb-28 sm:pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">

        {/* 4 Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-12 border-b border-black/[0.08]">

          {/* Col 1: Brand & Description with Interactive Text Scatter Motion */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <ScatterItem
                velocity={120}
                rotation={45}
                scale={1.12}
                returnAfter={0.8}
                duration={1.6}
                title="Interactive Logo"
                className="shrink-0"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform hover:scale-105">
                  N
                </div>
              </ScatterItem>
              <TextScatter
                text={storeConfig?.name || STORE_CONFIG?.name || 'Nakoda Imitation'}
                as="h3"
                className="font-sans text-xl font-bold tracking-tight text-[#1D1D1F]"
                velocity={140}
                rotation={60}
                scale={1.08}
                returnAfter={0.8}
                duration={1.8}
              />
            </div>
            <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed font-normal">
              Your one-stop destination for premium bags, luggage trolleys, fine jewelry, authentic papads, organic innerwear, and electronics.
            </p>
          </div>

          {/* Col 2: Shop Departments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] font-sans">
              Departments
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#6E6E73]">
              {shopDepartments.map((dept) => (
                <li key={dept.label}>
                  <button
                    onClick={() => handleItemClick(dept.label, dept.tabId, dept.cat)}
                    className="hover:text-[#0071E3] transition-colors text-left"
                  >
                    {dept.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] font-sans">
              Store Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#6E6E73]">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <Link href={link.href} className="hover:text-[#0071E3] transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleItemClick(link.label, link.tabId)}
                      className="hover:text-[#0071E3] transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Direct Order */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] font-sans">
              Customer Support
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-[#6E6E73]">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#1D1D1F]" />
                <span>{storeConfig?.whatsappDisplay || STORE_CONFIG?.whatsappDisplay || '+91 98794 51341'}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#1D1D1F] shrink-0 mt-0.5" />
                <span>
                  {(storeConfig?.address || STORE_CONFIG?.address || '6, Honey Complex, Opposite Gunjan Cinema, Koparli Road, Gunjan, G.I.D.C, Vapi, Gujarat 396195')
                    .replace(/\s*[\u2014\u2013-]\s*(\d{6})/g, ' $1')
                    .replace(/Gujarat,(\d{6})/g, 'Gujarat $1')}
                </span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868B]">
          <p className="flex items-center gap-1.5 flex-wrap">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-medium text-[#1D1D1F]">
              {storeConfig?.name || STORE_CONFIG?.name || 'Nakoda Imitation'}
            </span>
            <span>. All rights reserved.</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
