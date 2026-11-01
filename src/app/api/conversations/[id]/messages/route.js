import { NextResponse } from 'next/server';
import { getConversationMessages, sendConversationMessage } from '@/lib/db';
import { verifyCustomerAuth, verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/conversations/[id]/messages
 * Fetches chronologically sorted messages for a conversation.
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
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 50;
    const before = searchParams.get('before') || null;

    const result = await getConversationMessages(id, authUser, { limit, before });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const isForbidden = error.message?.includes('Unauthorized');
    const isNotFound = error.message?.includes('not found');
    const status = isForbidden ? 403 : isNotFound ? 404 : 500;

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch messages' },
      { status }
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Sends a message in a conversation.
 * Body:
 * - content: string (message text)
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Conversation ID is required' }, { status: 400 });
    }

    const customer = verifyCustomerAuth(request);
    const admin = verifyAdminAuth(request);

    if (!customer && !admin) {
      return unauthorizedResponse('Authentication required to send message');
    }

    const authUser = admin || customer;
    const body = await request.json().catch(() => ({}));
    const { content } = body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    const result = await sendConversationMessage(id, content, authUser);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 201 }
    );
  } catch (error) {
    const isForbidden = error.message?.includes('Unauthorized');
    const isNotFound = error.message?.includes('not found');
    const status = isForbidden ? 403 : isNotFound ? 404 : 400;

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send message' },
      { status }
    );
  }
}
