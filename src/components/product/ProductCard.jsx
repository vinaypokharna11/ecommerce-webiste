'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { getProductColors, getProductSizes } from '@/utils/productOptions';
import { STORE_CONFIG } from '@/data/constants';

export const ProductCardComponent = ({
  product,
  quantity = 0,
  selectedSize: externalSize = null,
  selectedColor: externalColor = null,
  isFavorite = false,
  onAddToCart,
  onUpdateQuantity,
  onUpdateSize,
  onToggleFavorite,
  onQuickView,
  onWhatsAppInquiry,
  onNotify,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedColor, setSelectedColor] = useState(externalColor || null);
  const [selectedSize, setSelectedSize] = useState(externalSize || null);
  const [activeColorIdx, setActiveColorIdx] = useState(0);

  if (!product) return null;

  // Extract images
  const allImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images.filter(Boolean)
    : (product.image ? [product.image] : []);

  const primaryImage = allImages[0] || product.image || '/assets/images/prod_backpack.jpg';
  const secondaryImage = allImages.length > 1 ? allImages[1] : null;

  // Extract colors and sizes
  const colors = getProductColors(product);
  const sizes = getProductSizes(product);

  const isOutOfStock =
    product.stockStatus === 'out_of_stock' ||
    (typeof product.stockCount === 'number' && product.stockCount <= 0);

  const handleCardClick = (e) => {
    if (onQuickView) {
      onQuickView(product);
    } else {
      router.push(`/product/${product.id}`);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product);
    }
  };

  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleColorClick = (e, col, idx) => {
    e.stopPropagation();
    setActiveColorIdx(idx);
    setSelectedColor(col.name);
  };

  const handleSizeClick = (e, size) => {
    e.stopPropagation();
    const newSize = selectedSize === size ? null : size;
    setSelectedSize(newSize);
    if (onUpdateSize) {
      onUpdateSize(product.id, newSize);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (isOutOfStock) {
      if (onWhatsAppInquiry) onWhatsAppInquiry(product);
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      if (onNotify) {
        onNotify('error', 'Select Size First ⚠️', `Please select a size for ${product.name} before adding to cart.`);
      }
      return;
    }

    const effectiveColor = selectedColor || (colors.length > 0 ? colors[0].name : '');
    const effectiveSize = selectedSize || (sizes.length === 1 ? sizes[0] : null);

    if (onAddToCart) {
      onAddToCart({
        ...product,
        selectedColor: effectiveColor,
        selectedSize: effectiveSize,
        selectedVariant: [effectiveColor, effectiveSize].filter(Boolean).join(' / ') || effectiveSize || effectiveColor || '',
      });
    }
  };

  const handleDecreaseQuantity = (e) => {
    e.stopPropagation();
    if (onUpdateQuantity) {
      onUpdateQuantity(product.id, quantity - 1);
    }
  };

  const handleIncreaseQuantity = (e) => {
    e.stopPropagation();
    const maxStock = typeof product.stockCount === 'number' ? Math.max(0, product.stockCount) : 99;
    if (quantity >= maxStock) {
      if (onNotify) {
        onNotify('info', 'Stock Limit Reached ⚠️', `Only ${maxStock} unit${maxStock === 1 ? '' : 's'} available in stock.`);
      }
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      if (onNotify) {
        onNotify('error', 'Select Size First ⚠️', `Please select a size for ${product.name} before updating quantity.`);
      }
      return;
    }

    if (onUpdateQuantity) {
      onUpdateQuantity(product.id, quantity + 1);
    }
  };

  const currentDisplayImage = allImages[activeColorIdx] || primaryImage;

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col cursor-pointer select-none bg-white rounded-2xl border border-black/[0.06] hover:border-black/15 shadow-2xs hover:shadow-md transition-all duration-300 p-2 sm:p-2.5"
      aria-label={`View ${product.name}`}
    >
      {/* ── Compact Portrait Aspect Ratio Product Image Container ── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#F7F7F8] flex items-center justify-center">
        {/* Subtle Badge */}
        {product.badge && (
          <span className="absolute top-2 left-2 z-10 text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/95 text-[#1D1D1F] border border-black/[0.06] shadow-2xs">
            {product.badge}
          </span>
        )}

        {/* Wishlist Heart Icon */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-xs ${isFavorite
            ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
            : 'bg-white/90 backdrop-blur-xs text-[#1D1D1F] hover:text-rose-600 hover:bg-white'
            }`}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${isFavorite
              ? 'fill-rose-600 text-rose-600'
              : 'fill-none stroke-[1.8]'
              }`}
          />
        </button>

        {/* Quick View Button (hover action) */}
        {onQuickView && (
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="absolute bottom-2 right-2 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs text-[#1D1D1F] hover:bg-black hover:text-white flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer"
            title="Quick View"
            aria-label="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Primary Product Image */}
        <div className="relative w-full h-full">
          {!imageError ? (
            <Image
              src={currentDisplayImage}
              alt={product.name || 'Product Image'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImageError(true)}
              className={`object-cover object-center transition-all duration-300 ease-out group-hover:scale-105 ${secondaryImage && isHovered && activeColorIdx === 0
                ? 'opacity-0'
                : 'opacity-100'
                }`}
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#86868B]">
              <span>Image unavailable</span>
            </div>
          )}

          {/* Secondary Hover Image (if available) */}
          {secondaryImage && !imageError && (
            <Image
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover object-center transition-all duration-300 ease-out group-hover:scale-105 ${isHovered && activeColorIdx === 0
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none'
                }`}
              loading="lazy"
              priority={false}
            />
          )}
        </div>
      </div>

      {/* ── Product Information ── */}
      <div className="pt-1.5 pb-0.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Product Name */}
          <h3 className="font-sans text-xs sm:text-sm font-semibold text-[#1D1D1F] tracking-tight line-clamp-1 group-hover:text-black transition-colors" title={product.name}>
            {product.name}
          </h3>

          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
            <span className="font-sans text-xs sm:text-sm font-bold text-[#1D1D1F]">
              {formatPrice(product.price, STORE_CONFIG.currency || '₹')}
            </span>

            {product.oldPrice && product.oldPrice > product.price && (
              <span className="font-sans text-[10px] sm:text-xs text-[#86868B] line-through">
                {formatPrice(product.oldPrice, STORE_CONFIG.currency || '₹')}
              </span>
            )}

            {product.discountPercent > 0 && (
              <span className="font-sans text-[9px] sm:text-[10px] font-bold text-[#34C759] bg-[#34C759]/10 px-1.5 py-0.5 rounded-full">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Color Swatches */}
          {colors && colors.length > 0 && (
            <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
              {colors.slice(0, 5).map((col, idx) => {
                const isSelected = selectedColor === col.name || activeColorIdx === idx;
                return (
                  <button
                    key={col.name || idx}
                    type="button"
                    onClick={(e) => handleColorClick(e, col, idx)}
                    title={col.name}
                    aria-label={`Color ${col.name}`}
                    className={`w-3 h-3 rounded-full transition-all cursor-pointer ${isSelected
                      ? 'ring-2  ring-offset-1 scale-110'
                      : 'border hover:scale-110'
                      }`}
                    style={{ backgroundColor: col.hex || '#1D1D1F' }}
                  />
                );
              })}
              {colors.length > 5 && (
                <span className="text-[10px] text-[#86868B] ml-0.5">
                  +{colors.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Size Pills */}
          {sizes && sizes.length > 0 && (
            <div className="flex items-center gap-1 mt-1 overflow-x-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
              {sizes.slice(0, 4).map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={(e) => handleSizeClick(e, size)}
                    title={isSelected ? `Size ${size} (Selected)` : `Select Size ${size}`}
                    aria-label={`Select Size ${size}`}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-medium transition-colors cursor-pointer ${isSelected
                      ? 'bg-[#1D1D1F] text-white'
                      : 'bg-[#F5F5F7] text-[#555555] hover:bg-[#E8E8ED]'
                      }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Row: Add to Cart / Stepper / Out of Stock */}
        <div className="mt-2 pt-1.5 border-t border-black/[0.05]" onClick={(e) => e.stopPropagation()}>
          {isOutOfStock ? (
            <button
              type="button"
              onClick={() => onWhatsAppInquiry && onWhatsAppInquiry(product)}
              className="w-full py-1.5 px-3 rounded-xl bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-[11px] font-bold flex items-center justify-center transition-colors cursor-pointer border border-black/[0.06]"
            >
              <span>Out of Stock</span>
            </button>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={handleAddToCartClick}
              className="w-full py-1.5 px-3 rounded-xl bg-[#1D1D1F] hover:bg-black text-white font-medium text-[11px] font-sans tracking-wide flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="w-full flex items-center justify-between bg-[#F5F5F7] border border-black/[0.06] rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={handleDecreaseQuantity}
                className="w-6 h-6 rounded-lg bg-white text-[#1D1D1F] hover:bg-black/5 flex items-center justify-center shadow-2xs transition-colors cursor-pointer shrink-0"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>

              <motion.span
                key={quantity}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-xs font-sans font-bold text-[#1D1D1F] px-2"
              >
                {quantity}
              </motion.span>

              <button
                type="button"
                onClick={handleIncreaseQuantity}
                disabled={typeof product.stockCount === 'number' && quantity >= product.stockCount}
                className="w-6 h-6 rounded-lg bg-[#1D1D1F] text-white hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-2xs transition-colors cursor-pointer shrink-0"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

function areProductCardPropsEqual(prevProps, nextProps) {
  if (prevProps.quantity !== nextProps.quantity) return false;
  if (prevProps.isFavorite !== nextProps.isFavorite) return false;
  if (prevProps.selectedSize !== nextProps.selectedSize) return false;
  if (prevProps.selectedColor !== nextProps.selectedColor) return false;
  if (prevProps.product?.id !== nextProps.product?.id) return false;
  if (prevProps.product?.price !== nextProps.product?.price) return false;
  if (prevProps.product?.oldPrice !== nextProps.product?.oldPrice) return false;
  if (prevProps.product?.stockCount !== nextProps.product?.stockCount) return false;
  if (prevProps.product?.stockStatus !== nextProps.product?.stockStatus) return false;
  if (prevProps.product?.name !== nextProps.product?.name) return false;
  if (prevProps.product?.image !== nextProps.product?.image) return false;
  if (prevProps.product?.images?.length !== nextProps.product?.images?.length) return false;
  return true;
}

export const ProductCard = React.memo(ProductCardComponent, areProductCardPropsEqual);
export default ProductCard;
