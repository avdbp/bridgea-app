import { VercelRequest, VercelResponse } from '@vercel/node';
import { Notification } from '../models/Notification';

// Get notifications
export const getNotifications = async (req: VercelRequest, res: VercelResponse) => {
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

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Notification.countDocuments({ recipient: userId });

    res.status(200).json({
      data: notifications.map(notification => ({
        id: notification._id,
        type: notification.type,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        sender: notification.sender ? {
          id: notification.sender._id,
          firstName: notification.sender.firstName,
          lastName: notification.sender.lastName,
          username: notification.sender.username,
          avatar: notification.sender.avatar
        } : null,
        createdAt: notification.createdAt
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get notifications'
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Notification ID is required'
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        error: 'Notification Not Found',
        message: 'Notification not found'
      });
    }

    // Check if user is recipient
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only mark your own notifications as read'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not mark notification as read'
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not mark all notifications as read'
    });
  }
};

// Delete notification
export const deleteNotification = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Notification ID is required'
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        error: 'Notification Not Found',
        message: 'Notification not found'
      });
    }

    // Check if user is recipient
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only delete your own notifications'
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not delete notification'
    });
  }
};

// Get unread notifications count
export const getUnreadCount = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    const unreadCount = await Notification.countDocuments({
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

// Create notification (for internal use)
export const createNotification = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { type, message, recipientId, senderId, data } = req.body;

    if (!type || !message || !recipientId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Type, message, and recipient ID are required'
      });
    }

    const notification = new Notification({
      type,
      message,
      recipient: recipientId,
      sender: senderId || null,
      data: data || null
    });

    await notification.save();

    res.status(201).json({
      message: 'Notification created successfully',
      notification: {
        id: notification._id,
        type: notification.type,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      }
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not create notification'
    });
  }
};

// Main notification routes handler
export const notificationRoutes = async (req: VercelRequest, res: VercelResponse) => {
  const { method, url } = req;
  const path = url?.replace('/api/v1/notifications', '') || '';

  switch (method) {
    case 'GET':
      if (path === '/' || path === '') {
        return await getNotifications(req, res);
      }
      if (path === '/unread-count' || path === '/unread-count/') {
        return await getUnreadCount(req, res);
      }
      break;
    case 'POST':
      if (path === '/' || path === '') {
        return await createNotification(req, res);
      }
      break;
    case 'PUT':
      if (path.startsWith('/read-all') || path.startsWith('/read-all/')) {
        return await markAllNotificationsAsRead(req, res);
      }
      if (path.startsWith('/read')) {
        return await markNotificationAsRead(req, res);
      }
      break;
    case 'DELETE':
      if (path.startsWith('/')) {
        return await deleteNotification(req, res);
      }
      break;
  }

  res.status(404).json({
    error: 'Not Found',
    message: 'Notification endpoint not found'
  });
};
