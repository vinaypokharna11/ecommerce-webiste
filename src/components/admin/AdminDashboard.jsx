'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Layers,
  Tag,
  Star,
  AlertTriangle,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  FolderPlus,
  RefreshCw,
  MessageSquare,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { STORE_CONFIG } from '@/data/constants';

export const AdminDashboard = ({ onNavigate, onOpenAddProduct }) => {
  const {
    products,
    categories,
    offers,
    catalogStats,
    activities,
    homePopularProducts,
    togglePopular,
    storeConfig,
  } = useCatalog();

  const metrics = [
    {
      title: 'Total Products',
      value: catalogStats.totalProducts,
      subtitle: `${catalogStats.inStockCount} in stock, ${catalogStats.outOfStockCount} out of stock`,
      icon: Package,
      bgLight: 'bg-[#F8FDF0]',
      textColor: 'text-[#709E1E]',
      action: () => onNavigate('products'),
    },
    {
      title: 'Active Categories',
      value: catalogStats.totalCategoriesCount,
      subtitle: 'Jewelry, Accessories & Fashion',
      icon: Layers,
      bgLight: 'bg-[#EEEEEC]',
      textColor: 'text-[#171717]',
      action: () => onNavigate('categories'),
    },
    {
      title: 'Live Offers & Deals',
      value: catalogStats.activeOffersCount,
      subtitle: `${offers.filter(o => o.popular).length} high priority deals`,
      icon: Tag,
      bgLight: 'bg-[#FFFBEB]',
      textColor: 'text-[#D97706]',
      action: () => onNavigate('offers'),
    },
    {
      title: 'Homepage Featured',
      value: catalogStats.featuredCount,
      subtitle: 'Visible on customer storefront',
      icon: Star,
      bgLight: 'bg-[#F8FDF0]',
      textColor: 'text-[#709E1E]',
      action: () => onNavigate('featured'),
    },
    {
      title: 'Stock Attention',
      value: catalogStats.lowStockCount + catalogStats.outOfStockCount,
      subtitle: `${catalogStats.outOfStockCount} out of stock, ${catalogStats.lowStockCount} low`,
      icon: AlertTriangle,
      bgLight: 'bg-[#FFF1F2]',
      textColor: 'text-[#E11D48]',
      action: () => onNavigate('inventory'),
    },
    {
      title: 'Total Catalog Value',
      value: `${storeConfig?.currency || STORE_CONFIG.currency}${(catalogStats.totalInventoryValue / 1000).toFixed(1)}k`,
      subtitle: 'Based on active retail inventory',
      icon: DollarSign,
      bgLight: 'bg-[#F0FDF4]',
      textColor: 'text-[#059669]',
      action: () => onNavigate('inventory'),
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Accessible page heading */}
      <h1 className="sr-only">Store Control Center Dashboard</h1>

      {/* ── Metric KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {metrics.map((m, index) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={m.action}
              className="bg-white rounded-[28px] border border-black/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl ${m.bgLight} flex items-center justify-center ${m.textColor} border border-black/5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="p-1.5 rounded-full text-[#AAAAAA] group-hover:text-[#171717] group-hover:bg-[#EEEEEC] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#171717] mb-0.5 tracking-tight">
                  {m.value}
                </div>
                <div className="text-xs font-bold text-[#555555]">
                  {m.title}
                </div>
                <div className="text-[11px] text-[#888888] mt-1 font-medium">
                  {m.subtitle}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Two Column Split: Category Breakdown & Homepage Spotlight ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Category Distribution Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-[28px] border border-black/10 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-extrabold text-[#171717]">
                  Category Breakdown
                </h3>
                <p className="text-xs text-[#777777]">Live inventory distribution across collections</p>
              </div>
              <button
                onClick={() => onNavigate('categories')}
                className="text-xs font-bold text-[#709E1E] hover:text-[#5A8015] flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {categories.map((c) => {
                const count = catalogStats.countByCat[c.id] || 0;
                const percentage = catalogStats.totalProducts > 0
                  ? Math.round((count / catalogStats.totalProducts) * 100)
                  : 0;

                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#171717] flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color || '#709E1E' }} />
                        {c.name}
                      </span>
                      <span className="font-semibold text-[#777777]">
                        {count} items ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#EEEEEC] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: c.color || '#709E1E',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-5 mt-6 border-t border-black/10 flex items-center justify-between text-xs">
            <span className="text-[#777777]">Looking to expand your collections?</span>
            <button
              onClick={() => onNavigate('categories')}
              className="font-bold text-[#709E1E] hover:text-[#5A8015] cursor-pointer"
            >
              + Create Category
            </button>
          </div>
        </div>

        {/* Right 5 cols: Homepage Featured Quick Switcher */}
        <div className="lg:col-span-5 bg-white rounded-[28px] border border-black/10 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#171717]">
                  Homepage Spotlight
                </h3>
                <p className="text-xs text-[#777777]">Products shown in the hero showcase</p>
              </div>
              <button
                onClick={() => onNavigate('featured')}
                className="text-xs font-bold text-[#709E1E] hover:text-[#5A8015] cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
              {homePopularProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#EEEEEC]/50 border border-black/5 hover:border-[#9FD842]/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-black/10 p-1 flex items-center justify-center flex-shrink-0">
                      <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#171717] truncate">{p.name}</h4>
                      <span className="text-[10px] text-[#777777]">
                        ₹{p.price} • {p.categoryName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePopular(p.id)}
                    className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 cursor-pointer"
                    title="Toggle Homepage Spotlight"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-black/10 flex items-center justify-between text-xs">
            <span className="text-[#888888] text-[11px]">Tip: Keep 6 to 12 featured items</span>
            <button
              onClick={() => onNavigate('products')}
              className="font-bold text-[#709E1E] hover:text-[#5A8015] cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        </div>

      </div>



      {/* ── Recent Activity Log ── */}
      <div className="bg-white rounded-[28px] border border-black/10 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EEEEEC] text-[#171717] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-[#171717]">
              Live Catalog Activity Log
            </h3>
          </div>
        </div>

        <div className="divide-y divide-black/5">
          {activities.slice(0, 6).map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#9FD842]" />
                <span className="font-semibold text-[#171717]">{act.title}</span>
              </div>
              <span className="text-[11px] text-[#888888] font-mono">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
