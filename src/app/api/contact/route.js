import { NextResponse } from 'next/server';
import { getContactMessages, createContactMessage, updateContactStatus, deleteContactMessage, getStoreConfig } from '@/lib/db';
import { sendContactConfirmationEmail, sendAdminContactNotification } from '@/lib/email';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const messages = await getContactMessages();
    return NextResponse.json({ success: true, count: messages.length, messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const newContactMessage = await createContactMessage(body);
    const storeConfig = await getStoreConfig();

    // Asynchronously dispatch confirmation & admin alert email
    Promise.allSettled([
      sendContactConfirmationEmail(newContactMessage, storeConfig),
      sendAdminContactNotification(newContactMessage, storeConfig),
    ]).catch((err) => console.error('Error dispatching contact emails:', err));

    return NextResponse.json({ success: true, contact: newContactMessage }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const { id, status, adminNotes } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Message ID and status are required' }, { status: 400 });
    }

    const updated = await updateContactStatus(id, status, adminNotes);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, contact: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Message ID is required' }, { status: 400 });
    }

    const deleted = await deleteContactMessage(id);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
