import { NextResponse } from 'next/server';
import { getExploreSection, updateExploreSection, DEFAULT_EXPLORE_SECTION } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const exploreSection = await getExploreSection();
    return NextResponse.json({ success: true, exploreSection });
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
    if (body.action === 'reset_defaults') {
      const updated = await updateExploreSection(DEFAULT_EXPLORE_SECTION);
      return NextResponse.json({
        success: true,
        message: 'Explore section reset to defaults',
        exploreSection: updated,
      });
    }

    const updated = await updateExploreSection(body);
    return NextResponse.json({ success: true, exploreSection: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
