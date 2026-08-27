import { NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/db';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, city, pincode } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const user = await registerCustomer({ name, email, password, phone, address, city, pincode });

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
