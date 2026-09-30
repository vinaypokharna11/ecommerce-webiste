import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const stockStatus = searchParams.get('stockStatus');
    const isPopular = searchParams.get('isPopular') === 'true';
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const admin = verifyAdminAuth(request);
    const includeDeleted = Boolean(admin && searchParams.get('includeDeleted') === 'true');

    const products = await getProducts({ category, search, stockStatus, isPopular, isFeatured, includeDeleted });
    const cacheHeader = includeDeleted
      ? 'no-store, no-cache, must-revalidate, proxy-revalidate'
      : 'public, s-maxage=15, stale-while-revalidate=59';

    return NextResponse.json(
      { success: true, count: products.length, products },
      {
        headers: {
          'Cache-Control': cacheHeader,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await request.json().catch(() => ({}));
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      );
    }
    const priceNum = Number(body.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid product price greater than 0 is required' },
        { status: 400 }
      );
    }

    const newProduct = await createProduct(body);
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    const status = error.code === 'SKU_ALREADY_EXISTS' ? 409 : 500;
    return NextResponse.json({ success: false, code: error.code, error: error.message }, { status });
  }
}
