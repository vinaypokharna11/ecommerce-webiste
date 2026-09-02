import nodemailer from 'nodemailer';

/**
 * Escapes HTML characters to prevent XSS and HTML Injection attacks in email templates.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Create Nodemailer Transporter
function getTransporter() {
  let host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  if (host.includes('@')) {
    host = 'smtp.gmail.com'; // Auto-fix if email was placed in host field
  }
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (user && pass) {
    // If Gmail, use Nodemailer's native Gmail configuration for maximum reliability
    if (user.endsWith('@gmail.com') || host.includes('gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
    });
  }

  // Fallback dev/mock transporter if no credentials provided
  return {
    isMock: true,
    sendMail: async (options) => {
      const maskedRecipient = typeof options.to === 'string'
        ? options.to.replace(/(?<=^.{2}).(?=.*@)/g, '*')
        : '[REDACTED]';
      console.log('────────────────────────────────────────────────────────');
      console.log('📧 [MOCK SMTP EMAIL DISPATCH]');
      console.log(`To: ${maskedRecipient}`);
      console.log(`Subject: ${options.subject}`);
      console.log('────────────────────────────────────────────────────────');
      return { messageId: `mock-${Date.now()}`, accepted: [options.to] };
    },
  };
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    const user = (process.env.SMTP_USER || '').trim();
    let from = process.env.SMTP_FROM;
    if (!from || from.includes('yourdomain.com')) {
      from = user ? `"Nakoda Imitation" <${user}>` : '"Nakoda Imitation" <orders@nakodaimitation.com>';
    }

    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || '',
      html: html || text || '',
    });

    console.log(`✅ [SMTP DISPATCH] Sent to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId, isMock: transporter.isMock };
  } catch (error) {
    console.error('❌ Error sending email via SMTP:', error);
    return { success: false, error: error.message };
  }
}

// ─── Order Confirmation Email for Customer ───
export async function sendOrderConfirmationEmail(order, storeConfig = {}) {
  const currency = storeConfig.currency || '₹';
  const storeName = escapeHtml(storeConfig.name || 'Nakoda Imitation');
  const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || storeConfig.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EAE6FD; color: #15152A; font-weight: 600;">
          ${escapeHtml(item.name)} <span style="color: #8E8EA0; font-size: 12px;">(x${Number(item.quantity) || 1})</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EAE6FD; text-align: right; color: #15152A; font-weight: 700;">
          ${currency}${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF9FF; color: #15152A; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; border: 1px solid #EAE6FD; overflow: hidden; box-shadow: 0 10px 35px rgba(98,87,255,0.08); }
        .header { background: linear-gradient(135deg, #6257FF 0%, #EC5AC8 100%); padding: 32px; text-align: center; color: #FFFFFF; }
        .content { padding: 32px; }
        .total-box { background: #F5F3FF; border-radius: 16px; padding: 16px; margin: 20px 0; border: 1px solid #EAE6FD; }
        .btn { display: inline-block; background: #25D366; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 14px; font-weight: bold; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">🎉 Order Confirmed!</h1>
          <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Thank you for shopping with ${storeName}</p>
        </div>
        <div class="content">
          <p style="font-size: 15px; color: #626276; margin-top: 0;">Hi <strong>${escapeHtml(order.customerName || 'Valued Customer')}</strong>,</p>
          <p style="font-size: 14px; color: #626276; line-height: 1.6;">
            We're thrilled to let you know that your order <strong>${escapeHtml(order.id)}</strong> has been received and is being prepared with care.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #EAE6FD; text-align: left; font-size: 12px; color: #8E8EA0; text-transform: uppercase;">
                <th style="padding-bottom: 8px;">Item</th>
                <th style="padding-bottom: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-box">
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #15152A;">
              <span>Total Amount:</span>
              <span style="color: #6257FF;">${currency}${Number(order.amount || 0).toLocaleString()}</span>
            </div>
            <div style="font-size: 12px; color: #8E8EA0; margin-top: 4px;">
              Payment Method: ${escapeHtml(order.payMethod || 'Cash on Delivery')} · Status: ${escapeHtml(order.statusLabel || 'Processing')}
            </div>
          </div>

          <p style="font-size: 13px; color: #8E8EA0; margin-bottom: 4px;"><strong>Shipping Address:</strong></p>
          <p style="font-size: 13px; color: #15152A; background: #F8F7FF; padding: 12px; border-radius: 12px; margin-top: 0;">
            ${escapeHtml(order.deliveryAddress || 'Store Pickup / Address not provided')}
          </p>

          <div style="text-align: center; margin-top: 28px;">
            <p style="font-size: 13px; color: #8E8EA0; margin-bottom: 8px;">Have questions about your order?</p>
            <a href="https://wa.me/${whatsapp}?text=Hi%20${encodeURIComponent(storeConfig.name || 'Nakoda Imitation')}!%20I%20have%20a%20question%20about%20my%20order%20${order.id}" class="btn">
              💬 Track & Inquire on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: order.customerEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'customer@example.com',
    subject: `Order Confirmation — ${order.id} | ${storeConfig.name || 'Nakoda Imitation'}`,
    html,
    text: `Your order ${order.id} of total ${currency}${order.amount} has been confirmed.`,
  });
}

// ─── Admin Notification Email on New Order ───
export async function sendAdminNewOrderNotification(order, storeConfig = {}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'admin@nakodaimitation.com';
  const currency = storeConfig.currency || '₹';
  const storeName = escapeHtml(storeConfig.name || 'Nakoda Imitation');

  const html = `
    <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background: #FAF9FF; border-radius: 20px; border: 1px solid #EAE6FD;">
      <h2 style="color: #6257FF; margin-top: 0;">🛍️ New Order Received: ${escapeHtml(order.id)}</h2>
      <p style="font-size: 14px; color: #15152A;">A customer has placed an order on <strong>${storeName}</strong>.</p>
      
      <div style="background: white; padding: 16px; border-radius: 14px; border: 1px solid #EAE6FD; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Customer:</strong> ${escapeHtml(order.customerName)} (${escapeHtml(order.customerPhone || 'No Phone')})</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${escapeHtml(order.customerEmail || 'N/A')}</p>
        <p style="margin: 4px 0;"><strong>Address:</strong> ${escapeHtml(order.deliveryAddress || 'N/A')}</p>
        <p style="margin: 4px 0;"><strong>Total Value:</strong> ${currency}${Number(order.amount || 0).toLocaleString()}</p>
        <p style="margin: 4px 0;"><strong>Payment:</strong> ${escapeHtml(order.payMethod || 'COD')}</p>
      </div>

      <p style="font-size: 12px; color: #8E8EA0;">Log into your Admin Dashboard to manage and fulfill this order.</p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[New Order Alert] ${order.id} — ${currency}${order.amount} (${order.customerName})`,
    html,
  });
}

// ─── Contact Form Confirmation for Customer ───
export async function sendContactConfirmationEmail(ticket, storeConfig = {}) {
  const storeName = escapeHtml(storeConfig.name || 'Nakoda Imitation');
  const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || storeConfig.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF9FF; color: #15152A; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; border: 1px solid #EAE6FD; overflow: hidden; box-shadow: 0 10px 35px rgba(98,87,255,0.08); }
        .header { background: linear-gradient(135deg, #6257FF 0%, #8B5CF6 100%); padding: 32px; text-align: center; color: #FFFFFF; }
        .content { padding: 32px; }
        .info-box { background: #F5F3FF; border-radius: 16px; padding: 18px; margin: 20px 0; border: 1px solid #EAE6FD; }
        .btn { display: inline-block; background: #25D366; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 14px; font-weight: bold; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">💬 We've Received Your Message!</h1>
          <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Ticket Reference: ${escapeHtml(ticket.id)}</p>
        </div>
        <div class="content">
          <p style="font-size: 15px; color: #626276; margin-top: 0;">Hi <strong>${escapeHtml(ticket.name || 'Valued Customer')}</strong>,</p>
          <p style="font-size: 14px; color: #626276; line-height: 1.6;">
            Thank you for reaching out to <strong>${storeName}</strong>. Our support team has received your inquiry and is reviewing it. We typically reply within a few hours during business hours.
          </p>

          <div class="info-box">
            <p style="margin: 4px 0; font-size: 13px;"><strong>Topic:</strong> ${escapeHtml(ticket.category || 'General Support')}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Subject:</strong> ${escapeHtml(ticket.subject || 'Support Request')}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Preferred Contact:</strong> ${escapeHtml(ticket.preferredContact || 'Email')}</p>
            <p style="margin: 8px 0 0; font-size: 13px; color: #626276;"><strong>Your Message:</strong><br/>"${escapeHtml(ticket.message)}"</p>
          </div>

          <div style="text-align: center;">
            <p style="font-size: 13px; color: #8E8EA0; margin-bottom: 8px;">Need immediate real-time assistance?</p>
            <a href="https://wa.me/${whatsapp}?text=Hi%20${encodeURIComponent(storeConfig.name || 'Nakoda Imitation')}!%20I%20have%20an%20inquiry%20regarding%20ticket%20${ticket.id}" class="btn">
              💬 Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: ticket.email,
    subject: `Support Ticket Received — ${ticket.id} | ${storeConfig.name || 'Nakoda Imitation'}`,
    html,
    text: `Hi ${ticket.name}, thank you for contacting ${storeConfig.name || 'Nakoda Imitation'}. Your reference ticket is ${ticket.id}. We will reply shortly.`,
  });
}

// ─── Admin Alert for Contact Form Submission ───
export async function sendAdminContactNotification(ticket, storeConfig = {}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'admin@nakodaimitation.com';
  const storeName = escapeHtml(storeConfig.name || 'Nakoda Imitation');

  const html = `
    <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background: #FAF9FF; border-radius: 20px; border: 1px solid #EAE6FD;">
      <h2 style="color: #6257FF; margin-top: 0;">📨 New Customer Message: ${escapeHtml(ticket.id)}</h2>
      <p style="font-size: 14px; color: #15152A;">A customer submitted a contact form on <strong>${storeName}</strong>.</p>
      
      <div style="background: white; padding: 16px; border-radius: 14px; border: 1px solid #EAE6FD; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Customer:</strong> ${escapeHtml(ticket.name)}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${escapeHtml(ticket.email)}</p>
        <p style="margin: 4px 0;"><strong>Phone:</strong> ${escapeHtml(ticket.phone || 'N/A')}</p>
        <p style="margin: 4px 0;"><strong>Topic:</strong> ${escapeHtml(ticket.category)}</p>
        <p style="margin: 4px 0;"><strong>Subject:</strong> ${escapeHtml(ticket.subject)}</p>
        <p style="margin: 8px 0 0; color: #4B5563;"><strong>Message:</strong><br/>${escapeHtml(ticket.message)}</p>
      </div>

      <p style="font-size: 12px; color: #8E8EA0;">You can view and reply to this message directly in your Admin Portal.</p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[Contact Alert] ${ticket.id} — ${ticket.category} from ${ticket.name}`,
    html,
  });
}

// ─── Inquiry Confirmation for Customer ───
export async function sendInquiryConfirmationEmail(inquiry, storeConfig = {}) {
  const storeName = escapeHtml(storeConfig.name || 'Nakoda Imitation');
  const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || storeConfig.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF9FF; color: #15152A; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; border: 1px solid #EAE6FD; overflow: hidden; box-shadow: 0 10px 35px rgba(98,87,255,0.08); }
        .header { background: linear-gradient(135deg, #EC5AC8 0%, #6257FF 100%); padding: 32px; text-align: center; color: #FFFFFF; }
        .content { padding: 32px; }
        .info-box { background: #FFF0FB; border-radius: 16px; padding: 18px; margin: 20px 0; border: 1px solid #FCD6F2; }
        .btn { display: inline-block; background: #25D366; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 14px; font-weight: bold; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">✨ Inquiry Received!</h1>
          <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Inquiry Reference: ${escapeHtml(inquiry.id)}</p>
        </div>
        <div class="content">
          <p style="font-size: 15px; color: #626276; margin-top: 0;">Hi <strong>${escapeHtml(inquiry.customerName || 'Valued Customer')}</strong>,</p>
          <p style="font-size: 14px; color: #626276; line-height: 1.6;">
            Thank you for your interest in <strong>${storeName}</strong>! We've received your request for <strong>${escapeHtml(inquiry.inquiryType)}</strong>. Our team is preparing a customized quotation and availability details for you.
          </p>

          <div class="info-box">
            <p style="margin: 4px 0; font-size: 13px;"><strong>Type:</strong> ${escapeHtml(inquiry.inquiryType)}</p>
            ${inquiry.productName ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Product / Item:</strong> ${escapeHtml(inquiry.productName)}</p>` : ''}
            ${inquiry.quantity ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Estimated Quantity:</strong> ${escapeHtml(inquiry.quantity)}</p>` : ''}
            ${inquiry.targetBudget ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Target Budget:</strong> ${escapeHtml(inquiry.targetBudget)}</p>` : ''}
            ${inquiry.requiredDate ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Timeline / Target Date:</strong> ${escapeHtml(inquiry.requiredDate)}</p>` : ''}
            ${inquiry.notes ? `<p style="margin: 8px 0 0; font-size: 13px; color: #626276;"><strong>Notes / Specs:</strong><br/>"${escapeHtml(inquiry.notes)}"</p>` : ''}
          </div>

          <div style="text-align: center;">
            <p style="font-size: 13px; color: #8E8EA0; margin-bottom: 8px;">Want instant discussion or custom samples?</p>
            <a href="https://wa.me/${whatsapp}?text=Hi%20${encodeURIComponent(storeConfig.name || 'Nakoda Imitation')}!%20I%20have%20inquiry%20reference%20${inquiry.id}" class="btn">
              💬 Discuss on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: inquiry.customerEmail,
    subject: `Inquiry Confirmation — ${inquiry.id} | ${storeConfig.name || 'Nakoda Imitation'}`,
    html,
    text: `Hi ${inquiry.customerName}, we received your inquiry ${inquiry.id} for ${inquiry.productName || inquiry.inquiryType}. We will get back to you shortly.`,
  });
}

// ─── Admin Alert for Inquiry Submission ───
export async function sendAdminInquiryNotification(inquiry, storeConfig = {}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'admin@nakodaimitation.com';
  const storeName = escapeHtml(storeConfig.name || 'Nakoda Imitation');

  const html = `
    <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background: #FAF9FF; border-radius: 20px; border: 1px solid #EAE6FD;">
      <h2 style="color: #EC5AC8; margin-top: 0;">✨ New Inquiry Received: ${escapeHtml(inquiry.id)}</h2>
      <p style="font-size: 14px; color: #15152A;">A customer submitted a product or bulk order inquiry on <strong>${storeName}</strong>.</p>
      
      <div style="background: white; padding: 16px; border-radius: 14px; border: 1px solid #EAE6FD; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Inquiry Type:</strong> ${escapeHtml(inquiry.inquiryType)}</p>
        <p style="margin: 4px 0;"><strong>Customer:</strong> ${escapeHtml(inquiry.customerName)} (${escapeHtml(inquiry.customerPhone || 'No Phone')})</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${escapeHtml(inquiry.customerEmail)}</p>
        ${inquiry.companyName ? `<p style="margin: 4px 0;"><strong>Company:</strong> ${escapeHtml(inquiry.companyName)}</p>` : ''}
        ${inquiry.productName ? `<p style="margin: 4px 0;"><strong>Product:</strong> ${escapeHtml(inquiry.productName)}</p>` : ''}
        ${inquiry.quantity ? `<p style="margin: 4px 0;"><strong>Quantity:</strong> ${escapeHtml(inquiry.quantity)}</p>` : ''}
        ${inquiry.targetBudget ? `<p style="margin: 4px 0;"><strong>Target Budget:</strong> ${escapeHtml(inquiry.targetBudget)}</p>` : ''}
        ${inquiry.requiredDate ? `<p style="margin: 4px 0;"><strong>Timeline:</strong> ${escapeHtml(inquiry.requiredDate)}</p>` : ''}
        ${inquiry.notes ? `<p style="margin: 8px 0 0; color: #4B5563;"><strong>Requirements:</strong><br/>${escapeHtml(inquiry.notes)}</p>` : ''}
      </div>

      <p style="font-size: 12px; color: #8E8EA0;">Manage this inquiry in your Admin Portal under Inquiries.</p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[Inquiry Alert] ${inquiry.id} — ${inquiry.inquiryType} (${inquiry.customerName})`,
    html,
  });
}

// ─── SMTP Connection Test Email ───
export async function sendTestEmail(targetEmail) {
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #F0FDF4; border-radius: 20px; border: 1px solid #BBF7D0; text-align: center;">
      <h2 style="color: #059669; margin-top: 0;">✓ SMTP Email Configuration Working!</h2>
      <p style="font-size: 14px; color: #15152A;">This test email confirms that your SMTP server connection in Nakoda Imitation is functioning properly.</p>
      <p style="font-size: 12px; color: #8E8EA0; margin-top: 16px;">Timestamp: ${new Date().toLocaleString()}</p>
    </div>
  `;

  return sendEmail({
    to: targetEmail,
    subject: '✓ Nakoda Imitation SMTP Test Email — Connection Successful',
    html,
  });
}
