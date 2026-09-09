/**
 * storeService.js (Unified Server Domain Service)
 *
 * Delegates directly to centralized database operations layer in @/lib/db.
 */
export {
  getStoreConfig,
  updateStoreConfig,
} from '@/lib/db';
