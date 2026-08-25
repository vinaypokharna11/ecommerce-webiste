'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  Edit3,
  Package,
  ChevronRight,
  MapPin,
  CreditCard,
  HelpCircle,
  LogOut,
  Check,
  Truck,
  Clock,
  X,
  ShoppingBag,
  Star,
  Bell,
  Shield,
  ChevronDown,
  MessageCircle,
  ArrowRight,
  Plus,
  Trash2,
  Lock,
  Smartphone,
  ExternalLink,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { STORE_CONFIG } from '../data/mockData';
import { useAuth } from '@/context/AuthContext';
import { firePartyPopper } from '@/utils/confetti';

// ─── Default fallback mock orders ─────────────────────────────────────────────
export const INITIAL_ORDERS = [
  {
    id: '#SE1003',
    items: 'Wireless Headphones (x1)',
    date: 'Aug 20, 2026',
    amount: 3499,
    status: 'delivered',
    statusLabel: 'Delivered',
    payMethod: 'Cash on Delivery',
    deliveryAddress: 'Shop #14, Main Market Road, Bangalore — 560001',
    recipientName: 'Customer',
    recipientPhone: '+91 98765 43210',
  },
  {
    id: '#SE1002',
    items: 'Smart Watch Pro (x1)',
    date: 'Aug 15, 2026',
    amount: 2499,
    status: 'shipped',
    statusLabel: 'Shipped',
    payMethod: 'Online Payment (UPI)',
    deliveryAddress: 'Shop #14, Main Market Road, Bangalore — 560001',
    recipientName: 'Customer',
    recipientPhone: '+91 98765 43210',
  },
  {
    id: '#SE1001',
    items: 'Premium Breathable Sneakers (x1)',
    date: 'Aug 10, 2026',
    amount: 1999,
    status: 'delivered',
    statusLabel: 'Delivered',
    payMethod: 'Cash on Delivery',
    deliveryAddress: 'Shop #14, Main Market Road, Bangalore — 560001',
    recipientName: 'Customer',
    recipientPhone: '+91 98765 43210',
  },
];

