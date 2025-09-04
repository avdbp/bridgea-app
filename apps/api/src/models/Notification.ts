import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 
  | 'NEW_FOLLOW_REQUEST'
  | 'FOLLOW_APPROVED'
  | 'NEW_LIKE'
  | 'NEW_COMMENT'
  | 'NEW_BRIDGE_SHARED'
  | 'NEW_MESSAGE'
  | 'GROUP_INVITE';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    bridgeId?: mongoose.Types.ObjectId;
    commentId?: mongoose.Types.ObjectId;
    followId?: mongoose.Types.ObjectId;
    groupId?: mongoose.Types.ObjectId;
    messageId?: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: [
      'NEW_FOLLOW_REQUEST',
      'FOLLOW_APPROVED',
      'NEW_LIKE',
      'NEW_COMMENT',
      'NEW_BRIDGE_SHARED',
      'NEW_MESSAGE',
      'GROUP_INVITE',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  body: {
    type: String,
    required: true,
    maxlength: [200, 'Body cannot be more than 200 characters'],
  },
  data: {
    bridgeId: {
      type: Schema.Types.ObjectId,
      ref: 'Bridge',
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    followId: {
      type: Schema.Types.ObjectId,
      ref: 'Follow',
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);


