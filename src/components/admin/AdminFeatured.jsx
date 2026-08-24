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
  SlidersHorizontal
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
    return p.name.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q);
  });

  const handleSetBadge = (productId, badgeText, badgeType) => {
    updateProduct(productId, { badge: badgeText, badgeType });
  };

  return (
    <div className="space-y-6">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#15152A] tracking-tight">
            Featured Products & Badges
          </h1>
          <p className="text-xs sm:text-sm text-[#626276] mt-0.5">
            Curate what products appear on the Homepage landing carousel, hero spotlight, and trending badges
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            {popularProducts.length} on Homepage
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] text-xs font-bold text-[#6257FF]">
            <Sparkles className="w-3.5 h-3.5" />
            {heroSpotlightProducts.length} Hero Spotlight
          </span>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#EAE6FD] shadow-xs w-fit">
        <button
          onClick={() => setActiveTab('popular')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'popular'
              ? 'bg-[#6257FF] text-white shadow-sm'
              : 'text-[#626276] hover:text-[#15152A] hover:bg-[#FAF9FF]'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Homepage Popular ({popularProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'badges'
              ? 'bg-[#6257FF] text-white shadow-sm'
              : 'text-[#626276] hover:text-[#15152A] hover:bg-[#FAF9FF]'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Product Badges Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'hero'
              ? 'bg-[#6257FF] text-white shadow-sm'
              : 'text-[#626276] hover:text-[#15152A] hover:bg-[#FAF9FF]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hero Spotlights ({heroSpotlightProducts.length})</span>
        </button>
      </div>

      {/* ── TAB 1: HOMEPAGE POPULAR PRODUCTS ── */}
      {activeTab === 'popular' && (
        <div className="space-y-6">
          {/* Active Homepage Grid Preview */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FAF9FF] via-white to-[#F5F3FF] border border-[#EAE6FD] shadow-[0_4px_20px_rgba(98,87,255,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#15152A]">
                  Currently Active on Homepage Popular Carousel
                </h3>
                <p className="text-xs text-[#626276]">
                  These {popularProducts.length} products are shown right below categories on the store home page
                </p>
              </div>
            </div>

            {popularProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularProducts.map((product) => (
                  <div
                    key={product.id}
                    className="relative bg-white rounded-2xl border border-[#EAE6FD] p-3.5 shadow-xs flex flex-col justify-between"
                  >
                    <div className="relative aspect-square rounded-xl bg-[#FAF9FF] p-3 flex items-center justify-center mb-2 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                      {product.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-[#6257FF] border border-[#EAE6FD]">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#8B5CF6] uppercase block">
                        {product.categoryName}
                      </span>
                      <h4 className="text-xs font-bold text-[#15152A] line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="text-xs font-extrabold text-[#15152A] mt-1">
                        {STORE_CONFIG.currency}{product.price.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => togglePopular(product.id)}
                      className="mt-3 w-full py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove from Home
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-[#EAE6FD]">
                <Star className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-[#15152A]">No products selected for the Homepage</p>
                <p className="text-[11px] text-[#626276] mt-0.5">Click "Feature on Homepage" on any product below to display it</p>
              </div>
            )}
          </div>

          {/* Catalog Selection List */}
          <div className="bg-white rounded-3xl border border-[#EAE6FD] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-extrabold text-[#15152A]">
                All Catalog Products (Click to Toggle Homepage Feature)
              </h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by product name..."
                className="px-3.5 py-1.5 rounded-xl border border-[#EAE6FD] text-xs max-w-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((p) => {
                const isPop = p.isPopular;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isPop
                        ? 'bg-[#FFFBEB] border-amber-300 shadow-xs'
                        : 'bg-white border-[#EAE6FD] hover:border-[#8B5CF6]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] p-1 flex items-center justify-center flex-shrink-0">
                        <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#15152A] truncate">{p.name}</h4>
                        <span className="text-[11px] text-[#8E8EA0]">{p.categoryName} • ₹{p.price}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePopular(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 ${
                        isPop
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-[#FAF9FF] text-[#6257FF] hover:bg-[#EDE9FE]'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isPop ? 'fill-white' : ''}`} />
                      <span>{isPop ? 'Featured ✓' : 'Feature'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PRODUCT BADGES MATRIX ── */}
      {activeTab === 'badges' && (
        <div className="bg-white rounded-3xl border border-[#EAE6FD] p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-[#15152A]">
              Product Badges & Merchandising Ribbons
            </h3>
            <p className="text-xs text-[#626276] mt-0.5">
              Quickly assign promotional ribbon badges to products (e.g. BEST SELLER, TRENDING, NEW, SALE)
            </p>
          </div>

          <div className="divide-y divide-[#EAE6FD]">
            {products.map((product) => (
              <div key={product.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] p-1 flex items-center justify-center flex-shrink-0">
                    <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#15152A] line-clamp-1">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#8E8EA0]">{product.categoryName}</span>
                      {product.badge ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#6257FF] border border-[#DDD6FE]">
                          Active: {product.badge}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#A0A0B2]">No badge</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badge Quick Selector Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {BADGE_PRESETS.slice(0, 6).map((bp) => (
                    <button
                      key={bp.label}
                      onClick={() => handleSetBadge(product.id, bp.label, bp.type)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        product.badge === bp.label
                          ? 'ring-2 ring-[#6257FF] bg-[#EDE9FE] text-[#6257FF] border-[#6257FF]'
                          : 'bg-[#FAF9FF] border-[#EAE6FD] text-[#626276] hover:bg-white'
                      }`}
                    >
                      {bp.label}
                    </button>
                  ))}
                  {product.badge && (
                    <button
                      onClick={() => handleSetBadge(product.id, '', '')}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-rose-500 hover:bg-rose-50"
                      title="Clear badge"
                    >
                      ✕ Clear
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
        <div className="bg-white rounded-3xl border border-[#EAE6FD] p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-[#15152A]">
              Hero & Special Spotlight Items
            </h3>
            <p className="text-xs text-[#626276] mt-0.5">
              Highlight signature catalog items with special glowing promotion priority
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const isFeat = p.isFeatured;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isFeat
                      ? 'bg-[#F5F3FF] border-[#8B5CF6] shadow-xs'
                      : 'bg-[#FAF9FF] border-[#EAE6FD]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#EAE6FD] p-1 flex items-center justify-center flex-shrink-0">
                      <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#15152A] truncate">{p.name}</h4>
                      <span className="text-[11px] text-[#8E8EA0]">{p.categoryName}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFeatured(p.id)}
                    className={`p-2 rounded-xl transition-all ${
                      isFeat
                        ? 'bg-[#6257FF] text-white shadow-xs'
                        : 'bg-white text-[#C4C4D4] hover:text-[#6257FF] border border-[#EAE6FD]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