const STATUS_STYLES = {
  delivered: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Check,
  },
  shipped: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Truck,
  },
  processing: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  cancelled: {
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: X,
  },
};

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
const SheetModal = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-[28px] border border-black/5 shadow-2xl z-10 p-6 sm:p-7 max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-black/5 flex-shrink-0">
            <div>
              <h3 className="text-lg font-extrabold text-[#171717]">{title}</h3>
              {subtitle && <p className="text-xs text-[#777777] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2E0] text-[#171717] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 py-4 space-y-4">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
const EditProfileModal = ({ profile, onClose, onSave }) => {
  const [form, setForm] = useState({ ...profile });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(form);
    setIsSaving(false);
    onClose();
  };

  return (
    <SheetModal isOpen={true} onClose={onClose} title="Edit Profile" subtitle="Update your personal details">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-[#777777] uppercase tracking-wider block mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC] text-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#9FD842] font-medium"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#777777] uppercase tracking-wider block mb-1.5">
            Phone Number (WhatsApp)
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
            <input
              type="tel"
              value={form.phone || ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC] text-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#9FD842] font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-sm shadow-neu-btn-accent active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </SheetModal>
  );
};

// ─── Order Details Modal ──────────────────────────────────────────────────────
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;
  const st = STATUS_STYLES[order.status] || STATUS_STYLES.delivered;
  const StatusIcon = st.icon;

  return (
    <SheetModal isOpen={true} onClose={onClose} title={`Order ${order.id}`} subtitle={`Placed on ${order.date}`}>
      <div className="space-y-4">
        {/* Status banner */}
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${st.badge}`}>
          <div className={`w-8 h-8 rounded-xl ${st.badge} flex items-center justify-center`}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider">{order.statusLabel || order.status}</span>
            <p className="text-[11px] opacity-80">Payment: {order.payMethod}</p>
          </div>
        </div>

        {/* Items */}
        <div className="p-4 rounded-2xl bg-[#EEEEEC] border border-black/5 space-y-2">
          <span className="text-xs font-bold text-[#777777] uppercase tracking-wider block mb-1">Items Ordered</span>
          <p className="text-sm font-semibold text-[#171717]">{order.items || order.itemSummary || 'Product details'}</p>
        </div>

        {/* Address */}
        <div className="p-4 rounded-2xl bg-[#EEEEEC] border border-black/5 space-y-1">
          <span className="text-xs font-bold text-[#777777] uppercase tracking-wider block mb-1">Delivery Address</span>
          <p className="text-xs text-[#171717] font-medium">{order.deliveryAddress}</p>
        </div>

        {/* Total Amount */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F3FCDA] border border-[#9FD842]/30">
          <span className="text-xs font-bold text-[#709E1E] uppercase tracking-wider">Total Amount</span>
          <span className="text-lg font-extrabold text-[#171717]">
            {STORE_CONFIG.currency}{(order.amount || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </SheetModal>
  );
};

// ─── Main Profile Page Component ──────────────────────────────────────────────
export const ProfilePage = ({ orders = [], onExploreCatalog, onNavigate }) => {
  const { user, isAuthenticated, logout, openAuthModal, updateProfile } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState(orders);

  useEffect(() => {
    async function loadCustomerOrders() {
      if (isAuthenticated && user?.email) {
        try {
          const res = await fetch('/api/orders');
          const data = await res.json();
          if (res.ok && data.orders && data.orders.length > 0) {
            setUserOrders(data.orders);
          }
        } catch (e) {
          console.warn('Failed to load orders from API', e);
        }
      }
    }
    loadCustomerOrders();
  }, [isAuthenticated, user]);

  const allOrdersList = userOrders.length > 0 ? userOrders : (orders.length > 0 ? orders : INITIAL_ORDERS);
  const displayedOrders = showAllOrders ? allOrdersList : allOrdersList.slice(0, 3);

  const profile = {
    name: user?.name || (isAuthenticated ? 'Valued Customer' : 'Guest Customer'),
    email: user?.email || (isAuthenticated ? 'customer@nakodaimitation.com' : 'Not signed in'),
    phone: user?.phone || (isAuthenticated ? '+91 98765 43210' : 'Sign in to link mobile'),
  };

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSaveProfile = async (updated) => {
    await updateProfile(updated);
    firePartyPopper();
  };

  return (
    <section className="relative pt-24 pb-28 md:pt-28 md:pb-32 overflow-hidden min-h-[85vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* ── Sign-In Notification Banner (if guest) ── */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 sm:p-5 rounded-[24px] bg-[#171717] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-[#9FD842] text-[#171717] flex items-center justify-center flex-shrink-0 font-extrabold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Have an Account or Want to Register?</h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Sign in to view real-time tracking, save addresses, and access exclusive member deals.
                </p>
              </div>
            </div>

            <button
              onClick={() => openAuthModal()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Sign In / Register</span>
            </button>
          </motion.div>
        )}

        {/* ── Profile Header Card ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[28px] border border-black/5 shadow-neu-card p-6 sm:p-7 mb-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#171717] text-white flex items-center justify-center shadow-md">
                  <span className="text-white text-xl sm:text-2xl font-extrabold tracking-wider">{initials}</span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${isAuthenticated ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#171717] truncate">{profile.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                    isAuthenticated ? 'bg-[#F3FCDA] text-[#709E1E]' : 'bg-[#EEEEEC] text-[#777777]'
                  }`}>
                    {isAuthenticated ? 'Verified Customer' : 'Guest Mode'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#777777] mt-1 truncate">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{profile.email}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#777777] mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{profile.phone}</span>
                </div>
              </div>
            </div>

            {/* Profile Action: Edit if logged in, Sign in if guest */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/10 bg-[#EEEEEC] hover:bg-white text-xs font-bold text-[#171717] transition-all shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-xs font-extrabold text-[#171717] transition-all shadow-neu-btn-accent"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-black/5">
            {[
              { label: 'Orders', value: `${allOrdersList.length}`, icon: Package, color: 'text-[#171717]', bg: 'bg-[#EEEEEC]' },
              { label: 'Member Tier', value: isAuthenticated ? 'VIP Gold' : 'Explorer', icon: Star, color: 'text-[#709E1E]', bg: 'bg-[#F3FCDA]' },
              { label: 'Support', value: 'Instant', icon: MessageCircle, color: 'text-[#171717]', bg: 'bg-[#EEEEEC]' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center gap-1">
                <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-base font-extrabold text-[#171717]">{stat.value}</span>
                <span className="text-[11px] font-bold text-[#777777]">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── My Orders ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[28px] border border-black/5 shadow-neu-card mb-5 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-black/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#EEEEEC] flex items-center justify-center">
                <Package className="w-4 h-4 text-[#171717]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#171717]">Recent Orders ({allOrdersList.length})</h3>
                <p className="text-[11px] text-[#777777]">Tap any order to view details & status</p>
              </div>
            </div>
            {allOrdersList.length > 3 && (
              <button
                onClick={() => setShowAllOrders(!showAllOrders)}
                className="flex items-center gap-1 text-xs font-bold text-[#171717] hover:underline"
              >
                {showAllOrders ? 'Show Less' : 'View all'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllOrders ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          <div className="divide-y divide-black/5">
            {displayedOrders.map((order) => {
              const st = STATUS_STYLES[order.status] || STATUS_STYLES.delivered;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-3.5 px-5 sm:px-6 py-4 hover:bg-[#EEEEEC]/50 transition-colors group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#EEEEEC] border border-black/5 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-[#171717]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-[#171717]">Order {order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {order.statusLabel || order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-[#777777] font-medium">{order.date}</span>
                      <span className="text-[10px] text-[#A0A0A0]">•</span>
                      <span className="text-xs text-[#171717] font-medium truncate max-w-[170px]">{order.items || order.itemSummary || 'Product details'}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[#171717]">
                      {STORE_CONFIG.currency}{(order.amount || 0).toLocaleString()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#171717] transition-colors ml-auto" />
                  </div>
                </div>
              );
            })}
          </div>

          {allOrdersList.length === 0 && (
            <div className="px-6 py-10 text-center">
              <Package className="w-10 h-10 text-[#A0A0A0] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#777777]">No orders placed yet</p>
            </div>
          )}
        </motion.div>

        {/* ── Quick Actions & Support ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-[28px] border border-black/5 shadow-neu-card mb-5 overflow-hidden"
        >
          <div className="divide-y divide-black/5">
            {/* WhatsApp Direct Help */}
            <button
              onClick={() => {
                const msg = `Hi ${STORE_CONFIG.name}! I need assistance regarding my orders/account.`;
                window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full flex items-center gap-3.5 px-5 sm:px-6 py-4 hover:bg-[#EEEEEC]/50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-[#171717] group-hover:text-emerald-700 transition-colors">
                  Direct WhatsApp Support
                </span>
                <span className="text-[11px] text-[#777777] block">Chat instantly with our Bangalore store team</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#171717]" />
            </button>

            {/* Catalog Explore */}
            <button
              onClick={onExploreCatalog}
              className="w-full flex items-center gap-3.5 px-5 sm:px-6 py-4 hover:bg-[#EEEEEC]/50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-[#EEEEEC] text-[#171717] flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-[#171717] group-hover:underline">
                  Browse Product Catalog
                </span>
                <span className="text-[11px] text-[#777777] block">Explore latest electronics, fashion, and home deals</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#171717]" />
            </button>
          </div>
        </motion.div>

        {/* ── Sign Out / Sign In Action ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isAuthenticated ? (
            !logoutConfirm ? (
              <button
                onClick={() => setLogoutConfirm(true)}
                className="w-full flex items-center gap-3 px-5 sm:px-6 py-4 rounded-[24px] bg-white border border-rose-100 hover:bg-rose-50 transition-all group shadow-sm"
              >
                <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-rose-500" />
                </div>
                <span className="flex-1 text-sm font-bold text-rose-500 text-left">Sign Out of Account</span>
                <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-400 transition-colors" />
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full p-5 rounded-[24px] bg-rose-50 border border-rose-200 text-center"
              >
                <p className="text-sm font-bold text-rose-700 mb-3">Are you sure you want to sign out?</p>
                <div className="flex gap-3 max-w-xs mx-auto">
                  <button
                    onClick={() => setLogoutConfirm(false)}
                    className="flex-1 py-2.5 rounded-full bg-white border border-rose-200 text-rose-500 font-bold text-xs hover:bg-rose-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setLogoutConfirm(false);
                      await logout();
                    }}
                    className="flex-1 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    Yes, Sign Out
                  </button>
                </div>
              </motion.div>
            )
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="w-full py-4 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#9FD842]" />
              <span>Sign In to Unlock Full Profile Features</span>
            </button>
          )}

          {/* Footer note */}
          <p className="text-center text-[11px] text-[#A0A0A0] font-medium pt-5">
            Nakoda Imitation v1.0.0 · Local Neighborhood Store in Bangalore
          </p>
        </motion.div>

      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
};

export default ProfilePage;
