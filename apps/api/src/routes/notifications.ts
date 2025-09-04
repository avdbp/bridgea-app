import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { authenticate } from '../middleware/auth';
import { validateQuery, validateParams } from '../middleware/validation';
import { paginationSchema } from '../types/schemas';
import { z } from 'zod';

const notificationIdParamSchema = z.object({
  id: z.string().min(1),
});

export default async function notificationRoutes(fastify: FastifyInstance) {
  // Get user's notifications
  fastify.get('/', {
    preHandler: [authenticate, validateQuery(paginationSchema)],
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const { page, limit } = request.query;
      
      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'username firstName lastName avatar')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Notification.countDocuments({ recipient: userId });
      const unreadCount = await Notification.countDocuments({ 
        recipient: userId, 
        isRead: false 
      });
      
      return reply.send({
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get notifications' });
    }
  });
  
  // Mark notification as read
  fastify.patch('/:id/read', {
    preHandler: [authenticate, validateParams(notificationIdParamSchema)],
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const userId = (request as any).user.id;
      
      const notification = await Notification.findOneAndUpdate(
        { _id: id, recipient: userId },
        { isRead: true },
        { new: true }
      );
      
      if (!notification) {
        return reply.status(404).send({ error: 'Notification not found' });
      }
      
      return reply.send({
        message: 'Notification marked as read',
        notification,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to mark notification as read' });
    }
  });
  
  // Mark all notifications as read
  fastify.patch('/read-all', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );
      
      return reply.send({
        message: 'All notifications marked as read',
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to mark all notifications as read' });
    }
  });
  
  // Get unread count
  fastify.get('/unread-count', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      
      const unreadCount = await Notification.countDocuments({ 
        recipient: userId, 
        isRead: false 
      });
      
      return reply.send({
        unreadCount,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get unread count' });
    }
  });
  
  // Delete notification
  fastify.delete('/:id', {
    preHandler: [authenticate, validateParams(notificationIdParamSchema)],
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const userId = (request as any).user.id;
      
      const notification = await Notification.findOneAndDelete({
        _id: id,
        recipient: userId,
      });
      
      if (!notification) {
        return reply.status(404).send({ error: 'Notification not found' });
      }
      
      return reply.send({
        message: 'Notification deleted',
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete notification' });
    }
  });
  
  // Test push notification (for development)
  fastify.post('/push/test', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest<{ Body: { message: string } }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const { message } = request.body;
      
      const user = await User.findById(userId);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      // TODO: Implement actual push notification sending
      // For now, just create a notification in the database
      const notification = new Notification({
        recipient: userId,
        type: 'NEW_MESSAGE',
        title: 'Test Notification',
        body: message || 'This is a test notification',
      });
      
      await notification.save();
      
      return reply.send({
        message: 'Test notification sent',
        notification,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to send test notification' });
    }
  });
}


