import mongoose, { Document, Schema } from 'mongoose';

export interface IBridge extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  visibility: 'public' | 'private' | 'followers';
  tags: string[];
  media: Array<{
    url: string;
    type: 'image' | 'video' | 'audio';
    publicId: string;
  }>;
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BridgeSchema = new Schema<IBridge>({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'followers'],
    default: 'public'
  },
  tags: [{
    type: String,
    trim: true
  }],
  media: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', 'audio']
    },
    publicId: String
  }],
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
BridgeSchema.index({ author: 1, createdAt: -1 });
BridgeSchema.index({ visibility: 1, createdAt: -1 });

export const Bridge = mongoose.models.Bridge || mongoose.model<IBridge>('Bridge', BridgeSchema);
