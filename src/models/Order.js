import mongoose from 'mongoose';

/**
 * OrderItemSchema
 * Embedded schema representing an individual line item in a customer order.
 */
const OrderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
  selectedColor: { type: String, default: '' },
  selectedSize: { type: String, default: '' },
  sellerId: { type: String, default: 'nakoda_seller' },
});

/**
 * OrderSchema
 * MongoDB schema for e-commerce orders, supporting Cash on Delivery (COD)
 * and WhatsApp checkout flows.
 */
const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true, default: null },
    customerId: { type: String, index: true, default: null },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, lowercase: true, trim: true, default: '' },
    customerPhone: { type: String, required: true, trim: true },
    items: [OrderItemSchema],
    itemSummary: { type: String, default: '' },
    amount: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    statusLabel: { type: String, default: 'Pending' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    payMethod: { type: String, default: 'Cash on Delivery' },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    deliveryAddress: { type: String, default: '' },
    shippingAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    date: { type: String, default: '' },
    sellerId: { type: String, default: 'nakoda_seller', index: true },
    rejectionReason: { type: String, default: '' },
    sellerNotes: { type: String, default: '' },
    acceptedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    inventoryDeducted: { type: Boolean, default: false },
    inventoryRestored: { type: Boolean, default: false },
    chatMessages: [
      {
        id: { type: String, required: true },
        senderRole: { type: String, enum: ['customer', 'seller'], required: true },
        senderName: { type: String, required: true },
        message: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to ensure address & payment method synchronization
OrderSchema.pre('save', function () {
  if (!this.deliveryAddress && this.shippingAddress) {
    this.deliveryAddress = this.shippingAddress;
  }
  if (!this.shippingAddress && this.deliveryAddress) {
    this.shippingAddress = this.deliveryAddress;
  }
  if (!this.payMethod && this.paymentMethod) {
    this.payMethod = this.paymentMethod;
  }
  if (!this.paymentMethod && this.payMethod) {
    this.paymentMethod = this.payMethod;
  }
  if (!this.userId && this.customerId) {
    this.userId = this.customerId;
  }
  if (!this.customerId && this.userId) {
    this.customerId = this.userId;
  }
});

// Indexes for rapid order history lookups
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ customerEmail: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

