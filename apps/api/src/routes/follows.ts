import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Follow } from '../models/Follow';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { authenticate } from '../middleware/auth';
import { validateParams, validateQuery } from '../middleware/validation';
import { followUserSchema, paginationSchema } from '../types/schemas';
import { emitNewFollow } from '../services/socket';
import { z } from 'zod';

const usernameParamSchema = z.object({
  username: z.string().min(1),
});

export default async function followRoutes(fastify: FastifyInstance) {
  // Follow user
  fastify.post('/:username', {
    preHandler: [authenticate, validateParams(usernameParamSchema)],
  }, async (request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) => {
    try {
      const { username } = request.params;
      const userId = (request as any).user.id;
      
      // Find user to follow
      const userToFollow = await User.findOne({ username });
      if (!userToFollow) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      // Can't follow yourself
      if (userToFollow._id.toString() === userId) {
        return reply.status(400).send({ error: 'Cannot follow yourself' });
      }
      
      // Check if already following
      const existingFollow = await Follow.findOne({
        follower: userId,
        following: userToFollow._id,
      });
      
      if (existingFollow) {
        return reply.status(400).send({ error: 'Already following this user' });
      }
      
      // Create follow relationship
      const follow = new Follow({
        follower: userId,
        following: userToFollow._id,
        status: userToFollow.isPrivate ? 'pending' : 'approved',
      });
      
      await follow.save();
      
      // Create notification
      const notification = new Notification({
        recipient: userToFollow._id,
        sender: userId,
        type: userToFollow.isPrivate ? 'NEW_FOLLOW_REQUEST' : 'FOLLOW_APPROVED',
        title: userToFollow.isPrivate ? 'Nueva solicitud de seguimiento' : 'Nuevo seguidor',
        body: userToFollow.isPrivate 
          ? 'Tienes una nueva solicitud de seguimiento'
          : 'Alguien comenzó a seguirte',
        data: {
          followId: follow._id.toString(),
        },
      });
      
      await notification.save();
      
      // Emit socket event
      emitNewFollow(fastify.io, userToFollow._id.toString(), {
        userId: userId,
        followerId: userId,
        status: follow.status,
      });
      
      return reply.status(201).send({
        message: userToFollow.isPrivate 
          ? 'Follow request sent' 
          : 'Successfully followed user',
        status: follow.status,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to follow user' });
    }
  });
  
  // Unfollow user
  fastify.delete('/:username', {
    preHandler: [authenticate, validateParams(usernameParamSchema)],
  }, async (request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) => {
    try {
      const { username } = request.params;
      const userId = (request as any).user.id;
      
      // Find user to unfollow
      const userToUnfollow = await User.findOne({ username });
      if (!userToUnfollow) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      // Find and delete follow relationship
      const follow = await Follow.findOneAndDelete({
        follower: userId,
        following: userToUnfollow._id,
      });
      
      if (!follow) {
        return reply.status(400).send({ error: 'Not following this user' });
      }
      
      return reply.send({
        message: 'Successfully unfollowed user',
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to unfollow user' });
    }
  });
  
  // Accept/Reject follow request
  fastify.patch('/:username', {
    preHandler: [authenticate, validateParams(usernameParamSchema)],
  }, async (request: FastifyRequest<{ 
    Params: { username: string };
    Body: { action: 'accept' | 'reject' };
  }>, reply: FastifyReply) => {
    try {
      const { username } = request.params;
      const userId = (request as any).user.id;
      const { action } = request.body;
      
      // Find user who sent the request
      const requester = await User.findOne({ username });
      if (!requester) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      // Find follow request
      const follow = await Follow.findOne({
        follower: requester._id,
        following: userId,
        status: 'pending',
      });
      
      if (!follow) {
        return reply.status(404).send({ error: 'No pending follow request found' });
      }
      
      if (action === 'accept') {
        follow.status = 'approved';
        await follow.save();
        
        // Create notification for approval
        const notification = new Notification({
          recipient: requester._id,
          sender: userId,
          type: 'FOLLOW_APPROVED',
          title: 'Solicitud de seguimiento aprobada',
          body: 'Tu solicitud de seguimiento fue aprobada',
          data: {
            followId: follow._id.toString(),
          },
        });
        
        await notification.save();
        
        // Emit socket event
        emitNewFollow(fastify.io, requester._id.toString(), {
          userId: userId,
          followerId: requester._id.toString(),
          status: 'approved',
        });
        
        return reply.send({
          message: 'Follow request accepted',
        });
      } else {
        await Follow.findByIdAndDelete(follow._id);
        
        return reply.send({
          message: 'Follow request rejected',
        });
      }
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to process follow request' });
    }
  });
  
  // Get current user's followers
  fastify.get('/me/followers', {
    preHandler: [authenticate, validateQuery(paginationSchema)],
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const { page, limit } = request.query;
      
      const skip = (page - 1) * limit;
      
      const followers = await Follow.find({ following: userId, status: 'approved' })
        .populate('follower', 'username firstName lastName avatar followersCount')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Follow.countDocuments({ following: userId, status: 'approved' });
      
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
  
  // Get current user's following
  fastify.get('/me/following', {
    preHandler: [authenticate, validateQuery(paginationSchema)],
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const { page, limit } = request.query;
      
      const skip = (page - 1) * limit;
      
      const following = await Follow.find({ follower: userId, status: 'approved' })
        .populate('following', 'username firstName lastName avatar followersCount')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Follow.countDocuments({ follower: userId, status: 'approved' });
      
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
  
  // Get pending follow requests
  fastify.get('/me/requests', {
    preHandler: [authenticate, validateQuery(paginationSchema)],
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const { page, limit } = request.query;
      
      const skip = (page - 1) * limit;
      
      const requests = await Follow.find({ following: userId, status: 'pending' })
        .populate('follower', 'username firstName lastName avatar')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Follow.countDocuments({ following: userId, status: 'pending' });
      
      return reply.send({
        requests: requests.map(follow => ({
          ...follow.follower.toJSON(),
          requestedAt: follow.createdAt,
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
      return reply.status(500).send({ error: 'Failed to get follow requests' });
    }
  });
  
  // Check if following a user
  fastify.get('/:username/status', {
    preHandler: [authenticate, validateParams(usernameParamSchema)],
  }, async (request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) => {
    try {
      const { username } = request.params;
      const userId = (request as any).user.id;
      
      const user = await User.findOne({ username });
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      const follow = await Follow.findOne({
        follower: userId,
        following: user._id,
      });
      
      return reply.send({
        isFollowing: !!follow,
        status: follow?.status || null,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to check follow status' });
    }
  });
}
