import { NextResponse } from 'next/server';
import { getOrders, createOrder, updateOrderStatus, getStoreConfig } from '@/lib/db';
import { sendOrderConfirmationEmail, sendAdminNewOrderNotification } from '@/lib/email';
import { verifyAdminAuth, verifyCustomerAuth, unauthorizedResponse } from '@/lib/auth';
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const sellerId = searchParams.get('sellerId');

    const admin = verifyAdminAuth(request);
    if (admin) {
      const filterSeller = (admin.role === 'seller' && admin.sellerId) ? admin.sellerId : sellerId;
      const orders = await getOrders(null, { status, sellerId: filterSeller, search, limit });
      return NextResponse.json({ success: true, count: orders.length, orders });
    }

    const customer = verifyCustomerAuth(request);
    if (customer) {
      const orders = await getOrders(customer.email || customer.id, { status, search, limit });
      return NextResponse.json({ success: true, count: orders.length, orders });
    }

    return unauthorizedResponse('Authentication required to access orders');
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`order:${ip}`, 10, 5 * 60 * 1000);
    if (!rateLimit.isAllowed) {
      return rateLimitExceededResponse(rateLimit.retryAfterSec, 'Too many order attempts. Please wait before placing another order.');
    }

    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid order payload' }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must contain at least one product item.' }, { status: 400 });
    }

    if (!body.customerName || typeof body.customerName !== 'string' || !body.customerName.trim()) {
      return NextResponse.json({ success: false, error: 'Customer name is required.' }, { status: 400 });
    }

    if (!body.customerPhone || typeof body.customerPhone !== 'string' || !body.customerPhone.trim()) {
      return NextResponse.json({ success: false, error: 'Customer phone number is required.' }, { status: 400 });
    }

    const customer = verifyCustomerAuth(request);

    const orderData = {
      ...body,
      userId: customer ? (customer.id || customer.email) : (body.userId || body.customerEmail),
      customerId: customer ? (customer.id || customer.email) : null,
    };

    const newOrder = await createOrder(orderData);
    const storeConfig = await getStoreConfig();

    // Notify the seller immediately about the new incoming pending order
    Promise.allSettled([
      sendAdminNewOrderNotification(newOrder, storeConfig),
    ]).catch((err) => console.error('Error dispatching seller order notification:', err));

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const { id, status, sellerNotes } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Order ID and status are required' }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, status, sellerNotes);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
