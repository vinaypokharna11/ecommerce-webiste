import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/couponValidation';
import { verifyCustomerAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { couponCode, items = [], subtotal } = body;

    if (!couponCode || typeof couponCode !== 'string' || !couponCode.trim()) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          code: 'COUPON_NOT_FOUND',
          message: 'Please provide a coupon code to apply.',
        },
        { status: 400 }
      );
    }

    // Identify authenticated user from verified JWT session (never trust client userId)
    const customer = verifyCustomerAuth(request);
    const authUserId = customer ? customer.id || customer.email : null;

    const result = await validateCoupon({
      couponCode: couponCode.trim(),
      userId: authUserId,
      items: Array.isArray(items) ? items : [],
      cartSubtotal: typeof subtotal === 'number' ? subtotal : null,
    });

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          ...result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        code: 'VALIDATION_ERROR',
        message: error.message || 'An error occurred while validating the coupon.',
      },
      { status: 500 }
    );
  }
}
