/**
 * authService.js
 *
 * Frontend service layer for Customer and Admin authentication, session checks,
 * profile management, and logout.
 */

import apiClient from './apiClient';

export const authService = {
  // ── Customer Operations ──
  async getSession() {
    return apiClient.get('/api/auth/me');
  },

  async login(email, password) {
    return apiClient.post('/api/auth/login', { email, password });
  },

  async signup(userData) {
    return apiClient.post('/api/auth/signup', userData);
  },

  async logout() {
    return apiClient.post('/api/auth/logout', {});
  },

  async updateProfile(profileData) {
    return apiClient.put('/api/auth/profile', profileData);
  },

  async deleteAccount() {
    return apiClient.delete('/api/auth/profile');
  },

  // ── Admin Operations ──
  async adminLogin(email, password) {
    return apiClient.post('/api/admin/login', { email, password });
  },

  async adminVerifySession() {
    return apiClient.get('/api/admin/auth');
  },

  async adminLogout() {
    return apiClient.post('/api/admin/logout', {});
  },
};

export default authService;
