import { NextResponse } from 'next/server';
import { verifyCustomerAuth, verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';
import { updateReviewDB, deleteReviewDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/reviews/[id]
 * Customer edits their own review.
 */
export async function PUT(request, { params }) {
  try {
    const customer = verifyCustomerAuth(request);
    if (!customer) {
      return unauthorizedResponse('Please sign in to edit your review');
    }

    const { id: reviewId } = params;
    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { rating, title, comment } = body;

    const result = await updateReviewDB(reviewId, customer.id, {
      rating,
      title,
      comment,
    });

    return NextResponse.json({
      success: true,
      message: 'Your review has been updated successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    const msg = error.message || 'Failed to update review';
    const status = msg.includes('Unauthorized') ? 403 : msg.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

/**
 * DELETE /api/reviews/[id]
 * Customer deletes their own review, or Admin moderates/deletes any review.
 */
export async function DELETE(request, { params }) {
  try {
    const { id: reviewId } = params;
    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    const admin = verifyAdminAuth(request);
    const customer = verifyCustomerAuth(request);

    if (!admin && !customer) {
      return unauthorizedResponse('Authentication required to delete review');
    }

    const isAdmin = Boolean(admin);
    const customerId = customer ? customer.id : null;

    const result = await deleteReviewDB(reviewId, customerId, isAdmin);

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    const msg = error.message || 'Failed to delete review';
    const status = msg.includes('Unauthorized') ? 403 : msg.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
