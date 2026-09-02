'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  X,
  User,
  Phone,
  Package,
  ArrowRight,
  Check,
  Star,
  Heart,
  Eye,
  Sparkles,
  Tag,
  ArrowUpRight,
} from 'lucide-react';
import Image from 'next/image';
import { STORE_CONFIG } from '../data/mockData';
import { useAuth } from '@/context/AuthContext';
import { firePartyPopper } from '@/utils/confetti';

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
const CheckoutModal = ({ cartList, subtotal, promoDiscountAmount, shippingFee, total, onClose, onSuccess, user }) => {
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState('cod');
  
  const defaultAddr = user?.addresses?.[0] || {};
  const [form, setForm] = useState({
    name: user?.name || defaultAddr.name || '',
    phone: user?.phone || defaultAddr.phone || '',
    address: defaultAddr.address || '',
    city: defaultAddr.city || 'Bangalore',
    pincode: defaultAddr.pincode || '560001',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setStep(3);

    // Trigger mini party popper celebration!
    firePartyPopper();

    const orderData = {
      id: orderId,
      userId: user?.id || user?._id || user?.email || '',
      customerName: form.name,
      customerEmail: user?.email || '',
      customerPhone: form.phone,
      items: cartList.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        selectedColor: item.selectedColor?.name || '',
        selectedSize: item.selectedSize || '',
      })),
      itemSummary: cartList.map(i => `${i.name} (x${i.quantity})`).join(', '),
      amount: total,
      status: 'processing',
      statusLabel: 'Processing',
      payMethod: payMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (UPI/Card)',
      deliveryAddress: `${form.address}, ${form.city} — ${form.pincode}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
    } catch (err) {
      console.warn('Order API dispatch warning:', err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        onSuccess(orderData);
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step !== 3 ? onClose : undefined}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal sheet */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] border border-black/5 shadow-glass-modal z-10 max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-black/[0.06] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EEEEEC] flex items-center justify-center text-[#171717]">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#171717]">
                {step === 1 ? 'Shipping Details' : step === 2 ? 'Review & Pay' : 'Order Placed! 🎉'}
              </h3>
              <p className="text-[11px] text-[#777777]">
                {step === 1 ? `Logged in as ${user?.email || 'Customer'}` : `Step ${step} of 3`}
              </p>
            </div>
          </div>
          {step !== 3 && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#EEEEEC] flex items-center justify-center text-[#171717]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Step 1: Address Form ── */}
        {step === 1 && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div>
              <label className="text-xs font-bold text-[#171717] block mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-full bg-[#EEEEEC] text-sm text-[#171717] outline-none focus:ring-2 focus:ring-[#9FD842]"
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-[#171717] block mb-1.5">Phone Number (WhatsApp)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-full bg-[#EEEEEC] text-sm text-[#171717] outline-none focus:ring-2 focus:ring-[#9FD842]"
              />
              {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-[#171717] block mb-1.5">Street Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
                placeholder="Flat / House No., Apartment name, Street"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#EEEEEC] text-sm text-[#171717] outline-none focus:ring-2 focus:ring-[#9FD842] resize-none"
              />
              {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#171717] block mb-1.5">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Bangalore"
                  className="w-full px-4 py-2.5 rounded-full bg-[#EEEEEC] text-sm text-[#171717] outline-none focus:ring-2 focus:ring-[#9FD842]"
                />
                {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-[#171717] block mb-1.5">PIN Code</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  placeholder="560001"
                  className="w-full px-4 py-2.5 rounded-full bg-[#EEEEEC] text-sm text-[#171717] outline-none focus:ring-2 focus:ring-[#9FD842]"
                />
                {errors.pincode && <p className="text-[11px] text-red-500 mt-1">{errors.pincode}</p>}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full mt-4 py-3.5 rounded-full bg-[#9FD842] text-[#171717] font-extrabold text-sm shadow-neu-btn-accent flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 2: Payment Method & Review ── */}
        {step === 2 && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <div className="p-3.5 rounded-2xl bg-[#EEEEEC] flex items-start justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-[#171717]">Delivering to:</span>
                <p className="text-[#777777] mt-0.5">{form.name} • {form.phone}</p>
                <p className="text-[#777777]">{form.address}, {form.city} — {form.pincode}</p>
              </div>
              <button onClick={() => setStep(1)} className="text-[#9FD842] font-bold hover:underline flex-shrink-0">
                Edit
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-[#171717] block mb-2">Select Payment Method</label>
              <div className="space-y-2">
                {[
                  { id: 'cod', title: 'Cash on Delivery (COD)', desc: 'Pay when your package arrives at your door' },
                  { id: 'upi', title: 'UPI / Card / NetBanking', desc: 'Instant confirmation via QR / Gateway' },
                ].map((m) => (
                  <label
                    key={m.id}
                    onClick={() => setPayMethod(m.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      payMethod === m.id
                        ? 'border-[#9FD842] bg-[#F3FCDA]/30'
                        : 'border-black/5 bg-[#EEEEEC]/50 hover:bg-[#EEEEEC]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={payMethod === m.id}
                      onChange={() => setPayMethod(m.id)}
                      className="mt-0.5 accent-[#9FD842]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#171717] block">{m.title}</span>
                      <span className="text-[11px] text-[#777777]">{m.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#EEEEEC]/60 space-y-2 text-xs">
              <div className="flex justify-between text-[#777777]">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#171717]">{STORE_CONFIG.currency}{subtotal.toLocaleString()}</span>
              </div>
              {promoDiscountAmount > 0 && (
                <div className="flex justify-between text-[#709E1E]">
                  <span>Discount</span>
                  <span className="font-bold">−{STORE_CONFIG.currency}{promoDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#777777]">
                <span>Delivery</span>
                <span className="font-bold text-[#171717]">{shippingFee === 0 ? 'FREE' : `${STORE_CONFIG.currency}${shippingFee}`}</span>
              </div>
              <div className="pt-2 border-t border-black/10 flex justify-between text-sm font-extrabold text-[#171717]">
                <span>Total Payable</span>
                <span>{STORE_CONFIG.currency}{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-full bg-[#EEEEEC] text-[#171717] font-bold text-xs"
              >
                Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="flex-2 py-3.5 rounded-full bg-[#9FD842] text-[#171717] font-extrabold text-sm shadow-neu-btn-accent flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#171717] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Success Animation ── */}
        {step === 3 && (
          <div className="p-8 text-center space-y-4 flex flex-col items-center justify-center my-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-16 h-16 rounded-full bg-[#9FD842] text-[#171717] flex items-center justify-center shadow-lg"
            >
              <Check className="w-8 h-8 stroke-[3]" />
            </motion.div>

            <h3 className="text-xl font-extrabold text-[#171717]">Order Placed Successfully! 🎉</h3>
            <p className="text-xs text-[#777777] max-w-xs leading-relaxed">
              Order <strong className="text-[#171717]">{orderId}</strong> has been saved. We will notify you on WhatsApp when it ships!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Main Cart Page ───────────────────────────────────────────────────────────
export const CartPage = ({
  cartItems = {},
  wishlist = {},
  products = [],
  onUpdateQuantity,
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  onExploreCatalog,
  onPlaceOrder,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [viewTab, setViewTab] = useState('cart'); // 'cart' | 'wishlist'

  const cartList = Object.values(cartItems).filter((item) => item.quantity > 0);
  const subtotal = cartList.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  const promoDiscountAmount = appliedPromo && VALID_PROMOS[appliedPromo]
    ? Math.round(subtotal * VALID_PROMOS[appliedPromo].discount)
    : 0;

  const shippingFee = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 99;
  const total = Math.max(0, subtotal - promoDiscountAmount + shippingFee);
  const amountToFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / SHIPPING_THRESHOLD) * 100));

  // Wishlist products resolution
  const wishlistProducts = Object.keys(wishlist)
    .filter((id) => wishlist[id])
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  // Special featured products for bottom section
  const specialProducts = products
    .filter((p) => p.isPopular || p.badgeType === 'special' || p.discountPercent >= 30)
    .slice(0, 4);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    if (VALID_PROMOS[code]) {
      setAppliedPromo(code);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try ELEC20, FASH30, HOME15, ACC25');
    }
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      openAuthModal(() => {
        setCheckoutOpen(true);
      });
    } else {
      setCheckoutOpen(true);
    }
  };

  const handleMoveWishlistToCart = (product) => {
    if (onAddToCart) onAddToCart(product);
    if (onToggleFavorite) onToggleFavorite(product);
  };

  return (
    <section className="pt-24 pb-20 px-4 sm:px-8 lg:px-12 xl:px-16 w-full max-w-[1720px] mx-auto min-h-[85vh]">
      {/* Header with Corner Emoji Toggle Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9FD842] bg-[#171717] px-3 py-1 rounded-full inline-block">
              Shopping & Saved Items
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight mt-1.5">
            {viewTab === 'cart' ? `Shopping Cart (${cartList.reduce((acc, i) => acc + i.quantity, 0)})` : `Saved Wishlist (${wishlistProducts.length})`}
          </h1>
        </div>

        {/* Playful Corner Emoji Indicator Toggle */}
        <div className="flex items-center bg-[#EEEEEC] p-1 rounded-full border border-black/5 self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setViewTab('cart')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              viewTab === 'cart'
                ? 'bg-white text-[#171717] shadow-sm'
                : 'text-[#777777] hover:text-[#171717]'
            }`}
          >
            <span>🛍️ Cart</span>
            <span className="px-1.5 py-0.2 bg-[#9FD842] text-[#171717] rounded-full text-[10px]">
              {cartList.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </button>

          <button
            onClick={() => setViewTab('wishlist')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              viewTab === 'wishlist'
                ? 'bg-white text-[#171717] shadow-sm'
                : 'text-[#777777] hover:text-[#171717]'
            }`}
          >
            <span>💖 Wishlist</span>
            {wishlistProducts.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                {wishlistProducts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── TAB 1: CART VIEW ────────────────────────────────────────── */}
      {viewTab === 'cart' && (
        <>
          {cartList.length === 0 && !orderPlaced ? (
            <div className="bg-white rounded-[32px] border border-black/5 p-10 text-center shadow-neu-card mb-12 max-w-xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-[#EEEEEC] flex items-center justify-center text-[#777777] mx-auto mb-4">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-extrabold text-[#171717]">Your Cart is Empty</h2>
              <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-sm mx-auto">
                Looks like you haven&apos;t added any items to your shopping bag yet.
              </p>
              <button
                onClick={onExploreCatalog}
                className="mt-6 px-6 py-3 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-xs shadow-neu-btn-accent active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Free Shipping Tracker */}
              <div className="bg-white rounded-[24px] border border-black/5 p-4 sm:p-5 shadow-neu-card mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-[#171717] mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#9FD842]" />
                    <span>
                      {amountToFreeShipping === 0
                        ? '🎉 You qualified for FREE Delivery!'
                        : `Add ${STORE_CONFIG.currency}${amountToFreeShipping} more to get FREE Delivery`}
                    </span>
                  </div>
                  <span className="text-[#777777]">{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#EEEEEC] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#9FD842] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                {/* LEFT: Items List */}
                <div className="lg:col-span-7 space-y-3">
                  <AnimatePresence>
                    {cartList.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[24px] border border-black/5 p-4 shadow-neu-card flex gap-4 items-center"
                      >
                        <div className="w-20 h-20 rounded-2xl bg-[#EEEEEC] overflow-hidden flex-shrink-0 relative">
                          <Image
                            src={item.image || '/assets/images/prod_headphones.jpg'}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-[#777777] uppercase">{item.categoryName}</span>
                          <h3 className="text-xs sm:text-sm font-bold text-[#171717] line-clamp-1 mt-0.5">{item.name}</h3>
                          {item.selectedSize && <span className="text-[11px] text-[#777777] bg-[#EEEEEC] px-2 py-0.5 rounded-full inline-block mt-1 mr-1">Size: {item.selectedSize}</span>}

                          <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-extrabold text-[#171717]">
                              {STORE_CONFIG.currency}{(item.price * item.quantity).toLocaleString()}
                            </span>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-[#EEEEEC] rounded-full p-1 shadow-inner">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                  className="w-6 h-6 rounded-full bg-white text-[#171717] flex items-center justify-center"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-[#171717] px-2">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 rounded-full bg-[#9FD842] text-[#171717] flex items-center justify-center font-bold"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => onUpdateQuantity(item.id, 0)}
                                className="w-7 h-7 rounded-full bg-[#EEEEEC] hover:bg-rose-50 text-[#777777] hover:text-rose-500 flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* RIGHT: Order Summary Card */}
                <div className="lg:col-span-5 sticky top-24 space-y-4">
                  <div className="bg-white rounded-[24px] border border-black/5 p-4 shadow-neu-card">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                        placeholder="Promo Code (e.g. FASH30)"
                        className="flex-1 px-4 py-2 rounded-full bg-[#EEEEEC] text-xs font-bold text-[#171717] placeholder:text-[#A0A0A0] outline-none"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 py-2 rounded-full bg-[#171717] text-white font-bold text-xs hover:bg-black transition-all"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && <p className="text-[11px] text-red-500 mt-1.5 font-medium">{promoError}</p>}
                    {appliedPromo && (
                      <div className="mt-2 flex items-center justify-between text-xs font-bold bg-[#F3FCDA] text-[#709E1E] rounded-full px-3 py-1">
                        <span>{VALID_PROMOS[appliedPromo].label}</span>
                        <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-[26px] border border-black/5 p-5 shadow-neu-card space-y-3">
                    <h3 className="text-base font-extrabold text-[#171717]">Order Summary</h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[#777777]">
                        <span>Subtotal</span>
                        <span className="font-bold text-[#171717]">{STORE_CONFIG.currency}{subtotal.toLocaleString()}</span>
                      </div>
                      {promoDiscountAmount > 0 && (
                        <div className="flex justify-between text-[#709E1E]">
                          <span>Discount</span>
                          <span className="font-bold">−{STORE_CONFIG.currency}{promoDiscountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#777777]">
                        <span>Delivery</span>
                        <span className="font-bold text-[#171717]">{shippingFee === 0 ? 'FREE' : `${STORE_CONFIG.currency}${shippingFee}`}</span>
                      </div>
                      <div className="pt-2 border-t border-black/5 flex justify-between text-base font-extrabold text-[#171717]">
                        <span>Total</span>
                        <span>{STORE_CONFIG.currency}{total.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckoutClick}
                      className="w-full mt-3 py-3.5 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-sm shadow-neu-btn-accent flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ─── TAB 2: EMBEDDED WISHLIST VIEW ─────────────────────────── */}
      {viewTab === 'wishlist' && (
        <div className="mb-12">
          {wishlistProducts.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-black/5 p-10 text-center shadow-neu-card max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-[#171717]">Your Wishlist is Empty</h3>
              <p className="text-xs text-[#777777] mt-1 max-w-xs mx-auto">
                Explore our collections and tap the heart icon on any product to save it for later.
              </p>
              <button
                onClick={onExploreCatalog}
                className="mt-5 px-6 py-2.5 rounded-full bg-[#171717] text-white font-extrabold text-xs hover:bg-black active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-[24px] border border-black/5 p-4 shadow-neu-card flex gap-4 items-center justify-between"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#EEEEEC] relative overflow-hidden flex-shrink-0">
                    <Image
                      src={prod.image || '/assets/images/prod_headphones.jpg'}
                      alt={prod.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#171717] truncate">{prod.name}</h4>
                    <span className="text-xs font-extrabold text-[#171717] block mt-0.5">
                      {STORE_CONFIG.currency}{(prod.price || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleMoveWishlistToCart(prod)}
                      className="px-3 py-1.5 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-[11px] shadow-sm active:scale-95 transition-all flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Bag</span>
                    </button>
                    <button
                      onClick={() => onToggleFavorite && onToggleFavorite(prod)}
                      className="w-7 h-7 rounded-full bg-[#EEEEEC] text-[#777777] hover:text-rose-500 flex items-center justify-center transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 4. SPECIAL PRODUCTS & EXCLUSIVE OFFERS AT THE END OF CART ─── */}
      <div className="pt-8 border-t border-black/10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3FCDA] text-[#709E1E] text-[11px] font-extrabold uppercase tracking-wide mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Special Recommendations ⭐</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight">
              Exclusive Add-Ons You May Love
            </h3>
          </div>

          <button
            onClick={onExploreCatalog}
            className="text-xs font-bold text-[#171717] hover:underline flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {specialProducts.map((prod) => {
            const isFav = !!wishlist[prod.id];
            const inCartQty = cartItems[prod.id]?.quantity || 0;
            const imgSrc = typeof prod.image === 'string' ? prod.image : prod.image?.src || prod.image || '/assets/images/prod_headphones.jpg';

            return (
              <motion.div
                key={prod.id}
                whileHover={{ y: -4 }}
                onClick={() => onQuickView && onQuickView(prod)}
                className="bg-white rounded-[24px] border border-black/5 p-3 sm:p-4 shadow-neu-card hover:shadow-neu-card-hover transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-[20px] overflow-hidden mb-2.5 bg-transparent flex items-center justify-center">
                    <Image
                      src={imgSrc}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover rounded-[20px] group-hover:scale-108 transition-transform duration-300"
                    />
                    
                    {/* Badge */}
                    {prod.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[#171717] border border-black/5 text-[9px] font-extrabold shadow-sm z-10">
                        {prod.badge}
                      </span>
                    )}

                    {/* Heart / Wishlist Like Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleFavorite) onToggleFavorite(prod);
                      }}
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
                      aria-label={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isFav
                            ? 'text-red-500 fill-red-500 stroke-red-500'
                            : 'text-[#171717] hover:text-red-500'
                        }`}
                      />
                    </button>

                    {/* Quick View Hover Badge */}
                    <div className="absolute bottom-2 inset-x-2 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[#171717] text-[10px] font-bold shadow-sm border border-black/5">
                        <Eye className="w-3 h-3 text-[#709E1E]" />
                        <span>Quick View</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-[#777777] uppercase block">{prod.categoryName || 'Product'}</span>
                  <h4 className="text-xs font-bold text-[#171717] line-clamp-1 group-hover:text-[#709E1E] transition-colors mt-0.5">
                    {prod.name}
                  </h4>
                </div>

                <div className="pt-2.5 mt-2 border-t border-black/5 flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm font-extrabold text-[#171717]">
                    {STORE_CONFIG.currency}{(prod.price || 0).toLocaleString()}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) onAddToCart(prod);
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-[11px] shadow-sm active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>{inCartQty > 0 ? `Add (${inCartQty})` : 'Add'}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutModal
            cartList={cartList}
            subtotal={subtotal}
            promoDiscountAmount={promoDiscountAmount}
            shippingFee={shippingFee}
            total={total}
            user={user}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={(orderData) => {
              setCheckoutOpen(false);
              setOrderPlaced(true);
              if (onPlaceOrder && orderData) onPlaceOrder(orderData);
              cartList.forEach(item => onUpdateQuantity(item.id, 0));
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
