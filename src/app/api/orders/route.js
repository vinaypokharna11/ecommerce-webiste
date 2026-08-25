import { NextResponse } from 'next/server';
import { getOrders, createOrder, updateOrderStatus, getStoreConfig } from '@/lib/db';
import { sendOrderConfirmationEmail, sendAdminNewOrderNotification } from '@/lib/email';
import { verifyAdminAuth, verifyCustomerAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (admin) {
      const orders = await getOrders();
      return NextResponse.json({ success: true, count: orders.length, orders });
    }

    const customer = verifyCustomerAuth(request);
    if (customer) {
      const orders = await getOrders(customer.email || customer.id);
      return NextResponse.json({ success: true, count: orders.length, orders });
    }

    return unauthorizedResponse('Authentication required to access orders');
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const customer = verifyCustomerAuth(request);

    const orderData = {
      ...body,
      userId: customer ? (customer.id || customer.email) : (body.userId || body.customerEmail),
    };

    const newOrder = await createOrder(orderData);
    const storeConfig = await getStoreConfig();

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

export async function PUT(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Order ID and status are required' }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
