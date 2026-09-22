import { NextResponse } from 'next/server';
import { restoreProduct } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/products/[id]/restore
 * Restores a soft-deleted product back into active catalog.
 */
export async function POST(request, { params }) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const rawId = params?.id || '';
    const id = decodeURIComponent(rawId).trim();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const restored = await restoreProduct(id);
    if (!restored) {
      return NextResponse.json({ success: false, error: `Product "${id}" not found or not deleted` }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, product: restored, message: `Product ${id} restored successfully` },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error restoring product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
