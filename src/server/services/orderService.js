/**
 * orderService.js (Unified Server Domain Service)
 *
 * Delegates directly to centralized database operations layer in @/lib/db.
 */
export {
  getOrders,
  createOrder,
  updateOrderStatus,
} from '@/lib/db';
