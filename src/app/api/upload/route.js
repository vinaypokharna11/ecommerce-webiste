import { NextResponse } from 'next/server';
import { uploadImage, deleteImage, isCloudinaryConfigured } from '@/lib/cloudinary';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Check Cloudinary status
export async function GET() {
  const configured = isCloudinaryConfigured();
  return NextResponse.json({
    success: true,
    isConfigured: configured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    message: configured
      ? 'Cloudinary is ready for uploads.'
      : 'Cloudinary credentials missing in .env.local (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).',
  });
}

// POST: Upload an image
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let imageData = '';
    let folder = 'nakoda_imitation/products';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      imageData = body.image || body.file || body.dataUrl;
      if (body.folder) folder = body.folder;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') || formData.get('image');
      if (formData.get('folder')) folder = formData.get('folder');

      if (!file) {
        return NextResponse.json({ success: false, error: 'No image file found in form data' }, { status: 400 });
      }

      if (typeof file === 'string') {
        imageData = file;
      } else {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mimeType = file.type || 'image/jpeg';
        imageData = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported Content-Type. Use JSON or multipart/form-data.' }, { status: 400 });
    }

    if (!imageData) {
      return NextResponse.json({ success: false, error: 'Image data is required.' }, { status: 400 });
    }

    const result = await uploadImage(imageData, { folder });

    return NextResponse.json({
      success: true,
      url: result.url,
      public_id: result.public_id || null,
      width: result.width || null,
      height: result.height || null,
      format: result.format || null,
      isCloudinary: !result.isLocalFallback,
      message: result.message || 'Image uploaded successfully.',
    });
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an image
export async function DELETE(request) {
  try {
    const admin = verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json({ success: false, error: 'public_id query parameter is required' }, { status: 400 });
    }

    const result = await deleteImage(publicId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
