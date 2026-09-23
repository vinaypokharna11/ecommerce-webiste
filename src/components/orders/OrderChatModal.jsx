'use client';

import React from 'react';
import { UnifiedChatWindow } from '@/components/chat/UnifiedChatWindow';

/**
 * OrderChatModal
 * Wrapper delegating to UnifiedChatWindow for order-specific chat threads.
 * Retains full backward compatibility with any existing components.
 */
export function OrderChatModal({
  isOpen,
  onClose,
  orderId,
  customerName = 'Customer',
  orderStatus = 'pending',
  role = 'customer',
}) {
  if (!isOpen || !orderId) return null;

  return (
    <UnifiedChatWindow
      orderId={orderId}
      onClose={onClose}
      role={role}
      isModal={true}
    />
  );
}

export default OrderChatModal;
