import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  media?: {
    url: string;
    type: 'image' | 'video' | 'audio';
    publicId: string;
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: {
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', 'audio']
    },
    publicId: String
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, isRead: 1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
