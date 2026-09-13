'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Sparkles,
  Flame,
  Check,
  Tag,
  ArrowUpRight,
  Plus,
  Trash2,
  Package,
  Layers,
  Award,
  Zap,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { BADGE_PRESETS } from './adminConstants';
import { STORE_CONFIG } from '../../data/mockData';

export const AdminFeatured = () => {
  const { products, togglePopular, toggleFeatured, updateProduct } = useCatalog();
  const [activeTab, setActiveTab] = useState('popular'); // 'popular', 'badges', 'hero'
  const [searchQuery, setSearchQuery] = useState('');

  const popularProducts = products.filter((p) => p.isPopular);
  const heroSpotlightProducts = products.filter((p) => p.isFeatured);

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q);
  });

  const handleSetBadge = (productId, badgeText, badgeType) => {
    updateProduct(productId, { badge: badgeText, badgeType });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Featured Showcase & Badges
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-0.5">
            Curate what products appear in homepage showcases, spotlights, and ribbon badges
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F3FCDA] border border-[#9FD842]/40 text-xs font-bold text-[#709E1E]">
            <Star className="w-3.5 h-3.5 fill-[#709E1E]" />
            {popularProducts.length} on Homepage
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EEEEEC] text-xs font-bold text-[#171717]">
            <Sparkles className="w-3.5 h-3.5" />
            {heroSpotlightProducts.length} Spotlights
          </span>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#EEEEEC] w-fit">
        <button
          onClick={() => setActiveTab('popular')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'popular'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'text-[#555555] hover:text-[#171717]'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${activeTab === 'popular' ? 'text-[#9FD842]' : ''}`} />
          <span>Homepage Popular ({popularProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'text-[#555555] hover:text-[#171717]'
          }`}
        >
          <Tag className={`w-3.5 h-3.5 ${activeTab === 'badges' ? 'text-[#9FD842]' : ''}`} />
          <span>Product Badges Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'text-[#555555] hover:text-[#171717]'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'hero' ? 'text-[#9FD842]' : ''}`} />
          <span>Special Spotlights ({heroSpotlightProducts.length})</span>
        </button>
      </div>

      {/* ── TAB 1: HOMEPAGE POPULAR PRODUCTS ── */}
      {activeTab === 'popular' && (
        <div className="space-y-6">
          {/* Active Homepage Grid Preview */}
          <div className="p-6 sm:p-7 rounded-[28px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-extrabold text-[#171717]">
                  Currently Active on Homepage Popular Products
                </h3>
                <p className="text-xs text-[#777777]">
                  These {popularProducts.length} items are featured directly on the storefront landing page
                </p>
              </div>
            </div>

            {popularProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularProducts.map((product) => (
                  <div
                    key={product.id}
                    className="relative bg-[#EEEEEC]/40 rounded-2xl border border-black/5 p-3.5 shadow-xs flex flex-col justify-between"
                  >
                    <div className="relative aspect-square rounded-xl bg-white p-3 flex items-center justify-center mb-2 overflow-hidden border border-black/5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                      {product.badge && (
                        <span className="absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-bold bg-[#171717] text-white shadow-xs">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#709E1E] uppercase block">
                        {product.categoryName}
                      </span>
                      <h4 className="text-xs font-bold text-[#171717] line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="text-xs font-extrabold text-[#171717] mt-1">
                        ₹{product.price.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => togglePopular(product.id)}
                      className="mt-3 w-full py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px] font-bold border border-rose-200 transition-colors cursor-pointer"
                    >
                      Remove from Homepage
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#777777]">
                <Star className="w-8 h-8 text-[#AAAAAA] mx-auto mb-2 opacity-50" />
                <p className="font-bold text-[#171717] text-sm mb-1">No products featured yet</p>
                <p>Use the catalog below to add products to the homepage spotlight.</p>
              </div>
            )}
          </div>

          {/* All Catalog Selector */}
          <div className="p-6 sm:p-7 rounded-[28px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h3 className="text-base font-extrabold text-[#171717] mb-1">
              Add Products to Homepage
            </h3>
            <p className="text-xs text-[#777777] mb-4">Click the star button on any product to show it on the homepage</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-96 overflow-y-auto pr-1">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#EEEEEC]/40 border border-black/5 hover:border-black/15 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-black/10 p-1 flex items-center justify-center flex-shrink-0">
                      <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#171717] truncate">{p.name}</h4>
                      <span className="text-[10px] text-[#777777]">₹{p.price} • {p.categoryName}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePopular(p.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      p.isPopular
                        ? 'bg-[#171717] text-[#9FD842]'
                        : 'bg-white text-[#171717] border border-black/10 hover:bg-[#EEEEEC]'
                    }`}
                  >
                    {p.isPopular ? '★ On Home' : '+ Add'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: BADGES MATRIX ── */}
      {activeTab === 'badges' && (
        <div className="p-6 sm:p-7 rounded-[28px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-[#171717]">
              Product Ribbon Badges Matrix
            </h3>
            <p className="text-xs text-[#777777]">Assign high-conversion promotional labels to catalog items</p>
          </div>

          <div className="divide-y divide-black/5">
            {products.map((product) => (
              <div key={product.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#EEEEEC] p-1 flex items-center justify-center flex-shrink-0 border border-black/5">
                    <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#171717] truncate">{product.name}</h4>
                    <span className="text-[10px] text-[#777777] font-mono">SKU: {product.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {BADGE_PRESETS.slice(0, 5).map((bp) => {
                    const isCurrent = product.badge === bp.label;
                    return (
                      <button
                        key={bp.label}
                        onClick={() => handleSetBadge(product.id, isCurrent ? '' : bp.label, bp.type)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#171717] text-white border-black shadow-xs'
                            : 'bg-white border-black/10 text-[#555555] hover:bg-[#EEEEEC]'
                        }`}
                      >
                        {bp.label}
                      </button>
                    );
                  })}
                  {product.badge && (
                    <button
                      onClick={() => handleSetBadge(product.id, '', '')}
                      className="text-rose-500 hover:text-rose-700 text-[10px] font-bold px-2 py-1 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: HERO SPOTLIGHTS ── */}
      {activeTab === 'hero' && (
        <div className="p-6 sm:p-7 rounded-[28px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-[#171717]">
              Special Spotlight Items
            </h3>
            <p className="text-xs text-[#777777]">Products highlighted in promotional banners and priority showcases</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  p.isFeatured
                    ? 'bg-[#F8FDF0] border-[#9FD842]/40 shadow-xs'
                    : 'bg-[#EEEEEC]/30 border-black/5 hover:border-black/15'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white border border-black/10 p-1 flex items-center justify-center flex-shrink-0">
                    <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#171717] truncate">{p.name}</h4>
                    <span className="text-[10px] text-[#777777]">₹{p.price} • {p.categoryName}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleFeatured(p.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    p.isFeatured
                      ? 'bg-[#171717] text-[#9FD842]'
                      : 'bg-white text-[#171717] border border-black/10 hover:bg-[#EEEEEC]'
                  }`}
                >
                  {p.isFeatured ? '★ Featured' : '+ Spotlight'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
