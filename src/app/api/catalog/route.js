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
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
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
