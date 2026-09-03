'use client';

import React, { useState, useEffect } from 'react';
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
  Plus,
  Menu,
  X,
  LogOut,
  MessageSquare,
  Clock,
  RefreshCw,
  Radio,
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

export const AdminLayout = ({ 
  onExitAdmin, 
  onLogout, 
  adminUser, 
  activeTab = 'dashboard', 
  onTabChange 
}) => {
  const { catalogStats, storeConfig, isLiveConnected, refreshCatalog } = useCatalog();
  const [activeNav, setActiveNav] = useState(activeTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Synchronize state whenever URL activeTab changes (e.g. Back/Forward button)
  useEffect(() => {
    if (activeTab && activeTab !== activeNav) {
      setActiveNav(activeTab);
    }
  }, [activeTab]);

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
    if (onTabChange) {
      onTabChange(id);
    }
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      if (refreshCatalog) await refreshCatalog();
    } catch (e) {}
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#171717] flex flex-col font-sans selection:bg-[#9FD842] selection:text-[#171717]">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/3 w-[800px] h-[500px] bg-[#9FD842]/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-0 w-[600px] h-[600px] bg-[#8EC731]/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/10 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
        
        {/* Left: Mobile Menu Trigger + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-[#777777] hover:text-[#171717] hover:bg-[#EEEEEC] lg:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#171717] flex items-center justify-center text-[#9FD842] shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-[#171717] block leading-tight">
                  {storeConfig?.name || 'Nakoda Imitation'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#F3FCDA] border border-[#9FD842]/30 text-[#709E1E] font-extrabold text-[10px] uppercase tracking-wider">
                  Admin
                </span>
                <span 
                  className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEEEEC] border border-black/5 text-[#555555] font-semibold text-[10px]"
                  title="Your administrator session automatically expires after 12 hours of inactivity"
                >
                  <Clock className="w-2.5 h-2.5 text-[#709E1E]" />
                  <span>12h Session</span>
                </span>
              </div>
              <span className="text-[11px] text-[#777777] block font-medium">
                {adminUser?.email || 'Master Administrator'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Real-time status, Quick Storefront Switch, New Product Button & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Real-time Socket Live Sync Pill */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEEEEC]/80 border border-black/10 text-[11px] font-bold text-[#171717]"
            title={isLiveConnected ? "Real-time auto-refresh socket is connected" : "Connecting real-time socket..."}
          >
            <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span className="hidden sm:inline">{isLiveConnected ? 'Live Sync' : 'Connecting'}</span>
            <button
              onClick={handleManualSync}
              className="p-0.5 rounded text-[#777777] hover:text-[#171717] transition-colors cursor-pointer"
              title="Force Refresh Data"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#709E1E]' : ''}`} />
            </button>
          </div>

          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] text-xs font-bold text-[#171717] transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Back to Customer Storefront"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live Store</span>
            <span className="sm:hidden">Store</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#171717] hover:bg-black text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#9FD842]" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Logout from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Main Layout (Sidebar + Content) ── */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        
        {/* ── Desktop Sidebar Navigation ── */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-20 bg-white rounded-[28px] border border-black/10 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-extrabold text-[#999999] uppercase tracking-wider">
              Store Management
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-white shadow-sm'
                      : 'text-[#555555] hover:text-[#171717] hover:bg-[#EEEEEC]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#9FD842]' : 'text-[#777777]'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-[#9FD842] text-[#171717]' : 'bg-[#EEEEEC] text-[#555555]'
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
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-white p-6 shadow-2xl z-10 flex flex-col justify-between overflow-y-auto"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#171717] text-[#9FD842] flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-sm text-[#171717]">
                        {storeConfig?.name || 'Nakoda Imitation'} Admin
                      </span>
                    </div>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1 rounded-lg text-[#777777] hover:bg-[#EEEEEC] cursor-pointer"
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
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold cursor-pointer ${
                            isActive
                              ? 'bg-[#171717] text-white'
                              : 'text-[#555555] hover:bg-[#EEEEEC]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#9FD842]' : 'text-[#777777]'}`} />
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

                <div className="pt-4 border-t border-black/10">
                  <button
                    onClick={onExitAdmin}
                    className="w-full py-2.5 rounded-2xl bg-[#EEEEEC] text-[#171717] font-bold text-xs border border-black/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Customer Store</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── Dynamic Content Subview with Silky Transitions ── */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {activeNav === 'dashboard' && (
                <AdminDashboard
                  onNavigate={handleNavClick}
                  onOpenAddProduct={() => setIsAddModalOpen(true)}
                />
              )}

              {activeNav === 'products' && (
                <AdminProducts onPreviewStore={onExitAdmin} />
              )}

              {activeNav === 'categories' && (
                <AdminCategories onNavigateToProducts={(catId) => handleNavClick('products')} />
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
            </motion.div>
          </AnimatePresence>
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
