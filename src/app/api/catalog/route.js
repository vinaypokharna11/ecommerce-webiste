import { NextResponse } from 'next/server';
import { getCatalogBundle } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bundle = await getCatalogBundle();

    return NextResponse.json(
      {
        success: true,
        ...bundle,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching catalog bundle:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
