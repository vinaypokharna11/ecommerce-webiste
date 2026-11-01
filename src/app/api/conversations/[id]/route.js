import { NextResponse } from 'next/server';
import { getConversationById } from '@/lib/db';
import { verifyCustomerAuth, verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/conversations/[id]
 * Retrieves details for a specific conversation.
 * Validates participant authorization (IDOR security guard).
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Conversation ID is required' }, { status: 400 });
    }

    const customer = verifyCustomerAuth(request);
    const admin = verifyAdminAuth(request);

    if (!customer && !admin) {
      return unauthorizedResponse('Authentication required');
    }

    const authUser = admin || customer;
    const conversation = await getConversationById(id, authUser);

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    const isForbidden = error.message?.includes('Unauthorized');
    const isNotFound = error.message?.includes('not found');
    const status = isForbidden ? 403 : isNotFound ? 404 : 500;

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch conversation' },
      { status }
    );
  }
}
