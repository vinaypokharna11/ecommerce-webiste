import { NextResponse } from 'next/server';
import { verifyCustomerAuth, unauthorizedResponse } from '@/lib/auth';
import { updateCustomerProfile, deleteCustomerAccount } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

/**
 * DELETE /api/auth/profile
 * Permanently deletes the customer account and anonymizes/removes personal data.
 */
export async function DELETE(request) {
  try {
    const auth = verifyCustomerAuth(request);
    if (!auth) {
      return unauthorizedResponse('Please log in to delete your account');
    }

    const deleted = await deleteCustomerAccount(auth.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'User account not found' }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Your account and personal data have been permanently deleted.',
    });

    // Clear session cookie
    response.cookies.set('customer_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
