'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  CheckCircle2,
  Search,
  Filter,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useCatalog } from '../../context/CatalogContext';

export const AdminReviews = () => {
  const { products, refreshCatalog } = useCatalog();

  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [averageStoreRating, setAverageStoreRating] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Deletion state
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchAdminReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: '15',
      });
      if (search.trim()) query.set('search', search.trim());
      if (selectedProduct) query.set('productId', selectedProduct);
      if (selectedRating) query.set('rating', selectedRating);
      if (verifiedOnly) query.set('verifiedOnly', 'true');
      if (selectedStatus) query.set('status', selectedStatus);

      const res = await fetch(`/api/admin/reviews?${query.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success) {
        setReviews(data.reviews || []);
        setTotalReviews(data.totalReviews || 0);
        setTotalFiltered(data.totalFiltered || 0);
        setAverageStoreRating(data.averageStoreRating || 0);
        setVerifiedCount(data.verifiedCount || 0);
        setPendingCount(data.pendingCount || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedProduct, selectedRating, verifiedOnly, selectedStatus]);

  useEffect(() => {
    fetchAdminReviews();
  }, [fetchAdminReviews]);

  // Handle delete
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/reviews/${reviewToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success) {
        setActionSuccess('Review deleted and product rating updated');
        setTimeout(() => setActionSuccess(''), 3500);
        setReviewToDelete(null);
        await fetchAdminReviews();
        if (refreshCatalog) refreshCatalog();
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch (e) {
      alert(e.message || 'Error deleting review');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setActionSuccess(`Review marked as ${newStatus}`);
        setTimeout(() => setActionSuccess(''), 3000);
        await fetchAdminReviews();
        if (refreshCatalog) refreshCatalog();
      } else {
        alert(data.error || 'Failed to update review status');
      }
    } catch (e) {
      alert(e.message || 'Error updating status');
    }
  };

  const verifiedPercent = totalReviews > 0 ? Math.round((verifiedCount / totalReviews) * 100) : 0;

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Customer Reviews & Ratings
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-0.5">
            Real customer feedback, rating recalculations, verified purchases, and review moderation
          </p>
        </div>

        {actionSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[24px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#777777]">Total Reviews</span>
            <div className="w-8 h-8 rounded-full bg-[#EEEEEC] flex items-center justify-center text-[#171717]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-[#171717] block">{totalReviews}</span>
          <span className="text-[11px] text-[#777777]">Real database records</span>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#777777]">Overall Store Rating</span>
            <div className="w-8 h-8 rounded-full bg-[#FFFBEB] flex items-center justify-center text-[#D97706]">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#171717]">{averageStoreRating.toFixed(1)}</span>
            <span className="text-xs font-bold text-[#FF9500]">★</span>
          </div>
          <span className="text-[11px] text-[#777777]">Average of all approved reviews</span>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#777777]">Verified Purchase Ratio</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">{verifiedPercent}%</span>
            <span className="text-xs text-[#777777]">({verifiedCount} orders)</span>
          </div>
          <span className="text-[11px] text-[#777777]">Cross-checked with order history</span>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#777777]">Pending Moderation</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-[#171717] block">{pendingCount}</span>
          <span className="text-[11px] text-[#777777]">Approved by default</span>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="p-4 sm:p-5 rounded-[28px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          
          {/* Search */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search customer, product, comment..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#EEEEEC] border border-black/5 text-xs sm:text-sm text-[#171717] placeholder-[#888888] focus:bg-white focus:ring-2 focus:ring-[#9FD842] focus:outline-none"
            />
          </div>

          {/* Product Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-full bg-[#EEEEEC] border border-black/5 text-xs font-semibold text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#9FD842] cursor-pointer"
            >
              <option value="">All Products ({products.length})</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedRating}
              onChange={(e) => {
                setSelectedRating(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-full bg-[#EEEEEC] border border-black/5 text-xs font-semibold text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#9FD842] cursor-pointer"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★☆</option>
              <option value="3">3 Stars ★★★☆☆</option>
              <option value="2">2 Stars ★★☆☆☆</option>
              <option value="1">1 Star ★☆☆☆☆</option>
            </select>
          </div>

          {/* Verified Checkbox */}
          <div className="lg:col-span-3 flex items-center justify-between sm:justify-start gap-3 px-2">
            <label className="flex items-center gap-2 text-xs font-bold text-[#171717] cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-[#709E1E] accent-[#709E1E] cursor-pointer"
              />
              <span>Verified Only</span>
            </label>

            {(search || selectedProduct || selectedRating || verifiedOnly || selectedStatus) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedProduct('');
                  setSelectedRating('');
                  setVerifiedOnly(false);
                  setSelectedStatus('');
                  setPage(1);
                }}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Reviews Table ── */}
      <div className="bg-white rounded-[28px] border border-black/10 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-[#709E1E] animate-spin mx-auto mb-2" />
            <span className="text-xs font-bold text-[#777777]">Loading customer reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center p-8">
            <MessageSquare className="w-12 h-12 text-[#CCCCCC] mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-[#171717]">No Reviews Found</h3>
            <p className="text-xs text-[#777777] mt-1">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 bg-[#F6F5F0]/60 text-[11px] font-black uppercase tracking-wider text-[#777777]">
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Review Content</th>
                  <th className="py-3.5 px-4">Verified</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-xs">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-black/[0.01] transition-colors">
                    
                    {/* Customer */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#171717] text-[#9FD842] flex items-center justify-center font-bold text-xs shrink-0">
                          {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="font-extrabold text-[#171717] block">
                            {rev.customerName}
                          </span>
                          <span className="text-[11px] text-[#777777]">
                            {rev.customerEmail || 'No email provided'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="py-4 px-4 max-w-[180px]">
                      <span className="font-bold text-[#171717] block truncate" title={rev.productName}>
                        {rev.productName || rev.productId}
                      </span>
                      <Link
                        href={`/product/${rev.productId}`}
                        target="_blank"
                        className="text-[10px] text-[#709E1E] hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>View Page</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[#FF9500]">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-extrabold text-[#171717]">{rev.rating}.0</span>
                      </div>
                    </td>

                    {/* Review Title & Content */}
                    <td className="py-4 px-4 max-w-xs">
                      {rev.title && (
                        <span className="font-extrabold text-[#171717] block truncate mb-0.5">
                          {rev.title}
                        </span>
                      )}
                      <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed" title={rev.comment}>
                        {rev.comment}
                      </p>
                    </td>

                    {/* Verified Purchase */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {rev.verifiedPurchase ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#888888]">Guest Review</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-[#777777] text-[11px]">
                      {new Date(rev.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setReviewToDelete(rev)}
                        className="p-1.5 rounded-full text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-black/10 flex items-center justify-between text-xs">
            <span className="text-[#777777]">
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalFiltered} reviews)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl bg-[#EEEEEC] hover:bg-[#E2E2DE] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl bg-[#EEEEEC] hover:bg-[#E2E2DE] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirm Delete Modal ── */}
      <AnimatePresence>
        {reviewToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewToDelete(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-[28px] border border-black/10 p-6 text-center space-y-4 shadow-2xl z-10"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[#171717]">
                  Delete Review?
                </h3>
                <p className="text-xs text-[#777777] mt-1">
                  Are you sure you want to permanently delete this customer review? The product average rating will be recalculated.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewToDelete(null)}
                  className="px-5 py-2 rounded-full bg-[#EEEEEC] text-[#171717] text-xs font-bold hover:bg-[#E2E2DE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminReviews;
