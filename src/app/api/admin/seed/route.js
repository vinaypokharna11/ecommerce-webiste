import { NextResponse } from 'next/server';
import {
  getMasterSeedTemplate,
  updateMasterSeedTemplate,
  restoreSeedCatalog,
  clearCatalog,
} from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const template = getMasterSeedTemplate();
    return NextResponse.json({
      success: true,
      template,
      productsCount: (template.products || []).length,
      categoriesCount: (template.categories || []).length,
      offersCount: (template.offers || []).length,
      version: template.version || 1,
      updatedAt: template.updatedAt,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || 'restore_defaults';

    if (action === 'restore_defaults' || action === 'restore_seed') {
      const result = await restoreSeedCatalog(body.customSeed || null);
      return NextResponse.json({
        success: true,
        message: 'Master seed catalog restored successfully into active database.',
        count: result.count,
      });
    }

    if (action === 'update_seed') {
      const templateData = body.template || {};
      if (!templateData.products && !templateData.categories && !templateData.offers) {
        return NextResponse.json(
          { success: false, error: 'Valid seed template payload (products, categories, or offers) is required.' },
          { status: 400 }
        );
      }

      const updated = updateMasterSeedTemplate(templateData);
      return NextResponse.json({
        success: true,
        message: 'Master seed template updated and saved successfully.',
        template: updated,
      });
    }

    if (action === 'clear_catalog' || action === 'clear_all') {
      const result = await clearCatalog();
      return NextResponse.json({
        success: true,
        message: 'Catalog cleared successfully. Database will remain empty across refreshes.',
        count: result.count,
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action "${action}". Allowed actions: restore_defaults, update_seed, clear_catalog` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin seed action error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
