import { NextResponse } from 'next/server';
import { getStoreConfig, updateStoreConfig, resetDatabase } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getStoreConfig();
    return NextResponse.json({ success: true, storeConfig: config });
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
      const reset = resetDatabase();
      return NextResponse.json({ success: true, message: 'Database reset to factory defaults', storeConfig: reset.storeConfig });
    }

    const updated = await updateStoreConfig(body);
    return NextResponse.json({ success: true, storeConfig: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
