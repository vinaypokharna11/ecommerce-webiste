import { NextResponse } from 'next/server';
import {
  getConversations,
  findOrCreateOrderConversation,
  findOrCreateGeneralConversation,
} from '@/lib/db';
import { verifyCustomerAuth, verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/conversations
 * Returns conversations for the authenticated user.
 * - Customer: Returns their own order and general conversations.
 * - Admin: Returns storewide conversations with optional search & type filtering.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope'); // 'admin' or 'customer'
    const customer = verifyCustomerAuth(request);
    const admin = verifyAdminAuth(request);

    if (!customer && !admin) {
      return unauthorizedResponse('Authentication required to access conversations');
    }

    // Prioritize customer context unless explicitly called from admin dashboard
    const authUser = (customer && scope !== 'admin') ? customer : (admin || customer);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || null;
    const limit = searchParams.get('limit') || 50;

    const result = await getConversations(authUser, { search, type, limit });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const isForbidden = error.message?.includes('Unauthorized');
    const status = isForbidden ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch conversations' },
      { status }
    );
  }
}

/**
 * POST /api/conversations
 * Finds or creates a conversation.
 * Body:
 * - type: 'ORDER' | 'GENERAL'
 * - orderId: string (required if type === 'ORDER')
 */
export async function POST(request) {
  try {
    const customer = verifyCustomerAuth(request);
    const admin = verifyAdminAuth(request);

    if (!customer && !admin) {
      return unauthorizedResponse('Authentication required to start a conversation');
    }

    const authUser = admin || customer;
    const body = await request.json().catch(() => ({}));
    const type = (body.type || 'GENERAL').toUpperCase();

    let conversation = null;

    if (type === 'ORDER') {
      const orderId = body.orderId;
      if (!orderId) {
        return NextResponse.json(
          { success: false, error: 'Order ID is required for order conversations' },
          { status: 400 }
        );
      }
      conversation = await findOrCreateOrderConversation(orderId, authUser);
    } else {
      conversation = await findOrCreateGeneralConversation(authUser);
    }

    return NextResponse.json(
      {
        success: true,
        conversation,
      },
      { status: 201 }
    );
  } catch (error) {
    const isForbidden = error.message?.includes('Unauthorized');
    const isNotFound = error.message?.includes('not found');
    const status = isForbidden ? 403 : isNotFound ? 404 : 400;

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize conversation' },
      { status }
    );
  }
}
