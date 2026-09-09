/**
 * storeService.js
 *
 * Frontend service layer for store metadata, Cloudinary image uploads,
 * and SMTP test emails.
 */

import apiClient from './apiClient';

export const storeService = {
  async getSettings() {
    return apiClient.get('/api/settings');
  },

  async updateSettings(settingsData) {
    return apiClient.put('/api/settings', settingsData);
  },

  async testEmail(recipientEmail) {
    return apiClient.post('/api/email/test', { to: recipientEmail });
  },

  async uploadImage(base64Image, folder = 'nakoda_imitation') {
    return apiClient.post('/api/upload', { image: base64Image, folder });
  },
};

export default storeService;
