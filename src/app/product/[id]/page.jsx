import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowLeft, ShoppingBag, ShieldCheck, Heart, Truck, Sparkles } from 'lucide-react';
import { getProductByIdDB } from '@/lib/db';
import { ProductReviews } from '@/components/product/ProductReviews';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { STORE_CONFIG } from '@/data/mockData';
import { formatPrice } from '@/utils/formatPrice';
import { TrackProductView } from '@/components/product/TrackProductView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const product = await getProductByIdDB(params.id);
  if (!product) return { title: 'Product Not Found | Nakoda Imitation' };
  return {
    title: `${product.name} | Nakoda Imitation`,
    description: product.description || 'Premium lifestyle accessories & imitation jewelry.',
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await getProductByIdDB(params.id);

  if (!product) {
    notFound();
  }

  const ratingVal = product.rating ? Number(product.rating).toFixed(1) : '0.0';
  const reviewsCount = product.reviews || 0;

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#171717] flex flex-col font-sans selection:bg-[#9FD842] selection:text-[#171717]">
      <Navbar />
      <TrackProductView productId={product.id || params.id} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#777777] hover:text-[#171717] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products Catalog</span>
          </Link>
        </div>

        {/* Product Details Hero Card */}
        <div className="bg-white rounded-[32px] border border-black/10 p-6 sm:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Left: Product Media Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#F5F5F7] border border-black/5 shadow-inner">
                <Image
                  src={product.image || '/assets/images/prod_backpack.jpg'}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                {product.badge && (
                  <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-[#171717] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Multiple Images Gallery Thumbnails if available */}
              {Array.isArray(product.images) && product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {product.images.map((imgUrl, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-black/10 shrink-0 bg-[#F5F5F7]"
                    >
                      <Image
                        src={imgUrl}
                        alt={`${product.name} - view ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info & Buy */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-[#709E1E] uppercase tracking-wider">
                  {product.categoryName || 'Catalog Product'}
                </span>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#171717] tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Rating Badge - Only display when genuine reviews exist */}
                {reviewsCount > 0 && Number(ratingVal) > 0 ? (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center text-[#FF9500]">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1.5 font-extrabold text-sm text-[#171717]">{ratingVal}</span>
                    </div>
                    <span className="text-[#888888]">·</span>
                    <span className="text-xs font-bold text-[#777777]">
                      {reviewsCount} verified {reviewsCount === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                    <span>No reviews yet</span>
                  </div>
                )}

                {/* Pricing */}
                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#171717]">
                    {formatPrice(product.price, STORE_CONFIG.currency)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm sm:text-base text-[#888888] line-through">
                      {formatPrice(product.oldPrice, STORE_CONFIG.currency)}
                    </span>
                  )}
                  {product.discountPercent > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F3FCDA] border border-[#9FD842]/40 text-[#709E1E] font-black text-xs">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed pt-2">
                  {product.description ||
                    'Handcrafted with fine precision, quality polished plating, and designed for lasting beauty.'}
                </p>

                {/* Features & Assurance */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/5">
                  <div className="flex items-center gap-2 text-xs text-[#555555]">
                    <Truck className="w-4 h-4 text-[#709E1E]" />
                    <span>Free doorstep delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#555555]">
                    <ShieldCheck className="w-4 h-4 text-[#709E1E]" />
                    <span>100% genuine quality</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-black/10">
                <Link
                  href={`/catalog?product=${product.id}`}
                  className="w-full py-3.5 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-[#9FD842]" />
                  <span>Order Now · {formatPrice(product.price, STORE_CONFIG.currency)}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Real Customer Reviews & Ratings ── */}
          <div className="mt-12">
            <ProductReviews productId={product.id} productName={product.name} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
