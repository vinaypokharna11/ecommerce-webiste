import { NextResponse } from 'next/server';
import { bulkImportProductsDB } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await request.json().catch(() => ({}));
    const {
      products = [],
      duplicateMode = 'skip',
      importMode = 'create',
    } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No products provided for bulk import.' },
        { status: 400 }
      );
    }

    if (products.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Maximum 5,000 products allowed per bulk import batch.' },
        { status: 400 }
      );
    }

    const result = await bulkImportProductsDB({
      products,
      duplicateMode,
      importMode,
    });

    return NextResponse.json({
      success: true,
      ...result,
      message: `Successfully processed ${result.total} items. Created: ${result.inserted}, Updated: ${result.updated}, Skipped: ${result.skipped}, Failed: ${result.failed}.`,
    });
  } catch (error) {
    console.error('Bulk product import error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bulk import failed.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    supportedFormats: ['.csv', '.xlsx', '.xls'],
    maxBatchSize: 5000,
    importModes: ['create', 'update', 'upsert'],
    duplicateModes: ['skip', 'update', 'generate_id'],
  });
}
