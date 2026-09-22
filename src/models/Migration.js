import mongoose from 'mongoose';

const MigrationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    executedAt: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.Migration || mongoose.model('Migration', MigrationSchema);
