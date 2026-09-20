import { NextResponse } from 'next/server';
import { acceptOrder, getStoreConfig } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/orders/[id]/accept
 * Seller confirms and accepts a pending order.
 * Validates seller authorization, verifies pending status, atomically decrements inventory,
 * and triggers customer order confirmation.
 */
export async function POST(request, { params }) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse('Administrator / Seller authorization required');
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    // Execute atomic accept & inventory deduction
    const acceptedOrder = await acceptOrder(id, admin);
    const storeConfig = await getStoreConfig();

    // Trigger customer confirmation notification asynchronously
    Promise.resolve(
      sendOrderConfirmationEmail(acceptedOrder, storeConfig)
    ).catch((err) => console.error(`Error dispatching order confirmation email for ${id}:`, err));

    return NextResponse.json({
      success: true,
      message: `Order ${id} accepted successfully. Stock decremented and confirmation dispatched.`,
      order: acceptedOrder,
    });
  } catch (error) {
    const isClientError =
      error.message?.includes('not in pending status') ||
      error.message?.includes('already been accepted') ||
      error.message?.includes('Insufficient stock') ||
      error.message?.includes('Unauthorized') ||
      error.message?.includes('not found');

    const statusCode = error.message?.includes('Unauthorized')
      ? 403
      : isClientError
      ? 400
      : 500;

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to accept order' },
      { status: statusCode }
    );
  }
}
