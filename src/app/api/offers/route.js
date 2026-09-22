import { NextResponse } from 'next/server';
import { getOffers, createOffer } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const admin = verifyAdminAuth(request);
    const { searchParams } = new URL(request.url);
    const showAll = Boolean(admin);

    // Public customers only receive active, non-paused, non-deleted, non-expired offers
    const offers = await getOffers({
      includeInactive: Boolean(showAll),
      includeDeleted: false,
    });

    return NextResponse.json({ success: true, count: offers.length, offers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse('Administrative access required to create offers.');
    }

    const body = await request.json();
    if (!body.code || typeof body.code !== 'string' || !body.code.trim()) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }
    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json({ success: false, error: 'Offer title is required' }, { status: 400 });
    }

    const newOffer = await createOffer(body);
    return NextResponse.json({ success: true, offer: newOffer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
