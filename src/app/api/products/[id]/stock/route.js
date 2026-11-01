import { NextResponse } from 'next/server';
import { adjustProductStockDB, getProductById } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH /api/products/[id]/stock
 * Atomic product inventory adjustment.
 * Body: { delta: number } OR { stockCount: number }
 */
export async function PATCH(request, { params }) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const resolvedParams = await params;
    const rawId = resolvedParams?.id || '';
    const id = decodeURIComponent(rawId).trim();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    let delta = body.delta !== undefined ? Number(body.delta) : undefined;

    if (delta === undefined && body.stockCount !== undefined) {
      const targetStock = Number(body.stockCount);
      if (isNaN(targetStock) || targetStock < 0) {
        return NextResponse.json(
          { success: false, error: 'Stock count cannot be negative' },
          { status: 400 }
        );
      }
      const existing = await getProductById(id, { includeDeleted: true });
      if (!existing) {
        return NextResponse.json({ success: false, error: `Product "${id}" not found` }, { status: 404 });
      }
      delta = targetStock - (Number(existing.stockCount) || 0);
    }

    if (delta === undefined || isNaN(delta)) {
      return NextResponse.json(
        { success: false, error: 'Either "delta" or "stockCount" is required' },
        { status: 400 }
      );
    }

    const result = await adjustProductStockDB(id, delta);
    if (!result.success) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status }
      );
    }

    return NextResponse.json(
      { success: true, product: result.product },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error adjusting product stock:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
