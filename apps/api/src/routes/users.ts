import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../models/User';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { 
  updateProfileSchema, 
  searchUsersSchema,
  UpdateProfileInput,
  SearchUsersInput
} from '../types/schemas';
import { z } from 'zod';

const usernameParamSchema = z.object({
  username: z.string().min(1),
});

export default async function userRoutes(fastify: FastifyInstance) {
  // Get user by username
  fastify.get('/:username', {
    preHandler: [validateParams(usernameParamSchema), optionalAuth],
  }, async (request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) => {
    try {
      const { username } = request.params;
      const currentUserId = (request as any).user?.id;
      
      const user = await User.findOne({ username }).select('-email');
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      // If user is private and current user is not following them, hide some info
      const userObj = user.toJSON();
      if (user.isPrivate && currentUserId !== user._id.toString()) {
        // TODO: Check if current user is following this user
        // For now, we'll show basic info for private users
      }
      
      return reply.send({ user: userObj });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get user' });
    }
  });
  
  // Update current user profile
  fastify.patch('/me', {
    preHandler: [authenticate, validateBody(updateProfileSchema)],
  }, async (request: FastifyRequest<{ Body: UpdateProfileInput }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const updateData = request.body;
      
      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      return reply.send({
        message: 'Profile updated successfully',
        user: user.toJSON(),
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update profile' });
    }
  });
  
  // Update avatar
  fastify.patch('/me/avatar', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest<{ Body: { avatar: string } }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const { avatar } = request.body;
      
      if (!avatar) {
        return reply.status(400).send({ error: 'Avatar URL is required' });
      }
      
      const user = await User.findByIdAndUpdate(
        userId,
        { avatar },
        { new: true }
      );
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      return reply.send({
        message: 'Avatar updated successfully',
        user: user.toJSON(),
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update avatar' });
    }
  });
  
  // Update banner
  fastify.patch('/me/banner', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest<{ Body: { banner: string } }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const { banner } = request.body;
      
      if (!banner) {
        return reply.status(400).send({ error: 'Banner URL is required' });
      }
      
      const user = await User.findByIdAndUpdate(
        userId,
        { banner },
        { new: true }
      );
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      return reply.send({
        message: 'Banner updated successfully',
        user: user.toJSON(),
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update banner' });
    }
  });
  
  // Search users
  fastify.get('/search', {
    preHandler: [validateQuery(searchUsersSchema)],
  }, async (request: FastifyRequest<{ Querystring: SearchUsersInput }>, reply: FastifyReply) => {
    try {
      const { q, page, limit } = request.query;
      
      const skip = (page - 1) * limit;
      
      const users = await User.find({
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
        ],
      })
      .select('-email')
      .skip(skip)
      .limit(limit)
      .sort({ followersCount: -1, createdAt: -1 });
      
      const total = await User.countDocuments({
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
        ],
      });
      
      return reply.send({
        users: users.map(user => user.toJSON()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to search users' });
    }
  });
  
  // Get user's followers
  fastify.get('/:username/followers', {
    preHandler: [validateParams(usernameParamSchema), validateQuery(searchUsersSchema)],
  }, async (request: FastifyRequest<{ 
    Params: { username: string };
    Querystring: SearchUsersInput;
  }>, reply: FastifyReply) => {
    try {
      const { username } = request.params;
      const { page, limit } = request.query;
      
      const user = await User.findOne({ username });
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      const skip = (page - 1) * limit;
      
      const Follow = (await import('../models/Follow')).Follow;
      
      const followers = await Follow.find({ following: user._id, status: 'approved' })
        .populate('follower', 'username firstName lastName avatar followersCount')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Follow.countDocuments({ following: user._id, status: 'approved' });
      
      return reply.send({
        followers: followers.map(follow => ({
          ...follow.follower.toJSON(),
          followedAt: follow.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get followers' });
    }
  });
  
  // Get user's following
  fastify.get('/:username/following', {
    preHandler: [validateParams(usernameParamSchema), validateQuery(searchUsersSchema)],
  }, async (request: FastifyRequest<{ 
    Params: { username: string };
    Querystring: SearchUsersInput;
  }>, reply: FastifyReply) => {
    try {
      const { username } = request.params;
      const { page, limit } = request.query;
      
      const user = await User.findOne({ username });
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      const skip = (page - 1) * limit;
      
      const Follow = (await import('../models/Follow')).Follow;
      
      const following = await Follow.find({ follower: user._id, status: 'approved' })
        .populate('following', 'username firstName lastName avatar followersCount')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Follow.countDocuments({ follower: user._id, status: 'approved' });
      
      return reply.send({
        following: following.map(follow => ({
          ...follow.following.toJSON(),
          followedAt: follow.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to get following' });
    }
  });
}


