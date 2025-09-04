import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  creator: mongoose.Types.ObjectId;
  admins: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  membersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot be more than 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  avatar: {
    type: String,
    default: null,
  },
  banner: {
    type: String,
    default: null,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPrivate: {
    type: Boolean,
    default: false,
  },
  membersCount: {
    type: Number,
    default: 1, // Creator is automatically a member
  },
}, {
  timestamps: true,
});

// Indexes
GroupSchema.index({ name: 'text', description: 'text' });
GroupSchema.index({ creator: 1 });
GroupSchema.index({ members: 1 });
GroupSchema.index({ isPrivate: 1 });

// Update members count when members are added/removed
GroupSchema.post('save', async function (doc) {
  if (doc.isModified('members')) {
    doc.membersCount = doc.members.length;
    await doc.save();
  }
});

export const Group = mongoose.model<IGroup>('Group', GroupSchema);


