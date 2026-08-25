import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    icon: { type: String, default: 'LayoutGrid' },
    color: { type: String, default: '#6257FF' },
    accentBg: { type: String, default: 'bg-[#F5F3FF]' },
    iconColor: { type: String, default: 'text-[#6257FF]' },
    itemCount: { type: String, default: '0 Items' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
