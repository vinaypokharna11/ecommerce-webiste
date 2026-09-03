import { NextResponse } from 'next/server';
import { bulkDeleteProductsDB, bulkUpdateProductsDB } from '@/lib/db';
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
    const { action, ids, updates } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'A non-empty "ids" array is required.' },
        { status: 400 }
      );
    }

    if (action === 'delete') {
      const result = await bulkDeleteProductsDB(ids);
      return NextResponse.json({
        success: true,
        action: 'delete',
        deletedCount: result.deletedCount,
        message: `Successfully deleted ${result.deletedCount} products.`,
      });
    }

    if (action === 'update_stock') {
      const stockStatus = body.stockStatus || 'in_stock';
      const stockCount = Number(body.stockCount) || 0;
      const result = await bulkUpdateProductsDB(ids, { stockStatus, stockCount });
      return NextResponse.json({
        success: true,
        action: 'update_stock',
        updatedCount: result.updatedCount,
      });
    }

    if (action === 'update_category') {
      const { category, categoryName } = body;
      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Target category is required.' },
          { status: 400 }
        );
      }
      const result = await bulkUpdateProductsDB(ids, { category, categoryName: categoryName || category });
      return NextResponse.json({
        success: true,
        action: 'update_category',
        updatedCount: result.updatedCount,
      });
    }

    if (action === 'apply_discount') {
      const discountPercent = Math.max(0, Math.min(100, Number(body.discountPercent) || 0));
      const result = await bulkUpdateProductsDB(ids, {
        discountPercent,
        badge: discountPercent > 0 ? `${discountPercent}% OFF` : '',
        badgeType: discountPercent > 0 ? 'discount' : '',
      });
      return NextResponse.json({
        success: true,
        action: 'apply_discount',
        updatedCount: result.updatedCount,
      });
    }

    if (action === 'custom_update' && updates && typeof updates === 'object') {
      const result = await bulkUpdateProductsDB(ids, updates);
      return NextResponse.json({
        success: true,
        action: 'custom_update',
        updatedCount: result.updatedCount,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: `Invalid action "${action}". Supported actions: delete, update_stock, update_category, apply_discount, custom_update`,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Bulk product operation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
