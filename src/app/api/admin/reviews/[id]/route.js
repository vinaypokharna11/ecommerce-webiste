import { NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';
import { moderateReviewAdminDB, deleteReviewDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/reviews/[id]
 * Moderates review status (approved, pending, rejected).
 */
export async function PATCH(request, { params }) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse('Administrative access required');
    }

    const { id: reviewId } = await params;
    const { status } = await request.json();

    const result = await moderateReviewAdminDB(reviewId, status);
    return NextResponse.json({
      success: true,
      message: `Review status updated to ${status}`,
      ...result,
    });
  } catch (error) {
    console.error('Admin review PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to moderate review' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Deletes a review as an admin.
 */
export async function DELETE(request, { params }) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse('Administrative access required');
    }

    const { id: reviewId } = await params;
    const result = await deleteReviewDB(reviewId, null, true);

    return NextResponse.json({
      success: true,
      message: 'Review permanently removed',
      ...result,
    });
  } catch (error) {
    console.error('Admin review DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete review' },
      { status: 400 }
    );
  }
}
