import { NextResponse } from 'next/server';
import { getContactMessages, createContactMessage, getStoreConfig } from '@/lib/db';
import { sendContactConfirmationEmail, sendAdminContactNotification } from '@/lib/email';

export async function GET() {
  try {
    const messages = getContactMessages();
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

    const newContactMessage = createContactMessage(body);
    const storeConfig = getStoreConfig();

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
