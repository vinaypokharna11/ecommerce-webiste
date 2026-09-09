/**
 * offerService.js
 *
 * Frontend service layer for promo coupons and discount offers.
 */

import apiClient from './apiClient';

export const offerService = {
  async getOffers() {
    return apiClient.get('/api/offers');
  },

  async createOffer(offerData) {
    return apiClient.post('/api/offers', offerData);
  },

  async updateOffer(id, offerData) {
    return apiClient.put(`/api/offers/${encodeURIComponent(id)}`, offerData);
  },

  async deleteOffer(id) {
    return apiClient.delete(`/api/offers/${encodeURIComponent(id)}`);
  },
};

export default offerService;
