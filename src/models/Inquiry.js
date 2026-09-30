import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    inquiryType: { type: String, required: true },
    productId: { type: String, default: '' },
    productName: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    targetBudget: { type: String, default: '' },
    requiredDate: { type: String, default: '' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: '' },
    customerPhone: { type: String, required: true },
    companyName: { type: String, default: '' },
    notes: { type: String, default: '' },
    preferredContact: { type: String, default: 'WhatsApp' },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'quoted', 'resolved'],
      default: 'pending',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
