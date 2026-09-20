/**
 * orderService.js
 *
 * Frontend service layer for order creation, customer order retrieval,
 * and admin order status updates.
 */

import apiClient from './apiClient';

export const orderService = {
  async createOrder(orderPayload) {
    return apiClient.post('/api/orders', orderPayload);
  },

  async getOrders(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit);
    if (params.sellerId) query.set('sellerId', params.sellerId);

    const qs = query.toString();
    return apiClient.get(`/api/orders${qs ? `?${qs}` : ''}`);
  },

  async acceptOrder(id) {
    return apiClient.post(`/api/admin/orders/${encodeURIComponent(id)}/accept`);
  },

  async rejectOrder(id, reason = '') {
    return apiClient.post(`/api/admin/orders/${encodeURIComponent(id)}/reject`, { reason });
  },

  async updateOrderStatus(id, status, sellerNotes = '') {
    return apiClient.put('/api/orders', { id, status, sellerNotes });
  },
};

export default orderService;
