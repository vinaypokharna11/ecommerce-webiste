import { NextResponse } from 'next/server';

/**
 * Cryptographically verifies admin JWT token using Web Crypto API (supported in Edge and Node runtimes).
 * Validates HMAC SHA-256 signature, expiration, and authorized roles.
 */
async function isValidAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [headerB64, payloadB64, signatureB64] = parts;

  try {
    // 1. Decode and check payload claims
    let b64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const payload = JSON.parse(atob(b64));
    if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin' && payload.role !== 'seller')) {
      return false;
    }
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }

    // 2. Cryptographic signature check with HMAC SHA-256
    const secret = process.env.JWT_SECRET || 'dev_temporary_jwt_secret_change_in_production_2026';
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    let sigB64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    while (sigB64.length % 4) sigB64 += '=';
    const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    const dataBytes = enc.encode(`${headerB64}.${payloadB64}`);

    return await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
  } catch (err) {
    return false;
  }
}

/**
 * Next.js 16 Proxy for Server-Side Route Protection
 * Cryptographically validates admin credentials before allowing access to /admin routes.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Protect /admin and any sub-routes, except the login page
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value;

    const isValid = await isValidAdminToken(adminToken);
    if (!isValid) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      if (adminToken) {
        response.cookies.delete('admin_token');
      }
      return response;
    }
  }

  return NextResponse.next();
}

// Support fallback naming
export const middleware = proxy;

export const config = {
  matcher: ['/admin/:path*'],
};
