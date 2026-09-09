/**
 * productService.js
 *
 * Frontend service layer for catalog querying, product mutations,
 * bulk actions, and seed management.
 */

import apiClient from './apiClient';

export const productService = {
  // ── Catalog Queries ──
  async getCatalog() {
    return apiClient.get('/api/catalog');
  },

  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/api/products${qs}`);
  },

  async getProductById(id) {
    return apiClient.get(`/api/products/${encodeURIComponent(id)}`);
  },

  // ── Admin Product CRUD ──
  async createProduct(productData) {
    return apiClient.post('/api/products', productData);
  },

  async updateProduct(id, productData) {
    return apiClient.put(`/api/products/${encodeURIComponent(id)}`, productData);
  },

  async deleteProduct(id) {
    return apiClient.delete(`/api/products/${encodeURIComponent(id)}`);
  },

  // ── Bulk Admin Actions ──
  async bulkUpdate(payload) {
    return apiClient.post('/api/products/bulk', payload);
  },

  // ── Master Seed Management ──
  async getMasterSeedTemplate() {
    return apiClient.get('/api/admin/seed');
  },

  async updateMasterSeedTemplate(template) {
    return apiClient.post('/api/admin/seed', {
      action: 'update_template',
      template,
    });
  },

  async restoreSeedCatalog() {
    return apiClient.post('/api/admin/seed', { action: 'restore' });
  },

  async clearCatalog() {
    return apiClient.post('/api/admin/seed', { action: 'clear' });
  },
};

export default productService;
