/**
 * apiClient.js
 *
 * Centralized HTTP Client for all frontend-to-API communication.
 * Provides unified error handling, automatic JSON serialization,
 * and token authorization headers.
 */

/**
 * Retrieves the currently stored admin token (if any).
 */
export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nakoda_admin_token') || localStorage.getItem('shopease_admin_token') || null;
}

/**
 * Base request executor with standard credentials and error handling.
 *
 * @param {string} endpoint - API route path (e.g., '/api/products')
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<any>} Parsed JSON response body
 */
export async function apiRequest(endpoint, options = {}) {
  const adminToken = getAdminToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  };

  const res = await fetch(endpoint, config);
  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = { success: false, error: 'Invalid response from server' };
  }

  if (!res.ok) {
    const errorMsg = data.error || `HTTP request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const apiClient = {
  get: (endpoint, headers) => apiRequest(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    }),
  put: (endpoint, body, headers) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    }),
  delete: (endpoint, headers) => apiRequest(endpoint, { method: 'DELETE', headers }),
};

export default apiClient;
