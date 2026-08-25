import { NextResponse } from 'next/server';
import { verifyCustomerAuth } from '@/lib/auth';
import { getCustomerById, getOrders } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const user = await getCustomerById(auth.id || auth.email);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // Also get customer's orders
    const orders = await getOrders(user.email || user._id || user.id);

    return NextResponse.json({
      authenticated: true,
      user,
      orders,
    });
  } catch (error) {
    console.error('Customer me error:', error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
