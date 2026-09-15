import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  title: { type: String, default: 'Home' }, // 'Home', 'Work', 'Other'
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: '' },
    dob: { type: String, default: '' }, // Date of birth in YYYY-MM-DD format
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

// Prevent duplicate model compilation in Next.js hot reload
export default mongoose.models.User || mongoose.model('User', UserSchema);
