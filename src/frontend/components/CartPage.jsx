import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  CheckCircle2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ShoppingCart,
  X,
  User,
  Phone,
  MapPin,
  ChevronRight,
  CreditCard,
  Banknote,
  Package,
  ArrowRight,
  Home,
  Check,
  Star,
} from 'lucide-react';
import { STORE_CONFIG } from '../data/mockData';

const SHIPPING_THRESHOLD = 999;

const VALID_PROMOS = {
  ELEC20: { discount: 0.20, label: 'Electronics 20% OFF' },
  FASH30: { discount: 0.30, label: 'Fashion 30% OFF' },
  HOME15: { discount: 0.15, label: 'Home & Living 15% OFF' },
  ACC25: { discount: 0.25, label: 'Accessories 25% OFF' },
  FEET35: { discount: 0.35, label: 'Footwear 35% OFF' },
  GIFT10: { discount: 0.10, label: 'Gift Hampers 10% OFF' },
};

// ─── Checkout Modal ───────────────────────────────────────────────────────────
const CheckoutModal = ({ cartList, subtotal, promoDiscountAmount, shippingFee, total, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1 = form, 2 = confirm, 3 = success
  const [payMethod, setPayMethod] = useState('cod');
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', pincode: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim() || !/^\+?[\d\s\-]{7,15}$/.test(form.phone)) e.phone = 'Valid phone is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.pincode.trim() || !/^\d{5,6}$/.test(form.pincode)) e.pincode = 'Valid pincode is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const orderId = `#SE${Date.now().toString().slice(-6)}`;

  const handleNext = () => { if (validate()) setStep(2); };
  const handlePlaceOrder = () => { 
    setStep(3); 
    const orderData = {
      id: orderId,
      items: cartList.map(i => `${i.name} (x${i.quantity})`).join(', '),
      itemList: cartList,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: total,
      status: 'processing',
      statusLabel: 'Processing',
      payMethod: payMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (UPI/Card)',
      deliveryAddress: `${form.address}, ${form.city} — ${form.pincode}`,
      recipientName: form.name,
      recipientPhone: form.phone,
    };
    setTimeout(() => { 
      onSuccess(orderData); 
      onClose(); 
    }, 2500); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step !== 3 ? onClose : undefined}
        className="fixed inset-0 bg-[#15152A]/60 backdrop-blur-md"
      />

      {/* Modal sheet */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[28px] border border-[#EAE6FD] shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* ── Step 1: Delivery Details ─────────────────────── */}
        {step === 1 && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#EAE6FD] flex-shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-[#15152A]">Delivery Details</h3>
                <p className="text-xs text-[#626276] mt-0.5">Where should we deliver your order?</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#FAF9FF] hover:bg-[#F1EFFF] text-[#626276] flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-[#626276] uppercase tracking-wider block mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5CF6]" />
                  <input
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF9FF] border text-sm font-semibold text-[#15152A] placeholder-[#C4C4D4] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/15 transition-all ${errors.name ? 'border-rose-400' : 'border-[#EAE6FD] focus:border-[#6257FF]'}`}
                  />
                </div>
                {errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-[#626276] uppercase tracking-wider block mb-1.5">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5CF6]" />
                  <input
                    value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210" type="tel"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF9FF] border text-sm font-semibold text-[#15152A] placeholder-[#C4C4D4] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/15 transition-all ${errors.phone ? 'border-rose-400' : 'border-[#EAE6FD] focus:border-[#6257FF]'}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.phone}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-bold text-[#626276] uppercase tracking-wider block mb-1.5">Street Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8B5CF6]" />
                  <textarea
                    value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="House no, Street, Locality" rows={2}
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF9FF] border text-sm font-semibold text-[#15152A] placeholder-[#C4C4D4] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/15 transition-all resize-none ${errors.address ? 'border-rose-400' : 'border-[#EAE6FD] focus:border-[#6257FF]'}`}
                  />
                </div>
                {errors.address && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.address}</p>}
              </div>

              {/* City + Pincode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#626276] uppercase tracking-wider block mb-1.5">City *</label>
                  <input
                    value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                    placeholder="Mumbai"
                    className={`w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border text-sm font-semibold text-[#15152A] placeholder-[#C4C4D4] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/15 transition-all ${errors.city ? 'border-rose-400' : 'border-[#EAE6FD] focus:border-[#6257FF]'}`}
                  />
                  {errors.city && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.city}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-[#626276] uppercase tracking-wider block mb-1.5">Pincode *</label>
                  <input
                    value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))}
                    placeholder="400001" type="number"
                    className={`w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border text-sm font-semibold text-[#15152A] placeholder-[#C4C4D4] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/15 transition-all ${errors.pincode ? 'border-rose-400' : 'border-[#EAE6FD] focus:border-[#6257FF]'}`}
                  />
                  {errors.pincode && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.pincode}</p>}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-[#626276] uppercase tracking-wider block mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', icon: Banknote, sub: 'Pay at door' },
                    { id: 'online', label: 'Online Payment', icon: CreditCard, sub: 'UPI / Card' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setPayMethod(opt.id)}
                      className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all ${
                        payMethod === opt.id
                          ? 'border-[#6257FF] bg-[#F5F3FF]'
                          : 'border-[#EAE6FD] bg-[#FAF9FF] hover:border-[#8B5CF6]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${payMethod === opt.id ? 'bg-[#6257FF]' : 'bg-[#EAE6FD]'}`}>
                        <opt.icon className={`w-4 h-4 ${payMethod === opt.id ? 'text-white' : 'text-[#8B5CF6]'}`} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#15152A]">{opt.label}</p>
                        <p className="text-[11px] text-[#8E8EA0]">{opt.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order mini summary */}
              <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#EAE6FD] space-y-1.5 text-sm">
                <div className="flex justify-between text-[#626276]"><span>Subtotal</span><span className="font-semibold text-[#15152A]">{STORE_CONFIG.currency}{subtotal.toLocaleString()}</span></div>
                {promoDiscountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Promo Discount</span><span className="font-bold">−{STORE_CONFIG.currency}{promoDiscountAmount.toLocaleString()}</span></div>}
                <div className="flex justify-between text-[#626276]"><span>Shipping</span><span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-600' : 'text-[#15152A]'}`}>{shippingFee === 0 ? 'FREE' : `${STORE_CONFIG.currency}${shippingFee}`}</span></div>
                <div className="border-t border-[#EAE6FD] pt-1.5 flex justify-between"><span className="font-extrabold text-[#15152A]">Total</span><span className="font-extrabold text-[#6257FF] text-base">{STORE_CONFIG.currency}{total.toLocaleString()}</span></div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-6 pb-6 pt-3 border-t border-[#EAE6FD] flex-shrink-0">
              <button onClick={handleNext} className="w-full py-4 rounded-2xl gradient-btn-primary text-white font-extrabold text-sm shadow-btn flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-95 transition-all">
                Review Order
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Order Review ─────────────────────────── */}
        {step === 2 && (
          <>
            <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-[#EAE6FD] flex-shrink-0">
              <button onClick={() => setStep(1)} className="w-9 h-9 rounded-full bg-[#FAF9FF] hover:bg-[#F1EFFF] text-[#626276] flex items-center justify-center">
                <X className="w-4 h-4 rotate-180" style={{ transform: 'scaleX(-1)' }} />
              </button>
              <div>
                <h3 className="text-lg font-extrabold text-[#15152A]">Review Order</h3>
                <p className="text-xs text-[#626276]">Confirm your details before placing</p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {/* Delivery address */}
              <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#EAE6FD]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#6257FF] flex items-center justify-center flex-shrink-0">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#8B5CF6] mb-0.5">DELIVERING TO</p>
                    <p className="text-sm font-extrabold text-[#15152A]">{form.name}</p>
                    <p className="text-xs text-[#626276]">{form.phone}</p>
                    <p className="text-xs text-[#626276] mt-1">{form.address}, {form.city} — {form.pincode}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="ml-auto text-[10px] font-bold text-[#6257FF] hover:underline">Edit</button>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-[#626276] uppercase tracking-wider mb-2">Your Items ({cartList.length})</p>
                <div className="space-y-2.5">
                  {cartList.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#EAE6FD]">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-[#FAF9FF] border border-[#EAE6FD] p-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#15152A] truncate">{item.name}</p>
                        <p className="text-[11px] text-[#8E8EA0]">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-extrabold text-[#15152A]">{STORE_CONFIG.currency}{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="p-4 rounded-2xl bg-white border border-[#EAE6FD] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                  {payMethod === 'cod' ? <Banknote className="w-4 h-4 text-[#6257FF]" /> : <CreditCard className="w-4 h-4 text-[#6257FF]" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#15152A]">{payMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                  <p className="text-[11px] text-[#8E8EA0]">{payMethod === 'cod' ? 'Pay when the order arrives' : 'Pay now via UPI / Card'}</p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F3FF] to-[#FFF0FB] border border-[#EAE6FD] space-y-2 text-sm">
                <div className="flex justify-between text-[#626276]"><span>Subtotal</span><span className="font-semibold">{STORE_CONFIG.currency}{subtotal.toLocaleString()}</span></div>
                {promoDiscountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Promo Discount</span><span className="font-bold">−{STORE_CONFIG.currency}{promoDiscountAmount.toLocaleString()}</span></div>}
                <div className="flex justify-between text-[#626276]"><span>Shipping</span><span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-600' : ''}`}>{shippingFee === 0 ? 'FREE' : `${STORE_CONFIG.currency}${shippingFee}`}</span></div>
                <div className="border-t border-[#EAE6FD] pt-2 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-[#15152A]">Total Amount</span>
                  <span className="text-xl font-extrabold text-[#6257FF]">{STORE_CONFIG.currency}{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-3 border-t border-[#EAE6FD] flex-shrink-0">
              <button onClick={handlePlaceOrder} className="w-full py-4 rounded-2xl gradient-btn-primary text-white font-extrabold text-sm shadow-btn flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-95 transition-all">
                <Package className="w-4 h-4" />
                Place Order · {STORE_CONFIG.currency}{total.toLocaleString()}
              </button>
              <p className="text-center text-[11px] text-[#8E8EA0] mt-2">
                By placing your order, you agree to our Terms of Service.
              </p>
            </div>
          </>
        )}

        {/* ── Step 3: Success ──────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center px-8 py-14 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#6257FF] to-[#EC5AC8] flex items-center justify-center shadow-[0_12px_30px_rgba(98,87,255,0.35)] mb-6"
            >
              <Check className="w-12 h-12 text-white stroke-[3]" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="text-2xl font-extrabold text-[#15152A] mb-1">Order Placed! 🎉</h3>
              <p className="text-sm text-[#626276] mb-2">Your order has been confirmed.</p>
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#F5F3FF] border border-[#EAE6FD] text-xs font-bold text-[#6257FF] mb-5">
                Order ID: {orderId}
              </div>
              <p className="text-xs text-[#8E8EA0] max-w-xs">
                We'll contact you at <span className="font-bold text-[#15152A]">{form.phone}</span> to confirm delivery to <span className="font-bold text-[#15152A]">{form.city}</span>.
              </p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Main Cart Page ───────────────────────────────────────────────────────────
export const CartPage = ({ cartItems = {}, onUpdateQuantity, onExploreCatalog, onPlaceOrder }) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const cartList = Object.values(cartItems).filter((item) => item.quantity > 0);
  const subtotal = cartList.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const promoDiscountAmount = appliedPromo ? Math.round(subtotal * VALID_PROMOS[appliedPromo].discount) : 0;
  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : 99;
  const total = subtotal - promoDiscountAmount + shippingFee;

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (VALID_PROMOS[code]) {
      setAppliedPromo(code);
      setPromoError('');
    } else {
      setPromoError('Invalid code. Try: ELEC20, FASH30, HOME15, ACC25…');
      setAppliedPromo(null);
    }
  };

  // ── Empty Cart ─────────────────────────────────────────────────────────────
  if (cartList.length === 0 && !orderPlaced) {
    return (
      <section className="relative pt-24 pb-28 md:pt-32 md:pb-32 overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute top-20 right-10 w-96 h-96 ambient-glow-purple rounded-full pointer-events-none -z-10 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-8 py-14 bg-white rounded-3xl border border-[#EAE6FD] shadow-[0_10px_40px_rgba(98,87,255,0.08)] max-w-sm w-full mx-auto"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#F5F3FF] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <ShoppingCart className="w-10 h-10 text-[#6257FF]" />
          </div>
          <h2 className="text-xl font-extrabold text-[#15152A] mb-2">Your Cart is Empty</h2>
          <p className="text-sm text-[#626276] mb-6 leading-relaxed">
            Looks like you haven't added anything yet. Start exploring our catalog!
          </p>
          <button
            onClick={onExploreCatalog}
            className="gradient-btn-primary text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-btn flex items-center gap-2 mx-auto hover:scale-105 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore Catalog
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>
    );
  }

  // ── Order Success (after checkout modal closed) ────────────────────────────
  if (orderPlaced) {
    return (
      <section className="relative pt-24 pb-28 md:pt-32 md:pb-32 overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 ambient-glow-purple pointer-events-none -z-10 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          className="text-center px-8 py-14 bg-white rounded-3xl border border-[#EAE6FD] shadow-[0_16px_50px_rgba(98,87,255,0.14)] max-w-sm w-full mx-auto"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#6257FF] to-[#EC5AC8] flex items-center justify-center mx-auto mb-5 shadow-[0_10px_30px_rgba(98,87,255,0.35)]">
            <Check className="w-12 h-12 text-white stroke-[3]" />
          </div>
          <div className="flex justify-center gap-1 mb-3">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
          </div>
          <h2 className="text-2xl font-extrabold text-[#15152A] mb-2">Order Placed! 🎉</h2>
          <p className="text-sm text-[#626276] mb-6 leading-relaxed">
            Thank you for shopping at {STORE_CONFIG.name}. We'll contact you shortly to confirm your delivery.
          </p>
          <button
            onClick={onExploreCatalog}
            className="gradient-btn-primary text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-btn flex items-center gap-2 mx-auto hover:scale-105 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </button>
        </motion.div>
      </section>
    );
  }

  // ── Cart Page ──────────────────────────────────────────────────────────────
  return (
    <section className="relative pt-24 pb-28 md:pt-32 md:pb-32 overflow-hidden min-h-screen">
      <div className="absolute top-20 right-10 w-96 h-96 ambient-glow-purple rounded-full pointer-events-none -z-10 blur-3xl" />
      <div className="absolute bottom-40 -left-20 w-80 h-80 ambient-glow-pink rounded-full pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6257FF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15152A]">
                Your Cart <span className="text-[#8B5CF6]">({cartList.length})</span>
              </h1>
              <p className="text-sm text-[#626276]">Review items and proceed to checkout</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ── LEFT: Items ── */}
          <div className="lg:col-span-7 space-y-4">
            <AnimatePresence>
              {cartList.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                  className="flex items-center gap-4 p-4 sm:p-5 bg-white rounded-3xl border border-[#EAE6FD] shadow-[0_4px_16px_rgba(98,87,255,0.06)] hover:shadow-[0_8px_28px_rgba(98,87,255,0.1)] transition-all duration-300"
                >
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#F5F3FF] to-[#FFF0FB] flex items-center justify-center flex-shrink-0 border border-[#EAE6FD] overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6]">{item.categoryName}</span>
                    <h3 className="text-sm font-bold text-[#15152A] line-clamp-2 leading-snug mt-0.5 mb-1">{item.name}</h3>
                    {item.selectedSize && <span className="inline-block text-[11px] text-[#626276] bg-[#F5F3FF] px-2 py-0.5 rounded-full mr-1">Size: {item.selectedSize}</span>}
                    {item.selectedColor && <span className="inline-block text-[11px] text-[#626276] bg-[#F5F3FF] px-2 py-0.5 rounded-full">{item.selectedColor}</span>}

                    <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-[#15152A]">
                          {STORE_CONFIG.currency}{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <span className="text-xs text-[#A0A0B2]">
                          {STORE_CONFIG.currency}{item.price.toLocaleString()} × {item.quantity}
                        </span>
                      </div>

                      {/* Stepper + Delete */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-[#F5F3FF] border border-[#EAE6FD] rounded-xl p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white text-[#6257FF] hover:bg-purple-100 flex items-center justify-center transition-colors active:scale-90"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <motion.span key={item.quantity} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="text-sm font-bold text-[#15152A] px-2.5 min-w-[28px] text-center">
                            {item.quantity}
                          </motion.span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-[#6257FF] text-white hover:bg-[#4F46E5] flex items-center justify-center transition-colors active:scale-90"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 0)}
                          className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-400 hover:text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors active:scale-90"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue shopping */}
            <button
              onClick={onExploreCatalog}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#EAE6FD] text-[#8B5CF6] font-semibold text-sm hover:border-[#8B5CF6] hover:bg-[#F5F3FF] transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </button>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="lg:col-span-5 sticky top-28 space-y-4"
          >
            {/* Promo Code */}
            <div className="bg-white rounded-3xl border border-[#EAE6FD] p-5 shadow-[0_4px_16px_rgba(98,87,255,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className="text-sm font-bold text-[#15152A]">Promo Code</h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                  placeholder="e.g. FASH30"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm font-mono font-bold text-[#15152A] placeholder-[#C4C4D4] focus:outline-none focus:border-[#6257FF] transition-colors"
                />
                <button onClick={handleApplyPromo} className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white font-bold text-sm hover:scale-105 transition-all active:scale-95">
                  Apply
                </button>
              </div>
              {promoError && <p className="text-xs text-rose-500 mt-2 font-medium">{promoError}</p>}
              {appliedPromo && (
                <div className="mt-2 flex items-center justify-between text-xs font-semibold bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    {VALID_PROMOS[appliedPromo].label} applied!
                  </span>
                  <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }} className="text-rose-400 hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-3xl border border-[#EAE6FD] p-5 sm:p-6 shadow-[0_4px_16px_rgba(98,87,255,0.06)]">
              <h3 className="text-base font-extrabold text-[#15152A] mb-5">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-[#626276]">
                  <span>Subtotal ({cartList.length} {cartList.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-[#15152A]">{STORE_CONFIG.currency}{subtotal.toLocaleString()}</span>
                </div>

                {promoDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="font-medium">Promo Discount</span>
                    <span className="font-bold">−{STORE_CONFIG.currency}{promoDiscountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[#626276]">
                  <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Shipping</span>
                  <span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-600' : 'text-[#15152A]'}`}>
                    {shippingFee === 0 ? 'FREE' : `${STORE_CONFIG.currency}${shippingFee}`}
                  </span>
                </div>

                {shippingFee === 0 && (
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Free shipping unlocked!
                  </div>
                )}
                {shippingFee > 0 && (
                  <div className="text-[11px] text-[#8B5CF6] bg-[#F5F3FF] border border-[#EAE6FD] rounded-xl px-3 py-2">
                    Add {STORE_CONFIG.currency}{(SHIPPING_THRESHOLD - subtotal).toLocaleString()} more for free shipping
                  </div>
                )}

                <div className="h-px bg-[#EAE6FD] my-1" />

                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#15152A]">Total</span>
                  <span className="text-xl font-extrabold text-[#6257FF]">{STORE_CONFIG.currency}{total.toLocaleString()}</span>
                </div>
              </div>

              {/* ── Proceed to Checkout CTA ── */}
              <button
                onClick={() => setCheckoutOpen(true)}
                className="mt-6 w-full py-4 rounded-2xl gradient-btn-primary text-white font-extrabold text-sm shadow-btn hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2.5"
              >
                <Package className="w-4 h-4" />
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Trust Markers */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[#EAE6FD]">
                {[
                  { icon: ShieldCheck, label: 'Genuine Products', color: 'text-[#6257FF]' },
                  { icon: Truck, label: 'Fast Delivery', color: 'text-[#8B5CF6]' },
                  { icon: RotateCcw, label: '7-Day Returns', color: 'text-[#EC5AC8]' },
                ].map(t => (
                  <div key={t.label} className="flex flex-col items-center gap-1.5 text-center">
                    <t.icon className={`w-5 h-5 ${t.color}`} />
                    <span className="text-[10px] font-semibold text-[#626276] leading-tight">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo reminder */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFF0FB] border border-[#FCD6F2]">
              <Sparkles className="w-4 h-4 text-[#EC5AC8] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#626276]">
                Use codes <span className="font-bold text-[#15152A]">ELEC20, FASH30, HOME15, ACC25, FEET35, GIFT10</span> for instant savings!
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Checkout Modal ── */}
      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutModal
            cartList={cartList}
            subtotal={subtotal}
            promoDiscountAmount={promoDiscountAmount}
            shippingFee={shippingFee}
            total={total}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={(orderData) => {
              setCheckoutOpen(false);
              setOrderPlaced(true);
              if (onPlaceOrder && orderData) {
                onPlaceOrder(orderData);
              }
              // Clear cart items by setting all quantities to 0
              cartList.forEach(item => onUpdateQuantity(item.id, 0));
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
