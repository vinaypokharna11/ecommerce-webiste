import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shopease_super_secret_jwt_key_2026';

export async function GET(request) {
  try {
    const token =
      request.cookies.get('admin_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({
      authenticated: true,
      user: { email: decoded.email, name: decoded.name, role: decoded.role },
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
