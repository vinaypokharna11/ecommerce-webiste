import nodemailer from 'nodemailer';

// Create Nodemailer Transporter
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  // Fallback dev/mock transporter if no credentials provided
  return {
    isMock: true,
    sendMail: async (options) => {
      console.log('────────────────────────────────────────────────────────');
      console.log('📧 [MOCK SMTP EMAIL DISPATCH]');
      console.log(`To: ${options.to}`);
      console.log(`From: ${options.from || process.env.SMTP_FROM || 'orders@nakodaimitation.com'}`);
      console.log(`Subject: ${options.subject}`);
      console.log('────────────────────────────────────────────────────────');
      return { messageId: `mock-${Date.now()}`, accepted: [options.to] };
    },
  };
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || '"Nakoda Imitation" <orders@nakodaimitation.com>';

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || '',
      html: html || text || '',
    });

    return { success: true, messageId: info.messageId, isMock: transporter.isMock };
  } catch (error) {
    console.error('Error sending email via SMTP:', error);
    return { success: false, error: error.message };
  }
}

// ─── Order Confirmation Email for Customer ───
export async function sendOrderConfirmationEmail(order, storeConfig = {}) {
  const currency = storeConfig.currency || '₹';
  const storeName = storeConfig.name || 'ShopEase';
  const whatsapp = storeConfig.whatsappNumber || '919876543210';

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EAE6FD; color: #15152A; font-weight: 600;">
          ${item.name} <span style="color: #8E8EA0; font-size: 12px;">(x${item.quantity})</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EAE6FD; text-align: right; color: #15152A; font-weight: 700;">
          ${currency}${(item.price * item.quantity).toLocaleString()}
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
          <p style="font-size: 15px; color: #626276; margin-top: 0;">Hi <strong>${order.customerName || 'Valued Customer'}</strong>,</p>
          <p style="font-size: 14px; color: #626276; line-height: 1.6;">
            We're thrilled to let you know that your order <strong>${order.id}</strong> has been received and is being prepared with care.
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
              <span style="color: #6257FF;">${currency}${order.amount.toLocaleString()}</span>
            </div>
            <div style="font-size: 12px; color: #8E8EA0; margin-top: 4px;">Payment Method: ${order.payMethod || 'Cash on Delivery'}</div>
          </div>

          <div style="background: #FAF9FF; padding: 16px; border-radius: 16px; border: 1px solid #EAE6FD; font-size: 13px; color: #626276; margin-bottom: 24px;">
            <strong style="color: #15152A; display: block; margin-bottom: 4px;">🚚 Delivery Details:</strong>
            ${order.deliveryAddress || 'Standard Home Delivery'}
          </div>

          <div style="text-align: center;">
            <p style="font-size: 13px; color: #8E8EA0; margin-bottom: 8px;">Need quick updates or want to track on WhatsApp?</p>
            <a href="https://wa.me/${whatsapp}?text=Hi%20${encodeURIComponent(storeName)}!%20I'd%20like%20an%20update%20on%20my%20order%20${order.id}" class="btn">
              💬 Track Order on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: order.customerEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'customer@example.com',
    subject: `Order Confirmation — ${order.id} | ${storeName}`,
    html,
    text: `Your order ${order.id} of total ${currency}${order.amount} has been confirmed.`,
  });
}

