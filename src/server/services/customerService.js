/**
 * customerService.js (Unified Server Domain Service)
 *
 * Delegates directly to centralized database operations layer in @/lib/db.
 */
export {
  registerCustomer,
  loginCustomer,
  getCustomerById,
  updateCustomerProfile,
  deleteCustomerAccount,
  verifyAdminCredentials,
} from '@/lib/db';
