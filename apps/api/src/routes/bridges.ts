import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Bridge } from '../models/Bridge';
import { Like } from '../models/Like';
import { Comment } from '../models/Comment';
import { Follow } from '../models/Follow';
import { User } from '../models/User';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { 
  createBridgeSchema, 
  updateBridgeSchema,
  paginationSchema,
  CreateBridgeInput,
  UpdateBridgeInput,
  PaginationInput
} from '../types/schemas';
import { z } from 'zod';

const bridgeIdParamSchema = z.object({
  id: z.string().min(1),
});

const usernameParamSchema = z.object({
  username: z.string().min(1),
});

export default async function bridgeRoutes(fastify: FastifyInstance) {
  // Create bridge
  fastify.post('/', {
    preHandler: [authenticate, validateBody(createBridgeSchema)],
  }, async (request: FastifyRequest<{ Body: CreateBridgeInput }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const bridgeData = request.body;
      
      const bridge = new Bridge({
        ...bridgeData,
        author: userId,
      });
      
      await bridge.save();
      await bridge.populate('author', 'username firstName lastName avatar');
      
      return reply.status(201).send({
        message: 'Bridge created successfully',
        bridge,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create bridge' });
    }
  });
  
  // Get feed (public bridges + from followed users)
  fastify.get('/feed', {
    preHandler: [optionalAuth, validateQuery(paginationSchema)],
  }, async (request: FastifyRequest<{ Querystring: PaginationInput }>, reply: FastifyReply) => {
    try {
      const currentUserId = (request as any).user?.id;
      const { page, limit } = request.query;
      
      const skip = (page - 1) * limit;
      
      let query: any = { visibility: 'public' };
      
      // If user is authenticated, include bridges from followed users
      if (currentUserId) {
        const followedUsers = await Follow.find({ 
          follower: currentUserId, 
          status: 'approved' 
        }).select('following');
        
        const followedUserIds = followedUsers.map(follow => follow.following);
        
        query = {
          $or: [
            { visibility: 'public' },
            { 
              visibility: 'followers',
              author: { $in: followedUserIds }
            },
            { author: currentUserId }
          ]
        };
      }
      
      const bridges = await Bridge.find(query)
        .populate('author', 'username firstName lastName avatar')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Bridge.countDocuments(query);
      
      return reply.send({
        bridges,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get feed' });
    }
  });
  
  // Get user's bridges
  fastify.get('/user/:username', {
    preHandler: [validateParams(usernameParamSchema), validateQuery(paginationSchema)],
  }, async (request: FastifyRequest<{ 
    Params: { username: string };
    Querystring: PaginationInput;
  }>, reply: FastifyReply) => {
    try {
      const { username } = request.params;
      const { page, limit } = request.query;
      const currentUserId = (request as any).user?.id;
      
      const user = await User.findOne({ username });
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      const skip = (page - 1) * limit;
      
      let query: any = { author: user._id };
      
      // If viewing own profile or user is public, show all bridges
      if (currentUserId === user._id.toString() || !user.isPrivate) {
        // Show all bridges
      } else {
        // For private users, only show public bridges
        query.visibility = 'public';
      }
      
      const bridges = await Bridge.find(query)
        .populate('author', 'username firstName lastName avatar')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Bridge.countDocuments(query);
      
      return reply.send({
        bridges,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get user bridges' });
    }
  });
  
  // Get single bridge
  fastify.get('/:id', {
    preHandler: [validateParams(bridgeIdParamSchema), optionalAuth],
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const currentUserId = (request as any).user?.id;
      
      const bridge = await Bridge.findById(id)
        .populate('author', 'username firstName lastName avatar');
      
      if (!bridge) {
        return reply.status(404).send({ error: 'Bridge not found' });
      }
      
      // Check if user can view this bridge
      if (bridge.visibility === 'private' && currentUserId !== bridge.author._id.toString()) {
        return reply.status(403).send({ error: 'Access denied' });
      }
      
      if (bridge.visibility === 'followers' && currentUserId !== bridge.author._id.toString()) {
        const isFollowing = await Follow.findOne({
          follower: currentUserId,
          following: bridge.author._id,
          status: 'approved'
        });
        
        if (!isFollowing) {
          return reply.status(403).send({ error: 'Access denied' });
        }
      }
      
      return reply.send({ bridge });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get bridge' });
    }
  });
  
  // Update bridge
  fastify.patch('/:id', {
    preHandler: [authenticate, validateParams(bridgeIdParamSchema), validateBody(updateBridgeSchema)],
  }, async (request: FastifyRequest<{ 
    Params: { id: string };
    Body: UpdateBridgeInput;
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const userId = (request as any).user.id;
      const updateData = request.body;
      
      const bridge = await Bridge.findById(id);
      if (!bridge) {
        return reply.status(404).send({ error: 'Bridge not found' });
      }
      
      if (bridge.author.toString() !== userId) {
        return reply.status(403).send({ error: 'Access denied' });
      }
      
      const updatedBridge = await Bridge.findByIdAndUpdate(
        id,
        { ...updateData, isEdited: true },
        { new: true, runValidators: true }
      ).populate('author', 'username firstName lastName avatar');
      
      return reply.send({
        message: 'Bridge updated successfully',
        bridge: updatedBridge,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update bridge' });
    }
  });
  
  // Delete bridge
  fastify.delete('/:id', {
    preHandler: [authenticate, validateParams(bridgeIdParamSchema)],
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const userId = (request as any).user.id;
      
      const bridge = await Bridge.findById(id);
      if (!bridge) {
        return reply.status(404).send({ error: 'Bridge not found' });
      }
      
      if (bridge.author.toString() !== userId) {
        return reply.status(403).send({ error: 'Access denied' });
      }
      
      await Bridge.findByIdAndDelete(id);
      
      return reply.send({
        message: 'Bridge deleted successfully',
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete bridge' });
    }
  });
  
  // Like/Unlike bridge
  fastify.post('/:id/like', {
    preHandler: [authenticate, validateParams(bridgeIdParamSchema)],
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const userId = (request as any).user.id;
      
      const bridge = await Bridge.findById(id);
      if (!bridge) {
        return reply.status(404).send({ error: 'Bridge not found' });
      }
      
      const existingLike = await Like.findOne({ user: userId, bridge: id });
      
      if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return reply.send({
          message: 'Bridge unliked',
          liked: false,
        });
      } else {
        const like = new Like({ user: userId, bridge: id });
        await like.save();
        
        // TODO: Emit socket event for real-time notification
        // emitNewLike(io, bridge.author.toString(), { bridgeId: id, userId });
        
        return reply.send({
          message: 'Bridge liked',
          liked: true,
        });
      }
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to like bridge' });
    }
  });
  
  // Get bridge comments
  fastify.get('/:id/comments', {
    preHandler: [validateParams(bridgeIdParamSchema), validateQuery(paginationSchema)],
  }, async (request: FastifyRequest<{ 
    Params: { id: string };
    Querystring: PaginationInput;
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const { page, limit } = request.query;
      
      const bridge = await Bridge.findById(id);
      if (!bridge) {
        return reply.status(404).send({ error: 'Bridge not found' });
      }
      
      const skip = (page - 1) * limit;
      
      const comments = await Comment.find({ bridge: id, parentComment: null })
        .populate('user', 'username firstName lastName avatar')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Comment.countDocuments({ bridge: id, parentComment: null });
      
      return reply.send({
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get comments' });
    }
  });
  
  // Add comment
  fastify.post('/:id/comments', {
    preHandler: [authenticate, validateParams(bridgeIdParamSchema)],
  }, async (request: FastifyRequest<{ 
    Params: { id: string };
    Body: { content: string; parentCommentId?: string };
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const userId = (request as any).user.id;
      const { content, parentCommentId } = request.body;
      
      const bridge = await Bridge.findById(id);
      if (!bridge) {
        return reply.status(404).send({ error: 'Bridge not found' });
      }
      
      const comment = new Comment({
        user: userId,
        bridge: id,
        content,
        parentComment: parentCommentId,
      });
      
      await comment.save();
      await comment.populate('user', 'username firstName lastName avatar');
      
      // TODO: Emit socket event for real-time notification
      // emitNewComment(io, bridge.author.toString(), { bridgeId: id, commentId: comment._id, userId });
      
      return reply.status(201).send({
        message: 'Comment added successfully',
        comment,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to add comment' });
    }
  });
}
