import { NextResponse } from 'next/server';
import { realtimeEmitter, PUBLIC_CATALOG_EVENT_TYPES, CATALOG_EVENTS } from '@/lib/events';
import { verifyAdminAuth, verifyCustomerAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  const admin = verifyAdminAuth(request);
  const customer = verifyCustomerAuth(request);
  const encoder = new TextEncoder();

  let listener = null;
  let heartbeatInterval = null;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial connected event
      const initialPayload = JSON.stringify({
        type: 'CONNECTED',
        timestamp: new Date().toISOString(),
        message: 'Realtime live stream connected',
      });
      controller.enqueue(encoder.encode(`data: ${initialPayload}\n\n`));

      // 2. Subscribe to realtime catalog events with role-based filtering
      listener = (eventData) => {
        try {
          const type = eventData.type;
          const payload = eventData.payload || {};

          // Admin gets everything
          if (admin) {
            const chunk = `data: ${JSON.stringify(eventData)}\n\n`;
            controller.enqueue(encoder.encode(chunk));
            return;
          }

          // Public catalog events allowed for everyone
          if (PUBLIC_CATALOG_EVENT_TYPES.has(type)) {
            const chunk = `data: ${JSON.stringify(eventData)}\n\n`;
            controller.enqueue(encoder.encode(chunk));
            return;
          }

          // Customer-specific chat events: allow if the customer is the recipient or participant
          const isChatEvent =
            type === CATALOG_EVENTS.CHAT_MESSAGE_CREATED ||
            type === CATALOG_EVENTS.CHAT_MESSAGES_READ ||
            type === CATALOG_EVENTS.CHAT_TYPING ||
            type === CATALOG_EVENTS.ORDER_CHAT_MESSAGE;

          if (customer && isChatEvent) {
            const customerId = String(customer.id || customer._id || '');
            const customerEmail = String(customer.email || '').toLowerCase();
            const targetCustomerId = String(payload.customerId || payload.recipientId || '').toLowerCase();
            const targetCustomerEmail = String(payload.customerEmail || '').toLowerCase();
            const targetParticipants = Array.isArray(payload.participantIds)
              ? payload.participantIds.map(String)
              : [];

            const isAuthorized =
              (customerId && targetCustomerId === customerId) ||
              (customerEmail && targetCustomerEmail === customerEmail) ||
              (customerId && targetParticipants.includes(customerId));

            if (isAuthorized) {
              const chunk = `data: ${JSON.stringify(eventData)}\n\n`;
              controller.enqueue(encoder.encode(chunk));
            }
          }
        } catch (err) {
          // Stream might be closed
        }
      };

      realtimeEmitter.on('catalog_event', listener);

      // 3. Heartbeat ping every 20s to keep connection alive
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (err) {
          clearInterval(heartbeatInterval);
        }
      }, 20000);
    },
    cancel() {
      if (listener) {
        realtimeEmitter.off('catalog_event', listener);
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
