'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  Edit3,
  Trash2,
  MessageSquarePlus,
  Filter,
  ArrowUpDown,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCatalog } from '@/context/CatalogContext';

/**
 * Format relative date (e.g. "2 days ago", "just now")
 */
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'min' : 'mins'} ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
}

const RATING_LABELS = {
  1: 'Terrible',
  2: 'Poor',
  3: 'Average',
  4: 'Very Good',
  5: 'Excellent',
};

export const ProductReviews = ({ productId, productName = 'Product', onStatsLoaded }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { refreshCatalog } = useCatalog();

  // Review List State
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [distribution, setDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [percentages, setPercentages] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [userReview, setUserReview] = useState(null);

  // Filter & Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'highest', 'lowest', 'helpful'
  const [ratingFilter, setRatingFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helpful Vote Loading Map
  const [votingReviewId, setVotingReviewId] = useState(null);

  /**
   * Fetch reviews from server
   */
  const fetchReviews = useCallback(
    async (targetPage = 1, append = false) => {
      if (!productId) return;
      if (targetPage === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const query = new URLSearchParams({
          page: String(targetPage),
          limit: '6',
          sortBy,
        });
        if (ratingFilter) query.set('rating', String(ratingFilter));

        const res = await fetch(`/api/products/${productId}/reviews?${query.toString()}`, {
          credentials: 'include',
        });
        const data = await res.json();

        if (data.success) {
          setTotalReviews(data.totalReviews || 0);
          setAverageRating(data.averageRating || 0);
          setDistribution(data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
          setPercentages(data.percentages || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
          setUserReview(data.userReview || null);
          setHasMore(data.hasMore || false);
          setPage(data.page || 1);

          if (append) {
            setReviews((prev) => [...prev, ...(data.reviews || [])]);
          } else {
            setReviews(data.reviews || []);
          }

          if (typeof onStatsLoaded === 'function') {
            onStatsLoaded({
              totalReviews: data.totalReviews || 0,
              averageRating: data.averageRating || 0,
            });
          }
        }
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [productId, sortBy, ratingFilter]
  );

  useEffect(() => {
    fetchReviews(1, false);
  }, [fetchReviews]);

  /**
   * Open Review Form (with auth check)
   */
  const handleOpenWriteReview = () => {
    if (!isAuthenticated) {
      openAuthModal(
        () => {
          setIsEditing(false);
          setSelectedStars(5);
          setReviewTitle('');
          setReviewComment('');
          setFormError('');
          setIsFormOpen(true);
        },
        {
          title: 'Sign in to write a review',
          subtitle: 'Share your genuine experience with other shoppers',
          defaultTab: 'login',
        }
      );
      return;
    }

    if (userReview) {
      handleOpenEditReview(userReview);
      return;
    }

    setIsEditing(false);
    setSelectedStars(5);
    setReviewTitle('');
    setReviewComment('');
    setFormError('');
    setIsFormOpen(true);
  };

  /**
   * Open Edit Review Form
   */
  const handleOpenEditReview = (existing) => {
    setIsEditing(true);
    setSelectedStars(existing.rating || 5);
    setReviewTitle(existing.title || '');
    setReviewComment(existing.comment || '');
    setFormError('');
    setIsFormOpen(true);
  };

  /**
   * Submit Review (Create or Update)
   */
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError('');

    if (selectedStars < 1 || selectedStars > 5) {
      setFormError('Please select a star rating between 1 and 5');
      return;
    }

    const cleanComment = reviewComment.trim();
    if (cleanComment.length < 5) {
      setFormError('Please write at least 5 characters in your review feedback');
      return;
    }

    if (cleanComment.length > 2000) {
      setFormError('Review comment cannot exceed 2000 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && userReview) {
        // PUT update
        const res = await fetch(`/api/reviews/${userReview.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            rating: selectedStars,
            title: reviewTitle.trim(),
            comment: cleanComment,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to update review');
        }
      } else {
        // POST create
        const res = await fetch(`/api/products/${productId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            rating: selectedStars,
            title: reviewTitle.trim(),
            comment: cleanComment,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to publish review');
        }
      }

      setIsFormOpen(false);
      // Refresh real-time data
      await fetchReviews(1, false);
      if (refreshCatalog) refreshCatalog();
    } catch (err) {
      setFormError(err.message || 'An error occurred while saving your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Confirm and execute Review Delete
   */
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/reviews/${reviewToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete review');
      }

      setReviewToDelete(null);
      await fetchReviews(1, false);
      if (refreshCatalog) refreshCatalog();
    } catch (err) {
      alert(err.message || 'Could not delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Helpful Vote Toggle
   */
  const handleToggleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      openAuthModal(null, {
        title: 'Sign in to vote',
        subtitle: 'Let others know if this review was helpful',
      });
      return;
    }

    setVotingReviewId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => {
            if (r.id === reviewId) {
              const currentVotes = Array.isArray(r.helpfulVotes) ? [...r.helpfulVotes] : [];
              const uId = String(user.id || user._id);
              const hasVoted = currentVotes.includes(uId);
              const updatedVotes = hasVoted
                ? currentVotes.filter((id) => id !== uId)
                : [...currentVotes, uId];
              return {
                ...r,
                helpfulCount: data.helpfulCount,
                helpfulVotes: updatedVotes,
              };
            }
            return r;
          })
        );
      }
    } catch (err) {
      console.error('Error voting helpful:', err);
    } finally {
      setVotingReviewId(null);
    }
  };

  return (
    <div className="w-full pt-8 sm:pt-10 border-t border-black/10 font-sans text-[#171717]">
      
      {/* ── Section Title & Write Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#171717]">
              Customer Reviews & Ratings
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F3FCDA] border border-[#9FD842]/40 text-[#709E1E] font-bold text-xs">
              {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#777777] mt-0.5">
            Verified ratings and authentic feedback from genuine buyers
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenWriteReview}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <MessageSquarePlus className="w-4 h-4 text-[#9FD842]" />
          <span>{userReview ? 'Edit Your Review' : 'Write a Review'}</span>
        </button>
      </div>

      {/* ── Rating Overview & Distribution Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 rounded-[28px] bg-[#F6F5F0] border border-black/5 mb-8">
        
        {/* Left: Overall Score Card */}
        <div className="md:col-span-5 flex flex-col justify-center items-center text-center p-4 border-b md:border-b-0 md:border-r border-black/10">
          <span className="text-5xl sm:text-6xl font-black text-[#171717] tracking-tight">
            {totalReviews > 0 ? averageRating.toFixed(1) : '0.0'}
          </span>

          <div className="flex items-center gap-1 my-2 text-[#FF9500]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? 'fill-[#FF9500] text-[#FF9500]'
                    : 'fill-black/10 text-black/15'
                }`}
              />
            ))}
          </div>

          <span className="text-xs sm:text-sm font-bold text-[#171717]">
            {totalReviews > 0 ? `${averageRating.toFixed(1)} out of 5 stars` : 'No reviews yet'}
          </span>
          <span className="text-xs text-[#777777] mt-0.5">
            Based on {totalReviews} {totalReviews === 1 ? 'customer review' : 'customer reviews'}
          </span>
        </div>

        {/* Right: Star Breakdown Progress Bars */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-2.5 px-0 sm:px-4">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = percentages[star] || 0;
            const isSelected = ratingFilter === star;

            return (
              <button
                key={star}
                type="button"
                onClick={() => setRatingFilter(isSelected ? null : star)}
                className={`flex items-center gap-3 text-xs text-left group/star p-1 rounded-xl transition-all ${
                  isSelected ? 'bg-[#F3FCDA] ring-1 ring-[#9FD842]' : 'hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-1 w-14 shrink-0 font-bold text-[#171717]">
                  <span>{star}</span>
                  <Star className="w-3.5 h-3.5 fill-[#FF9500] text-[#FF9500]" />
                </div>

                {/* Progress bar */}
                <div className="flex-1 h-3 rounded-full bg-black/10 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-[#171717] group-hover/star:bg-[#709E1E] transition-colors"
                  />
                </div>

                <span className="w-12 text-right text-[11px] font-mono font-bold text-[#555555]">
                  {pct}%
                </span>
                <span className="w-8 text-right text-[11px] text-[#888888]">
                  ({count})
                </span>
              </button>
            );
          })}

          {ratingFilter && (
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-[#709E1E]">
                Filtered by {ratingFilter}-star reviews
              </span>
              <button
                type="button"
                onClick={() => setRatingFilter(null)}
                className="text-xs font-bold text-[#171717] hover:underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Sorting & Review Filters Bar ── */}
      {totalReviews > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-black/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#777777]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#171717]" />
            <span>Sort Reviews:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'recent', label: 'Most Recent' },
              { id: 'highest', label: 'Highest Rating' },
              { id: 'lowest', label: 'Lowest Rating' },
              { id: 'helpful', label: 'Most Helpful' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSortBy(s.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  sortBy === s.id
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'bg-[#EEEEEC] text-[#666666] hover:bg-[#E2E2DE]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Customer's Own Review Banner (if logged in & submitted) ── */}
      {userReview && (
        <div className="p-5 rounded-[24px] bg-[#F8FDF0] border border-[#9FD842]/40 mb-6 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#9FD842] text-[#171717] text-[10px] font-black uppercase tracking-wider">
                  Your Review
                </span>
                {userReview.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified Purchase</span>
                  </span>
                )}
                <span className="text-xs text-[#777777]">
                  • {formatRelativeTime(userReview.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[#FF9500] mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= userReview.rating
                        ? 'fill-[#FF9500] text-[#FF9500]'
                        : 'fill-black/10 text-black/15'
                    }`}
                  />
                ))}
              </div>

              {userReview.title && (
                <h4 className="text-sm font-extrabold text-[#171717] mb-1">
                  {userReview.title}
                </h4>
              )}
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                {userReview.comment}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenEditReview(userReview)}
                className="p-2 rounded-full bg-white hover:bg-black/5 text-[#171717] border border-black/10 shadow-xs cursor-pointer transition-colors"
                title="Edit your review"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setReviewToDelete(userReview)}
                className="p-2 rounded-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-xs cursor-pointer transition-colors"
                title="Delete your review"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review Cards List ── */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-7 h-7 text-[#709E1E] animate-spin" />
          <span className="text-xs font-bold text-[#777777]">Loading real customer reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 sm:py-16 text-center rounded-[28px] border border-dashed border-black/15 p-8 bg-white">
          <div className="w-14 h-14 rounded-full bg-[#F3FCDA] text-[#709E1E] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#171717]">No Reviews Yet</h3>
          <p className="text-xs text-[#777777] max-w-sm mx-auto mt-1 mb-5">
            Be the first to share your thoughts on this product and help other customers make an informed choice!
          </p>
          <button
            type="button"
            onClick={handleOpenWriteReview}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#171717] hover:bg-black text-white text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-[#9FD842]" />
            <span>Write the First Review</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const isUserOwn = user && String(rev.customerId) === String(user.id || user._id);
            const userHasVoted =
              user && Array.isArray(rev.helpfulVotes) && rev.helpfulVotes.includes(String(user.id || user._id));

            return (
              <div
                key={rev.id}
                className="p-5 sm:p-6 rounded-[24px] bg-white border border-black/10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3 transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)]"
              >
                {/* Header: Customer info, rating, verified badge, relative date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#171717] text-[#9FD842] flex items-center justify-center font-bold text-xs shadow-xs">
                      {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs sm:text-sm text-[#171717]">
                          {rev.customerName || 'Verified Customer'}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified Purchase</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#888888] block">
                        {formatRelativeTime(rev.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-[#FF9500]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating
                            ? 'fill-[#FF9500] text-[#FF9500]'
                            : 'fill-black/10 text-black/15'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-[#171717] ml-1">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Review Title & Body */}
                <div className="space-y-1">
                  {rev.title && (
                    <h4 className="text-sm sm:text-base font-extrabold text-[#171717]">
                      {rev.title}
                    </h4>
                  )}
                  <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                {/* Footer: Helpful Vote & Actions */}
                <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleHelpful(rev.id)}
                    disabled={votingReviewId === rev.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      userHasVoted
                        ? 'bg-[#F3FCDA] text-[#709E1E] border border-[#9FD842]/50 shadow-xs'
                        : 'bg-[#EEEEEC] text-[#666666] hover:bg-[#E2E2DE]'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${userHasVoted ? 'fill-current' : ''}`} />
                    <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>

                  {isUserOwn && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditReview(rev)}
                        className="text-xs font-bold text-[#709E1E] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <span className="text-[#CCCCCC]">·</span>
                      <button
                        type="button"
                        onClick={() => setReviewToDelete(rev)}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => fetchReviews(page + 1, true)}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading more reviews...</span>
                  </>
                ) : (
                  <span>Load More Reviews</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Write / Edit Review Modal ── */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] border border-black/10 p-6 sm:p-8 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-[#171717]">
                    {isEditing ? 'Edit Your Review' : 'Rate & Review'}
                  </h3>
                  <p className="text-xs text-[#777777] mt-0.5 line-clamp-1">
                    {productName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 text-[#777777] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                
                {/* Interactive Star Picker */}
                <div>
                  <label className="block text-xs font-extrabold text-[#171717] mb-2 uppercase tracking-wider">
                    Overall Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoverStars || selectedStars);
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverStars(star)}
                            onMouseLeave={() => setHoverStars(0)}
                            onClick={() => setSelectedStars(star)}
                            className="p-1 hover:scale-115 active:scale-95 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                isFilled
                                  ? 'fill-[#FF9500] text-[#FF9500]'
                                  : 'fill-black/10 text-black/20'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#F3FCDA] text-[#709E1E] text-xs font-extrabold ml-2 shadow-xs">
                      {RATING_LABELS[hoverStars || selectedStars]}
                    </span>
                  </div>
                </div>

                {/* Review Headline (Optional) */}
                <div>
                  <label className="block text-xs font-extrabold text-[#171717] mb-1.5 uppercase tracking-wider">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Excellent fit and premium quality!"
                    maxLength={100}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#EEEEEC] border border-black/5 text-xs sm:text-sm text-[#171717] placeholder-[#888888] focus:bg-white focus:ring-2 focus:ring-[#9FD842] focus:outline-none"
                  />
                </div>

                {/* Review Feedback Comment */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-extrabold text-[#171717] uppercase tracking-wider">
                      Your Feedback *
                    </label>
                    <span className="text-[11px] text-[#888888]">
                      {reviewComment.length} / 2000
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="What did you like or dislike about this product? How is the finish, material, or fit?"
                    maxLength={2000}
                    required
                    className="w-full p-4 rounded-2xl bg-[#EEEEEC] border border-black/5 text-xs sm:text-sm text-[#171717] placeholder-[#888888] focus:bg-white focus:ring-2 focus:ring-[#9FD842] focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Submit button with double-click protection */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#171717] hover:bg-black text-white text-xs sm:text-sm font-extrabold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#9FD842]" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <span>{isEditing ? 'Update Review' : 'Submit Review'}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  Delete Your Review?
                </h3>
                <p className="text-xs text-[#777777] mt-1">
                  Are you sure you want to delete this review? The product average rating will be recalculated.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewToDelete(null)}
                  className="px-5 py-2 rounded-full bg-[#EEEEEC] text-[#171717] text-xs font-bold hover:bg-[#E2E2DE] cursor-pointer"
                >
                  Keep Review
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

export default ProductReviews;
