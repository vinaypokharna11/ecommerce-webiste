import { NextResponse } from 'next/server';
import { verifyCustomerAuth, unauthorizedResponse } from '@/lib/auth';
import { updateCustomerProfile } from '@/lib/db';

export async function PUT(request) {
  try {
    const auth = verifyCustomerAuth(request);
    if (!auth) {
      return unauthorizedResponse('Please log in to update your profile');
    }

    const body = await request.json();
    const updated = await updateCustomerProfile(auth.id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
