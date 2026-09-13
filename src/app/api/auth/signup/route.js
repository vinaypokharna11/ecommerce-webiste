import { NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`signup:${ip}`, 5, 15 * 60 * 1000); // Max 5 signups per 15 mins per IP
    if (!rateLimit.isAllowed) {
      return rateLimitExceededResponse(rateLimit.retryAfterSec, 'Too many registration attempts. Please wait before creating another account.');
    }

    const body = await request.json();
    const { name, email, password, phone, address, city, pincode } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (/[^a-zA-Z\s]/.test(name.trim())) {
      return NextResponse.json(
        { success: false, error: 'Name must only contain letters and spaces (no special characters or numbers)' },
        { status: 400 }
      );
    }

    let cleanPhone = '';
    if (phone && String(phone).trim() !== '') {
      cleanPhone = String(phone).replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return NextResponse.json(
          { success: false, error: 'Phone number must be exactly 10 digits' },
          { status: 400 }
        );
      }
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const user = await registerCustomer({ 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      password, 
      phone: cleanPhone, 
      address, 
      city, 
      pincode 
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
