'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  ExternalLink,
  ShieldCheck, 
  Lock,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { FOOTER_LINKS } from '../data/mockData';
import { useCatalog } from '../context/CatalogContext';
import { createHelpWhatsAppUrl } from '../utils/whatsapp';

export const Footer = ({ onLinkClick = () => {} }) => {
  const { storeConfig } = useCatalog();

  const handleLinkNavigation = (link, e) => {
    if (link.isExternal) {
      return; // Let native link handle new tab
    }
    if (onLinkClick) {
      e.preventDefault();
      onLinkClick(link.label, link.href);
    }
  };

  return (
    <footer className="bg-[#171717] text-white pt-12 pb-24 md:pb-12 mt-16 border-t border-black/10 font-sans">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12">
          
          {/* Brand & Direct Contact Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#9FD842] flex items-center justify-center text-[#171717] shadow-sm">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                {storeConfig.name || 'Nakoda Imitation'}
              </span>
            </div>

            <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-sm">
              Your premier destination for luxury imitation jewelry, bridal collections, fashion accessories, and instant WhatsApp ordering.
            </p>

            {/* Quick Contact Chips */}
            <div className="space-y-2.5 pt-2">
              <a
                href={createHelpWhatsAppUrl(storeConfig.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold transition-colors border border-[#25D366]/20 group"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp: {storeConfig.whatsappDisplay || '+91 98794 51341'}</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <div className="flex items-center gap-3 text-xs text-[#8E8EA0] flex-wrap">
                <a 
                  href={`mailto:${storeConfig.email || 'vinaypokharna36@gmail.com'}`}
                  className="hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#9FD842]" />
                  <span>{storeConfig.email || 'vinaypokharna36@gmail.com'}</span>
                </a>
                <span className="text-[#444]">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#9FD842]" />
                  <span>{storeConfig.hours || '9:30 AM – 9:30 PM'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links (3 Columns) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Shop Column */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#9FD842] mb-4">
                Shop Collection
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.shop.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkNavigation(link, e)}
                      className="text-xs text-[#A0A0A0] hover:text-white transition-colors flex items-center gap-1.5 group cursor-pointer"
                    >
                      <span className="group-hover:translate-x-1 transition-transform inline-block">
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#9FD842] mb-4">
                Help & Support
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.support.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.isExternal ? '_blank' : '_self'}
                      rel={link.isExternal ? 'noopener noreferrer' : ''}
                      onClick={(e) => handleLinkNavigation(link, e)}
                      className="text-xs text-[#A0A0A0] hover:text-white transition-colors flex items-center gap-1.5 group cursor-pointer"
                    >
                      <span className="group-hover:translate-x-1 transition-transform inline-block">
                        {link.label}
                      </span>
                      {link.isExternal && <ExternalLink className="w-3 h-3 text-[#666] group-hover:text-white transition-colors" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company & Account Column */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#9FD842] mb-4">
                Account & Store
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkNavigation(link, e)}
                      className="text-xs text-[#A0A0A0] hover:text-white transition-colors flex items-center gap-1.5 group cursor-pointer"
                    >
                      <span className="group-hover:translate-x-1 transition-transform inline-block">
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom copyright & badges */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-[#777777] flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <p>© 2026 {storeConfig.name || 'Nakoda Imitation'}. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#888]">
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
              <ShieldCheck className="w-3 h-3 text-[#9FD842]" />
              <span>100% Authentic Quality</span>
            </span>
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
              <Lock className="w-3 h-3 text-[#9FD842]" />
              <span>256-Bit SSL Encrypted</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onLinkClick('Privacy Policy', '/#privacy')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-[#444]">•</span>
            <button 
              onClick={() => onLinkClick('Terms of Service', '/#terms')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
