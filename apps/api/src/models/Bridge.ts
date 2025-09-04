import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia {
  url: string;
  type: 'image' | 'video';
  publicId: string;
  width?: number;
  height?: number;
  duration?: number; // for videos
}

export interface IBridge extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  media: IMedia[];
  tags: string[];
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  visibility: 'public' | 'private' | 'followers';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  duration: {
    type: Number,
  },
}, { _id: false });

const BridgeSchema = new Schema<IBridge>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot be more than 2000 characters'],
  },
  media: [MediaSchema],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  location: {
    name: {
      type: String,
      trim: true,
    },
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'followers'],
    default: 'public',
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  sharesCount: {
    type: Number,
    default: 0,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
BridgeSchema.index({ author: 1, createdAt: -1 });
BridgeSchema.index({ visibility: 1, createdAt: -1 });
BridgeSchema.index({ tags: 1 });
BridgeSchema.index({ content: 'text' });

// Update user's bridges count when bridge is created/deleted
BridgeSchema.post('save', async function (doc) {
  if (doc.isNew) {
    await mongoose.model('User').findByIdAndUpdate(
      doc.author,
      { $inc: { bridgesCount: 1 } }
    );
  }
});

BridgeSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  await mongoose.model('User').findByIdAndUpdate(
    doc.author,
    { $inc: { bridgesCount: -1 } }
  );
});

export const Bridge = mongoose.model<IBridge>('Bridge', BridgeSchema);

