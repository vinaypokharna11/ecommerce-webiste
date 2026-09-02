import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/lib/db';
import { signAdminToken, ADMIN_COOKIE_MAX_AGE } from '@/lib/auth';
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_login:${ip}`, 5, 60 * 1000);
    if (!rateLimit.isAllowed) {
      return rateLimitExceededResponse(rateLimit.retryAfterSec, 'Too many admin login attempts. Please wait before retrying.');
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await verifyAdminCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Sign JWT token with 12 hours expiration
    const token = signAdminToken({
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: { email: user.email, name: user.name, role: user.role },
      token,
    });

    // Set secure cookie expiring in 12 hours
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_COOKIE_MAX_AGE, // 12 hours (43,200 seconds)
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
