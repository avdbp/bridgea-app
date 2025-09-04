import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

import { connectDB } from './utils/database';
import { config } from './config';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import bridgeRoutes from './routes/bridges';
import followRoutes from './routes/follows';
import notificationRoutes from './routes/notifications';
import mediaRoutes from './routes/media';
import messageRoutes from './routes/messages';
import { uploadRoutes } from './routes/upload';
import { setupSocketIO } from './services/socket';

const fastify = Fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Create HTTP server for Socket.IO
const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST'],
  },
});

// Register plugins
fastify.register(helmet);
fastify.register(cors, {
  origin: config.ALLOWED_ORIGINS.split(','),
  credentials: true,
});

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Register multipart support
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Swagger documentation
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Bridgea API',
      description: 'API documentation for Bridgea social media app',
      version: '1.0.0',
    },
    host: `localhost:${config.PORT}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
});

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/v1/auth' });
fastify.register(userRoutes, { prefix: '/api/v1/users' });
fastify.register(bridgeRoutes, { prefix: '/api/v1/bridges' });
fastify.register(followRoutes, { prefix: '/api/v1/follows' });
fastify.register(notificationRoutes, { prefix: '/api/v1/notifications' });
fastify.register(mediaRoutes, { prefix: '/api/v1/media' });
fastify.register(messageRoutes, { prefix: '/api/v1/messages' });
fastify.register(uploadRoutes, { prefix: '/api/v1' });

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Setup Socket.IO
    setupSocketIO(io);
    
    // Start HTTP server for Socket.IO
    httpServer.listen(3003, () => {
      console.log('Socket.IO server running on port 3003');
    });
    
    // Start Fastify server
    await fastify.listen({ port: config.PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${config.PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${config.PORT}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
