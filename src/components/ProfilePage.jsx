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
  ShieldCheck,
} from 'lucide-react';
import { STORE_CONFIG } from '../data/mockData';
import { useAuth } from '@/context/AuthContext';
import { firePartyPopper } from '@/utils/confetti';

// ─── Default fallback mock orders ─────────────────────────────────────────────
export const INITIAL_ORDERS = [];

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

// ─── Nakoda Suggestion Modal ──────────────────────────────────────────────────
const NakodaSuggestionModal = ({ isOpen, onClose, user }) => {
  const [suggestionType, setSuggestionType] = useState('Design Idea');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { id: 'Design Idea', label: '🎨 Design Idea', desc: 'New pattern or style' },
    { id: 'Product Request', label: '📦 Product Request', desc: 'Item sourcing or restock' },
    { id: 'Store Feedback', label: '💡 Store Feedback', desc: 'Service & app ideas' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim() || !email.trim() || !name.trim()) return;

    setSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || user?.name || 'Valued Customer',
          email: email || user?.email || 'customer@nakodaimitation.com',
          phone: phone || user?.phone || '',
          category: 'Nakoda Suggestion',
          subject: `[Nakoda Suggestion] ${suggestionType} from ${name}`,
          message: `Category: ${suggestionType}\n\nSuggestion Details:\n${suggestion}\n\nCustomer Phone: ${phone || 'N/A'}\nCustomer Email: ${email}`,
        }),
      });
      setSubmitted(true);
      firePartyPopper();
    } catch (err) {
      console.warn('Fallback suggestion dispatch', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nakoda Suggestions"
      subtitle="Share your design ideas, custom requests & store feedback"
    >
      {submitted ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[#9FD842]/20 text-[#3E5C0F] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-[#171717] mb-2">Suggestion Sent Directly via Email! ✉️</h3>
          <p className="text-xs text-[#666] leading-relaxed max-w-sm mx-auto mb-6">
            Thank you, <strong>{name}</strong>. Your suggestion has been dispatched directly to our design & management team via email. A confirmation was also sent to <strong>{email}</strong>.
          </p>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="neu-btn-dark py-3 px-8 text-xs font-extrabold"
            >
              Done & Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-2">
              Suggestion Category <span className="text-[#6A941C]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSuggestionType(c.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    suggestionType === c.id
                      ? 'bg-[#9FD842]/20 border-[#9FD842] ring-2 ring-[#9FD842]/30 text-[#2D4507]'
                      : 'bg-[#EEEEEC]/60 border-black/5 text-[#555] hover:bg-[#EEEEEC]'
                  }`}
                >
                  <span className="text-xs font-extrabold block">{c.label}</span>
                  <span className="text-[10px] text-[#777] block mt-0.5">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                Your Name <span className="text-[#6A941C]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEEEEC]/60 border border-black/5 text-xs text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/20 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                Email Address <span className="text-[#6A941C]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEEEEC]/60 border border-black/5 text-xs text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/20 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEEEEC]/60 border border-black/5 text-xs text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/20 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#171717]">
                Your Suggestion / Design Idea <span className="text-[#6A941C]">*</span>
              </label>
              <span className="text-[10px] text-[#888]">{suggestion.length}/500</span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={500}
              placeholder="e.g. Please bring Matte Gold Temple Chokers with Emerald beads, or add more size options for bangles..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#EEEEEC]/60 border border-black/5 text-xs text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/20 resize-none font-medium placeholder:text-[#9CA3AF]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="neu-btn-accent w-full py-4 px-6 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-extrabold shadow-md"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-[#171717] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#171717]" />
                  <span>Submit Suggestion Directly to Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </SheetModal>
  );
};

// ─── Main Profile Page Component ──────────────────────────────────────────────
export const ProfilePage = ({ orders = [], onExploreCatalog, onNavigate }) => {
  const { user, isAuthenticated, logout, openAuthModal, updateProfile } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState(orders);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/auth/profile', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeleteConfirm(false);
        await logout();
      } else {
        alert(data.error || 'Failed to delete account');
      }
    } catch (err) {
      alert('An error occurred while deleting your account');
    } finally {
      setIsDeleting(false);
    }
  };

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

  const allOrdersList = userOrders.length > 0 ? userOrders : (orders.length > 0 ? orders : []);
  const displayedOrders = showAllOrders ? allOrdersList : allOrdersList.slice(0, 3);

  const profile = {
    name: user?.name || (isAuthenticated ? 'Customer' : 'Guest Shopper'),
    email: user?.email || (isAuthenticated ? '' : 'Sign in to view orders & track packages'),
    phone: user?.phone || (isAuthenticated ? '' : 'No phone linked'),
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
            <div className="px-6 py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-[#EEEEEC] text-[#777777] flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-[#171717]" />
              </div>
              <p className="text-sm font-extrabold text-[#171717] mb-1">No Orders Placed Yet</p>
              <p className="text-xs text-[#777777] max-w-xs mx-auto mb-4 leading-relaxed">
                Your orders list is currently empty. Explore our bridal necklaces, bangles, and earrings to place your first order!
              </p>
              <button
                onClick={onExploreCatalog}
                className="neu-btn-accent py-2.5 px-6 text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#171717]" />
                <span>Browse Jewelry Catalog</span>
              </button>
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
              className="w-full flex items-center gap-3.5 px-5 sm:px-6 py-4 hover:bg-[#EEEEEC]/50 transition-colors text-left group border-t border-black/5"
            >
              <div className="w-9 h-9 rounded-full bg-[#EEEEEC] text-[#171717] flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-[#171717] group-hover:underline">
                  Browse Product Catalog
                </span>
                <span className="text-[11px] text-[#777777] block">Explore latest imitation jewelry, necklaces, and bangles</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#171717]" />
            </button>

            {/* Nakoda Suggestions */}
            <button
              onClick={() => setIsSuggestionOpen(true)}
              className="w-full flex items-center gap-3.5 px-5 sm:px-6 py-4 hover:bg-[#EEEEEC]/50 transition-colors text-left group border-t border-black/5"
            >
              <div className="w-9 h-9 rounded-full bg-[#9FD842]/20 text-[#3E5C0F] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#171717] group-hover:text-[#5F8C1D] transition-colors">
                    Nakoda Suggestions
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#9FD842]/20 text-[#3E5C0F] border border-[#9FD842]/30">
                    New
                  </span>
                </div>
                <span className="text-[11px] text-[#777777] block">
                  Suggest designs, request custom jewelry pieces, or give store feedback
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#171717]" />
            </button>

            {/* Admin Portal Quick Launcher (if admin) */}
            {(user?.role === 'admin' || user?.role === 'superadmin' || user?.email === 'vinaypokharna36@gmail.com') && (
              <a
                href="/admin"
                className="w-full flex items-center gap-3.5 px-5 sm:px-6 py-4 bg-[#171717] text-white hover:bg-black transition-colors text-left group border-t border-black/5"
              >
                <div className="w-9 h-9 rounded-full bg-[#9FD842] text-[#171717] flex items-center justify-center flex-shrink-0 font-extrabold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">
                      Open Admin Dashboard
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#9FD842] text-[#171717]">
                      Admin
                    </span>
                  </div>
                  <span className="text-[11px] text-white/70 block">
                    Manage products, stock inventory, categories, coupons & inquiries
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9FD842] group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
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
          ) : null}

          {/* ── Privacy & Data Deletion (GDPR/Privacy Compliant) ── */}
          {isAuthenticated && (
            <div className="mt-3">
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="w-full flex items-center gap-3 px-5 sm:px-6 py-3.5 rounded-[22px] bg-white border border-gray-100 hover:bg-gray-50 transition-all text-left group shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-gray-500 group-hover:text-rose-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-600 group-hover:text-rose-600 transition-colors block">
                      Delete Account & Personal Data
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Permanently erase your account, addresses, and personal details
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-rose-400 transition-colors" />
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full p-5 rounded-[24px] bg-red-50 border border-red-200 text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2.5">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-extrabold text-red-800 mb-1">Permanently Delete Account?</p>
                  <p className="text-xs text-red-600 mb-4 max-w-sm mx-auto">
                    This action cannot be undone. All your saved profile information, addresses, and personal data will be completely erased.
                  </p>
                  <div className="flex gap-3 max-w-xs mx-auto">
                    <button
                      disabled={isDeleting}
                      onClick={() => setDeleteConfirm(false)}
                      className="flex-1 py-2.5 rounded-full bg-white border border-red-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
                    >
                      Keep Account
                    </button>
                    <button
                      disabled={isDeleting}
                      onClick={handleDeleteAccount}
                      className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
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

      {/* Nakoda Suggestion Modal */}
      {isSuggestionOpen && (
        <NakodaSuggestionModal
          isOpen={isSuggestionOpen}
          onClose={() => setIsSuggestionOpen(false)}
          user={user}
        />
      )}
    </section>
  );
};

export default ProfilePage;
