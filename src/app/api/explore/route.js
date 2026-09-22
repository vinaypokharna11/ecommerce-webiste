import { NextResponse } from 'next/server';
import { getExploreSection, updateExploreSection, DEFAULT_EXPLORE_SECTION } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wantsAdmin = searchParams.get('admin') === 'true';
    const admin = wantsAdmin ? verifyAdminAuth(request) : null;
    const isAdmin = Boolean(admin);

    const exploreSection = await getExploreSection({ admin: isAdmin });
    return NextResponse.json(
      { success: true, exploreSection },
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

export async function PUT(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const updated = await updateExploreSection(body);
    return NextResponse.json({ success: true, exploreSection: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
