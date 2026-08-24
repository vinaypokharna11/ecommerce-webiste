import { NextResponse } from 'next/server';
import { getInquiries, createInquiry, getStoreConfig } from '@/lib/db';
import { sendInquiryConfirmationEmail, sendAdminInquiryNotification } from '@/lib/email';

export async function GET() {
  try {
    const inquiries = getInquiries();
    return NextResponse.json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required fields.' },
        { status: 400 }
      );
    }

    const newInquiry = createInquiry(body);
    const storeConfig = getStoreConfig();

    // Asynchronously dispatch confirmation & admin alert email
    Promise.allSettled([
      sendInquiryConfirmationEmail(newInquiry, storeConfig),
      sendAdminInquiryNotification(newInquiry, storeConfig),
    ]).catch((err) => console.error('Error dispatching inquiry emails:', err));

    return NextResponse.json({ success: true, inquiry: newInquiry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
