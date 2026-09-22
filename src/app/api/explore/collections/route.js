import { NextResponse } from 'next/server';
import { getExploreCollections, createExploreCollection } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wantsAdmin = searchParams.get('admin') === 'true';
    const admin = wantsAdmin ? verifyAdminAuth(request) : null;
    const includeInactive = Boolean(admin) || searchParams.get('includeInactive') === 'true';

    const collections = await getExploreCollections({
      includeInactive,
      includeDeleted: false,
    });

    return NextResponse.json(
      { success: true, collections },
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

export async function POST(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    if (!body || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Collection name is required' },
        { status: 400 }
      );
    }

    const collection = await createExploreCollection(body);
    return NextResponse.json(
      { success: true, collection },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
