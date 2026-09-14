import { NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';
import { getAllReviewsAdminDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/reviews
 * Admin endpoint for storewide review management, search, and filtering.
 */
export async function GET(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse('Administrative privileges required to access reviews');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const productId = searchParams.get('productId') || '';
    const rating = searchParams.get('rating') || '';
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const status = searchParams.get('status') || '';

    const data = await getAllReviewsAdminDB({
      page,
      limit,
      search,
      productId,
      rating,
      verifiedOnly,
      status,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Admin reviews GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
