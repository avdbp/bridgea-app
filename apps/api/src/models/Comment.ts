import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  bridge: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId; // For replies
  likesCount: number;
  repliesCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
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
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters'],
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  repliesCount: {
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
CommentSchema.index({ bridge: 1, createdAt: -1 });
CommentSchema.index({ user: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });

// Update bridge comments count when comment is created/deleted
CommentSchema.post('save', async function (doc) {
  if (doc.isNew) {
    await mongoose.model('Bridge').findByIdAndUpdate(
      doc.bridge,
      { $inc: { commentsCount: 1 } }
    );
    
    // If it's a reply, update parent comment's replies count
    if (doc.parentComment) {
      await mongoose.model('Comment').findByIdAndUpdate(
        doc.parentComment,
        { $inc: { repliesCount: 1 } }
      );
    }
  }
});

CommentSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  await mongoose.model('Bridge').findByIdAndUpdate(
    doc.bridge,
    { $inc: { commentsCount: -1 } }
  );
  
  // If it's a reply, update parent comment's replies count
  if (doc.parentComment) {
    await mongoose.model('Comment').findByIdAndUpdate(
      doc.parentComment,
      { $inc: { repliesCount: -1 } }
    );
  }
});

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);


