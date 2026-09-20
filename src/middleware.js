import { NextResponse } from 'next/server';

function isValidAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const payload = JSON.parse(atob(b64));
    if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin' && payload.role !== 'seller')) {
      return false;
    }
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Edge Middleware for Server-Side Route Protection
 * Prevents unauthenticated users from accessing administrative pages and downloading admin JS bundles.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect /admin and any sub-routes, except the login page
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value;

    if (!isValidAdminToken(adminToken)) {
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

export const config = {
  matcher: ['/admin/:path*'],
};
