import { NextResponse } from 'next/server';
import { verifyCustomerAuth, unauthorizedResponse } from '@/lib/auth';
import { getProductReviewsDB, createReviewDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products/[id]/reviews
 * Public endpoint to fetch real customer reviews, rating distribution, and average rating.
 * Detects optional customer session to surface customer's own review.
 */
export async function GET(request, { params }) {
  try {
    const { id: productId } = await params;
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'recent';
    const ratingFilter = searchParams.get('rating') || null;

    // Optional customer auth check to highlight customer's own review
    let currentCustomerId = null;
    try {
      const customer = verifyCustomerAuth(request);
      if (customer?.id) {
        currentCustomerId = customer.id;
      }
    } catch (e) {}

    const result = await getProductReviewsDB(productId, {
      page,
      limit,
      sortBy,
      ratingFilter,
      currentCustomerId,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch product reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/[id]/reviews
 * Authenticated customer endpoint to submit a review with server-verified purchase badge.
 */
export async function POST(request, { params }) {
  try {
    const customer = verifyCustomerAuth(request);
    if (!customer) {
      return unauthorizedResponse('Please sign in to write a review');
    }

    const { id: productId } = await params;
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { rating, title, comment } = body;

    // Validate rating
    const numRating = Math.round(Number(rating));
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid rating from 1 to 5 stars' },
        { status: 400 }
      );
    }

    // Validate comment length
    const cleanComment = (comment || '').trim();
    if (cleanComment.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Your review comment must be at least 5 characters long' },
        { status: 400 }
      );
    }
    if (cleanComment.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Review comment cannot exceed 2000 characters' },
        { status: 400 }
      );
    }

    const result = await createReviewDB({
      productId,
      customerId: customer.id,
      customerName: customer.name || 'Verified Customer',
      customerEmail: customer.email || '',
      rating: numRating,
      title: (title || '').trim(),
      comment: cleanComment,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Your review has been published.',
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting review:', error);
    const msg = error.message || 'Failed to submit review';

    if (msg.includes('already reviewed') || msg.includes('already submitted')) {
      return NextResponse.json({ success: false, error: msg, isDuplicate: true }, { status: 409 });
    }

    if (msg.includes('not found')) {
      return NextResponse.json({ success: false, error: msg }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
