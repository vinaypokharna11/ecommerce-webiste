'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { chatService } from '@/services/chatService';
import { UnifiedChatWindow } from '@/components/chat/UnifiedChatWindow';

export function ProfileMessages({ user, onNavigateToOrder }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'GENERAL' | 'ORDER'
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await chatService.getConversations({ search: searchQuery, scope: 'customer' });
      if (res?.success) {
        setConversations(res.conversations || []);
      } else {
        setErrorMessage(res?.error || 'Failed to load conversations');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error fetching messages');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Listen to realtime SSE updates to refresh list
  useEffect(() => {
    let eventSource = null;
    try {
      eventSource = new EventSource('/api/realtime');
      eventSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(':')) return;
          const parsed = JSON.parse(event.data);
          if (
            parsed.type === 'CHAT_MESSAGE_CREATED' ||
            parsed.type === 'CHAT_MESSAGES_READ' ||
            parsed.type === 'ORDER_CHAT_MESSAGE'
          ) {
            loadConversations();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [loadConversations]);

  // Filtered conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterType === 'GENERAL' && c.type !== 'GENERAL') return false;
    if (filterType === 'ORDER' && c.type !== 'ORDER') return false;
    return true;
  });

  const totalUnread = conversations.reduce(
    (acc, c) => acc + (c.unreadCountCustomer || 0),
    0
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[28px] border border-black/[0.06] shadow-sm overflow-hidden font-sans">
      {/* ─── HEADER & SEARCH ────────────────────────────────────────── */}
      <div className="p-4 sm:p-6 border-b border-black/5 bg-[#FAF9F5]/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EEEEEC] flex items-center justify-center text-[#171717]">
              <MessageSquare className="w-5 h-5 text-[#709E1E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#171717]">
                  Messages & Support
                </h2>
                {totalUnread > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#709E1E] text-white">
                    {totalUnread} new
                  </span>
                )}
              </div>
              <p className="text-xs text-[#777777]">
                Chat directly with our store team about orders or general inquiries.
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                const res = await chatService.findOrCreateGeneralConversation();
                if (res?.success && res.conversation) {
                  setSelectedConversation(res.conversation);
                  loadConversations();
                }
              } catch (e) {}
            }}
            className="neu-btn-accent py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Support Chat</span>
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, message, or subject..."
              className="w-full bg-white pl-9 pr-3 py-2 rounded-xl border border-black/10 text-xs text-[#171717] placeholder:text-[#888888] focus:outline-none focus:border-[#171717] transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#EEEEEC] p-1 rounded-xl self-start sm:self-auto">
            {['ALL', 'GENERAL', 'ORDER'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterType === t
                    ? 'bg-white text-[#171717] shadow-xs'
                    : 'text-[#666666] hover:text-[#171717]'
                }`}
              >
                {t === 'ALL' ? 'All' : t === 'GENERAL' ? 'Support' : 'Orders'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CONVERSATIONS LIST ──────────────────────────────────────── */}
      <div className="divide-y divide-black/5 min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#777777] gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#709E1E]" />
            <p className="text-xs font-semibold">Loading your conversations...</p>
          </div>
        ) : errorMessage ? (
          <div className="p-8 text-center text-xs text-rose-600 flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            <p>{errorMessage}</p>
            <button
              onClick={loadConversations}
              className="mt-2 text-xs font-bold underline cursor-pointer text-[#171717]"
            >
              Try Again
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-16 text-center text-[#777777] px-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-3 text-[#171717]">
              <Inbox className="w-6 h-6 text-[#709E1E]" />
            </div>
            <h4 className="font-extrabold text-sm text-[#171717] mb-1">
              No conversations found
            </h4>
            <p className="text-xs text-[#777777] max-w-xs mb-4">
              {searchQuery
                ? 'No messages match your search. Try a different keyword.'
                : 'Have a question about a product, delivery, or custom order? Reach out anytime!'}
            </p>
            {!searchQuery && (
              <button
                onClick={async () => {
                  try {
                    const res = await chatService.findOrCreateGeneralConversation();
                    if (res?.success && res.conversation) {
                      setSelectedConversation(res.conversation);
                      loadConversations();
                    }
                  } catch (e) {}
                }}
                className="neu-btn-accent py-2 px-5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start Support Conversation</span>
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isOrder = conv.type === 'ORDER';
            const unread = conv.unreadCountCustomer || 0;
            const timeStr = conv.lastMessageAt
              ? new Date(conv.lastMessageAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })
              : '';

            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`flex items-center gap-3.5 px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-[#F5F5F7]/50 transition-colors group cursor-pointer ${
                  unread > 0 ? 'bg-[#F8FDF0]/40' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-black/5 ${
                    isOrder ? 'bg-[#F0F7FF] text-[#0071E3]' : 'bg-[#F8FDF0] text-[#709E1E]'
                  }`}
                >
                  {isOrder ? (
                    <ShoppingBag className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-extrabold text-xs sm:text-sm text-[#171717] truncate">
                        {isOrder ? `Order ${conv.orderId}` : 'Nakoda Support'}
                      </span>
                      {isOrder && conv.orderSummary?.status && (
                        <span className="px-1.5 py-0.2 rounded-md bg-[#EEEEEC] text-[9px] font-bold text-[#555555] uppercase">
                          {conv.orderSummary.statusLabel || conv.orderSummary.status}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#888888] shrink-0 font-medium">
                      {timeStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${unread > 0 ? 'font-bold text-[#171717]' : 'text-[#777777]'}`}>
                      {conv.lastMessage || (isOrder ? 'Order chat started' : 'Direct support thread')}
                    </p>
                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#709E1E] text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#171717] transition-colors shrink-0" />
              </div>
            );
          })
        )}
      </div>

      {/* ─── ACTIVE CHAT MODAL ────────────────────────────────────────── */}
      {selectedConversation && (
        <UnifiedChatWindow
          conversationId={selectedConversation.id}
          initialConversation={selectedConversation}
          onClose={() => {
            setSelectedConversation(null);
            loadConversations();
          }}
          onViewOrder={(orderId) => {
            setSelectedConversation(null);
            if (onNavigateToOrder) {
              onNavigateToOrder(orderId);
            }
          }}
          isModal={true}
          role="customer"
        />
      )}
    </div>
  );
}

export default ProfileMessages;
