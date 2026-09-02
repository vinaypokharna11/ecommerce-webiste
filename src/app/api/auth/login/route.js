import { NextResponse } from 'next/server';
import { loginCustomer, verifyAdminCredentials } from '@/lib/db';
import { signToken, signAdminToken, ADMIN_COOKIE_MAX_AGE } from '@/lib/auth';
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`login:${ip}`, 5, 60 * 1000);
    if (!rateLimit.isAllowed) {
      return rateLimitExceededResponse(rateLimit.retryAfterSec, 'Too many login attempts. Please wait a minute before trying again.');
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 1. Check if this is an administrator
    const adminUser = await verifyAdminCredentials(email, password);
    if (adminUser) {
      const adminToken = signAdminToken({
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role || 'admin',
      });

      const response = NextResponse.json({
        success: true,
        message: 'Admin authenticated successfully',
        user: { email: adminUser.email, name: adminUser.name, role: adminUser.role || 'admin' },
        role: adminUser.role || 'admin',
        isAdmin: true,
        redirectTo: '/admin',
        token: adminToken,
      });

      response.cookies.set('admin_token', adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ADMIN_COOKIE_MAX_AGE, // 12 hours (43,200 seconds)
        path: '/',
      });

      return response;
    }

    // 2. Check regular customer credentials
    const customerUser = await loginCustomer({ email, password });
    if (!customerUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const customerToken = signToken({
      id: customerUser._id || customerUser.id,
      email: customerUser.email,
      name: customerUser.name,
      role: 'customer',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: customerUser,
      role: 'customer',
      isAdmin: false,
      redirectTo: '/',
      token: customerToken,
    });

    response.cookies.set('customer_token', customerToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
