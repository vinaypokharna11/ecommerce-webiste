/**
 * Client-side helper to upload images to Cloudinary via the /api/upload endpoint.
 * Accepts a File object, Blob, base64 data URI, or URL.
 *
 * @param {File|Blob|string} imageFileOrBase64
 * @param {string} folder - Destination folder on Cloudinary (e.g. 'nakoda_imitation/products')
 * @returns {Promise<{success: boolean, url: string, public_id?: string, isCloudinary?: boolean, error?: string}>}
 */
export async function uploadToCloudinary(imageFileOrBase64, folder = 'nakoda_imitation/products') {
  try {
    let payload;
    let headers = {};

    if (typeof imageFileOrBase64 === 'string') {
      // JSON base64 / data URI
      payload = JSON.stringify({
        image: imageFileOrBase64,
        folder,
      });
      headers['Content-Type'] = 'application/json';
    } else {
      // File or Blob
      const formData = new FormData();
      formData.append('file', imageFileOrBase64);
      formData.append('folder', folder);
      payload = formData;
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: payload,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to upload image');
    }

    return {
      success: true,
      url: data.url,
      public_id: data.public_id,
      isCloudinary: data.isCloudinary,
      width: data.width,
      height: data.height,
      format: data.format,
    };
  } catch (error) {
    console.error('❌ Upload client error:', error);
    // If upload fails, fallback to local object URL or data URI if available
    if (typeof imageFileOrBase64 === 'string') {
      return { success: true, url: imageFileOrBase64, isCloudinary: false };
    }
    throw error;
  }
}
