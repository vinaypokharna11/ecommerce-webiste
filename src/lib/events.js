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
  CATALOG_REFRESHED: 'CATALOG_REFRESHED',
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
  INQUIRY_CREATED: 'INQUIRY_CREATED',
  INQUIRY_UPDATED: 'INQUIRY_UPDATED',
  INQUIRY_DELETED: 'INQUIRY_DELETED',
  CONTACT_MESSAGE_CREATED: 'CONTACT_MESSAGE_CREATED',
  REVIEW_CREATED: 'REVIEW_CREATED',
  REVIEW_UPDATED: 'REVIEW_UPDATED',
  REVIEW_DELETED: 'REVIEW_DELETED',
  EXPLORE_UPDATED: 'EXPLORE_UPDATED',
  HERO_SHOWCASE_UPDATED: 'HERO_SHOWCASE_UPDATED',
};

/**
 * Whitelist of event types that are safe to broadcast to unauthenticated public storefront clients.
 * Private events (e.g. INQUIRY_*, CONTACT_MESSAGE_*) contain customer PII and must NEVER be sent to public clients.
 */
export const PUBLIC_CATALOG_EVENT_TYPES = new Set([
  CATALOG_EVENTS.PRODUCT_CREATED,
  CATALOG_EVENTS.PRODUCT_UPDATED,
  CATALOG_EVENTS.PRODUCT_DELETED,
  CATALOG_EVENTS.PRODUCTS_BULK_DELETED,
  CATALOG_EVENTS.PRODUCTS_BULK_UPDATED,
  CATALOG_EVENTS.CATALOG_REFRESHED,
  CATALOG_EVENTS.CATEGORY_CREATED,
  CATALOG_EVENTS.CATEGORY_UPDATED,
  CATALOG_EVENTS.CATEGORY_DELETED,
  CATALOG_EVENTS.OFFER_CREATED,
  CATALOG_EVENTS.OFFER_UPDATED,
  CATALOG_EVENTS.OFFER_DELETED,
  CATALOG_EVENTS.CONFIG_UPDATED,
  CATALOG_EVENTS.CATALOG_SEEDED,
  CATALOG_EVENTS.CATALOG_CLEARED,
  CATALOG_EVENTS.SEED_TEMPLATE_UPDATED,
  CATALOG_EVENTS.REVIEW_CREATED,
  CATALOG_EVENTS.REVIEW_UPDATED,
  CATALOG_EVENTS.REVIEW_DELETED,
  CATALOG_EVENTS.EXPLORE_UPDATED,
  CATALOG_EVENTS.HERO_SHOWCASE_UPDATED,
]);

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
