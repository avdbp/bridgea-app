import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const authenticate = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({ error: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }
    
    request.user = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    };
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return reply.status(401).send({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({ error: 'Token expired' });
    }
    return reply.status(500).send({ error: 'Authentication error' });
  }
};

export const optionalAuth = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return; // No token provided, continue without authentication
    }
    
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
    const user = await User.findById(decoded.userId).select('-password');
    if (user) {
      request.user = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
      };
    }
    
  } catch (error) {
    // Ignore authentication errors for optional auth
    return;
  }
};


