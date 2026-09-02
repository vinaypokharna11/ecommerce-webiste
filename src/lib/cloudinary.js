import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = () => {
  return Boolean(cloudName && apiKey && apiSecret);
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Upload an image (data URI, base64, remote URL, or file path) to Cloudinary
 * @param {string} fileData - Base64 Data URI, remote URL, or local file buffer/string
 * @param {object} options - Upload options (folder, tags, transformation, etc.)
 * @returns {Promise<{success: boolean, url: string, public_id?: string, width?: number, height?: number, format?: string, isLocalFallback?: boolean}>}
 */
export async function uploadImage(fileData, options = {}) {
  const {
    folder = 'nakoda_imitation/products',
    tags = ['nakoda', 'ecommerce'],
    resource_type = 'auto',
  } = options;

  if (!isCloudinaryConfigured()) {
    console.warn('⚠️ Cloudinary is not configured in .env.local. Falling back to local data URI.');
    return {
      success: true,
      url: fileData,
      isLocalFallback: true,
      message: 'Cloudinary credentials missing in .env.local. Using original file data.',
    };
  }

  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      tags,
      resource_type,
      overwrite: true,
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
      ],
    });

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }
}

/**
 * Delete an image from Cloudinary by its public ID
 * @param {string} publicId
 * @returns {Promise<{success: boolean, result?: any}>}
 */
export async function deleteImage(publicId) {
  if (!isCloudinaryConfigured() || !publicId) {
    return { success: false, message: 'Cloudinary not configured or public_id missing' };
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return { success: res.result === 'ok', result: res };
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    return { success: false, error: error.message };
  }
}

export default cloudinary;
