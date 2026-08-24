import { NextResponse } from 'next/server';
import { getOrders, createOrder, getStoreConfig } from '@/lib/db';
import { sendOrderConfirmationEmail, sendAdminNewOrderNotification } from '@/lib/email';

export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newOrder = createOrder(body);
    const storeConfig = getStoreConfig();

    // Trigger automated emails asynchronously (without blocking response)
    Promise.allSettled([
      sendOrderConfirmationEmail(newOrder, storeConfig),
      sendAdminNewOrderNotification(newOrder, storeConfig),
    ]).catch((err) => console.error('Error dispatching order emails:', err));

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
