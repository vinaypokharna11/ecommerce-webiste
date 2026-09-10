'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { STORE_CONFIG } from '@/data/mockData';
import { useCatalog } from '@/context/CatalogContext';

export const Footer = ({ onLinkClick }) => {
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
    { label: 'Special Offers', tabId: 'offers' },
    { label: 'Contact Us', tabId: 'contact' },
  ];

  const handleItemClick = (label, tabId, cat) => {
    if (onLinkClick) {
      onLinkClick(label, tabId, cat);
    }
  };

  return (
    <footer className="bg-[#F5F5F7] text-[#1D1D1F] border-t border-black/[0.08] pt-12 sm:pt-16 pb-28 sm:pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* 4 Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-12 border-b border-black/[0.08]">
          
          {/* Col 1: Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <span className="font-sans text-xl font-bold tracking-tight text-[#1D1D1F]">
                {STORE_CONFIG?.name || 'Nakoda Store'}
              </span>
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
                <span>{storeConfig?.address || '6, Honey Complex, Opposite Gunjan Cinema, Koparli Road, Gunjan, G.I.D.C, Vapi, Gujarat — 396195'}</span>
              </p>
              <p className="text-xs text-[#86868B] pt-1">
                Mon - Sun: 9:30 AM – 9:30 PM IST
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868B]">
          <p>© {new Date().getFullYear()} {STORE_CONFIG?.name || 'Nakoda Store'}. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
