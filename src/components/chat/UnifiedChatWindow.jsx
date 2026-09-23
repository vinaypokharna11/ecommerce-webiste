'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  User,
  ShieldCheck,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Check,
  CheckCheck,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { chatService } from '@/services/chatService';
import { formatPrice } from '@/utils/formatPrice';
import { STORE_CONFIG } from '@/data/mockData';

export function UnifiedChatWindow({
  conversationId: propConversationId,
  orderId: propOrderId,
  initialConversation = null,
  onClose,
  onViewOrder,
  isModal = true,
  role = 'customer', // 'customer' or 'admin' / 'seller'
}) {
  const [conversation, setConversation] = useState(initialConversation);
  const [conversationId, setConversationId] = useState(
    propConversationId || initialConversation?.id || null
  );
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [failedMessage, setFailedMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Initialize or find conversation
  const initConversation = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      let activeConv = initialConversation;

      if (!activeConv) {
        if (propConversationId) {
          const res = await chatService.getConversation(propConversationId);
          if (res?.success && res.conversation) {
            activeConv = res.conversation;
          }
        } else if (propOrderId) {
          const res = await chatService.findOrCreateOrderConversation(propOrderId);
          if (res?.success && res.conversation) {
            activeConv = res.conversation;
          }
        } else {
          // General Support Conversation
          const res = await chatService.findOrCreateGeneralConversation();
          if (res?.success && res.conversation) {
            activeConv = res.conversation;
          }
        }
      }

      if (activeConv) {
        setConversation(activeConv);
        setConversationId(activeConv.id);

        // Fetch messages
        const msgRes = await chatService.getMessages(activeConv.id, { limit: 50 });
        if (msgRes?.success) {
          setMessages(msgRes.messages || []);
          // Automatically mark incoming messages as read
          chatService.markAsRead(activeConv.id).catch(() => {});
        }
      } else {
        setErrorMessage('Could not load or initialize conversation.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to chat service.');
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollToBottom('auto'), 100);
    }
  }, [propConversationId, propOrderId, initialConversation]);

  useEffect(() => {
    initConversation();
  }, [initConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, partnerTyping]);

  // 2. Realtime SSE connection for instant message arrival
  useEffect(() => {
    if (!conversationId) return;

    let eventSource = null;
    try {
      eventSource = new EventSource('/api/realtime');
      eventSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(':')) return;
          const parsed = JSON.parse(event.data);

          if (
            parsed.type === 'CHAT_MESSAGE_CREATED' &&
            parsed.payload?.conversationId === conversationId &&
            parsed.payload?.message
          ) {
            const incoming = parsed.payload.message;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });

            // Mark as read immediately if current user is viewing this conversation
            const isFromOther =
              role === 'customer'
                ? incoming.senderRole !== 'customer'
                : incoming.senderRole === 'customer';

            if (isFromOther) {
              chatService.markAsRead(conversationId).catch(() => {});
            }
          }

          if (
            parsed.type === 'CHAT_MESSAGES_READ' &&
            parsed.payload?.conversationId === conversationId
          ) {
            setMessages((prev) =>
              prev.map((m) => (m.status !== 'read' ? { ...m, status: 'read' } : m))
            );
          }

          if (
            parsed.type === 'CHAT_TYPING' &&
            parsed.payload?.conversationId === conversationId &&
            parsed.payload?.role !== role
          ) {
            setPartnerTyping(Boolean(parsed.payload.isTyping));
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 3000);
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (eventSource) eventSource.close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, role]);

  // 3. Message Sender
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending || !conversationId) return;

    setIsSending(true);
    setErrorMessage('');
    setFailedMessage(null);

    // Optimistic message
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversationId,
      senderRole: role === 'customer' ? 'customer' : 'admin',
      senderName: role === 'customer' ? (conversation?.customerName || 'You') : 'Nakoda Support',
      content: text,
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await chatService.sendMessage(conversationId, text);
      if (res?.success && res.message) {
        // Replace optimistic message with actual persisted message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...res.message, status: 'sent' } : m))
        );
      } else {
        throw new Error(res?.error || 'Failed to deliver message');
      }
    } catch (err) {
      // Mark as failed
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      );
      setFailedMessage(text);
      setErrorMessage(err.message || 'Could not send message. Tap retry.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter (Send) vs Shift+Enter (New line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea as user types
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const isOrderChat = conversation?.type === 'ORDER';
  const orderSummary = conversation?.orderSummary;

  const content = (
    <div className="flex flex-col h-full bg-white rounded-2xl sm:rounded-3xl border border-black/10 overflow-hidden shadow-2xl">
      {/* ─── HEADER ────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-[#FAF9F5] border-b border-black/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 -ml-1 text-[#777777] hover:text-[#171717] hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EEEEEC] border border-black/5 flex items-center justify-center text-[#171717] font-bold text-sm shrink-0">
              {role === 'customer' ? (
                <ShieldCheck className="w-5 h-5 text-[#709E1E]" />
              ) : (
                <User className="w-5 h-5 text-[#0071E3]" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-[#171717] truncate">
                {role === 'customer'
                  ? 'Nakoda Store Support'
                  : conversation?.customerName || 'Customer'}
              </h3>
              {isOrderChat && (
                <span className="px-2 py-0.5 rounded-md bg-[#EEEEEC] text-[10px] font-bold text-[#555555] uppercase tracking-wide">
                  Order Chat
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#777777] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online • Instant replies</span>
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-[#777777] hover:text-[#171717] hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* ─── ORDER SUMMARY CONTEXT BANNER ─────────────────────────────────── */}
      {isOrderChat && orderSummary && (
        <div className="px-4 py-2.5 sm:px-6 bg-[#F8FDF0] border-b border-[#E3DFD5] flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#9FD842]/20 text-[#3E5C0F] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-[#171717]">
                  Order {orderSummary.id || conversation.orderId}
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white text-[#3E5C0F] border border-[#9FD842]/40">
                  {orderSummary.statusLabel || orderSummary.status || 'Pending'}
                </span>
              </div>
              <p className="text-[11px] text-[#555555] truncate">
                {orderSummary.itemSummary || 'Order details'} • {formatPrice(orderSummary.amount, STORE_CONFIG.currency)}
              </p>
            </div>
          </div>

          {onViewOrder && (
            <button
              onClick={() => onViewOrder(orderSummary.id || conversation.orderId)}
              className="px-2.5 py-1 text-[11px] font-bold text-[#171717] bg-white hover:bg-[#EEEEEC] border border-black/10 rounded-lg flex items-center gap-1 transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              <span>View Order</span>
              <ExternalLink className="w-3 h-3 text-[#777777]" />
            </button>
          )}
        </div>
      )}

      {/* ─── MESSAGES SCROLL AREA ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#FAF9F5]/40">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-[#777777] gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#709E1E]" />
            <p className="text-xs font-semibold">Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-[#777777] px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EEEEEC] flex items-center justify-center mb-3 text-[#171717]">
              <MessageSquare className="w-6 h-6 text-[#709E1E]" />
            </div>
            <h4 className="font-extrabold text-sm text-[#171717] mb-1">
              {isOrderChat ? 'No messages for this order yet' : 'No messages yet'}
            </h4>
            <p className="text-xs text-[#777777] max-w-xs leading-relaxed mb-3">
              {isOrderChat
                ? 'Send a question or update regarding order delivery, packaging, or custom requirements.'
                : 'Need help choosing products, custom sizes, or delivery advice? Our store team is here to help!'}
            </p>
            <button
              onClick={() => handleSendMessage('Hello, I have a question!')}
              className="text-xs font-bold text-[#709E1E] hover:underline cursor-pointer"
            >
              Say &ldquo;Hello, I have a question!&rdquo; 👋
            </button>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe =
              role === 'customer'
                ? msg.senderRole === 'customer'
                : msg.senderRole !== 'customer';

            const timeStr = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-[#777777] ml-2 mb-1">
                    {msg.senderName || 'Support'}
                  </span>
                )}

                <div
                  className={`relative max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed break-words shadow-xs ${
                    isMe
                      ? 'bg-[#171717] text-white rounded-br-xs'
                      : 'bg-white text-[#171717] border border-black/10 rounded-bl-xs'
                  } ${msg.status === 'failed' ? 'border-2 border-rose-500' : ''}`}
                >
                  <p className="whitespace-pre-wrap">{msg.content || msg.message}</p>

                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                      isMe ? 'text-white/60' : 'text-[#888888]'
                    }`}
                  >
                    <span>{timeStr}</span>
                    {isMe && (
                      <span>
                        {msg.status === 'sending' && <Clock className="w-2.5 h-2.5 animate-pulse" />}
                        {msg.status === 'sent' && <Check className="w-3 h-3" />}
                        {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-[#9FD842]" />}
                        {msg.status === 'failed' && (
                          <button
                            onClick={() => handleSendMessage(msg.content)}
                            className="text-rose-300 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Retry</span>
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {partnerTyping && (
          <div className="flex items-center gap-2 text-xs text-[#777777] italic ml-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#777777] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#777777] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#777777] animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>{role === 'customer' ? 'Support is typing...' : 'Customer is typing...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── ERROR BANNER ─────────────────────────────────────────────────── */}
      {errorMessage && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          {failedMessage && (
            <button
              onClick={() => handleSendMessage(failedMessage)}
              className="text-xs font-bold underline shrink-0 cursor-pointer ml-2"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* ─── MESSAGE COMPOSER ─────────────────────────────────────────────── */}
      <div className="p-3 sm:p-4 bg-white border-t border-black/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2 bg-[#F6F5F0] rounded-2xl p-1.5 sm:p-2 border border-black/10 focus-within:border-[#171717] focus-within:bg-white transition-all shadow-inner"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isOrderChat
                ? `Message about Order ${orderSummary?.id || conversation?.orderId || ''}...`
                : 'Type your message (Enter to send, Shift+Enter for new line)...'
            }
            className="flex-1 bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-[#171717] placeholder:text-[#888888] focus:outline-none resize-none max-h-28 overflow-y-auto leading-relaxed"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2 sm:p-2.5 rounded-xl bg-[#171717] hover:bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-xs"
            title="Send Message"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-[#888888]">
          <span>Press Enter to send • Shift + Enter for new line</span>
          <span>{inputText.length > 0 && `${inputText.length} / 4000`}</span>
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl h-[620px] max-h-[92vh]"
      >
        {content}
      </motion.div>
    </div>
  );
}

export default UnifiedChatWindow;
