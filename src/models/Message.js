import mongoose from 'mongoose';

/**
 * MessageSchema
 * Represents an individual message within a conversation (Order or General).
 */
const MessageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      default: null,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ['customer', 'admin', 'seller', 'support', 'system'],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    receiverId: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
      default: 'sent',
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast chronological message loading
MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
