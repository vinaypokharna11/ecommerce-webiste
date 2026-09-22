import { NextResponse } from 'next/server';
import { reorderExploreCollections } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const orderedIds = body.orderedIds || body.ids;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'orderedIds array is required' },
        { status: 400 }
      );
    }

    const collections = await reorderExploreCollections(orderedIds);

    return NextResponse.json({
      success: true,
      message: 'Collections reordered successfully',
      collections,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
