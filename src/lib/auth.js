import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shopease_super_secret_jwt_key_2026';

export const ADMIN_TOKEN_EXPIRY = '12h';
export const ADMIN_COOKIE_MAX_AGE = 12 * 60 * 60; // 12 hours in seconds (43,200s)

export function signToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function signAdminToken(payload, expiresIn = ADMIN_TOKEN_EXPIRY) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verifies admin authorization from Request cookies or Authorization header.
 * Returns decoded admin user if authorized, or null.
 */
export function verifyAdminAuth(request) {
  const token =
    request?.cookies?.get?.('admin_token')?.value ||
    request?.headers?.get?.('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
    return null;
  }

  return decoded;
}

/**
 * Verifies customer authentication from Request cookies or Authorization header.
 */
export function verifyCustomerAuth(request) {
  const token =
    request?.cookies?.get?.('customer_token')?.value ||
    request?.headers?.get?.('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'customer') {
    return null;
  }

  return decoded;
}

/**
 * Standard unauthorized response helper.
 */
export function unauthorizedResponse(message = 'Unauthorized: Administrative access required') {
  return Response.json(
    { success: false, error: message },
    { status: 401 }
  );
}
