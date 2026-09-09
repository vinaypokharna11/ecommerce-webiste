/**
 * src/server/index.js
 *
 * Backend Server Domain Services Barrel Export.
 * Encapsulates order management, customer auth, wholesale inquiries,
 * store settings, and JSON/Mongo persistence.
 */

export * from './db/jsonStore';
export * from './services/orderService';
export * from './services/inquiryService';
export * from './services/customerService';
export * from './services/storeService';
