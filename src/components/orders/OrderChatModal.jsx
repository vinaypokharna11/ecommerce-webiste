'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

export function OrderChatModal({
  isOpen,
  onClose,
  orderId,
  customerName = 'Customer',
  orderStatus = 'pending',
  role = 'customer', // 'customer' or 'seller'
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!orderId) return;
    try {
      setErrorMessage('');
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/chat`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.chatMessages || []);
      } else {
        setErrorMessage(data.error || 'Failed to load chat messages');
      }
    } catch (err) {
      setErrorMessage('Network error loading messages. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      setIsLoading(true);
      fetchMessages();
    } else {
      setMessages([]);
      setInputText('');
      setErrorMessage('');
    }
  }, [isOpen, orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to realtime SSE stream for incoming chat messages
  useEffect(() => {
    if (!isOpen || !orderId) return;

    let eventSource = null;
    try {
      eventSource = new EventSource('/api/realtime');
      eventSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(':')) return;
          const parsed = JSON.parse(event.data);
          if (
            parsed.type === 'ORDER_CHAT_MESSAGE' &&
            parsed.payload?.orderId === orderId &&
            parsed.payload?.message
          ) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === parsed.payload.message.id)) {
                return prev;
              }
              return [...prev, parsed.payload.message];
            });
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isOpen, orderId]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const clean = inputText.trim();
    if (!clean || isSending) return;

    setIsSending(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: clean }),
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setInputText('');
        if (data.chatMessages) {
          setMessages(data.chatMessages);
        } else if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      } else {
        setErrorMessage(data.error || 'Failed to send message');
      }
    } catch (err) {
      setErrorMessage('Network error sending message');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col h-[580px] max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-black/[0.06] bg-[#FBFBFD] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[#1D1D1F] tracking-tight">
                  Order Chat
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8E8ED] text-[#1D1D1F]">
                  {orderId}
                </span>
              </div>
              <p className="text-[11px] text-[#86868B] flex items-center gap-1 mt-0.5">
                <span>Direct conversation between Customer & Seller</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchMessages}
              title="Refresh messages"
              className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#86868B] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#86868B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#F9F9FB]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-[#86868B] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#0071E3]" />
              <span className="text-xs font-medium">Loading chat history...</span>
            </div>
          ) : errorMessage ? (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#86868B]">
              <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-[#86868B]" />
              </div>
              <p className="font-bold text-sm text-[#1D1D1F] mb-1">No messages yet</p>
              <p className="text-xs max-w-xs text-[#86868B]">
                {role === 'customer'
                  ? 'Have a question about your order, delivery timing, or customization? Send a message to the seller desk below!'
                  : 'Start the conversation or answer questions from the customer regarding this order.'}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === role;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#86868B] px-1">
                    <span className="font-semibold">
                      {isMe ? 'You' : msg.senderName || (msg.senderRole === 'seller' ? 'Store Seller' : 'Customer')}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#1D1D1F] text-white rounded-tr-xs shadow-xs'
                        : 'bg-white text-[#1D1D1F] border border-black/[0.08] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 bg-white border-t border-black/[0.06] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              role === 'customer'
                ? 'Type your message to seller...'
                : 'Reply to customer regarding this order...'
            }
            maxLength={1000}
            disabled={isSending || isLoading}
            className="flex-1 px-4 py-2.5 bg-[#F5F5F7] border border-black/5 rounded-full text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending || isLoading}
            className="w-10 h-10 rounded-full bg-[#1D1D1F] hover:bg-black text-white flex items-center justify-center shrink-0 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
