import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    category: { type: String, default: 'General Support' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    preferredContact: { type: String, default: 'WhatsApp' },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'replied', 'resolved'],
      default: 'pending',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
