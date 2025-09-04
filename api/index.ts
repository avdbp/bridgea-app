import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../apps/api/src/utils/database';
import { config } from '../apps/api/src/config';

// Import route handlers
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { bridgeRoutes } from './routes/bridges';
import { followRoutes } from './routes/follows';
import { messageRoutes } from './routes/messages';
import { notificationRoutes } from './routes/notifications';
import { mediaRoutes } from './routes/media';
import { uploadRoutes } from './routes/upload';

// Import middleware
import { authenticateToken, optionalAuth } from './middleware/auth';

// Initialize database connection
let dbConnected = false;

const connectToDatabase = async () => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
    }
  }
};

// CORS headers
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
};

// Main API handler
export default async (req: VercelRequest, res: VercelResponse) => {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Connect to database
  await connectToDatabase();

  const { url, method } = req;
  
  try {
    // Health check endpoint
    if (url === '/api/health' || url === '/api/health/') {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Bridgea API is running on Vercel',
        database: dbConnected ? 'Connected' : 'Disconnected'
      });
      return;
    }

    // Root API endpoint
    if (url === '/api' || url === '/api/') {
      res.status(200).json({
        message: 'Bridgea API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        environment: 'production',
        platform: 'Vercel',
        database: dbConnected ? 'Connected' : 'Disconnected'
      });
      return;
    }

    // Route to appropriate handler based on URL
    if (url?.startsWith('/api/v1/auth')) {
      return await authRoutes(req, res);
    }
    
    if (url?.startsWith('/api/v1/users')) {
      // Users routes need authentication for most endpoints
      if (method !== 'GET' || url.includes('/search')) {
        return await authenticateToken(req, res, () => userRoutes(req, res));
      } else {
        return await optionalAuth(req, res, () => userRoutes(req, res));
      }
    }
    
    if (url?.startsWith('/api/v1/bridges')) {
      // Bridges routes need authentication for most endpoints
      if (method !== 'GET') {
        return await authenticateToken(req, res, () => bridgeRoutes(req, res));
      } else {
        return await optionalAuth(req, res, () => bridgeRoutes(req, res));
      }
    }
    
    if (url?.startsWith('/api/v1/follows')) {
      return await authenticateToken(req, res, () => followRoutes(req, res));
    }
    
    if (url?.startsWith('/api/v1/messages')) {
      return await authenticateToken(req, res, () => messageRoutes(req, res));
    }
    
    if (url?.startsWith('/api/v1/notifications')) {
      return await authenticateToken(req, res, () => notificationRoutes(req, res));
    }
    
    if (url?.startsWith('/api/v1/media')) {
      return await authenticateToken(req, res, () => mediaRoutes(req, res));
    }
    
    if (url?.startsWith('/api/v1/upload')) {
      return await authenticateToken(req, res, () => uploadRoutes(req, res));
    }

    // 404 for unmatched routes
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource was not found',
      path: url
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }
};