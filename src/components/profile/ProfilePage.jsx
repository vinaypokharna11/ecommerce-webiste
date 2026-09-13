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
  Bell,
  ChevronDown,
  ArrowRight,
  Plus,
  Trash2,
  Lock,
  Smartphone,
  ExternalLink,
  LogIn,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { STORE_CONFIG } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { firePartyPopper } from '@/utils/confetti';
import { formatPrice } from '@/utils/formatPrice';
import { authService } from '@/services/authService';
import { orderService } from '@/services/orderService';
import { inquiryService } from '@/services/inquiryService';

// ─── Default fallback mock orders ─────────────────────────────────────────────
export const INITIAL_ORDERS = [];

// Helper to safely format order items into a string summary (prevents Object child render error)
const formatOrderItemSummary = (order) => {
  if (typeof order?.itemSummary === 'string' && order.itemSummary.trim()) {
    return order.itemSummary;
  }
  if (Array.isArray(order?.items) && order.items.length > 0) {
    return order.items
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return `${item.name || 'Product'} (x${item.quantity || 1})`;
        }
        return 'Product';
      })
      .join(', ');
  }
  if (typeof order?.items === 'string' && order.items.trim()) {
    return order.items;
  }
  return 'Product details';
};

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
          className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-3xl border border-black/5 shadow-2xl z-10 p-4.5 xs:p-6 sm:p-7 max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-black/5 flex-shrink-0">
            <div className="min-w-0 flex-1 pr-2">
              <h3 className="text-base sm:text-lg font-extrabold text-[#1D1D1F] truncate">{title}</h3>
              {subtitle && <p className="text-[11px] sm:text-xs text-[#777777] mt-0.5 truncate">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 py-3.5 sm:py-4 space-y-3.5 sm:space-y-4">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
// ─── Edit Profile Modal ───────────────────────────────────────────────────────
const EditProfileModal = ({ profile, onClose, onSave }) => {
  const initialEmail = (profile?.email && profile.email.includes('@')) ? profile.email : '';

  const [form, setForm] = useState({
    ...profile,
    name: (profile?.name || '').replace(/[^a-zA-Z\s]/g, ''),
    email: initialEmail,
    phone: (profile?.phone || '').replace(/\D/g, '').slice(0, 10),
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleNameChange = (e) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^a-zA-Z\s]/g, '');
    setForm((prev) => ({ ...prev, name: cleaned }));
    if (raw !== cleaned) {
      setError('Special characters and numbers are not allowed in name.');
    } else {
      setError('');
    }
  };

  const handleEmailChange = (e) => {
    const raw = e.target.value;
    setForm((prev) => ({ ...prev, email: raw }));
    const trimmed = raw.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address (e.g. name@domain.com)');
    } else {
      setError('');
    }
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phone: digits }));
    if (digits.length > 0 && digits.length < 10) {
      setError(`Phone number must be exactly 10 digits (${digits.length}/10 entered).`);
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = (form.name || '').trim();

    if (!trimmedName) {
      setError('Full name is required.');
      return;
    }

    if (/[^a-zA-Z\s]/.test(trimmedName)) {
      setError('Special characters and numbers are not allowed in name.');
      return;
    }

    const trimmedEmail = (form.email || '').trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@domain.com)');
      return;
    }

    const phoneDigits = (form.phone || '').replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError(`Phone number must be exactly 10 digits (currently ${phoneDigits.length} digits).`);
      return;
    }

    setIsSaving(true);
    setError('');
    const res = await onSave({ ...form, name: trimmedName, email: trimmedEmail, phone: phoneDigits });
    setIsSaving(false);
    if (res && res.success === false) {
      setError(res.error || 'Failed to update profile');
      return;
    }
    onClose();
  };

  return (
    <SheetModal isOpen={true} onClose={onClose} title="Edit Profile" subtitle="Update your personal details">
      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
        {error && (
          <div className="p-3 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-[#777777] uppercase tracking-wider block mb-1">
            Full Name <span className="text-[#0071E3]">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
            <input
              type="text"
              value={form.name || ''}
              onChange={handleNameChange}
              placeholder="e.g. Himanshi Sharma"
              className="w-full pl-10 pr-3.5 sm:pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-black/5 bg-[#F5F5F7]/60 text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white font-medium transition-all"
              required
            />
          </div>
          <p className="text-[10px] text-[#86868B] mt-1">Letters and spaces only. No special characters or numbers.</p>
        </div>

        <div>
          <label className="text-xs font-bold text-[#777777] uppercase tracking-wider block mb-1">
            Email Address <span className="text-[#0071E3]">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
            <input
              type="email"
              value={form.email || ''}
              onChange={handleEmailChange}
              placeholder="e.g. yourname@example.com"
              className="w-full pl-10 pr-3.5 sm:pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-black/5 bg-[#F5F5F7]/60 text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white font-medium transition-all"
              required
            />
          </div>
          <p className="text-[10px] text-[#86868B] mt-1">Used for signing in and order notifications.</p>
        </div>

        <div>
          <label className="text-xs font-bold text-[#777777] uppercase tracking-wider block mb-1">
            Phone Number (10 Digits) <span className="text-[#0071E3]">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.phone || ''}
              onChange={handlePhoneChange}
              placeholder="9876543210"
              className="w-full pl-10 pr-3.5 sm:pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-black/5 bg-[#F5F5F7]/60 text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white font-medium transition-all tracking-wider"
              required
            />
          </div>
          <p className="text-[10px] text-[#86868B] mt-1">Must be exactly 10 digits.</p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 sm:py-3.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 mt-3 sm:mt-4 cursor-pointer disabled:opacity-60"
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
        <div className="p-4 rounded-2xl bg-[#F5F5F7]/60 border border-black/5 space-y-3">
          <span className="text-xs font-bold text-[#777777] uppercase tracking-wider block">Items Ordered</span>
          {Array.isArray(order.items) && order.items.length > 0 ? (
            <div className="space-y-2.5 divide-y divide-black/5">
              {order.items.map((item, idx) => {
                if (typeof item === 'string') {
                  return (
                    <p key={idx} className="text-sm font-semibold text-[#1D1D1F] pt-2 first:pt-0">
                      {item}
                    </p>
                  );
                }
                const itemKey = item?._id || item?.id || idx;
                const itemName = item?.name || 'Product';
                const itemQty = item?.quantity || 1;
                const itemPrice = item?.price != null ? item.price : null;
                const itemImage = item?.image;
                const variantInfo = [item?.selectedColor, item?.selectedSize].filter(Boolean).join(' / ');

                return (
                  <div key={itemKey} className="flex items-center gap-3 pt-2.5 first:pt-0">
                    {itemImage ? (
                      <div className="w-11 h-11 rounded-xl bg-white border border-black/5 overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={itemImage} alt={itemName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-white border border-black/5 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-[#777777]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1D1D1F] truncate">{itemName}</p>
                      <div className="flex items-center gap-2 text-xs text-[#777777] mt-0.5">
                        <span>Qty: {itemQty}</span>
                        {variantInfo && (
                          <>
                            <span>•</span>
                            <span className="truncate">{variantInfo}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {itemPrice != null && (
                      <span className="text-sm font-bold text-[#1D1D1F] shrink-0">
                        {formatPrice(itemPrice * itemQty, STORE_CONFIG.currency)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm font-semibold text-[#1D1D1F]">{formatOrderItemSummary(order)}</p>
          )}
        </div>

        {/* Address */}
        <div className="p-4 rounded-2xl bg-[#F5F5F7]/60 border border-black/5 space-y-1">
          <span className="text-xs font-bold text-[#777777] uppercase tracking-wider block mb-1">Delivery Address</span>
          <p className="text-xs text-[#1D1D1F] font-medium">{order.deliveryAddress}</p>
        </div>

        {/* Total Amount */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#EBF5FF] border border-[#1D1D1F]/30">
          <span className="text-xs font-bold text-[#0071E3] uppercase tracking-wider">Total Amount</span>
          <span className="text-lg font-extrabold text-[#1D1D1F]">
            {formatPrice(order.amount, STORE_CONFIG.currency)}
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
      await inquiryService.submitContactMessage({
        name: name || user?.name || 'Valued Customer',
        email: email || user?.email || 'customer@nakodaimitation.com',
        phone: phone || user?.phone || '',
        category: 'Nakoda Suggestion',
        subject: `[Nakoda Suggestion] ${suggestionType} from ${name}`,
        message: `Category: ${suggestionType}\n\nSuggestion Details:\n${suggestion}\n\nCustomer Phone: ${phone || 'N/A'}\nCustomer Email: ${email}`,
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
          <div className="w-16 h-16 rounded-full bg-[#1D1D1F]/20 text-[#3E5C0F] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-[#1D1D1F] mb-2">Suggestion Sent Directly via Email! ✉️</h3>
          <p className="text-xs text-[#666] leading-relaxed max-w-sm mx-auto mb-6">
            Thank you, <strong>{name}</strong>. Your suggestion has been dispatched directly to our design & management team via email. A confirmation was also sent to <strong>{email}</strong>.
          </p>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="neu-btn-dark py-3 px-8 text-xs font-extrabold cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1D1D1F] mb-2">
              Suggestion Category <span className="text-[#6A941C]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSuggestionType(c.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    suggestionType === c.id
                      ? 'bg-[#1D1D1F] border-[#1D1D1F] text-white shadow-sm'
                      : 'bg-[#F5F5F7]/60 border-black/5 text-[#555] hover:bg-white'
                  }`}
                >
                  <span className={`text-xs font-extrabold block ${suggestionType === c.id ? 'text-white' : 'text-[#1D1D1F]'}`}>{c.label}</span>
                  <span className={`text-[10px] block mt-0.5 ${suggestionType === c.id ? 'text-white/70' : 'text-[#777]'}`}>{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                Your Name <span className="text-[#6A941C]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/20 font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                Email Address <span className="text-[#6A941C]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/20 font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1D1D1F] mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/20 font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#1D1D1F]">
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
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/20 resize-none font-medium placeholder:text-[#888888] transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="neu-btn-accent w-full py-4 px-6 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-extrabold shadow-md"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#1D1D1F]" />
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
      const data = await authService.deleteAccount();
      if (data.success) {
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
          const data = await orderService.getOrders();
          if (data.orders && data.orders.length > 0) {
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
    name: user?.name ? user.name.replace(/[^a-zA-Z\s]/g, '').trim() || user.name : (isAuthenticated ? 'Customer' : 'Guest Shopper'),
    email: user?.email || (isAuthenticated ? '' : 'Sign in to view orders & track packages'),
    phone: user?.phone ? user.phone.replace(/\D/g, '').slice(0, 10) || user.phone : (isAuthenticated ? '' : 'No phone linked'),
  };

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'C';

  const handleSaveProfile = async (updated) => {
    const res = await updateProfile(updated);
    if (res && res.success !== false) {
      firePartyPopper();
      return { success: true };
    }
    return res;
  };

  return (
    <section className="relative pt-4 sm:pt-6 pb-24 sm:pb-28 overflow-hidden min-h-[85vh] bg-[#F6F5F0]">
      <div className="max-w-3xl mx-auto px-3.5 sm:px-6">

        {/* ── Sign-In Notification Banner (if guest) ── */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-5 p-3.5 sm:p-5 rounded-2xl sm:rounded-[24px] bg-[#1D1D1F] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4"
          >
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 font-extrabold">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white">Have an Account or Want to Register?</h3>
                <p className="text-[11px] sm:text-xs text-white/70 mt-0.5">
                  Sign in to view real-time tracking, save addresses, and access exclusive member deals.
                </p>
              </div>
            </div>

            <button
              onClick={() => openAuthModal()}
              className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white text-[#1D1D1F] hover:bg-neutral-100 font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>Sign In / Register</span>
            </button>
          </motion.div>
        )}

        {/* ── Profile Header Card ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[28px] border border-black/[0.06] shadow-sm p-4.5 xs:p-6 sm:p-7 mb-4 sm:mb-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center shadow-md">
                  <span className="text-white text-lg sm:text-2xl font-extrabold tracking-wider">{initials}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-xl font-extrabold text-[#1D1D1F] truncate">{profile.name}</h2>

                <div className="flex items-center gap-1.5 text-xs text-[#777777] mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#777777] mt-0.5">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{profile.phone}</span>
                </div>
              </div>
            </div>

            {/* Profile Action: Edit if logged in, Sign in if guest */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-black/5 bg-[#F5F5F7] hover:bg-[#E5E5EA] text-xs font-bold text-[#1D1D1F] transition-all shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal()}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#1D1D1F] hover:bg-black text-xs font-extrabold text-white transition-all shadow-sm cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── My Orders ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[28px] border border-black/[0.06] shadow-sm mb-4 sm:mb-5 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-black/5">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center shrink-0">
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1D1D1F]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1D1D1F]">Recent Orders ({allOrdersList.length})</h3>
                <p className="text-[10px] sm:text-[11px] text-[#777777]">Tap any order to view details & status</p>
              </div>
            </div>
            {allOrdersList.length > 3 && (
              <button
                onClick={() => setShowAllOrders(!showAllOrders)}
                className="flex items-center gap-1 text-xs font-bold text-[#1D1D1F] hover:underline cursor-pointer"
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
                  className="flex items-center gap-2.5 sm:gap-3.5 px-3.5 sm:px-6 py-3 sm:py-4 hover:bg-[#F5F5F7]/40 transition-colors group cursor-pointer"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/5 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#1D1D1F]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-[#1D1D1F]">Order {order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border ${st.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {order.statusLabel || order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] sm:text-xs text-[#777777] font-medium">{order.date}</span>
                      <span className="text-[10px] text-[#A0A0A0]">•</span>
                      <span className="text-[11px] sm:text-xs text-[#1D1D1F] font-medium truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs">
                        {formatOrderItemSummary(order)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-[#1D1D1F]">
                      {formatPrice(order.amount, STORE_CONFIG.currency)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#1D1D1F] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>

          {allOrdersList.length === 0 && (
            <div className="px-4 sm:px-6 py-10 sm:py-12 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F5F5F7] text-[#777777] flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#1D1D1F]" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-[#1D1D1F] mb-1">No Orders Placed Yet</p>
              <p className="text-[11px] sm:text-xs text-[#777777] max-w-xs mx-auto mb-4 leading-relaxed">
                Your orders list is currently empty. Explore our bridal necklaces, bangles, and earrings to place your first order!
              </p>
              <button
                onClick={onExploreCatalog}
                className="neu-btn-accent py-2 sm:py-2.5 px-5 sm:px-6 text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#1D1D1F]" />
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
          className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[28px] border border-black/[0.06] shadow-sm mb-4 sm:mb-5 overflow-hidden"
        >
          <div className="divide-y divide-black/5">
            {/* WhatsApp Direct Help */}
            <button
              onClick={() => {
                const msg = `Hi ${STORE_CONFIG.name}! I need assistance regarding my orders/account.`;
                window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full flex items-center gap-3 sm:gap-3.5 px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-[#F5F5F7]/40 transition-colors text-left group cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[#1D1D1F] group-hover:text-emerald-700 transition-colors block truncate">
                  Direct WhatsApp Support
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#777777] block truncate">Chat instantly with our store support team</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#1D1D1F] shrink-0" />
            </button>

            {/* Catalog Explore */}
            <button
              onClick={onExploreCatalog}
              className="w-full flex items-center gap-3 sm:gap-3.5 px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-[#F5F5F7]/40 transition-colors text-left group border-t border-black/5 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[#1D1D1F] group-hover:underline block truncate">
                  Browse Product Catalog
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#777777] block truncate">Explore latest imitation jewelry, necklaces, and bangles</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#1D1D1F] shrink-0" />
            </button>

            {/* My Saved Wishlist */}
            <button
              onClick={() => onNavigate && onNavigate('wishlist', 'Wishlist')}
              className="w-full flex items-center gap-3 sm:gap-3.5 px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-[#F5F5F7]/40 transition-colors text-left group border-t border-black/5 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" fill="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[#1D1D1F] group-hover:text-rose-600 transition-colors block truncate">
                  My Saved Wishlist
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#777777] block truncate">View your favorited items and products</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#1D1D1F] shrink-0" />
            </button>

            {/* Nakoda Suggestions */}
            <button
              onClick={() => setIsSuggestionOpen(true)}
              className="w-full flex items-center gap-3 sm:gap-3.5 px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-[#F5F5F7]/40 transition-colors text-left group border-t border-black/5 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1D1D1F]/20 text-[#3E5C0F] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#1D1D1F] group-hover:text-[#5F8C1D] transition-colors truncate">
                    Nakoda Suggestions
                  </span>
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-[#1D1D1F]/20 text-[#3E5C0F] border border-[#1D1D1F]/30 shrink-0">
                    New
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-[#777777] block truncate">
                  Suggest designs, request custom jewelry pieces, or give store feedback
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#1D1D1F] shrink-0" />
            </button>

            {/* Admin Portal Quick Launcher (if admin) */}
            {(user?.role === 'admin' || user?.role === 'superadmin' || user?.email === 'vinaypokharna36@gmail.com') && (
              <a
                href="/admin"
                className="w-full flex items-center gap-3 sm:gap-3.5 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#1D1D1F] text-white hover:bg-black transition-colors text-left group border-t border-black/5"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center shrink-0 font-extrabold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                      Open Admin Dashboard
                    </span>
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-[#1D1D1F] text-white shrink-0">
                      Admin
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-white/70 block truncate">
                    Manage products, stock inventory, categories, coupons & inquiries
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#1D1D1F] group-hover:translate-x-0.5 transition-transform shrink-0" />
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
            Nakoda Imitation v1.0.0 · Retail Store in Vapi, Gujarat
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