// ─── Admin Notification Email on New Order ───
export async function sendAdminNewOrderNotification(order, storeConfig = {}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'admin@nakodaimitation.com';
  const currency = storeConfig.currency || '₹';
  const storeName = storeConfig.name || 'Nakoda Imitation';

  const html = `
    <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background: #FAF9FF; border-radius: 20px; border: 1px solid #EAE6FD;">
      <h2 style="color: #6257FF; margin-top: 0;">🛍️ New Order Received: ${order.id}</h2>
      <p style="font-size: 14px; color: #15152A;">A customer has placed an order on <strong>${storeName}</strong>.</p>
      
      <div style="background: white; padding: 16px; border-radius: 14px; border: 1px solid #EAE6FD; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Customer:</strong> ${order.customerName} (${order.customerPhone || 'No Phone'})</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
        <p style="margin: 4px 0;"><strong>Address:</strong> ${order.deliveryAddress || 'N/A'}</p>
        <p style="margin: 4px 0;"><strong>Total Value:</strong> ${currency}${order.amount.toLocaleString()}</p>
        <p style="margin: 4px 0;"><strong>Payment:</strong> ${order.payMethod || 'COD'}</p>
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
  const storeName = storeConfig.name || 'Nakoda Imitation';
  const whatsapp = storeConfig.whatsappNumber || '919876543210';

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
          <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Ticket Reference: ${ticket.id}</p>
        </div>
        <div class="content">
          <p style="font-size: 15px; color: #626276; margin-top: 0;">Hi <strong>${ticket.name || 'Valued Customer'}</strong>,</p>
          <p style="font-size: 14px; color: #626276; line-height: 1.6;">
            Thank you for reaching out to <strong>${storeName}</strong>. Our support team has received your inquiry and is reviewing it. We typically reply within a few hours during business hours.
          </p>

          <div class="info-box">
            <p style="margin: 4px 0; font-size: 13px;"><strong>Topic:</strong> ${ticket.category || 'General Support'}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Subject:</strong> ${ticket.subject || 'Support Request'}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Preferred Contact:</strong> ${ticket.preferredContact || 'Email'}</p>
            <p style="margin: 8px 0 0; font-size: 13px; color: #626276;"><strong>Your Message:</strong><br/>"${ticket.message}"</p>
          </div>

          <div style="text-align: center;">
            <p style="font-size: 13px; color: #8E8EA0; margin-bottom: 8px;">Need immediate real-time assistance?</p>
            <a href="https://wa.me/${whatsapp}?text=Hi%20${encodeURIComponent(storeName)}!%20I%20have%20an%20inquiry%20regarding%20ticket%20${ticket.id}" class="btn">
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
    subject: `Support Ticket Received — ${ticket.id} | ${storeName}`,
    html,
    text: `Hi ${ticket.name}, thank you for contacting ${storeName}. Your reference ticket is ${ticket.id}. We will reply shortly.`,
  });
}

// ─── Admin Alert for Contact Form Submission ───
export async function sendAdminContactNotification(ticket, storeConfig = {}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'admin@shopease.com';
  const storeName = storeConfig.name || 'ShopEase';

  const html = `
    <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background: #FAF9FF; border-radius: 20px; border: 1px solid #EAE6FD;">
      <h2 style="color: #6257FF; margin-top: 0;">📨 New Customer Message: ${ticket.id}</h2>
      <p style="font-size: 14px; color: #15152A;">A customer submitted a contact form on <strong>${storeName}</strong>.</p>
      
      <div style="background: white; padding: 16px; border-radius: 14px; border: 1px solid #EAE6FD; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Customer:</strong> ${ticket.name}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${ticket.email}</p>
        <p style="margin: 4px 0;"><strong>Phone:</strong> ${ticket.phone || 'N/A'}</p>
        <p style="margin: 4px 0;"><strong>Topic:</strong> ${ticket.category}</p>
        <p style="margin: 4px 0;"><strong>Subject:</strong> ${ticket.subject}</p>
        <p style="margin: 8px 0 0; color: #4B5563;"><strong>Message:</strong><br/>${ticket.message}</p>
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
  const storeName = storeConfig.name || 'ShopEase';
  const whatsapp = storeConfig.whatsappNumber || '919876543210';

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
          <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Inquiry Reference: ${inquiry.id}</p>
        </div>
        <div class="content">
          <p style="font-size: 15px; color: #626276; margin-top: 0;">Hi <strong>${inquiry.customerName || 'Valued Customer'}</strong>,</p>
          <p style="font-size: 14px; color: #626276; line-height: 1.6;">
            Thank you for your interest in <strong>${storeName}</strong>! We've received your request for <strong>${inquiry.inquiryType}</strong>. Our team is preparing a customized quotation and availability details for you.
          </p>

          <div class="info-box">
            <p style="margin: 4px 0; font-size: 13px;"><strong>Type:</strong> ${inquiry.inquiryType}</p>
            ${inquiry.productName ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Product / Item:</strong> ${inquiry.productName}</p>` : ''}
            ${inquiry.quantity ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Estimated Quantity:</strong> ${inquiry.quantity}</p>` : ''}
            ${inquiry.targetBudget ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Target Budget:</strong> ${inquiry.targetBudget}</p>` : ''}
            ${inquiry.requiredDate ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Timeline / Target Date:</strong> ${inquiry.requiredDate}</p>` : ''}
            ${inquiry.notes ? `<p style="margin: 8px 0 0; font-size: 13px; color: #626276;"><strong>Notes / Specs:</strong><br/>"${inquiry.notes}"</p>` : ''}
          </div>

          <div style="text-align: center;">
            <p style="font-size: 13px; color: #8E8EA0; margin-bottom: 8px;">Want instant discussion or custom samples?</p>
            <a href="https://wa.me/${whatsapp}?text=Hi%20${encodeURIComponent(storeName)}!%20I%20have%20inquiry%20reference%20${inquiry.id}" class="btn">
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
    subject: `Inquiry Confirmation — ${inquiry.id} | ${storeName}`,
    html,
    text: `Hi ${inquiry.customerName}, we received your inquiry ${inquiry.id} for ${inquiry.productName || inquiry.inquiryType}. We will get back to you shortly.`,
  });
}

// ─── Admin Alert for Inquiry Submission ───
export async function sendAdminInquiryNotification(inquiry, storeConfig = {}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'admin@nakodaimitation.com';
  const storeName = storeConfig.name || 'Nakoda Imitation';

  const html = `
    <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background: #FAF9FF; border-radius: 20px; border: 1px solid #EAE6FD;">
      <h2 style="color: #EC5AC8; margin-top: 0;">✨ New Inquiry Received: ${inquiry.id}</h2>
      <p style="font-size: 14px; color: #15152A;">A customer submitted a product or bulk order inquiry on <strong>${storeName}</strong>.</p>
      
      <div style="background: white; padding: 16px; border-radius: 14px; border: 1px solid #EAE6FD; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Inquiry Type:</strong> ${inquiry.inquiryType}</p>
        <p style="margin: 4px 0;"><strong>Customer:</strong> ${inquiry.customerName} (${inquiry.customerPhone || 'No Phone'})</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${inquiry.customerEmail}</p>
        ${inquiry.companyName ? `<p style="margin: 4px 0;"><strong>Company:</strong> ${inquiry.companyName}</p>` : ''}
        ${inquiry.productName ? `<p style="margin: 4px 0;"><strong>Product:</strong> ${inquiry.productName}</p>` : ''}
        ${inquiry.quantity ? `<p style="margin: 4px 0;"><strong>Quantity:</strong> ${inquiry.quantity}</p>` : ''}
        ${inquiry.targetBudget ? `<p style="margin: 4px 0;"><strong>Target Budget:</strong> ${inquiry.targetBudget}</p>` : ''}
        ${inquiry.requiredDate ? `<p style="margin: 4px 0;"><strong>Timeline:</strong> ${inquiry.requiredDate}</p>` : ''}
        ${inquiry.notes ? `<p style="margin: 8px 0 0; color: #4B5563;"><strong>Requirements:</strong><br/>${inquiry.notes}</p>` : ''}
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

