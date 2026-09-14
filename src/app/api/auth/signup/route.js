import { NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit';
import { validateAndSanitizeSignup } from '@/lib/validations/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`signup:${ip}`, 5, 15 * 60 * 1000); // Max 5 signups per 15 mins per IP
    if (!rateLimit.isAllowed) {
      return rateLimitExceededResponse(rateLimit.retryAfterSec, 'Too many registration attempts. Please wait before creating another account.');
    }

    const rawBody = await request.json().catch(() => null);

    // Server-side input validation & sanitization via Zod
    const validation = validateAndSanitizeSignup(rawBody, ip, 'POST /api/auth/signup');
    if (!validation.isValid) {
      return validation.response;
    }

    const { name, email, password, phone, address, city, pincode } = validation.data;

    const user = await registerCustomer({ 
      name, 
      email, 
      password, 
      phone: phone || '', 
      address: address || '', 
      city: city || '', 
      pincode: pincode || '' 
    });

    // Generate JWT token
    const token = signToken({
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: 'customer',
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user,
        token,
      },
      { status: 201 }
    );

    // Set secure cookie
    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create account' },
      { status: 400 }
    );
  }
}
