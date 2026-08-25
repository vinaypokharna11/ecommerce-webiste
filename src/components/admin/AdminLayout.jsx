import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  Star,
  Boxes,
  Settings,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Plus,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  HelpCircle,
  LogOut,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOffers } from './AdminOffers';
import { AdminFeatured } from './AdminFeatured';
import { AdminInventory } from './AdminInventory';
import { AdminInquiries } from './AdminInquiries';
import { AdminSettings } from './AdminSettings';
import { AdminProductModal } from './AdminProductModal';

export const AdminLayout = ({ onExitAdmin, onLogout, adminUser }) => {
  const { catalogStats, storeConfig } = useCatalog();
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard', 'products', 'categories', 'offers', 'featured', 'inventory', 'inquiries', 'settings'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inquiries', label: 'Inquiries & Messages', icon: MessageSquare },
    { id: 'products', label: 'Products Catalog', icon: Package, badge: catalogStats.totalProducts },
    { id: 'categories', label: 'Categories', icon: Layers, badge: catalogStats.totalCategoriesCount },
    { id: 'offers', label: 'Offers & Coupons', icon: Tag, badge: catalogStats.activeOffersCount },
    { id: 'featured', label: 'Featured & Badges', icon: Star, badge: catalogStats.featuredCount },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes, alert: catalogStats.lowStockCount + catalogStats.outOfStockCount > 0 },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-[#15152A] flex flex-col font-sans selection:bg-[#6257FF] selection:text-white">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/3 w-[800px] h-[500px] ambient-glow-lavender rounded-full blur-[140px] pointer-events-none -z-10 opacity-60" />
      <div className="fixed bottom-10 right-0 w-[600px] h-[600px] ambient-glow-pink rounded-full blur-[140px] pointer-events-none -z-10 opacity-40" />

      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#EAE6FD] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-xs">
        
        {/* Left: Mobile Menu Trigger + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-[#626276] hover:bg-[#FAF9FF] lg:hidden"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6257FF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-[#15152A] block leading-tight">
                {storeConfig.name} <span className="text-[#EC5AC8] font-bold text-xs">Admin</span>
              </span>
              <span className="text-[10px] text-[#8E8EA0] block font-medium">
                {adminUser?.email || 'Master Administrator'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Storefront Switch, New Product Button & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EAE6FD] text-xs font-bold text-[#6257FF] hover:bg-[#F5F3FF] shadow-xs transition-all active:scale-95"
            title="Back to Customer Storefront"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Storefront</span>
            <span className="sm:hidden">Storefront</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold shadow-btn hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 text-xs font-bold shadow-xs transition-all"
              title="Logout from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Main Layout (Sidebar + Content) ── */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        
        {/* ── Desktop Sidebar Navigation ── */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-20 bg-white rounded-3xl border border-[#EAE6FD] p-4 shadow-[0_4px_20px_rgba(98,87,255,0.04)] space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold text-[#8E8EA0] uppercase tracking-wider">
              Store Management
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-[#EDE9FE] text-[#6257FF] shadow-xs'
                      : 'text-[#626276] hover:text-[#15152A] hover:bg-[#FAF9FF]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#6257FF]' : 'text-[#8E8EA0]'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-[#6257FF] text-white' : 'bg-[#FAF9FF] text-[#626276] border border-[#EAE6FD]'
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              );
            })}

            {/* Quick Live Preview Box */}
            <div className="pt-4 mt-4 border-t border-[#EAE6FD] px-2">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F5F3FF] to-[#FFF0FB] border border-[#EAE6FD] text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6257FF] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Live Sync</span>
                </div>
                <p className="text-[11px] text-[#626276] leading-relaxed mb-2.5">
                  All changes made here update your store in real-time.
                </p>
                <button
                  onClick={onExitAdmin}
                  className="w-full py-1.5 rounded-xl bg-white text-[#6257FF] text-xs font-bold shadow-xs hover:bg-[#FAF9FF] border border-[#EAE6FD] flex items-center justify-center gap-1 mb-2"
                >
                  <span>Preview Store</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 border border-rose-100 flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </aside>

        {/* ── Mobile Drawer Sidebar ── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-[#15152A]/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-white p-6 shadow-2xl z-10 flex flex-col justify-between overflow-y-auto"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EAE6FD]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#6257FF] text-white flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-sm text-[#15152A]">{storeConfig.name} Admin</span>
                    </div>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1 rounded-lg text-[#626276] hover:bg-[#FAF9FF]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeNav === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold ${
                            isActive
                              ? 'bg-[#EDE9FE] text-[#6257FF]'
                              : 'text-[#626276] hover:bg-[#FAF9FF]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EAE6FD]">
                  <button
                    onClick={onExitAdmin}
                    className="w-full py-2.5 rounded-2xl bg-[#FAF9FF] text-[#6257FF] font-bold text-xs border border-[#EAE6FD] flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Customer Store</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── Dynamic Content Subview ── */}
        <main className="flex-1 min-w-0">
          {activeNav === 'dashboard' && (
            <AdminDashboard
              onNavigate={setActiveNav}
              onOpenAddProduct={() => setIsAddModalOpen(true)}
            />
          )}

          {activeNav === 'products' && (
            <AdminProducts onPreviewStore={onExitAdmin} />
          )}

          {activeNav === 'categories' && (
            <AdminCategories onNavigateToProducts={(catId) => setActiveNav('products')} />
          )}

          {activeNav === 'offers' && (
            <AdminOffers />
          )}

          {activeNav === 'featured' && (
            <AdminFeatured />
          )}

          {activeNav === 'inventory' && (
            <AdminInventory />
          )}

          {activeNav === 'inquiries' && (
            <AdminInquiries />
          )}

          {activeNav === 'settings' && (
            <AdminSettings />
          )}
        </main>

      </div>

      {/* ── Global Quick Add Product Modal ── */}
      <AdminProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

    </div>
  );
};
