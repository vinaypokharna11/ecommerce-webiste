import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { email } = await request.json();
    const target = email || process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'admin@nakodaimitation.com';

    const result = await sendTestEmail(target);
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email successfully dispatched to ${target}!`,
        isMock: result.isMock,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send test email',
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
