import { FastifyInstance } from 'fastify';
import { config } from '../apps/api/src/config';
import { connectDB } from '../apps/api/src/utils/database';
import { authRoutes } from '../apps/api/src/routes/auth';
import { userRoutes } from '../apps/api/src/routes/users';
import { bridgeRoutes } from '../apps/api/src/routes/bridges';
import { followRoutes } from '../apps/api/src/routes/follows';
import { messageRoutes } from '../apps/api/src/routes/messages';
import { notificationRoutes } from '../apps/api/src/routes/notifications';
import { uploadRoutes } from '../apps/api/src/routes/upload';
import { mediaRoutes } from '../apps/api/src/routes/media';

// Import Fastify
const fastify = require('fastify')({
  logger: true
});

// Register CORS
fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true
});

// Register multipart
fastify.register(require('@fastify/multipart'), {
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Connect to MongoDB
connectDB();

// Register routes
fastify.register(authRoutes, { prefix: '/api/v1' });
fastify.register(userRoutes, { prefix: '/api/v1' });
fastify.register(bridgeRoutes, { prefix: '/api/v1' });
fastify.register(followRoutes, { prefix: '/api/v1' });
fastify.register(messageRoutes, { prefix: '/api/v1' });
fastify.register(notificationRoutes, { prefix: '/api/v1' });
fastify.register(uploadRoutes, { prefix: '/api/v1' });
fastify.register(mediaRoutes, { prefix: '/api/v1' });

// Health check endpoint
fastify.get('/api/health', async (request, reply) => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Export the handler for Vercel
export default async (req: any, res: any) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
};

