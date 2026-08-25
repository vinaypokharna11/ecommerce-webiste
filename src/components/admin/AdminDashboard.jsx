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
  ShoppingBag,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  FolderPlus,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { STORE_CONFIG } from '../../data/mockData';

export const AdminDashboard = ({ onNavigate, onOpenAddProduct }) => {
  const {
    products,
    categories,
    offers,
    catalogStats,
    activities,
    homePopularProducts,
    togglePopular,
  } = useCatalog();

  const metrics = [
    {
      title: 'Total Catalog Products',
      value: catalogStats.totalProducts,
      subtitle: `${catalogStats.inStockCount} in stock, ${catalogStats.outOfStockCount} out of stock`,
      icon: Package,
      gradient: 'from-[#6257FF] to-[#8B5CF6]',
      bgLight: 'bg-[#F5F3FF]',
      textColor: 'text-[#6257FF]',
      action: () => onNavigate('products'),
    },
    {
      title: 'Active Categories',
      value: catalogStats.totalCategoriesCount,
      subtitle: 'Across fashion, tech & living',
      icon: Layers,
      gradient: 'from-[#EC5AC8] to-[#BE185D]',
      bgLight: 'bg-[#FFF0FB]',
      textColor: 'text-[#EC5AC8]',
      action: () => onNavigate('categories'),
    },
    {
      title: 'Live Offers & Deals',
      value: catalogStats.activeOffersCount,
      subtitle: `${offers.filter(o => o.popular).length} high priority deals`,
      icon: Tag,
      gradient: 'from-[#8B5CF6] to-[#6D28D9]',
      bgLight: 'bg-[#F5F3FF]',
      textColor: 'text-[#8B5CF6]',
      action: () => onNavigate('offers'),
    },
    {
      title: 'Featured on Homepage',
      value: catalogStats.featuredCount,
      subtitle: 'Visible on landing page',
      icon: Star,
      gradient: 'from-[#D97706] to-[#B45309]',
      bgLight: 'bg-[#FFFBEB]',
      textColor: 'text-[#D97706]',
      action: () => onNavigate('featured'),
    },
    {
      title: 'Stock Attention Needed',
      value: catalogStats.lowStockCount + catalogStats.outOfStockCount,
      subtitle: `${catalogStats.outOfStockCount} out of stock, ${catalogStats.lowStockCount} low`,
      icon: AlertTriangle,
      gradient: 'from-[#E11D48] to-[#9F1239]',
      bgLight: 'bg-[#FFF1F2]',
      textColor: 'text-[#E11D48]',
      action: () => onNavigate('inventory'),
    },
    {
      title: 'Total Catalog Value',
      value: `${STORE_CONFIG.currency}${(catalogStats.totalInventoryValue / 1000).toFixed(1)}k`,
      subtitle: 'Based on active stock units',
      icon: DollarSign,
      gradient: 'from-[#059669] to-[#047857]',
      bgLight: 'bg-[#F0FDF4]',
      textColor: 'text-[#059669]',
      action: () => onNavigate('inventory'),
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl gradient-promo-banner p-6 sm:p-8 text-white shadow-[0_15px_40px_rgba(98,87,255,0.22)]">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nakoda Imitation Catalog Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Welcome back to your Store Admin!
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              You have <strong className="text-white">{catalogStats.totalProducts} active products</strong> in <strong className="text-white">{catalogStats.totalCategoriesCount} categories</strong> with <strong className="text-white">{catalogStats.activeOffersCount} live discount offers</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            <button
              onClick={() => onNavigate('inquiries')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/30 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inquiries & Messages</span>
            </button>

            <button
              onClick={onOpenAddProduct}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#6257FF] font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative discs */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
      </div>

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
              className="bg-white rounded-3xl border border-[#EAE6FD] p-5 shadow-[0_4px_20px_rgba(98,87,255,0.04)] hover:shadow-[0_12px_35px_rgba(98,87,255,0.12)] hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl ${m.bgLight} flex items-center justify-center ${m.textColor} shadow-xs border border-[#EAE6FD]`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="p-1.5 rounded-full text-[#C4C4D4] group-hover:text-[#6257FF] group-hover:bg-[#F5F3FF] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#15152A] mb-0.5">
                  {m.value}
                </div>
                <div className="text-xs font-bold text-[#626276]">
                  {m.title}
                </div>
                <div className="text-[11px] text-[#8E8EA0] mt-1">
                  {m.subtitle}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Two Column Split: Category Distribution & Homepage Spotlight ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Category Distribution Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EAE6FD] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-extrabold text-[#15152A]">
                  Category Breakdown
                </h3>
                <p className="text-xs text-[#626276]">Catalog distribution across store departments</p>
              </div>
              <button
                onClick={() => onNavigate('categories')}
                className="text-xs font-bold text-[#6257FF] hover:underline flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {categories.map((c) => {
                const count = catalogStats.countByCat[c.id] || 0;
                const percentage = catalogStats.totalProducts > 0
                  ? Math.round((count / catalogStats.totalProducts) * 100)
                  : 0;

                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#15152A] flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color || '#6257FF' }} />
                        {c.name}
                      </span>
                      <span className="font-semibold text-[#8E8EA0]">
                        {count} items ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FAF9FF] overflow-hidden border border-[#EAE6FD]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: c.color || '#6257FF',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-[#EAE6FD] flex items-center justify-between text-xs">
            <span className="text-[#626276]">Want to add another category?</span>
            <button
              onClick={() => onNavigate('categories')}
              className="font-bold text-[#6257FF] hover:text-[#4F46E5]"
            >
              + Create Category
            </button>
          </div>
        </div>

        {/* Right 5 cols: Homepage Featured Carousel Quick Switcher */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EAE6FD] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#15152A]">
                  Homepage Spotlight
                </h3>
                <p className="text-xs text-[#626276]">Products featured on landing page</p>
              </div>
              <button
                onClick={() => onNavigate('featured')}
                className="text-xs font-bold text-[#6257FF] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
              {homePopularProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] hover:border-[#8B5CF6]/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE6FD] p-1 flex items-center justify-center flex-shrink-0">
                      <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#15152A] truncate">{p.name}</h4>
                      <span className="text-[10px] text-[#8E8EA0]">
                        ₹{p.price} • {p.categoryName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePopular(p.id)}
                    className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50"
                    title="Remove from Homepage"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#EAE6FD] flex items-center justify-between text-xs">
            <span className="text-[#8E8EA0] text-[11px]">Tip: Keep 4 to 8 featured items</span>
            <button
              onClick={() => onNavigate('products')}
              className="font-bold text-[#6257FF] hover:underline"
            >
              Browse Catalog
            </button>
          </div>
        </div>

      </div>

      {/* ── Recent Activity Log ── */}
      <div className="bg-white rounded-3xl border border-[#EAE6FD] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF9FF] text-[#6257FF] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-[#15152A]">
              Recent Catalog Activity Log
            </h3>
          </div>
        </div>

        <div className="divide-y divide-[#EAE6FD]/60">
          {activities.slice(0, 6).map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#6257FF]" />
                <span className="font-semibold text-[#15152A]">{act.title}</span>
              </div>
              <span className="text-[11px] text-[#8E8EA0] font-mono">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
