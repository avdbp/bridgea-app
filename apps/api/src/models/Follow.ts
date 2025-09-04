import mongoose, { Document, Schema } from 'mongoose';

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  status: 'pending' | 'approved';
  createdAt: Date;
  updatedAt: Date;
}

const FollowSchema = new Schema<IFollow>({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'approved', // For public accounts, auto-approve
  },
}, {
  timestamps: true,
});

// Indexes
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
FollowSchema.index({ following: 1, status: 1 });
FollowSchema.index({ follower: 1, status: 1 });

// Update follower/following counts when follow is created/deleted
FollowSchema.post('save', async function (doc) {
  if (doc.isNew) {
    // Update follower's following count
    await mongoose.model('User').findByIdAndUpdate(
      doc.follower,
      { $inc: { followingCount: 1 } }
    );
    
    // Update following user's followers count
    await mongoose.model('User').findByIdAndUpdate(
      doc.following,
      { $inc: { followersCount: 1 } }
    );
  }
});

FollowSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  // Update follower's following count
  await mongoose.model('User').findByIdAndUpdate(
    doc.follower,
    { $inc: { followingCount: -1 } }
  );
  
  // Update following user's followers count
  await mongoose.model('User').findByIdAndUpdate(
    doc.following,
    { $inc: { followersCount: -1 } }
  );
});

export const Follow = mongoose.model<IFollow>('Follow', FollowSchema);

