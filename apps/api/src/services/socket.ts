import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const setupSocketIO = (io: SocketIOServer) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });
  
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Join user to their personal room for notifications
    socket.join(`user:${socket.userId}`);
    
    // Handle joining group rooms
    socket.on('join-group', (groupId: string) => {
      socket.join(`group:${groupId}`);
      console.log(`User ${socket.userId} joined group ${groupId}`);
    });
    
    // Handle leaving group rooms
    socket.on('leave-group', (groupId: string) => {
      socket.leave(`group:${groupId}`);
      console.log(`User ${socket.userId} left group ${groupId}`);
    });
    
    // Handle joining conversation rooms
    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });
    
    // Handle leaving conversation rooms
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });
    
    // Handle typing indicators
    socket.on('typing-start', (data: { conversationId: string; recipientId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: true,
      });
    });
    
    socket.on('typing-stop', (data: { conversationId: string; recipientId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: false,
      });
    });
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
  
  return io;
};

// Helper functions to emit events
export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToGroup = (io: SocketIOServer, groupId: string, event: string, data: any) => {
  io.to(`group:${groupId}`).emit(event, data);
};

export const emitToConversation = (io: SocketIOServer, conversationId: string, event: string, data: any) => {
  io.to(`conversation:${conversationId}`).emit(event, data);
};

// Notification events
export const emitNewLike = (io: SocketIOServer, recipientId: string, data: any) => {
  emitToUser(io, recipientId, 'new-like', data);
};

export const emitNewComment = (io: SocketIOServer, recipientId: string, data: any) => {
  emitToUser(io, recipientId, 'new-comment', data);
};

export const emitNewFollow = (io: SocketIOServer, recipientId: string, data: any) => {
  emitToUser(io, recipientId, 'new-follow', data);
};

export const emitNewMessage = (io: SocketIOServer, recipientId: string, data: any) => {
  emitToUser(io, recipientId, 'new-message', data);
};

export const emitNewGroupInvite = (io: SocketIOServer, recipientId: string, data: any) => {
  emitToUser(io, recipientId, 'new-group-invite', data);
};


