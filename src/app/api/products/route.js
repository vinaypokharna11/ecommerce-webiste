import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const stockStatus = searchParams.get('stockStatus');
    const isPopular = searchParams.get('isPopular') === 'true';
    const isFeatured = searchParams.get('isFeatured') === 'true';

    const products = getProducts({ category, search, stockStatus, isPopular, isFeatured });
    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.price) {
      return NextResponse.json(
        { success: false, error: 'Product name and price are required' },
        { status: 400 }
      );
    }

    const newProduct = createProduct(body);
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
