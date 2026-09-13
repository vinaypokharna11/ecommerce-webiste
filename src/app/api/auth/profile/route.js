import { NextResponse } from 'next/server';
import { verifyCustomerAuth, unauthorizedResponse, signToken } from '@/lib/auth';
import { updateCustomerProfile, deleteCustomerAccount } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(request) {
  try {
    const auth = verifyCustomerAuth(request);
    if (!auth) {
      return unauthorizedResponse('Please log in to update your profile');
    }

    const body = await request.json();

    // Validation: Name must not contain special characters
    if (body.name !== undefined) {
      const trimmedName = String(body.name).trim();
      if (!trimmedName || /[^a-zA-Z\s]/.test(trimmedName)) {
        return NextResponse.json(
          { success: false, error: 'Name must only contain letters and spaces (no special characters or numbers)' },
          { status: 400 }
        );
      }
      body.name = trimmedName;
    }

    // Validation: Email address format
    if (body.email !== undefined) {
      const trimmedEmail = String(body.email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { success: false, error: 'Please provide a valid email address' },
          { status: 400 }
        );
      }
      body.email = trimmedEmail;
    }

    // Validation: Phone must be exactly 10 digits
    if (body.phone !== undefined && body.phone !== null && String(body.phone).trim() !== '') {
      const phoneDigits = String(body.phone).replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        return NextResponse.json(
          { success: false, error: 'Phone number must be exactly 10 digits' },
          { status: 400 }
        );
      }
      body.phone = phoneDigits;
    }

    const updated = await updateCustomerProfile(auth.id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Re-sign token with updated customer info so session cookie stays valid and in sync
    const newToken = signToken({
      id: updated._id || updated.id,
      email: updated.email,
      name: updated.name,
      role: 'customer',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    });

    response.cookies.set('customer_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
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
