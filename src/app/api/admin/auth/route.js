import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const admin = verifyAdminAuth(request);

    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: { email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
