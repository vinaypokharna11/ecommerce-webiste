import { NextResponse } from 'next/server';
import { realtimeEmitter, PUBLIC_CATALOG_EVENT_TYPES } from '@/lib/events';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  const admin = verifyAdminAuth(request);
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
          // Security filter: If caller is not an authenticated admin, drop non-public events
          // (e.g. customer inquiries, contact messages containing personal info)
          if (!admin && !PUBLIC_CATALOG_EVENT_TYPES.has(eventData.type)) {
            return;
          }

          const chunk = `data: ${JSON.stringify(eventData)}\n\n`;
          controller.enqueue(encoder.encode(chunk));
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
