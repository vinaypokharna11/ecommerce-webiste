/**
 * chatService.js
 *
 * Frontend service layer for the unified Chat & Messaging System.
 * Communicates with /api/conversations endpoints using apiClient.
 */

import apiClient from './apiClient';

export const chatService = {
  /**
   * Fetches conversations for current authenticated user.
   */
  async getConversations(params = {}) {
    if (params.search) query.set('search', params.search);
    if (params.type) query.set('type', params.type);
    if (params.limit) query.set('limit', params.limit);
    if (params.scope) query.set('scope', params.scope);

    const qs = query.toString();
    return apiClient.get(`/api/conversations${qs ? `?${qs}` : ''}`);
  },

  /**
   * Fetches a specific conversation by ID.
   */
  async getConversation(id) {
    return apiClient.get(`/api/conversations/${encodeURIComponent(id)}`);
  },

  /**
   * Finds or creates an ORDER-specific conversation.
   */
  async findOrCreateOrderConversation(orderId) {
    return apiClient.post('/api/conversations', {
      type: 'ORDER',
      orderId,
    });
  },

  /**
   * Finds or creates a GENERAL support conversation.
   */
  async findOrCreateGeneralConversation() {
    return apiClient.post('/api/conversations', {
      type: 'GENERAL',
    });
  },

  /**
   * Fetches messages for a conversation.
   */
  async getMessages(conversationId, params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', params.limit);
    if (params.before) query.set('before', params.before);

    const qs = query.toString();
    return apiClient.get(
      `/api/conversations/${encodeURIComponent(conversationId)}/messages${qs ? `?${qs}` : ''}`
    );
  },

  /**
   * Sends a message in a conversation.
   */
  async sendMessage(conversationId, content) {
    return apiClient.post(
      `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
      { content }
    );
  },

  /**
   * Marks unread messages in a conversation as read.
   */
  async markAsRead(conversationId) {
    return apiClient.apiRequest(
      `/api/conversations/${encodeURIComponent(conversationId)}/read`,
      { method: 'PATCH' }
    );
  },
};

export default chatService;
