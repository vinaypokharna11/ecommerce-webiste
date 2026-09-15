import { NextResponse } from 'next/server';
import { getHeroShowcase, updateHeroShowcase, DEFAULT_HERO_SHOWCASE } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const heroShowcase = await getHeroShowcase();
    return NextResponse.json({ success: true, heroShowcase });
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
      const updated = await updateHeroShowcase(DEFAULT_HERO_SHOWCASE);
      return NextResponse.json({
        success: true,
        message: 'Hero showcase reset to defaults',
        heroShowcase: updated,
      });
    }

    const cards = Array.isArray(body) ? body : (body.heroShowcase || body.cards || []);
    const updated = await updateHeroShowcase(cards);
    return NextResponse.json({ success: true, heroShowcase: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
