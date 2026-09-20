import { NextResponse } from 'next/server';
import { getOrderChatMessages, addOrderChatMessage } from '@/lib/db';
import { verifyCustomerAuth, verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/[id]/chat
 * Fetches order-specific conversation history for verified customer or authorized seller.
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const customer = verifyCustomerAuth(request);
    const admin = verifyAdminAuth(request);

    if (!customer && !admin) {
      return unauthorizedResponse('Authentication required to access order chat');
    }

    const authUser = admin || customer;
    const result = await getOrderChatMessages(id, authUser);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const isForbidden = error.message?.includes('Unauthorized');
    const isNotFound = error.message?.includes('not found');
    const status = isForbidden ? 403 : isNotFound ? 404 : 500;

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order chat' },
      { status }
    );
  }
}

/**
 * POST /api/orders/[id]/chat
 * Sends a message in the order chat thread.
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const customer = verifyCustomerAuth(request);
    const admin = verifyAdminAuth(request);

    if (!customer && !admin) {
      return unauthorizedResponse('Authentication required to send chat message');
    }

    const authUser = admin || customer;
    const body = await request.json().catch(() => ({}));
    const { message } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    const result = await addOrderChatMessage(id, message, authUser);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      ...result,
    }, { status: 201 });
  } catch (error) {
    const isForbidden = error.message?.includes('Unauthorized');
    const isNotFound = error.message?.includes('not found');
    const status = isForbidden ? 403 : isNotFound ? 404 : 400;

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send chat message' },
      { status }
    );
  }
}
