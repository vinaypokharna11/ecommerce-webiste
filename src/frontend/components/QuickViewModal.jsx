import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, MessageCircle, ShieldCheck, Truck, RotateCcw, Check, Plus, Minus } from 'lucide-react';
import { STORE_CONFIG } from '../data/mockData';
import { createProductWhatsAppUrl } from '../utils/whatsapp';

export const QuickViewModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  cartQuantity = 0,
  onUpdateQuantity,
  onInquire
}) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [localQty, setLocalQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes ? product.sizes[0] : null);
      setSelectedColor(product.colors ? product.colors[0].name : null);
      setLocalQty(1);
      setIsAdded(false);
    }
  }, [product]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stockStatus === 'out_of_stock';
  const whatsappInquiryUrl = createProductWhatsAppUrl(product, selectedSize, selectedColor);

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity: localQty,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#15152A]/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window / Mobile Bottom Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-t-[32px] sm:rounded-[32px] border border-[#EAE6FD] shadow-[0_25px_60px_rgba(98,87,255,0.2)] z-10 p-6 sm:p-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-[#FAF9FF] hover:bg-[#F1EFFF] text-[#626276] hover:text-[#15152A] flex items-center justify-center transition-colors shadow-sm z-20"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center">
            
            {/* Left Column: Product Image Gallery */}
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-[#F5F3FF] via-[#FAF9FF] to-[#FFF0FB] p-6 flex items-center justify-center overflow-hidden border border-[#EAE6FD]">
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-[#6257FF] border border-[#EAE6FD] shadow-sm">
                  {product.badge}
                </span>
              )}

              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain drop-shadow-[0_12px_30px_rgba(98,87,255,0.18)]"
              />

              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                  <span className="px-4 py-1.5 rounded-full bg-[#15152A] text-white font-bold text-sm">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Product Details & Controls */}
            <div>
              {/* Category & Title */}
              <div className="mb-3">
                <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">
                  {product.categoryName}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#15152A] mt-1 leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Rating & Stock Status */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-1 bg-[#FAF9FF] px-2.5 py-1 rounded-full border border-[#EAE6FD]">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-[#15152A]">{product.rating}</span>
                  <span className="text-xs text-[#8E8EA0]">({product.reviews} reviews)</span>
                </div>

                {isOutOfStock ? (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Out of Stock
                  </span>
                ) : product.stockStatus === 'low_stock' ? (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Only {product.stockCount} left in stock
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock (Ready to dispatch)
                  </span>
                )}
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-[#EAE6FD]">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#15152A]">
                  {STORE_CONFIG.currency}{product.price.toLocaleString()}
                </span>
                {product.oldPrice && (
                  <span className="text-base font-medium text-[#A0A0B2] line-through">
                    {STORE_CONFIG.currency}{product.oldPrice.toLocaleString()}
                  </span>
                )}
                {product.discountPercent && (
                  <span className="text-xs font-bold text-[#EC5AC8] bg-[#FFF0FB] px-2 py-0.5 rounded-full border border-[#FCD6F2]">
                    Save {product.discountPercent}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#626276] leading-relaxed mb-5">
                {product.description}
              </p>

              {/* Dynamic Variation: Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#15152A] mb-2">
                    <span>Select Size</span>
                    <span className="text-[#8B5CF6]">Size Guide</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedSize === size
                            ? 'bg-[#6257FF] text-white shadow-sm ring-2 ring-[#6257FF]/30'
                            : 'bg-[#FAF9FF] text-[#15152A] hover:bg-[#EDE9FE] border border-[#EAE6FD]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Variation: Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-5">
                  <div className="text-xs font-semibold text-[#15152A] mb-2">
                    <span>Color: </span>
                    <span className="font-bold text-[#6257FF]">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-7 h-7 rounded-full transition-transform border-2 ${
                          selectedColor === color.name
                            ? 'scale-115 ring-2 ring-[#6257FF] ring-offset-2 border-white'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        aria-label={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & CTA Row */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center bg-[#F5F3FF] border border-[#EAE6FD] rounded-xl p-1">
                    <button
                      onClick={() => setLocalQty(Math.max(1, localQty - 1))}
                      className="w-8 h-8 rounded-lg bg-white text-[#15152A] hover:bg-purple-100 flex items-center justify-center shadow-xs"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 text-[#6257FF]" />
                    </button>
                    <span className="text-sm font-bold text-[#15152A] px-3">
                      {localQty}
                    </span>
                    <button
                      onClick={() => setLocalQty(localQty + 1)}
                      className="w-8 h-8 rounded-lg bg-[#6257FF] text-white hover:bg-[#4F46E5] flex items-center justify-center shadow-xs"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAdd}
                    disabled={isOutOfStock || isAdded}
                    className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-btn transition-all duration-300 ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'gradient-btn-primary text-white hover:scale-[1.02] active:scale-98'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart ✓</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add {localQty > 1 ? `(${localQty})` : ''} to Cart</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Primary WhatsApp Order / Inquiry Button */}
                <div className="flex gap-2">
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
                    <span>Ask on WhatsApp</span>
                  </a>

                  {onInquire && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onInquire(product);
                      }}
                      className="py-3 px-4 rounded-2xl bg-[#FFF0FB] hover:bg-[#FCE7F3] border border-[#FCD6F2] text-[#EC5AC8] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                      title="Bulk or Custom Quote Inquiry"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Bulk Quote</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Local Trust Badges */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-[#EAE6FD] text-[11px] text-[#626276] text-center">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#6257FF]" />
                  <span>100% Genuine</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-[#EC5AC8]" />
                  <span>Easy Exchange</span>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
