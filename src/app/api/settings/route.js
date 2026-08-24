import { NextResponse } from 'next/server';
import { getStoreConfig, updateStoreConfig, resetDatabase } from '@/lib/db';

export async function GET() {
  try {
    const config = getStoreConfig();
    return NextResponse.json({ success: true, storeConfig: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (body.action === 'reset_defaults') {
      const reset = resetDatabase();
      return NextResponse.json({ success: true, message: 'Database reset to factory defaults', storeConfig: reset.storeConfig });
    }

    const updated = updateStoreConfig(body);
    return NextResponse.json({ success: true, storeConfig: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
