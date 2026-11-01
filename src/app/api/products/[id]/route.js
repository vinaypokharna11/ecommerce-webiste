import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const rawId = resolvedParams?.id || '';
    const id = decodeURIComponent(rawId).trim();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const admin = verifyAdminAuth(request);
    const includeDeleted = Boolean(admin && searchParams.get('includeDeleted') === 'true');

    const product = await getProductById(id, { includeDeleted });
    if (!product) {
      return NextResponse.json({ success: false, error: `Product "${id}" not found` }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, product },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
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
    const updated = await updateProduct(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: `Product "${id}" not found` }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    const status = error.code === 'SKU_ALREADY_EXISTS' ? 409 : 500;
    return NextResponse.json({ success: false, code: error.code, error: error.message }, { status });
  }
}

export async function DELETE(request, { params }) {
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

    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    await deleteProduct(id, { soft: !hard });

    return NextResponse.json({ success: true, id, message: `Product ${id} deleted successfully` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
