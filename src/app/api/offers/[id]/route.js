import { NextResponse } from 'next/server';
import { updateOffer, deleteOffer } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const { id } = params;
    const body = await request.json();
    const updated = await updateOffer(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, offer: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const { id } = params;
    const deleted = await deleteOffer(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Offer ${id} deleted successfully` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
