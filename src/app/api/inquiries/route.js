import { NextResponse } from 'next/server';
import { getInquiries, createInquiry, updateInquiryStatus, deleteInquiry, getStoreConfig } from '@/lib/db';
import { sendInquiryConfirmationEmail, sendAdminInquiryNotification } from '@/lib/email';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const inquiries = await getInquiries();
    return NextResponse.json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone number are required.' },
        { status: 400 }
      );
    }

    const newInquiry = await createInquiry(body);
    const storeConfig = await getStoreConfig();

    // Asynchronously dispatch confirmation & admin alert email if configured
    Promise.allSettled([
      sendInquiryConfirmationEmail(newInquiry, storeConfig),
      sendAdminInquiryNotification(newInquiry, storeConfig),
    ]).catch((err) => console.error('Error dispatching inquiry emails:', err));

    return NextResponse.json({ success: true, inquiry: newInquiry }, { status: 201 });
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
      return NextResponse.json({ success: false, error: 'Inquiry ID and status are required' }, { status: 400 });
    }

    const updated = await updateInquiryStatus(id, status, adminNotes);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry: updated });
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
      return NextResponse.json({ success: false, error: 'Inquiry ID is required' }, { status: 400 });
    }

    const deleted = await deleteInquiry(id);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
