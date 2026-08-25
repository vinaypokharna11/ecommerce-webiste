import { NextResponse } from 'next/server';
import { getOffers, createOffer } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const offers = await getOffers();
    return NextResponse.json({ success: true, count: offers.length, offers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    if (!body.code || !body.title) {
      return NextResponse.json({ success: false, error: 'Offer code and title are required' }, { status: 400 });
    }
    const newOffer = await createOffer(body);
    return NextResponse.json({ success: true, offer: newOffer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
