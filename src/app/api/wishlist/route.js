import { NextResponse } from 'next/server';
import { getUserWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '@/lib/db';
import { verifyCustomerAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/wishlist
 * Returns all wishlist items for the authenticated customer.
 */
export async function GET(request) {
  try {
    const customer = verifyCustomerAuth(request);
    if (!customer) {
      return unauthorizedResponse('Authentication required to view your wishlist');
    }

    const userId = customer.id || customer._id || customer.email;
    const wishlist = await getUserWishlist(userId);

    return NextResponse.json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/wishlist
 * Adds a product to the authenticated customer's wishlist in MongoDB Atlas.
 */
export async function POST(request) {
  try {
    const customer = verifyCustomerAuth(request);
    if (!customer) {
      return unauthorizedResponse('Please sign in or create an account to save items to your wishlist');
    }

    const body = await request.json().catch(() => ({}));
    const productId = body.productId || body.id;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid productId is required' },
        { status: 400 }
      );
    }

    const userId = customer.id || customer._id || customer.email;
    const item = await addToWishlist(userId, productId);

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist',
      item,
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

/**
 * DELETE /api/wishlist
 * Removes a product from the customer's wishlist in MongoDB Atlas.
 */
export async function DELETE(request) {
  try {
    const customer = verifyCustomerAuth(request);
    if (!customer) {
      return unauthorizedResponse('Authentication required to modify your wishlist');
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || searchParams.get('id');
    const userId = customer.id || customer._id || customer.email;

    if (!productId) {
      // Clear entire wishlist
      await clearWishlist(userId);
      return NextResponse.json({
        success: true,
        message: 'Wishlist cleared successfully',
      });
    }

    const deleted = await removeFromWishlist(userId, productId);
    return NextResponse.json({
      success: true,
      message: deleted ? 'Product removed from wishlist' : 'Product was not in wishlist',
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
