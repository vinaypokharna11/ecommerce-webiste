import React, { useState } from 'react';
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
  SlidersHorizontal,
} from 'lucide-react';
import { STORE_CONFIG } from '../data/mockData';

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
    recipientName: 'John Doe',
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
    recipientName: 'John Doe',
    recipientPhone: '+91 98765 43210',
  },
  {
    id: '#SE1001',
    items: 'Premium Breathable Sneakers (x1)',
    date: 'Aug 12, 2026',
    amount: 1999,
    status: 'delivered',
    statusLabel: 'Delivered',
    payMethod: 'Cash on Delivery',
    deliveryAddress: 'Shop #14, Main Market Road, Bangalore — 560001',
    recipientName: 'John Doe',
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
          className="fixed inset-0 bg-[#15152A]/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-[28px] border border-[#EAE6FD] shadow-2xl z-10 p-6 sm:p-7 max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE6FD] flex-shrink-0">
            <div>
              <h3 className="text-lg font-extrabold text-[#15152A]">{title}</h3>
              {subtitle && <p className="text-xs text-[#626276] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#FAF9FF] hover:bg-[#F1EFFF] text-[#626276] flex items-center justify-center transition-colors"
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

  return (
    <SheetModal isOpen={true} onClose={onClose} title="Edit Profile" subtitle="Update your personal details">
      <div className="space-y-4">
        {[
          { label: 'Full Name', field: 'name', icon: User, type: 'text' },
          { label: 'Phone Number', field: 'phone', icon: Phone, type: 'tel' },
          { label: 'Email Address', field: 'email', icon: Mail, type: 'email' },
        ].map(({ label, field, icon: Icon, type }) => (
          <div key={field}>
            <label className="text-xs font-bold text-[#626276] uppercase tracking-wider block mb-1.5">
              {label}
            </label>
            <div className="relative">
              <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5CF6]" />
              <input
                type={type}
                value={form[field]}
                onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm font-semibold text-[#15152A] placeholder-[#C4C4D4] focus:outline-none focus:border-[#6257FF] focus:ring-2 focus:ring-[#6257FF]/15 transition-all"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t border-[#EAE6FD]">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl border border-[#EAE6FD] bg-[#FAF9FF] text-[#626276] font-bold text-sm hover:bg-[#F1EFFF] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => { onSave(form); onClose(); }}
          className="flex-1 py-3 rounded-2xl gradient-btn-primary text-white font-bold text-sm shadow-btn hover:scale-[1.02] transition-all"
        >
          Save Changes
        </button>
      </div>
    </SheetModal>
  );
};

// ─── Order Details Modal ──────────────────────────────────────────────────────
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;
  const st = STATUS_STYLES[order.status] || STATUS_STYLES.delivered;

  const handleTrackWhatsApp = () => {
    const msg = `Hi ${STORE_CONFIG.name}! I would like an update on my order *${order.id}* placed on ${order.date}.`;
    window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <SheetModal isOpen={true} onClose={onClose} title={`Order ${order.id}`} subtitle={`Placed on ${order.date}`}>
      <div className="space-y-4">
        {/* Status Tracker */}
        <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#EAE6FD]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">Status</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${st.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {order.statusLabel}
            </span>
          </div>

          {/* Step Timeline */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            {[
              { label: 'Confirmed', done: true },
              { label: 'Shipped', done: order.status === 'shipped' || order.status === 'delivered' },
              { label: 'Delivered', done: order.status === 'delivered' },
            ].map((step, i) => (
              <div key={step.label} className="flex flex-col items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.done ? 'bg-[#6257FF] text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : i + 1}
                </div>
                <span className={`text-[11px] font-semibold ${step.done ? 'text-[#15152A]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE6FD] space-y-2">
          <p className="text-xs font-bold text-[#626276] uppercase tracking-wider mb-2">Order Items</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-[#6257FF]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#15152A]">{order.items}</p>
              <p className="text-[11px] text-[#8E8EA0]">{order.payMethod || 'Cash on Delivery'}</p>
            </div>
            <span className="text-sm font-extrabold text-[#15152A]">
              {STORE_CONFIG.currency}{order.amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="p-4 rounded-2xl bg-white border border-[#EAE6FD] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8B5CF6] uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Delivery Address</span>
            </div>
            <p className="text-xs font-bold text-[#15152A]">{order.recipientName}</p>
            <p className="text-xs text-[#626276]">{order.deliveryAddress}</p>
            {order.recipientPhone && <p className="text-xs text-[#626276]">{order.recipientPhone}</p>}
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handleTrackWhatsApp}
          className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Ask Status on WhatsApp</span>
        </button>
      </div>
    </SheetModal>
  );
};

// ─── Saved Addresses Modal ────────────────────────────────────────────────────
const SavedAddressesModal = ({ isOpen, onClose }) => {
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      title: 'Home',
      name: 'John Doe',
      phone: '+91 98765 43210',
      address: 'Flat 402, Sunshine Apartments, 12th Cross Road, Indiranagar, Bangalore',
      pincode: '560038',
      isDefault: true,
    },
    {
      id: 'addr-2',
      title: 'Work / Office',
      name: 'John Doe',
      phone: '+91 98765 43210',
      address: 'Tech Park Tower B, 5th Floor, Electronic City, Bangalore',
      pincode: '560100',
      isDefault: false,
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ title: 'Home', name: '', phone: '', address: '', pincode: '' });

  const handleAdd = () => {
    if (!newAddr.address.trim() || !newAddr.pincode.trim()) return;
    setAddresses((prev) => [
      ...prev,
      {
        id: `addr-${Date.now()}`,
        title: newAddr.title,
        name: newAddr.name || 'John Doe',
        phone: newAddr.phone || '+91 98765 43210',
        address: newAddr.address,
        pincode: newAddr.pincode,
        isDefault: false,
      },
    ]);
    setShowAddForm(false);
    setNewAddr({ title: 'Home', name: '', phone: '', address: '', pincode: '' });
  };

  return (
    <SheetModal isOpen={isOpen} onClose={onClose} title="Saved Addresses" subtitle="Manage your delivery locations">
      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-4 rounded-2xl border transition-all ${
              addr.isDefault
                ? 'bg-[#F5F3FF] border-[#6257FF] shadow-xs'
                : 'bg-white border-[#EAE6FD] hover:border-[#8B5CF6]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#6257FF] uppercase tracking-wider bg-purple-100 px-2 py-0.5 rounded-md">
                {addr.title}
              </span>
              {addr.isDefault && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Default Address
                </span>
              )}
            </div>
            <p className="text-sm font-extrabold text-[#15152A]">{addr.name}</p>
            <p className="text-xs text-[#626276] mt-0.5">{addr.address} — {addr.pincode}</p>
            <p className="text-xs text-[#8E8EA0] mt-0.5">Phone: {addr.phone}</p>
          </div>
        ))}

        {showAddForm ? (
          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] space-y-3">
            <p className="text-xs font-bold text-[#15152A]">Add New Address</p>
            <input
              placeholder="Address (House no, Street)"
              value={newAddr.address}
              onChange={(e) => setNewAddr((p) => ({ ...p, address: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6FD] text-xs font-semibold"
            />
            <input
              placeholder="Pincode"
              value={newAddr.pincode}
              onChange={(e) => setNewAddr((p) => ({ ...p, pincode: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6FD] text-xs font-semibold"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold"
              >
                Save Address
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-[#EAE6FD] text-[#6257FF] font-bold text-xs hover:bg-[#F5F3FF] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        )}
      </div>
    </SheetModal>
  );
};

// ─── Payment Methods Modal ────────────────────────────────────────────────────
const PaymentMethodsModal = ({ isOpen, onClose }) => {
  return (
    <SheetModal isOpen={isOpen} onClose={onClose} title="Payment Methods" subtitle="Saved payment options">
      <div className="space-y-3">
        {[
          {
            id: 'upi',
            title: 'UPI / Google Pay / PhonePe',
            sub: 'johndoe@okaxis (Verified)',
            badge: 'Primary',
            icon: Smartphone,
          },
          {
            id: 'card',
            title: 'HDFC Bank Debit Card',
            sub: '•••• •••• •••• 4028 (Expires 08/28)',
            badge: 'Saved',
            icon: CreditCard,
          },
          {
            id: 'cod',
            title: 'Cash on Delivery',
            sub: 'Always available for all orders',
            badge: 'Available',
            icon: Shield,
          },
        ].map((method) => (
          <div key={method.id} className="p-4 rounded-2xl bg-white border border-[#EAE6FD] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center flex-shrink-0 text-[#6257FF]">
              <method.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#15152A]">{method.title}</span>
                <span className="text-[10px] font-bold text-[#6257FF] bg-purple-50 px-2 py-0.5 rounded-full">
                  {method.badge}
                </span>
              </div>
              <p className="text-xs text-[#8E8EA0] mt-0.5">{method.sub}</p>
            </div>
          </div>
        ))}

        <div className="p-4 rounded-2xl bg-[#FFF0FB] border border-[#FCD6F2] text-xs text-[#626276]">
          🔒 All transactions are protected with 256-bit SSL encryption.
        </div>
      </div>
    </SheetModal>
  );
};

// ─── Notifications Modal ──────────────────────────────────────────────────────
const NotificationsModal = ({ isOpen, onClose }) => {
  const [prefs, setPrefs] = useState({
    whatsapp: true,
    sms: true,
    promo: false,
  });

  return (
    <SheetModal isOpen={isOpen} onClose={onClose} title="Notification Preferences" subtitle="Control what alerts you receive">
      <div className="space-y-3">
        {[
          { id: 'whatsapp', label: 'WhatsApp Order Updates', desc: 'Real-time order delivery updates via WhatsApp' },
          { id: 'sms', label: 'SMS Alerts', desc: 'Order dispatched & delivery OTP via SMS' },
          { id: 'promo', label: 'Promotional Offers & Discounts', desc: 'Exclusive festival deals and discount codes' },
        ].map((item) => (
          <div key={item.id} className="p-4 rounded-2xl bg-white border border-[#EAE6FD] flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#15152A]">{item.label}</p>
              <p className="text-[11px] text-[#8E8EA0] mt-0.5">{item.desc}</p>
            </div>
            <button
              onClick={() => setPrefs((p) => ({ ...p, [item.id]: !p[item.id] }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                prefs[item.id] ? 'bg-[#6257FF]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  prefs[item.id] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </SheetModal>
  );
};

// ─── Privacy Modal ────────────────────────────────────────────────────
const PrivacyModal = ({ isOpen, onClose }) => {
  return (
    <SheetModal isOpen={isOpen} onClose={onClose} title="Privacy & Security" subtitle="Your data and account security">
      <div className="space-y-3 text-xs text-[#626276] leading-relaxed">
        <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#EAE6FD]">
          <div className="flex items-center gap-2 font-bold text-[#15152A] mb-1">
            <Lock className="w-4 h-4 text-[#6257FF]" />
            <span>Secure Storage</span>
          </div>
          <p>Your delivery information and phone number are only shared with our store and delivery courier.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EAE6FD]">
          <p className="font-bold text-[#15152A] mb-1">Active Session</p>
          <p>Current Browser · Verified Device · IP Protected</p>
        </div>
      </div>
    </SheetModal>
  );
};

// ─── Main Profile Page ────────────────────────────────────────────────────────
export const ProfilePage = ({ 
  orders = INITIAL_ORDERS,
  onExploreCatalog, 
  onNavigate 
}) => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    phone: '+91 98765 43210',
    email: 'john.doe@example.com',
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'addresses' | 'payment' | 'notifications' | 'privacy'

  const allOrdersList = orders.length > 0 ? orders : INITIAL_ORDERS;
  const displayedOrders = showAllOrders ? allOrdersList : allOrdersList.slice(0, 3);

  const menuItems = [
    {
      id: 'admin',
      label: 'Store Admin Panel',
      subtitle: 'Manage catalog, categories & offers',
      icon: SlidersHorizontal,
      iconBg: 'bg-gradient-to-tr from-[#6257FF]/20 to-[#EC5AC8]/20',
      iconColor: 'text-[#6257FF]',
      badge: 'Admin Mode',
      onClick: () => onNavigate && onNavigate('admin', 'Admin Panel'),
    },
    {
      id: 'addresses',
      label: 'Saved Addresses',
      icon: MapPin,
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-[#6257FF]',
      onClick: () => setActiveModal('addresses'),
    },
    {
      id: 'payment',
      label: 'Payment Methods',
      icon: CreditCard,
      iconBg: 'bg-[#FFF0FB]',
      iconColor: 'text-[#EC5AC8]',
      onClick: () => setActiveModal('payment'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      iconBg: 'bg-[#F0F9FF]',
      iconColor: 'text-[#0891B2]',
      onClick: () => setActiveModal('notifications'),
    },
    {
      id: 'support',
      label: 'Help & Support',
      icon: HelpCircle,
      iconBg: 'bg-[#F0FDF4]',
      iconColor: 'text-[#059669]',
      onClick: () => {
        const msg = `Hi ${STORE_CONFIG.name}! I need some help with my account or order.`;
        window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
      },
    },
    {
      id: 'privacy',
      label: 'Privacy & Security',
      icon: Shield,
      iconBg: 'bg-[#FFFBEB]',
      iconColor: 'text-[#D97706]',
      onClick: () => setActiveModal('privacy'),
    },
  ];

  // Avatar initials
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <section className="relative pt-24 pb-28 md:pt-32 md:pb-32 overflow-hidden min-h-screen">
      {/* Ambient glows */}
      <div className="absolute top-20 right-10 w-96 h-96 ambient-glow-purple rounded-full pointer-events-none -z-10 blur-3xl" />
      <div className="absolute bottom-40 -left-20 w-80 h-80 ambient-glow-pink rounded-full pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* ── Profile Card ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-[#EAE6FD] shadow-[0_8px_30px_rgba(98,87,255,0.08)] p-6 sm:p-7 mb-5"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#6257FF] to-[#EC5AC8] flex items-center justify-center shadow-[0_8px_20px_rgba(98,87,255,0.3)]">
                <span className="text-white text-xl sm:text-2xl font-extrabold">{initials}</span>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#15152A] truncate">{profile.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-[#626276] mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span className="font-medium">{profile.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#626276] mt-0.5 truncate">
                <Mail className="w-3.5 h-3.5 text-[#EC5AC8]" />
                <span className="font-medium truncate">{profile.email}</span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EAE6FD] bg-[#FAF9FF] hover:bg-[#EDE9FE] hover:border-[#8B5CF6] text-xs font-bold text-[#6257FF] transition-all shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[#EAE6FD]">
            {[
              { label: 'Orders', value: `${allOrdersList.length}`, icon: Package, color: 'text-[#6257FF]', bg: 'bg-[#F5F3FF]' },
              { label: 'Wishlist', value: '1', icon: Star, color: 'text-[#EC5AC8]', bg: 'bg-[#FFF0FB]' },
              { label: 'Reviews', value: '2', icon: MessageCircle, color: 'text-[#8B5CF6]', bg: 'bg-[#EDE9FE]' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center gap-1.5">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-base font-extrabold text-[#15152A]">{stat.value}</span>
                <span className="text-[11px] font-medium text-[#8E8EA0]">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── My Orders ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-3xl border border-[#EAE6FD] shadow-[0_4px_20px_rgba(98,87,255,0.06)] mb-5 overflow-hidden"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-[#EAE6FD]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] flex items-center justify-center">
                <Package className="w-4 h-4 text-[#6257FF]" />
              </div>
              <h3 className="text-base font-extrabold text-[#15152A]">My Orders ({allOrdersList.length})</h3>
            </div>
            {allOrdersList.length > 3 && (
              <button
                onClick={() => setShowAllOrders(!showAllOrders)}
                className="flex items-center gap-1 text-xs font-bold text-[#6257FF] hover:text-[#4F46E5]"
              >
                {showAllOrders ? 'Show Less' : 'View all'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllOrders ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Orders List */}
          <div className="divide-y divide-[#EAE6FD]">
            {displayedOrders.map((order, index) => {
              const st = STATUS_STYLES[order.status] || STATUS_STYLES.delivered;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-3.5 px-5 sm:px-6 py-4 hover:bg-[#FAF9FF] transition-colors group cursor-pointer"
                >
                  {/* Order icon */}
                  <div className="w-10 h-10 rounded-2xl bg-[#F5F3FF] border border-[#EAE6FD] flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-[#6257FF]" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-[#15152A]">Order {order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {order.statusLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-[#8E8EA0] font-medium">{order.date}</span>
                      <span className="text-[10px] text-[#C4C4D4]">•</span>
                      <span className="text-xs text-[#626276] font-medium truncate max-w-[150px]">{order.items}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[#15152A]">
                      {STORE_CONFIG.currency}{order.amount.toLocaleString()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#C4C4D4] group-hover:text-[#6257FF] transition-colors ml-auto" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty orders fallback */}
          {allOrdersList.length === 0 && (
            <div className="px-6 py-10 text-center">
              <Package className="w-10 h-10 text-[#C4C4D4] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#8E8EA0]">No orders yet</p>
            </div>
          )}
        </motion.div>

        {/* ── Settings Menu ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-white rounded-3xl border border-[#EAE6FD] shadow-[0_4px_20px_rgba(98,87,255,0.06)] mb-5 overflow-hidden"
        >
          <div className="divide-y divide-[#EAE6FD]">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + index * 0.05 }}
                onClick={item.onClick}
                className="w-full flex items-center gap-3.5 px-5 sm:px-6 py-4 hover:bg-[#FAF9FF] transition-colors group text-left"
              >
                <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-[#15152A] group-hover:text-[#6257FF] transition-colors block">
                    {item.label}
                  </span>
                  {item.subtitle && (
                    <span className="text-[11px] text-[#8E8EA0] block">
                      {item.subtitle}
                    </span>
                  )}
                </div>
                {item.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EDE9FE] text-[#6257FF] border border-[#DDD6FE]">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-[#C4C4D4] group-hover:text-[#6257FF] transition-colors" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Logout / App info ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="space-y-3"
        >
          {/* Logout Button */}
          {!logoutConfirm ? (
            <button
              onClick={() => setLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-5 sm:px-6 py-4 rounded-3xl bg-white border border-rose-100 hover:bg-rose-50 hover:border-rose-200 transition-all group shadow-[0_4px_16px_rgba(244,63,94,0.06)]"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-rose-500" />
              </div>
              <span className="flex-1 text-sm font-bold text-rose-500 text-left">Logout</span>
              <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-400 transition-colors" />
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full p-5 rounded-3xl bg-rose-50 border border-rose-200"
            >
              <p className="text-sm font-bold text-rose-700 mb-3 text-center">Are you sure you want to logout?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-white border border-rose-200 text-rose-500 font-bold text-xs hover:bg-rose-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setLogoutConfirm(false);
                    // Reset to home on logout
                    if (onNavigate) onNavigate('home', 'Home');
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          )}

          {/* App version */}
          <p className="text-center text-[11px] text-[#C4C4D4] font-medium pb-2">
            ShopEase v1.0.0 · Built with ❤️ for local businesses
          </p>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditOpen(false)}
          onSave={(updated) => setProfile(updated)}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Saved Addresses Modal */}
      <SavedAddressesModal
        isOpen={activeModal === 'addresses'}
        onClose={() => setActiveModal(null)}
      />

      {/* Payment Methods Modal */}
      <PaymentMethodsModal
        isOpen={activeModal === 'payment'}
        onClose={() => setActiveModal(null)}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
      />

      {/* Privacy Modal */}
      <PrivacyModal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
      />
    </section>
  );
};

export default ProfilePage;
