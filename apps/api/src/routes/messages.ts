import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { authenticate } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { emitNewMessage } from '../services/socket';
import { z } from 'zod';

// Schemas
const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message too long'),
  media: z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video', 'audio']),
    publicId: z.string(),
  }).optional(),
});

const messageParamsSchema = z.object({
  messageId: z.string().min(1),
});

const conversationQuerySchema = z.object({
  userId: z.string().min(1),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
});

const conversationsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
});

export default async function messageRoutes(fastify: FastifyInstance) {
  // Send a message
  fastify.post('/', {
    preHandler: [authenticate, validateBody(sendMessageSchema)],
  }, async (request: FastifyRequest<{ Body: z.infer<typeof sendMessageSchema> }>, reply: FastifyReply) => {
    try {
      const { recipientId, content, media } = request.body;
      const senderId = (request as any).user.id;

      // Check if recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return reply.status(404).send({ error: 'Recipient not found' });
      }

      // Check if user is trying to send message to themselves
      if (senderId === recipientId) {
        return reply.status(400).send({ error: 'Cannot send message to yourself' });
      }

      // Create message
      const message = new Message({
        sender: senderId,
        recipient: recipientId,
        content,
        media,
      });

      await message.save();
      await message.populate('sender recipient', 'username firstName lastName avatar');

      // Emit socket event for real-time messaging
      emitNewMessage(fastify.io, recipientId, {
        message: message.toJSON(),
        sender: message.sender,
      });

      return reply.status(201).send({ message: message.toJSON() });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to send message' });
    }
  });

  // Get conversation between two users
  fastify.get('/conversation/:userId', {
    preHandler: [authenticate, validateParams(z.object({ userId: z.string().min(1) })), validateQuery(conversationQuerySchema)],
  }, async (request: FastifyRequest<{ 
    Params: { userId: string }, 
    Querystring: { page: number; limit: number } 
  }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      const { page, limit } = request.query;
      const currentUserId = (request as any).user.id;

      const skip = (page - 1) * limit;

      // Get messages between current user and the specified user
      const messages = await Message.find({
        $or: [
          { sender: currentUserId, recipient: userId },
          { sender: userId, recipient: currentUserId },
        ],
      })
      .populate('sender recipient', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      const total = await Message.countDocuments({
        $or: [
          { sender: currentUserId, recipient: userId },
          { sender: userId, recipient: currentUserId },
        ],
      });

      return reply.send({
        messages: messages.map(msg => msg.toJSON()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get conversation' });
    }
  });

  // Get all conversations for current user
  fastify.get('/conversations', {
    preHandler: [authenticate, validateQuery(conversationsQuerySchema)],
  }, async (request: FastifyRequest<{ Querystring: { page: number; limit: number } }>, reply: FastifyReply) => {
    try {
      const { page, limit } = request.query;
      const currentUserId = (request as any).user.id;

      const skip = (page - 1) * limit;

      // Get the latest message from each conversation
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: currentUserId },
              { recipient: currentUserId },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$sender', currentUserId] },
                '$recipient',
                '$sender',
              ],
            },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$recipient', currentUserId] },
                      { $eq: ['$isRead', false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $project: {
            user: {
              _id: '$user._id',
              username: '$user.username',
              firstName: '$user.firstName',
              lastName: '$user.lastName',
              avatar: '$user.avatar',
            },
            lastMessage: {
              _id: '$lastMessage._id',
              content: '$lastMessage.content',
              media: '$lastMessage.media',
              isRead: '$lastMessage.isRead',
              createdAt: '$lastMessage.createdAt',
            },
            unreadCount: 1,
          },
        },
        {
          $sort: { 'lastMessage.createdAt': -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      const total = await Message.distinct('sender', {
        $or: [
          { sender: currentUserId },
          { recipient: currentUserId },
        ],
      }).length;

      return reply.send({
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get conversations' });
    }
  });

  // Mark message as read
  fastify.patch('/:messageId/read', {
    preHandler: [authenticate, validateParams(messageParamsSchema)],
  }, async (request: FastifyRequest<{ Params: { messageId: string } }>, reply: FastifyReply) => {
    try {
      const { messageId } = request.params;
      const currentUserId = (request as any).user.id;

      const message = await Message.findById(messageId);
      if (!message) {
        return reply.status(404).send({ error: 'Message not found' });
      }

      // Check if user is the recipient
      if (message.recipient.toString() !== currentUserId) {
        return reply.status(403).send({ error: 'Not authorized to mark this message as read' });
      }

      // Mark as read
      message.isRead = true;
      message.readAt = new Date();
      await message.save();

      return reply.send({ message: message.toJSON() });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to mark message as read' });
    }
  });

  // Mark all messages from a user as read
  fastify.patch('/conversation/:userId/read', {
    preHandler: [authenticate, validateParams(z.object({ userId: z.string().min(1) }))],
  }, async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      const currentUserId = (request as any).user.id;

      await Message.updateMany(
        {
          sender: userId,
          recipient: currentUserId,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );

      return reply.send({ success: true });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to mark messages as read' });
    }
  });

  // Delete a message
  fastify.delete('/:messageId', {
    preHandler: [authenticate, validateParams(messageParamsSchema)],
  }, async (request: FastifyRequest<{ Params: { messageId: string } }>, reply: FastifyReply) => {
    try {
      const { messageId } = request.params;
      const currentUserId = (request as any).user.id;

      const message = await Message.findById(messageId);
      if (!message) {
        return reply.status(404).send({ error: 'Message not found' });
      }

      // Check if user is the sender
      if (message.sender.toString() !== currentUserId) {
        return reply.status(403).send({ error: 'Not authorized to delete this message' });
      }

      await Message.findByIdAndDelete(messageId);

      return reply.send({ success: true });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete message' });
    }
  });

  // Get unread message count
  fastify.get('/unread-count', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const currentUserId = (request as any).user.id;

      const unreadCount = await Message.countDocuments({
        recipient: currentUserId,
        isRead: false,
      });

      return reply.send({ unreadCount });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get unread count' });
    }
  });
}
