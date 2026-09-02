import jwt from 'jsonwebtoken';

/**
 * Retrieves the JWT Secret from environment variables.
 * Enforces that in production, JWT_SECRET must be explicitly defined.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production environment.');
    }
    return 'dev_temporary_jwt_secret_change_in_production_2026';
  }
  return secret;
}

export const ADMIN_TOKEN_EXPIRY = '12h';
export const ADMIN_COOKIE_MAX_AGE = 12 * 60 * 60; // 12 hours in seconds (43,200s)

export function signToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function signAdminToken(payload, expiresIn = ADMIN_TOKEN_EXPIRY) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
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
