import { NextResponse } from 'next/server';
import { toggleExploreCollectionVisibility } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const updated = await toggleExploreCollectionVisibility(id);

    return NextResponse.json({
      success: true,
      message: `Collection visibility set to ${updated.isActive ? 'active' : 'hidden'}`,
      collection: updated,
    });
  } catch (error) {
    const status = error.message?.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
