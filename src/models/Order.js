import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  selectedColor: String,
  selectedSize: String,
});

const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, lowercase: true, trim: true },
    customerPhone: { type: String, required: true },
    items: [OrderItemSchema],
    itemSummary: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
    statusLabel: { type: String, default: 'Processing' },
    payMethod: { type: String, default: 'Cash on Delivery' },
    deliveryAddress: { type: String, required: true },
    date: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
