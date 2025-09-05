import { VercelRequest, VercelResponse } from '@vercel/node';
import { Message } from '../models/Message';
import { User } from '../models/User';

// Send message
export const sendMessage = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;
    const { content, recipientId, media } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!content || !recipientId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Content and recipient ID are required'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Content cannot be empty'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'Recipient not found'
      });
    }

    // Check if trying to send message to self
    if (recipientId === userId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Cannot send message to yourself'
      });
    }

    const message = new Message({
      content: content.trim(),
      sender: userId,
      recipient: recipientId,
      media: media || null
    });

    await message.save();
    await message.populate('sender', 'firstName lastName username avatar');
    await message.populate('recipient', 'firstName lastName username avatar');

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        id: message._id,
        content: message.content,
        media: message.media,
        sender: {
          id: message.sender._id,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
          username: message.sender.username,
          avatar: message.sender.avatar
        },
        recipient: {
          id: message.recipient._id,
          firstName: message.recipient.firstName,
          lastName: message.recipient.lastName,
          username: message.recipient.username,
          avatar: message.recipient.avatar
        },
        isRead: message.isRead,
        createdAt: message.createdAt
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not send message'
    });
  }
};

// Get conversation
export const getConversation = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { userId: otherUserId } = req.query;
    const currentUserId = (req as any).user?.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!currentUserId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!otherUserId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'User ID is required'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    })
    .populate('sender', 'firstName lastName username avatar')
    .populate('recipient', 'firstName lastName username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

    const total = await Message.countDocuments({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    });

    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, recipient: currentUserId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      data: messages.map(message => ({
        id: message._id,
        content: message.content,
        media: message.media,
        sender: {
          id: message.sender._id,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
          username: message.sender.username,
          avatar: message.sender.avatar
        },
        recipient: {
          id: message.recipient._id,
          firstName: message.recipient.firstName,
          lastName: message.recipient.lastName,
          username: message.recipient.username,
          avatar: message.recipient.avatar
        },
        isRead: message.isRead,
        createdAt: message.createdAt
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get conversation'
    });
  }
};

// Get conversations list
export const getConversations = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$recipient', userId] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            username: '$user.username',
            avatar: '$user.avatar'
          },
          lastMessage: {
            id: '$lastMessage._id',
            content: '$lastMessage.content',
            media: '$lastMessage.media',
            isRead: '$lastMessage.isRead',
            createdAt: '$lastMessage.createdAt'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limitNum
      }
    ]);

    const total = await Message.distinct('_id', {
      $or: [{ sender: userId }, { recipient: userId }]
    });

    res.status(200).json({
      data: conversations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total.length,
        pages: Math.ceil(total.length / limitNum)
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get conversations'
    });
  }
};

// Delete message
export const deleteMessage = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { messageId } = req.query;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!messageId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Message ID is required'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Message Not Found',
        message: 'Message not found'
      });
    }

    // Check if user is sender or recipient
    if (message.sender.toString() !== userId && message.recipient.toString() !== userId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only delete your own messages'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not delete message'
    });
  }
};

// Mark message as read
export const markMessageAsRead = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { messageId } = req.query;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!messageId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Message ID is required'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Message Not Found',
        message: 'Message not found'
      });
    }

    // Check if user is recipient
    if (message.recipient.toString() !== userId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only mark your own received messages as read'
      });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not mark message as read'
    });
  }
};

// Get unread messages count
export const getUnreadCount = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    const unreadCount = await Message.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.status(200).json({
      unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get unread count'
    });
  }
};

// Main message routes handler
export const messageRoutes = async (req: VercelRequest, res: VercelResponse) => {
  const { method, url } = req;
  const path = url?.replace('/api/v1/messages', '') || '';

  switch (method) {
    case 'POST':
      if (path === '/' || path === '') {
        return await sendMessage(req, res);
      }
      break;
    case 'GET':
      if (path === '/conversations' || path === '/conversations/') {
        return await getConversations(req, res);
      }
      if (path === '/unread-count' || path === '/unread-count/') {
        return await getUnreadCount(req, res);
      }
      if (path.startsWith('/conversation')) {
        return await getConversation(req, res);
      }
      break;
    case 'PUT':
      if (path.startsWith('/read')) {
        return await markMessageAsRead(req, res);
      }
      break;
    case 'DELETE':
      if (path.startsWith('/')) {
        return await deleteMessage(req, res);
      }
      break;
  }

  res.status(404).json({
    error: 'Not Found',
    message: 'Message endpoint not found'
  });
};
