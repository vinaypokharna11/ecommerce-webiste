import { EventEmitter } from 'events';

/**
 * Global singleton Event Emitter for Next.js server runtime.
 * Persists across hot-module reloads in development.
 */
let realtimeEmitter = global.__nakodaRealtimeEmitter;

if (!realtimeEmitter) {
  realtimeEmitter = new EventEmitter();
  realtimeEmitter.setMaxListeners(100);
  global.__nakodaRealtimeEmitter = realtimeEmitter;
}

export const CATALOG_EVENTS = {
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  PRODUCTS_BULK_DELETED: 'PRODUCTS_BULK_DELETED',
  PRODUCTS_BULK_UPDATED: 'PRODUCTS_BULK_UPDATED',
  CATEGORY_CREATED: 'CATEGORY_CREATED',
  CATEGORY_UPDATED: 'CATEGORY_UPDATED',
  CATEGORY_DELETED: 'CATEGORY_DELETED',
  OFFER_CREATED: 'OFFER_CREATED',
  OFFER_UPDATED: 'OFFER_UPDATED',
  OFFER_DELETED: 'OFFER_DELETED',
  CONFIG_UPDATED: 'CONFIG_UPDATED',
  CATALOG_SEEDED: 'CATALOG_SEEDED',
  CATALOG_CLEARED: 'CATALOG_CLEARED',
  SEED_TEMPLATE_UPDATED: 'SEED_TEMPLATE_UPDATED',
};

/**
 * Dispatches a typed event to all connected realtime clients.
 * @param {string} type - One of CATALOG_EVENTS
 * @param {object} payload - Event data payload
 */
export function broadcastCatalogEvent(type, payload = {}) {
  try {
    const eventData = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    realtimeEmitter.emit('catalog_event', eventData);
  } catch (err) {
    console.warn('Realtime event broadcast error:', err.message);
  }
}

export { realtimeEmitter };
