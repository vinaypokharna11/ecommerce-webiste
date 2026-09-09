/**
 * categoryService.js
 *
 * Frontend service layer for category querying and admin mutations.
 */

import apiClient from './apiClient';

export const categoryService = {
  async getCategories() {
    return apiClient.get('/api/categories');
  },

  async createCategory(categoryData) {
    return apiClient.post('/api/categories', categoryData);
  },

  async updateCategory(id, categoryData) {
    return apiClient.put(`/api/categories/${encodeURIComponent(id)}`, categoryData);
  },

  async deleteCategory(id) {
    return apiClient.delete(`/api/categories/${encodeURIComponent(id)}`);
  },
};

export default categoryService;
