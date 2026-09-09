/**
 * inquiryService.js (Unified Server Domain Service)
 *
 * Delegates directly to centralized database operations layer in @/lib/db.
 */
export {
  getInquiries,
  createInquiry,
  updateInquiryStatus,
  deleteInquiry,
  getContactMessages,
  createContactMessage,
  updateContactStatus,
  deleteContactMessage,
} from '@/lib/db';
