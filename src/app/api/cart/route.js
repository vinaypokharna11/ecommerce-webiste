import { NextResponse } from 'next/server';
import { getUserCart, syncUserCart, clearUserCart } from '@/lib/db';
import { verifyCustomerAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/cart
 * Retrieves the persisted cart for the authenticated customer.
 */
export async function GET(request) {
  try {
    const customer = verifyCustomerAuth(request);
    if (!customer) {
      return unauthorizedResponse('Authentication required to view persisted cart');
    }

    const userId = customer.id || customer._id || customer.email;
    const cart = await getUserCart(userId);

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Synchronizes/persists items to the customer's cart in MongoDB Atlas.
 */
export async function POST(request) {
  try {
    const customer = verifyCustomerAuth(request);
    if (!customer) {
      return unauthorizedResponse('Authentication required to persist cart');
    }

    const body = await request.json().catch(() => ({}));
    const items = Array.isArray(body.items) ? body.items : [];
    const userId = customer.id || customer._id || customer.email;

    const cart = await syncUserCart(userId, items);

    return NextResponse.json({
      success: true,
      cart,
      message: 'Cart synchronized successfully',
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

/**
 * DELETE /api/cart
 * Clears the customer's cart in MongoDB Atlas.
 */
export async function DELETE(request) {
  try {
    const customer = verifyCustomerAuth(request);
    if (!customer) {
      return unauthorizedResponse('Authentication required to modify cart');
    }

    const userId = customer.id || customer._id || customer.email;
    await clearUserCart(userId);

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
