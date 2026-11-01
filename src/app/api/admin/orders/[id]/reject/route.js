import { NextResponse } from 'next/server';
import { rejectOrder, getStoreConfig } from '@/lib/db';
import { sendOrderRejectionEmail } from '@/lib/email';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/orders/[id]/reject
 * Seller rejects a pending order.
 * Validates seller authorization, verifies pending status, marks status as 'rejected',
 * captures rejection reason, keeps inventory intact, and notifies customer.
 */
export async function POST(request, { params }) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse('Administrator / Seller authorization required');
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    let reason = '';
    try {
      const body = await request.json();
      reason = body?.reason || '';
    } catch {
      // Body is optional
    }

    // Execute atomic reject (inventory untouched)
    const rejectedOrder = await rejectOrder(id, admin, reason);
    const storeConfig = await getStoreConfig();

    // Trigger customer rejection notification asynchronously
    Promise.resolve(
      sendOrderRejectionEmail(rejectedOrder, reason, storeConfig)
    ).catch((err) => console.error(`Error dispatching order rejection email for ${id}:`, err));

    return NextResponse.json({
      success: true,
      message: `Order ${id} rejected. Customer notification dispatched.`,
      order: rejectedOrder,
    });
  } catch (error) {
    const isClientError =
      error.message?.includes('not in pending status') ||
      error.message?.includes('already been processed') ||
      error.message?.includes('cannot be rejected') ||
      error.message?.includes('Unauthorized') ||
      error.message?.includes('not found');

    const statusCode = error.message?.includes('Unauthorized')
      ? 403
      : isClientError
      ? 400
      : 500;

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reject order' },
      { status: statusCode }
    );
  }
}
