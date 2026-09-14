import { NextResponse } from 'next/server';
import { getCategories, getExistingProductIdsDB } from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';
import { validateBulkDataset } from '@/lib/productImport';

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
      rows = [],
      mapping = {},
      duplicateMode = 'skip',
      importMode = 'create',
    } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data rows provided for validation.' },
        { status: 400 }
      );
    }

    // 1. Fetch current categories and existing product IDs from DB
    const [categories, existingIdsList] = await Promise.all([
      getCategories(),
      getExistingProductIdsDB(),
    ]);

    const dbExistingIds = new Set(existingIdsList);

    // 2. Run comprehensive validation
    const validationResult = validateBulkDataset({
      dataRows: rows,
      mapping,
      categories: Array.isArray(categories) ? categories : [],
      dbExistingIds,
      duplicateMode,
      importMode,
    });

    return NextResponse.json({
      success: true,
      validation: validationResult,
      categoriesCount: categories.length,
      existingProductCount: existingIdsList.length,
    });
  } catch (error) {
    console.error('Error validating bulk products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Validation failed.' },
      { status: 500 }
    );
  }
}
