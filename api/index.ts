import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

import { connectDB } from '../apps/api/src/utils/database';
import { config } from '../apps/api/src/config';
import authRoutes from '../apps/api/src/routes/auth';
import userRoutes from '../apps/api/src/routes/users';
import bridgeRoutes from '../apps/api/src/routes/bridges';
import followRoutes from '../apps/api/src/routes/follows';
import notificationRoutes from '../apps/api/src/routes/notifications';
import mediaRoutes from '../apps/api/src/routes/media';
import messageRoutes from '../apps/api/src/routes/messages';
import { uploadRoutes } from '../apps/api/src/routes/upload';
import { setupSocketIO } from '../apps/api/src/services/socket';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Create HTTP server for Socket.IO
const httpServer = createServer();

// Register plugins
fastify.register(helmet, {
  contentSecurityPolicy: false,
});

fastify.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8081',
      'exp://192.168.5.251:8081',
      'https://bridgea-app.vercel.app',
      'https://bridgea-app-git-master-avdbp.vercel.app',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

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
    host: 'localhost:3001',
    schemes: ['http'],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
});

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/v1/auth' });
fastify.register(userRoutes, { prefix: '/api/v1/users' });
fastify.register(bridgeRoutes, { prefix: '/api/v1/bridges' });
fastify.register(followRoutes, { prefix: '/api/v1/follows' });
fastify.register(notificationRoutes, { prefix: '/api/v1/notifications' });
fastify.register(mediaRoutes, { prefix: '/api/v1/media' });
fastify.register(messageRoutes, { prefix: '/api/v1/messages' });
fastify.register(uploadRoutes, { prefix: '/api/v1/upload' });

// Health check endpoint
fastify.get('/api/health', async (request, reply) => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Root endpoint
fastify.get('/api', async (request, reply) => {
  return { 
    message: 'Bridgea API', 
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  };
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  if (error.validation) {
    reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation,
    });
    return;
  }
  
  reply.status(500).send({
    error: 'Internal Server Error',
    message: 'Something went wrong',
  });
});

// Start server
const start = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Setup Socket.IO
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:8081',
          'exp://192.168.5.251:8081',
          'https://bridgea-app.vercel.app',
          'https://bridgea-app-git-master-avdbp.vercel.app',
        ],
        credentials: true,
      },
    });
    
    setupSocketIO(io);
    
    // Start server
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port: parseInt(port.toString()), host });
    
    console.log(`🚀 Server running on http://${host}:${port}`);
    console.log(`📚 API Documentation available at http://${host}:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// For Vercel
export default async (req: any, res: any) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  start();
}