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

  async getOrders() {
    return apiClient.get('/api/orders');
  },

  async updateOrderStatus(id, status) {
    return apiClient.put('/api/orders', { id, status });
  },
};

export default orderService;
