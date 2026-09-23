'use client';

import React, { useState, useEffect } from 'react';
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
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { STORE_CONFIG } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { useCatalog } from '@/context/CatalogContext';
import { firePartyPopper } from '@/utils/confetti';
import { orderService } from '@/services/orderService';
import { offerService } from '@/services/offerService';
import { formatPrice } from '@/utils/formatPrice';
import { getProductSizes, isProductSizeAvailable, getProductColors, getProductColorHex } from '@/utils/productOptions';
import { createCartWhatsAppUrl } from '@/utils/whatsapp';

const SHIPPING_THRESHOLD = 999;

// ─── Checkout Modal ───────────────────────────────────────────────────────────
const CheckoutModal = ({ cartList, products = [], subtotal, promoDiscountAmount, shippingFee, total, couponCode = '', onClose, onSuccess, user }) => {
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState('cod');
  
  const defaultAddr = user?.addresses?.[0] || {};
  const [form, setForm] = useState({
    name: user?.name || defaultAddr.name || '',
    phone: user?.phone || defaultAddr.phone || '',
    address: defaultAddr.address || '',
    city: defaultAddr.city || 'Vapi',
    pincode: defaultAddr.pincode || '396195',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');

    const orderData = {
      id: orderId,
      userId: user?.id || user?._id || user?.email || '',
      customerName: form.name,
      customerEmail: user?.email || '',
      customerPhone: form.phone,
      items: cartList.map(item => {
        const fullProduct = products?.find((p) => p.id === item.id || p.id === item.productId) || item;
        const availableSizes = getProductSizes(fullProduct);
        const itemSize = (availableSizes.length > 0) ? (item.selectedSize || availableSizes[0]) : '';
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedColor: item.selectedColor?.name || '',
          selectedSize: itemSize,
        };
      }),
      itemSummary: cartList.map(i => {
        const fullProduct = products?.find((p) => p.id === i.id || p.id === i.productId) || i;
        const availableSizes = getProductSizes(fullProduct);
        const itemSize = (availableSizes.length > 0) ? (i.selectedSize || availableSizes[0]) : '';
        return `${i.name}${itemSize ? ` (Size: ${itemSize})` : ''} (x${i.quantity})`;
      }).join(', '),
      amount: total,
      couponCode: couponCode ? String(couponCode).trim().toUpperCase() : '',
      status: 'pending',
      statusLabel: 'Pending',
      payMethod: payMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (UPI/Card)',
      deliveryAddress: `${form.address}, ${form.city} — ${form.pincode}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    try {
      const createdOrder = await orderService.createOrder(orderData);
      // ONLY advance to Step 3 and trigger celebration if backend creation succeeded
      setStep(3);
      firePartyPopper();
      setIsSubmitting(false);
      setTimeout(() => {
        onSuccess(createdOrder || orderData);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Order creation failed:', err);
      setIsSubmitting(false);
      setSubmitError(err.message || 'Unable to place order. Please check item stock and try again.');
    }
  };

  // Lock background window and document scroll while checkout modal is open
  useEffect(() => {
    const scrollY = window.scrollY;
    const origBodyPosition = document.body.style.position;
    const origBodyTop = document.body.style.top;
    const origBodyWidth = document.body.style.width;
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && step !== 3) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow || '';
      document.body.style.position = origBodyPosition || '';
      document.body.style.top = origBodyTop || '';
      document.body.style.width = origBodyWidth || '';
      document.body.style.overflow = origBodyOverflow || '';
      window.scrollTo(0, scrollY);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, step]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-none touch-none sm:touch-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step !== 3 ? onClose : undefined}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm touch-none overscroll-none"
      />

      {/* Modal sheet */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-[32px] border border-black/5 shadow-glass-modal z-10 max-h-[90vh] sm:max-h-[86vh] flex flex-col overflow-hidden overscroll-contain"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F]">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#1D1D1F]">
                {step === 1 ? 'Shipping Details' : step === 2 ? 'Review & Pay' : 'Order Placed! 🎉'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#777777]">
                {step === 1 ? `Logged in as ${user?.email || 'Customer'}` : `Step ${step} of 3`}
              </p>
            </div>
          </div>
          {step !== 3 && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Step 1: Address Form ── */}
        {step === 1 && (
          <>
            <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-3.5 sm:space-y-4 flex-1 min-h-0">
              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-full bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white transition-all"
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-full bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white transition-all"
                />
                {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">Street Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  placeholder="Flat / House No., Apartment name, Street"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white resize-none transition-all"
                />
                {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1D1D1F] block mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Vapi"
                    className="w-full px-4 py-2.5 rounded-full bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white transition-all"
                  />
                  {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1D1D1F] block mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="396195"
                    className="w-full px-4 py-2.5 rounded-full bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white transition-all"
                  />
                  {errors.pincode && <p className="text-[11px] text-red-500 mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-white flex-shrink-0">
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-extrabold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Payment Method & Review ── */}
        {step === 2 && (
          <>
            <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-4 sm:space-y-5 flex-1 min-h-0">
              {submitError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}
              {submitError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}
              {/* Order Items Review with Size */}
              <div className="p-3.5 rounded-2xl bg-[#F5F5F7]/80 border border-black/5 space-y-2">
                <span className="text-xs font-bold text-[#1D1D1F] block">
                  Order Items ({cartList.length})
                </span>
                <div className="divide-y divide-black/5 space-y-1.5">
                  {cartList.map((item) => {
                    const fullProduct = products?.find((p) => p.id === item.id || p.id === item.productId) || item;
                    const availableSizes = getProductSizes(fullProduct);
                    const itemSize = (availableSizes.length > 0) ? (item.selectedSize || availableSizes[0]) : '';
                    return (
                      <div key={item.id} className="pt-1.5 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-[#1D1D1F] truncate">{item.name}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#777777] mt-0.5 flex-wrap">
                            <span>Qty: {item.quantity}</span>
                            {itemSize && (
                              <span className="bg-white px-2 py-0.5 rounded-full border border-black/5 font-semibold text-[#1D1D1F]">
                                Size: {itemSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="bg-white px-2 py-0.5 rounded-full border border-black/5 font-semibold text-[#1D1D1F] flex items-center gap-1">
                                <span
                                  className="w-2 h-2 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: getProductColorHex(fullProduct, item.selectedColor) }}
                                />
                                Color: {item.selectedColor}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-extrabold text-[#1D1D1F] shrink-0">
                          {formatPrice((item.price || 0) * item.quantity, STORE_CONFIG.currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivering To Address Card */}
              <div className="p-3.5 rounded-2xl bg-[#F5F5F7]/80 border border-black/5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#1D1D1F]">Delivering to:</span>
                  <p className="text-[#777777] mt-0.5">{form.name} • {form.phone}</p>
                  <p className="text-[#777777]">{form.address}, {form.city} — {form.pincode}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-[#0071E3] font-bold hover:underline flex-shrink-0 cursor-pointer">
                  Edit
                </button>
              </div>

              {/* Select Payment Method */}
              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-2">Select Payment Method</label>
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
                          ? 'border-[#1D1D1F] bg-[#EBF5FF]/30'
                          : 'border-black/5 bg-[#F5F5F7]/40 hover:bg-[#F5F5F7]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={payMethod === m.id}
                        onChange={() => setPayMethod(m.id)}
                        className="mt-0.5 accent-[#1D1D1F]"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#1D1D1F] block">{m.title}</span>
                        <span className="text-[11px] text-[#777777]">{m.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/60 border border-black/5 space-y-2 text-xs">
                <div className="flex justify-between text-[#777777]">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-[#1D1D1F]">{formatPrice(subtotal, STORE_CONFIG.currency)}</span>
                </div>
                {promoDiscountAmount > 0 && (
                  <div className="flex justify-between text-[#0071E3]">
                    <span>Discount</span>
                    <span className="font-bold">−{formatPrice(promoDiscountAmount, STORE_CONFIG.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#777777]">
                  <span>Delivery</span>
                  <span className="font-bold text-[#1D1D1F]">{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee, STORE_CONFIG.currency)}</span>
                </div>
                <div className="pt-2 border-t border-black/10 flex justify-between text-sm font-extrabold text-[#1D1D1F]">
                  <span>Total Payable</span>
                  <span>{formatPrice(total, STORE_CONFIG.currency)}</span>
                </div>
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-white flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-bold text-xs hover:bg-[#E5E5EA] transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-extrabold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Place Order ({formatPrice(total, STORE_CONFIG.currency)})</span>
                    <Check className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Success Animation ── */}
        {step === 3 && (
          <div className="p-8 text-center space-y-4 flex flex-col items-center justify-center my-auto flex-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-16 h-16 rounded-full bg-[#34C759] text-white flex items-center justify-center shadow-lg"
            >
              <Check className="w-8 h-8 stroke-[3]" />
            </motion.div>

            <h3 className="text-xl font-extrabold text-[#1D1D1F]">Order Placed Successfully! 🎉</h3>
            <p className="text-xs text-[#777777] max-w-xs leading-relaxed">
              Order <strong className="text-[#1D1D1F]">{orderId}</strong> has been saved. We will notify you on WhatsApp when it ships!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Main Cart Page ───────────────────────────────────────────────────────────
export const CartPage = ({
  initialTab = 'cart',
  cartItems = {},
  wishlist = {},
  products = [],
  onUpdateQuantity,
  onUpdateSize,
  onUpdateColor,
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  onExploreCatalog,
  onPlaceOrder,
}) => {
  const { storeConfig, products: liveCatalogProducts } = useCatalog();
  const effectiveProducts = (liveCatalogProducts && liveCatalogProducts.length > 0) ? liveCatalogProducts : products;
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [viewTab, setViewTab] = useState(initialTab || 'cart'); // 'cart' | 'wishlist'
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    if (initialTab && (initialTab === 'cart' || initialTab === 'wishlist')) {
      setViewTab(initialTab);
    }
  }, [initialTab]);

  const handleViewTabChange = (tab) => {
    setViewTab(tab);
    if (typeof window !== 'undefined') {
      window.history.replaceState({ tab }, '', `/?tab=${tab}`);
    }
  };

  const cartList = Object.values(cartItems).filter((item) => item.quantity > 0);
  const subtotal = cartList.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  // Revalidate availability against live catalog
  const unavailableItems = cartList.filter((item) => {
    const p = effectiveProducts.find((prod) => String(prod.id).trim() === String(item.id || item.productId).trim());
    return !p || p.isDeleted || p.status === 'inactive' || p.status === 'archived' || p.stockCount <= 0 || p.stockCount < item.quantity;
  });

  // Dynamic server-verified coupon discount calculation
  const promoDiscountAmount = (() => {
    if (!appliedCoupon) return 0;
    const cat = (appliedCoupon.category || 'all').toLowerCase();
    let eligibleSub = subtotal;
    if (cat !== 'all') {
      const eligibleItems = cartList.filter((item) => {
        const itemCat = (item.category || item.categoryId || '').toLowerCase();
        return itemCat === cat || itemCat.includes(cat) || cat.includes(itemCat);
      });
      eligibleSub = eligibleItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    }
    return Math.round((eligibleSub * (appliedCoupon.discountPercent || 0)) / 100);
  })();

  const shippingFee = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 99;
  const total = Math.max(0, subtotal - promoDiscountAmount + shippingFee);
  const amountToFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / SHIPPING_THRESHOLD) * 100));

  // Wishlist products resolution
  const wishlistProducts = Object.keys(wishlist)
    .filter((id) => wishlist[id])
    .map((id) => {
      const found = effectiveProducts.find((p) => p.id === id || p.id === (wishlist[id]?.productId));
      if (found) return found;
      const raw = wishlist[id];
      if (raw && typeof raw === 'object') {
        return {
          id: raw.productId || id,
          name: raw.productName || raw.name || 'Product',
          price: raw.productPrice || raw.price || 0,
          image: raw.productImage || raw.image || '',
          category: raw.productCategory || raw.category || 'all',
          categoryName: raw.productCategory || raw.categoryName || 'General',
          ...raw,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Special featured products for bottom section
  const specialProducts = effectiveProducts
    .filter((p) => p.isPopular || p.badgeType === 'special' || p.discountPercent >= 30)
    .slice(0, 4);

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a coupon code.');
      return;
    }
    if (cartList.length === 0) {
      setPromoError('Your cart is empty. Add items to apply a coupon.');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');

    try {
      const res = await offerService.validateCoupon(code, cartList, subtotal);
      if (res && res.valid) {
        setAppliedCoupon({
          code: res.coupon.code,
          title: res.coupon.title,
          category: res.coupon.category || 'all',
          discountPercent: res.discountPercent,
          discountAmount: res.discountAmount,
          label: `${res.coupon.code} (${res.discountPercent}% OFF)`,
        });
        setPromoError('');
      } else {
        setAppliedCoupon(null);
        setPromoError(res?.message || 'Invalid coupon code.');
      }
    } catch (err) {
      setAppliedCoupon(null);
      const msg = err.data?.message || err.message || 'Invalid coupon code. Please try another offer.';
      setPromoError(msg);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleCheckoutClick = async () => {
    if (unavailableItems.length > 0) {
      setPromoError(`Cannot checkout: "${unavailableItems[0].name}" is unavailable or out of stock. Please remove it to proceed.`);
      return;
    }

    // If a coupon is applied, re-validate with backend before opening checkout to prevent stale discounts
    if (appliedCoupon) {
      try {
        const res = await offerService.validateCoupon(appliedCoupon.code, cartList, subtotal);
        if (!res || !res.valid) {
          setAppliedCoupon(null);
          setPromoError('This coupon is no longer available. Please remove it and try another offer.');
          return;
        }
      } catch (err) {
        setAppliedCoupon(null);
        setPromoError(err.data?.message || 'This coupon is no longer available. Please remove it and try another offer.');
        return;
      }
    }

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
    <section className="pt-16 xs:pt-18 sm:pt-24 pb-28 sm:pb-20 px-3 xs:px-4 sm:px-8 lg:px-12 w-full max-w-[1440px] mx-auto min-h-[85vh] bg-[#FBFBFD] text-[#1D1D1F]">
      {/* Header with Apple Style Toggle Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1D1D1F] tracking-tight font-sans">
            {viewTab === 'cart' ? `Shopping Cart (${cartList.reduce((acc, i) => acc + i.quantity, 0)})` : `Saved Wishlist (${wishlistProducts.length})`}
          </h1>
        </div>

        {/* Apple Style Pill Toggle */}
        <div className="flex items-center bg-[#F5F5F7] p-1 rounded-full border border-black/[0.06] self-start sm:self-auto shadow-xs">
          <button
            onClick={() => handleViewTabChange('cart')}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewTab === 'cart'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
          >
            <span>🛍️ Cart</span>
            <span className="px-1.5 py-0.2 bg-[#1D1D1F] text-white rounded-full text-[10px]">
              {cartList.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </button>

          <button
            onClick={() => handleViewTabChange('wishlist')}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewTab === 'wishlist'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
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
            <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-black/[0.06] p-10 text-center shadow-sm mb-12 max-w-xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#777777] mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-[#1D1D1F]" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1D1D1F]">Your Cart is Empty</h2>
              <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-sm mx-auto">
                Looks like you haven&apos;t added any items to your shopping bag yet.
              </p>
              <button
                onClick={onExploreCatalog}
                className="mt-6 px-6 py-3 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Free Shipping Tracker */}
              <div className="bg-white/95 backdrop-blur-md rounded-[24px] border border-black/[0.06] p-4 sm:p-5 shadow-sm mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-[#1D1D1F] mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#0071E3]" />
                    <span>
                      {amountToFreeShipping === 0
                        ? '🎉 You qualified for FREE Delivery!'
                        : `Add ${STORE_CONFIG.currency}${amountToFreeShipping} more to get FREE Delivery`}
                    </span>
                  </div>
                  <span className="text-[#777777]">{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#0071E3] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start mb-12">
                {/* LEFT: Items List */}
                <div className="lg:col-span-7 space-y-3">
                  <AnimatePresence>
                    {cartList.map((item) => {
                      const fullProduct = effectiveProducts?.find((p) => p.id === item.id || p.id === item.productId) || item;
                      const liveProduct = effectiveProducts?.find((p) => p.id === item.id || p.id === item.productId);
                      const isUnavailable = !liveProduct || liveProduct.isDeleted || liveProduct.status === 'inactive' || liveProduct.status === 'archived';
                      const isOutOfStock = !isUnavailable && (liveProduct.stockCount <= 0 || liveProduct.stockStatus === 'out_of_stock');
                      const isStockInsufficient = !isUnavailable && !isOutOfStock && liveProduct.stockCount < item.quantity;
                      const availableSizes = getProductSizes(fullProduct);
                      const activeSize = item.selectedSize || (availableSizes.length > 0 ? availableSizes[0] : null);
                      const isSelected = selectedItemId === item.id;

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => {
                            setSelectedItemId(item.id);
                            if (onQuickView && !isUnavailable) onQuickView(fullProduct);
                          }}
                          className={`bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[24px] border p-3 sm:p-4 shadow-sm flex gap-3 sm:gap-4 items-center cursor-pointer hover:shadow-md transition-all duration-200 group ${
                            isUnavailable || isOutOfStock ? 'border-rose-200 bg-rose-50/20' : 'border-black/[0.06] hover:border-black/20'
                          }`}
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-[#F5F5F7] overflow-hidden shrink-0 relative">
                            <Image
                              src={item.image || '/assets/images/prod_headphones.jpg'}
                              alt={item.name}
                              fill
                              sizes="80px"
                              className={`object-cover ${isUnavailable || isOutOfStock ? 'grayscale opacity-75' : ''}`}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isUnavailable && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                  Unavailable
                                </span>
                              )}
                              {isOutOfStock && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                  Out of Stock
                                </span>
                              )}
                              {isStockInsufficient && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  Only {liveProduct.stockCount} in stock
                                </span>
                              )}
                            </div>
                            <h3 className={`text-xs sm:text-sm font-bold mt-0.5 ${isUnavailable || isOutOfStock ? 'text-rose-700 line-through' : 'text-[#1D1D1F]'}`}>{item.name}</h3>

                            {/* Size Option Selector (Only for Clothing & Shoes) */}
                            {availableSizes.length > 0 && (
                              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider">
                                  Size:
                                </span>
                                <div className="flex flex-wrap items-center gap-1">
                                  {availableSizes.map((sz) => {
                                    const isAvailable = isProductSizeAvailable(fullProduct, sz);
                                    const isSzSelected = activeSize === sz;
                                    return (
                                      <button
                                        key={sz}
                                        type="button"
                                        disabled={!isAvailable}
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          if (isAvailable && onUpdateSize) onUpdateSize(item.id, sz); 
                                        }}
                                        title={isAvailable ? `Select Size ${sz}` : `Size ${sz} is out of stock`}
                                        className={`relative overflow-hidden px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                                          !isAvailable
                                            ? 'bg-black/[0.03] text-[#86868B] border border-dashed border-black/15 cursor-not-allowed opacity-50'
                                            : isSzSelected
                                            ? 'bg-[#1D1D1F] text-white shadow-xs scale-105 cursor-pointer'
                                            : 'bg-[#F5F5F7] text-[#555555] hover:bg-[#E8E8ED] hover:text-[#1D1D1F] border border-black/5 cursor-pointer'
                                        }`}
                                      >
                                        <span>{sz}</span>
                                        {!isAvailable && (
                                          <svg
                                            className="absolute inset-0 w-full h-full pointer-events-none text-black/40"
                                            viewBox="0 0 100 100"
                                            preserveAspectRatio="none"
                                            aria-hidden="true"
                                          >
                                            <line
                                              x1="0"
                                              y1="100"
                                              x2="100"
                                              y2="0"
                                              stroke="currentColor"
                                              strokeWidth="1.5"
                                              vectorEffect="non-scaling-stroke"
                                            />
                                          </svg>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Color Option Selector (if product has colors) */}
                            {(() => {
                              const productColors = getProductColors(fullProduct);
                              const activeColor = item.selectedColor || (productColors.length === 1 ? productColors[0].name : null);
                              if (productColors.length === 0 && !item.selectedColor) return null;

                              return (
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider">
                                    Color:
                                  </span>
                                  {productColors.length > 0 ? (
                                    <div className="flex flex-wrap items-center gap-1">
                                      {productColors.map((c) => {
                                        const isColSelected = String(activeColor || '').toLowerCase() === c.name.toLowerCase();
                                        return (
                                          <button
                                            key={c.name}
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (onUpdateColor) onUpdateColor(item.id, c.name);
                                            }}
                                            title={`Select Color: ${c.name}`}
                                            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                              isColSelected
                                                ? 'bg-[#1D1D1F] text-white shadow-xs scale-105 ring-1 ring-[#1D1D1F]'
                                                : 'bg-[#F5F5F7] text-[#555555] hover:bg-[#E8E8ED] hover:text-[#1D1D1F] border border-black/5'
                                            }`}
                                          >
                                            <span
                                              className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                                              style={{ backgroundColor: c.hex }}
                                            />
                                            <span className="uppercase text-[10px]">{c.name}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-[#F5F5F7] px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#1D1D1F]">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full border border-black/15"
                                        style={{ backgroundColor: getProductColorHex(fullProduct, item.selectedColor) }}
                                      />
                                      <span className="uppercase text-[10px]">{item.selectedColor}</span>
                                    </span>
                                  )}
                                </div>
                              );
                            })()}

                          <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-extrabold text-[#1D1D1F]">
                              {formatPrice(item.price * item.quantity, STORE_CONFIG.currency)}
                            </span>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-[#F5F5F7] rounded-full p-1 shadow-inner">
                                <button
                                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity - 1); }}
                                  className="w-6 h-6 rounded-full bg-white text-[#1D1D1F] flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-[#1D1D1F] px-2">
                                  {item.quantity}
                                </span>
                                {(() => {
                                  const maxStock = typeof fullProduct?.stockCount === 'number'
                                    ? Math.max(0, fullProduct.stockCount)
                                    : (typeof item.stockCount === 'number' ? Math.max(0, item.stockCount) : 99);

                                  return (
                                    <button
                                      disabled={item.quantity >= maxStock}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (item.quantity >= maxStock) return;
                                        onUpdateQuantity(item.id, Math.min(maxStock, item.quantity + 1));
                                      }}
                                      className="w-6 h-6 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center font-bold hover:bg-[#000000] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                      title={item.quantity >= maxStock ? `Only ${maxStock} in stock` : 'Increase quantity'}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  );
                                })()}
                              </div>

                              <button
                                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, 0); }}
                                className="w-7 h-7 rounded-full bg-[#F5F5F7] hover:bg-rose-50 text-[#777777] hover:text-rose-500 flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* RIGHT: Order Summary Card */}
                <div className="lg:col-span-5 sticky top-24 space-y-4">
                  <div className="bg-white/95 backdrop-blur-md rounded-[24px] border border-black/[0.06] p-4 shadow-sm">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                        placeholder="Promo Code (e.g. FASH30)"
                        disabled={isApplyingPromo}
                        className="flex-1 px-4 py-2.5 rounded-full bg-[#F5F5F7]/70 border border-black/5 text-xs font-bold text-[#1D1D1F] placeholder:text-[#888888] outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white transition-all disabled:opacity-60"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={isApplyingPromo}
                        className="px-5 py-2.5 rounded-full bg-[#1D1D1F] text-white font-bold text-xs hover:bg-black transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isApplyingPromo ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p className="text-[11px] text-red-500 mt-1.5 font-medium">{promoError}</p>}
                    {appliedCoupon && (
                      <div className="mt-2 flex items-center justify-between text-xs font-bold bg-[#EBF5FF] text-[#0071E3] rounded-full px-3 py-1">
                        <span>{appliedCoupon.label}</span>
                        <button onClick={() => { setAppliedCoupon(null); setPromoCode(''); setPromoError(''); }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/95 backdrop-blur-md rounded-[26px] border border-black/[0.06] p-5 sm:p-6 shadow-sm space-y-3">
                    <h3 className="text-base font-extrabold text-[#1D1D1F]">Order Summary</h3>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between text-[#666666]">
                        <span>Subtotal</span>
                        <span className="font-bold text-[#1D1D1F]">{formatPrice(subtotal, STORE_CONFIG.currency)}</span>
                      </div>
                      {promoDiscountAmount > 0 && (
                        <div className="flex justify-between text-[#0071E3]">
                          <span>Discount</span>
                          <span className="font-bold">−{formatPrice(promoDiscountAmount, STORE_CONFIG.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#666666]">
                        <span>Delivery</span>
                        <span className="font-bold text-[#1D1D1F]">{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee, STORE_CONFIG.currency)}</span>
                      </div>
                      <div className="pt-2.5 border-t border-black/[0.06] flex justify-between text-base font-extrabold text-[#1D1D1F]">
                        <span>Total</span>
                        <span>{formatPrice(total, STORE_CONFIG.currency)}</span>
                      </div>
                    </div>

                    {unavailableItems.length > 0 && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Items Unavailable</span>
                          <span>Some items in your bag are no longer available or out of stock. Please remove them to proceed.</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleCheckoutClick}
                      disabled={unavailableItems.length > 0}
                      className="w-full mt-3 py-3.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-extrabold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
            <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-black/[0.06] p-10 text-center shadow-sm max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-[#1D1D1F]">Your Wishlist is Empty</h3>
              <p className="text-xs text-[#666666] mt-1 max-w-xs mx-auto">
                Explore our collections and tap the heart icon on any product to save it for later.
              </p>
              <button
                onClick={onExploreCatalog}
                className="mt-5 px-6 py-2.5 rounded-full bg-[#1D1D1F] text-white font-extrabold text-xs hover:bg-black active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
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
                  onClick={() => onQuickView && onQuickView(prod)}
                  className="bg-white/95 backdrop-blur-md rounded-[24px] border border-black/[0.06] p-4 shadow-sm flex gap-4 items-center justify-between cursor-pointer hover:border-black/20 hover:shadow-md transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] relative overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Image
                      src={prod.image || '/assets/images/prod_headphones.jpg'}
                      alt={prod.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#1D1D1F] truncate group-hover:text-[#0071E3] transition-colors">{prod.name}</h4>
                    <span className="text-xs font-extrabold text-[#1D1D1F] block mt-0.5">
                      {formatPrice(prod.price, STORE_CONFIG.currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleMoveWishlistToCart(prod)}
                      className="px-3 py-1.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-extrabold text-[11px] shadow-sm active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Bag</span>
                    </button>
                    <button
                      onClick={() => onToggleFavorite && onToggleFavorite(prod)}
                      className="w-7 h-7 rounded-full bg-[#F5F5F7] text-[#777777] hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
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


      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutModal
            cartList={cartList}
            products={effectiveProducts}
            subtotal={subtotal}
            promoDiscountAmount={promoDiscountAmount}
            shippingFee={shippingFee}
            total={total}
            couponCode={appliedCoupon?.code || ''}
            user={user}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={(orderData) => {
              setCheckoutOpen(false);
              setOrderPlaced(true);
              setAppliedCoupon(null);
              if (onPlaceOrder && orderData) onPlaceOrder(orderData);
              cartList.forEach(item => onUpdateQuantity(item.id, 0));
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── Cart Item Popup Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedItemId && (() => {
          const selItem = cartList.find(i => i.id === selectedItemId);
          if (!selItem) return null;
          const selProduct = products?.find((p) => p.id === selItem.id || p.id === selItem.productId) || selItem;
          const selSizes = getProductSizes(selProduct);
          const selActiveSize = selItem.selectedSize || (selSizes.length > 0 ? selSizes[0] : null);
          return (
            <motion.div
              key="cart-item-popup-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItemId(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                key="cart-item-popup"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-[28px] shadow-2xl border border-black/[0.06] w-full max-w-sm overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedItemId(null)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[#1D1D1F]" />
                </button>

                {/* Product Image */}
                <div className="relative w-full h-52 bg-[#F5F5F7]">
                  <Image
                    src={selItem.image || '/assets/images/prod_headphones.jpg'}
                    alt={selItem.name}
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                  {selProduct?.discountPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md">
                      {selProduct.discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Name */}
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1D1D1F] mt-0.5 leading-tight">
                      {selItem.name}
                    </h3>
                    {selProduct?.brand && (
                      <p className="text-xs text-[#888888] mt-0.5">by {selProduct.brand}</p>
                    )}
                  </div>

                  {/* Price Row */}
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-extrabold text-[#1D1D1F]">
                      {formatPrice(selItem.price * selItem.quantity, STORE_CONFIG.currency)}
                    </span>
                    {selItem.quantity > 1 && (
                      <span className="text-xs text-[#888888] mb-1">
                        {formatPrice(selItem.price, STORE_CONFIG.currency)} each
                      </span>
                    )}
                  </div>

                  {/* Detail Chips */}
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F7] text-xs font-bold text-[#1D1D1F]">
                      <Package className="w-3 h-3" />
                      Qty: {selItem.quantity}
                    </span>
                    {selActiveSize && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F7] text-xs font-bold text-[#1D1D1F]">
                        <Tag className="w-3 h-3" />
                        Size: {selActiveSize}
                      </span>
                    )}
                    {selItem.selectedColor && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F7] text-xs font-bold text-[#1D1D1F]">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: getProductColorHex(selProduct, selItem.selectedColor) }}
                        />
                        Color: {selItem.selectedColor}
                      </span>
                    )}
                    {selProduct?.isPopular && (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {selProduct?.description && (
                    <p className="text-xs text-[#666666] leading-relaxed border-t border-black/[0.06] pt-3">
                      {selProduct.description}
                    </p>
                  )}

                  {/* Action Row */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setSelectedItemId(null)}
                      className="flex-1 py-3 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-bold text-xs hover:bg-[#E5E5EA] transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => { onUpdateQuantity(selItem.id, 0); setSelectedItemId(null); }}
                      className="px-4 py-3 rounded-full bg-rose-50 text-rose-500 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
};

export default CartPage;
