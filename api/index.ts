import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// User Schema
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, required: true },
  bio: { type: String, default: '' },
  website: { type: String, default: '' },
  avatar: { type: String, default: '' },
  banner: { type: String, default: '' },
  isPrivate: { type: Boolean, default: false }
}, { timestamps: true });

// Bridge Schema
const BridgeSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 2000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visibility: { type: String, enum: ['public', 'private', 'followers'], default: 'public' },
  tags: [{ type: String, trim: true }],
  media: [{
    url: String,
    type: { type: String, enum: ['image', 'video', 'audio'] },
    publicId: String
  }],
  location: {
    name: String,
    coordinates: { lat: Number, lng: Number }
  },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Bridge = mongoose.models.Bridge || mongoose.model('Bridge', BridgeSchema);

// Initialize database connection
let dbConnected = false;

const connectToDatabase = async () => {
  if (!dbConnected) {
    try {
      await mongoose.connect(MONGODB_URI);
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

// Auth middleware
const authenticateToken = (req: VercelRequest, res: VercelResponse, next: () => void) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication Required', message: 'Access token is required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication Failed', message: 'Invalid token' });
  }
};

// Register endpoint
const register = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { firstName, lastName, email, username, password, location, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !username || !password || !location) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User Exists',
        message: 'User with this email or username already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      location,
      isPrivate: false
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        location: user.location,
        isPrivate: user.isPrivate,
        avatar: user.avatar,
        banner: user.banner,
        bio: user.bio,
        website: user.website,
        createdAt: user.createdAt
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not register user'
    });
  }
};

// Login endpoint
const login = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email/username and password are required'
      });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    console.log('Login: User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Login: User password field exists:', !!user.password);
      console.log('Login: User password type:', typeof user.password);
    }

    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    if (!user.password) {
      console.log('Login: User has no password field');
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        location: user.location,
        isPrivate: user.isPrivate,
        avatar: user.avatar,
        banner: user.banner,
        bio: user.bio,
        website: user.website,
        createdAt: user.createdAt
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not login user'
    });
  }
};

// Get bridges feed
const getBridges = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const bridges = await Bridge.find({ visibility: 'public' })
      .populate('author', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Bridge.countDocuments({ visibility: 'public' });

    res.status(200).json({
      data: bridges.map(bridge => ({
        id: bridge._id,
        content: bridge.content,
        visibility: bridge.visibility,
        tags: bridge.tags,
        media: bridge.media,
        location: bridge.location,
        author: {
          id: bridge.author._id,
          firstName: bridge.author.firstName,
          lastName: bridge.author.lastName,
          username: bridge.author.username,
          avatar: bridge.author.avatar
        },
        likesCount: bridge.likesCount,
        commentsCount: bridge.commentsCount,
        createdAt: bridge.createdAt
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get bridges error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get bridges'
    });
  }
};

// Create bridge
const createBridge = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;
    const { content, visibility = 'public', tags, media, location } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Content is required'
      });
    }

    const bridge = new Bridge({
      content: content.trim(),
      author: userId,
      visibility,
      tags: tags || [],
      media: media || [],
      location: location || null
    });

    await bridge.save();
    await bridge.populate('author', 'firstName lastName username avatar');

    res.status(201).json({
      message: 'Bridge created successfully',
      bridge: {
        id: bridge._id,
        content: bridge.content,
        visibility: bridge.visibility,
        tags: bridge.tags,
        media: bridge.media,
        location: bridge.location,
        author: {
          id: bridge.author._id,
          firstName: bridge.author.firstName,
          lastName: bridge.author.lastName,
          username: bridge.author.username,
          avatar: bridge.author.avatar
        },
        likesCount: bridge.likesCount,
        commentsCount: bridge.commentsCount,
        createdAt: bridge.createdAt
      }
    });

  } catch (error) {
    console.error('Create bridge error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not create bridge'
    });
  }
};

// Main API handler
export default async (req: VercelRequest, res: VercelResponse) => {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectToDatabase();

  const { url, method } = req;
  
  try {
    // Health check
    if (url === '/api/health' || url === '/api/health/') {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Bridgea API is running on Vercel',
        database: dbConnected ? 'Connected' : 'Disconnected'
      });
      return;
    }

    // Root API
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

    // Auth routes
    if (url === '/api/v1/auth/register' && method === 'POST') {
      return await register(req, res);
    }
    
    if (url === '/api/v1/auth/login' && method === 'POST') {
      return await login(req, res);
    }

    // Bridge routes
    if (url?.startsWith('/api/v1/bridges/feed') && method === 'GET') {
      return await getBridges(req, res);
    }
    
    if (url === '/api/v1/bridges' && method === 'POST') {
      return authenticateToken(req, res, () => createBridge(req, res));
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