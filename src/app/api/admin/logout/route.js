import { NextResponse } from 'next/server';
import { revokeToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  let token = request?.cookies?.get?.('admin_token')?.value;
  if (!token) {
    const authHeader = request?.headers?.get?.('authorization') || '';
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (token) {
    revokeToken(token);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('admin_token');
  return response;
}
