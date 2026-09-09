/**
 * inquiryService.js
 *
 * Frontend service layer for customer contact messages and wholesale inquiries.
 */

import apiClient from './apiClient';

export const inquiryService = {
  // ── Contact Messages ──
  async submitContactMessage(messageData) {
    return apiClient.post('/api/contact', messageData);
  },

  async getContactMessages() {
    return apiClient.get('/api/contact');
  },

  // ── Wholesale Inquiries ──
  async submitInquiry(inquiryData) {
    return apiClient.post('/api/inquiries', inquiryData);
  },

  async getInquiries() {
    return apiClient.get('/api/inquiries');
  },

  async updateInquiryStatus(id, status) {
    return apiClient.put('/api/inquiries', { id, status });
  },

  async deleteInquiry(id) {
    return apiClient.delete(`/api/inquiries?id=${encodeURIComponent(id)}`);
  },
};

export default inquiryService;
