import { NextResponse } from 'next/server';
import { verifyCustomerAuth, unauthorizedResponse } from '@/lib/auth';
import { voteReviewHelpfulDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reviews/[id]/helpful
 * Customer toggles helpful vote for a review.
 */
export async function POST(request, { params }) {
  try {
    const customer = verifyCustomerAuth(request);
    if (!customer) {
      return unauthorizedResponse('Please sign in to vote on reviews');
    }

    const { id: reviewId } = params;
    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    const result = await voteReviewHelpfulDB(reviewId, customer.id);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register helpful vote' },
      { status: 500 }
    );
  }
}
