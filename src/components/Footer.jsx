'use client';

import React from 'react';
import { 
  ShoppingBag, 
  Heart
} from 'lucide-react';
import { FOOTER_LINKS } from '../data/mockData';

export const Footer = ({ onLinkClick }) => {
  return (
    <footer className="bg-[#171717] text-white pt-10 pb-24 md:pb-12 mt-12 border-t border-black/10">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Main Footer Links & Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#9FD842] flex items-center justify-center text-[#171717]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">Nakoda Imitation</span>
            </div>

            <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-sm">
              Your trusted destination for premium imitation jewelry, bridal sets, fashion accessories, and instant WhatsApp ordering.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-8 grid grid-cols-3 gap-6">
            
            {/* Shop Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Shop
              </h4>
              <ul className="space-y-2">
                {FOOTER_LINKS.shop.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onLinkClick(link.label)}
                      className="text-xs text-[#A0A0A0] hover:text-white transition-colors text-left cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Support
              </h4>
              <ul className="space-y-2">
                {FOOTER_LINKS.support.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onLinkClick(link.label)}
                      className="text-xs text-[#A0A0A0] hover:text-white transition-colors text-left cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Company
              </h4>
              <ul className="space-y-2">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onLinkClick(link.label)}
                      className="text-xs text-[#A0A0A0] hover:text-white transition-colors text-left cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-[#777777] flex-wrap gap-2">
          <p>© 2026 Nakoda Imitation. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onLinkClick('Privacy Policy')} className="hover:text-[#A0A0A0] cursor-pointer">Privacy Policy</button>
            <button onClick={() => onLinkClick('Terms of Service')} className="hover:text-[#A0A0A0] cursor-pointer">Terms of Service</button>
            <a href="/admin" className="text-[#9FD842]/80 hover:text-[#9FD842] font-semibold transition-colors flex items-center gap-1">
              <span>Admin Portal</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
