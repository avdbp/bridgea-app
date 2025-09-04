import mongoose, { Document, Schema } from 'mongoose';

export interface ILike extends Document {
  user: mongoose.Types.ObjectId;
  bridge: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bridge: {
    type: Schema.Types.ObjectId,
    ref: 'Bridge',
    required: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Compound index to ensure one like per user per bridge
LikeSchema.index({ user: 1, bridge: 1 }, { unique: true });

// Index for efficient queries
LikeSchema.index({ bridge: 1 });
LikeSchema.index({ user: 1 });

export const Like = mongoose.model<ILike>('Like', LikeSchema);
