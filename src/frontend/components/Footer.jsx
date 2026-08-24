import React from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  Headphones, 
  ShoppingBag, 
  ArrowUpRight,
  Heart
} from 'lucide-react';
import { FOOTER_LINKS } from '../data/mockData';

export const Footer = ({ onLinkClick }) => {
  return (
    <footer className="bg-[#121124] text-white pt-16 pb-24 md:pb-12 mt-16 border-t border-[#252438]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Feature Highlights Bar (Matching Reference bottom section) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 mb-12 border-b border-[#252438]">
          
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#8B5CF6]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Secure Payment</h4>
              <p className="text-xs text-[#8E8EA0] mt-0.5">100% secure payment</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-[#EC5AC8]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Easy Returns</h4>
              <p className="text-xs text-[#8E8EA0] mt-0.5">7-day return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6257FF]">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Support</h4>
              <p className="text-xs text-[#8E8EA0] mt-0.5">We're here to help</p>
            </div>
          </div>

        </div>

        {/* Main Footer Links & Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
          
          {/* Brand Info Column */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6257FF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ShopEase</span>
            </div>

            <p className="text-sm text-[#8E8EA0] leading-relaxed max-w-sm mb-6">
              Shop smart and live better with high quality products, curated deals, and an ultra-seamless modern shopping experience.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#8E8EA0]">
              <span>Designed with precision</span>
              <Heart className="w-3.5 h-3.5 text-[#EC5AC8] fill-current" />
              <span>for modern shoppers</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-3 gap-6">
            
            {/* Shop Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Shop
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.shop.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onLinkClick(link.label)}
                      className="text-sm text-[#8E8EA0] hover:text-white transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Support
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.support.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onLinkClick(link.label)}
                      className="text-sm text-[#8E8EA0] hover:text-white transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Company
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onLinkClick(link.label)}
                      className="text-sm text-[#8E8EA0] hover:text-white transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-[#252438] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8EA0]">
          <p>© 2026 ShopEase. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onLinkClick('Privacy Policy')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => onLinkClick('Terms of Service')} className="hover:text-white transition-colors">
              Terms of Service
            </button>
            <button onClick={() => onLinkClick('Cookie Settings')} className="hover:text-white transition-colors">
              Cookie Settings
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
