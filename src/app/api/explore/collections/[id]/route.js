import { NextResponse } from 'next/server';
import {
  getExploreCollectionByIdOrSlug,
  updateExploreCollection,
  deleteExploreCollection,
} from '@/lib/db';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const collection = await getExploreCollectionByIdOrSlug(id);

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found or has been removed' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, collection },
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

export async function PUT(request, { params }) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const updated = await updateExploreCollection(id, body);

    return NextResponse.json({ success: true, collection: updated });
  } catch (error) {
    const status = error.message?.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const result = await deleteExploreCollection(id);

    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully',
      deletedId: result.deletedId,
    });
  } catch (error) {
    const status = error.message?.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
