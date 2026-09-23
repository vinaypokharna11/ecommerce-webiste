import mongoose from 'mongoose';

/**
 * ConversationSchema
 * Unified schema for both Order-specific conversations (ORDER)
 * and General Customer Support messaging (GENERAL).
 */
const ConversationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ['ORDER', 'GENERAL'],
      default: 'GENERAL',
      index: true,
    },
    orderId: {
      type: String,
      default: null,
      index: true,
    },
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: 'Customer',
      trim: true,
    },
    customerEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      default: '',
      trim: true,
    },
    sellerId: {
      type: String,
      default: 'nakoda_seller',
      index: true,
    },
    orderSummary: {
      id: { type: String, default: '' },
      amount: { type: Number, default: 0 },
      status: { type: String, default: '' },
      statusLabel: { type: String, default: '' },
      itemSummary: { type: String, default: '' },
      date: { type: String, default: '' },
      createdAt: { type: Date, default: null },
    },
    lastMessage: {
      type: String,
      default: '',
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastMessageSenderRole: {
      type: String,
      enum: ['customer', 'admin', 'seller', 'support', 'system', ''],
      default: '',
    },
    unreadCountCustomer: {
      type: Number,
      default: 0,
      min: 0,
    },
    unreadCountAdmin: {
      type: Number,
      default: 0,
      min: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring only ONE conversation exists per order
ConversationSchema.index(
  { type: 1, orderId: 1 },
  {
    unique: true,
    partialFilterExpression: { orderId: { $type: 'string' } },
  }
);

// Indexes for conversation listing & sorting
ConversationSchema.index({ customerId: 1, lastMessageAt: -1 });
ConversationSchema.index({ sellerId: 1, lastMessageAt: -1 });

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
