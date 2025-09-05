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

// Follow Schema
const FollowSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

// Message Schema
const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 1000 },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: {
    url: String,
    type: { type: String, enum: ['image', 'video', 'audio'] },
    publicId: String
  },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  data: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Bridge = mongoose.models.Bridge || mongoose.model('Bridge', BridgeSchema);
const Follow = mongoose.models.Follow || mongoose.model('Follow', FollowSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

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
      console.log('Login: User data:', {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        location: user.location
      });
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

// Get current user profile
const getCurrentUserProfile = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    const followersCount = await Follow.countDocuments({ following: user._id, status: 'accepted' });
    const followingCount = await Follow.countDocuments({ follower: user._id, status: 'accepted' });

    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        location: user.location,
        bio: user.bio,
        website: user.website,
        avatar: user.avatar,
        banner: user.banner,
        isPrivate: user.isPrivate,
        followersCount,
        followingCount,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get current user profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get current user profile'
    });
  }
};

// Get user profile by username
const getUserProfile = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username is required'
      });
    }

    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    const followersCount = await Follow.countDocuments({ following: user._id, status: 'accepted' });
    const followingCount = await Follow.countDocuments({ follower: user._id, status: 'accepted' });

    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        location: user.location,
        bio: user.bio,
        website: user.website,
        avatar: user.avatar,
        banner: user.banner,
        isPrivate: user.isPrivate,
        followersCount,
        followingCount,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get user profile'
    });
  }
};

// Update user profile
const updateProfile = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;
    const { firstName, lastName, bio, location, website, isPrivate } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (isPrivate !== undefined) user.isPrivate = isPrivate;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        location: user.location,
        bio: user.bio,
        website: user.website,
        avatar: user.avatar,
        banner: user.banner,
        isPrivate: user.isPrivate,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not update profile'
    });
  }
};

// Search users
const searchUsers = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Search query is required'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ]
    })
    .select('-password')
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 });

    const total = await User.countDocuments({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ]
    });

    res.status(200).json({
      data: users.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar,
        isPrivate: user.isPrivate
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not search users'
    });
  }
};

// Get user bridges
const getUserBridges = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { username } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const currentUserId = (req as any).user?.userId;

    if (!username) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username is required'
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { author: user._id };

    if (currentUserId && currentUserId.toString() !== user._id.toString()) {
      if (user.isPrivate) {
        const isFollowing = await Follow.findOne({
          follower: currentUserId,
          following: user._id,
          status: 'accepted'
        });

        if (!isFollowing) {
          return res.status(403).json({
            error: 'Access Denied',
            message: 'This user has a private account'
          });
        }
      }

      query.visibility = { $in: ['public', 'followers'] };
    }

    const bridges = await Bridge.find(query)
      .populate('author', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Bridge.countDocuments(query);

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
    console.error('Get user bridges error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get user bridges'
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

// Follow user
const followUser = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { username } = req.query;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!username) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username is required'
      });
    }

    const userToFollow = await User.findOne({ username });
    if (!userToFollow) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    if (userToFollow._id.toString() === userId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Cannot follow yourself'
      });
    }

    const existingFollow = await Follow.findOne({
      follower: userId,
      following: userToFollow._id
    });

    if (existingFollow) {
      if (existingFollow.status === 'accepted') {
        return res.status(400).json({
          error: 'Already Following',
          message: 'You are already following this user'
        });
      } else if (existingFollow.status === 'pending') {
        return res.status(400).json({
          error: 'Request Pending',
          message: 'Follow request is already pending'
        });
      }
    }

    const follow = new Follow({
      follower: userId,
      following: userToFollow._id,
      status: userToFollow.isPrivate ? 'pending' : 'accepted'
    });

    await follow.save();

    res.status(201).json({
      message: userToFollow.isPrivate 
        ? 'Follow request sent' 
        : 'Successfully followed user',
      status: follow.status
    });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not follow user'
    });
  }
};

// Unfollow user
const unfollowUser = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { username } = req.query;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!username) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username is required'
      });
    }

    const userToUnfollow = await User.findOne({ username });
    if (!userToUnfollow) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    const follow = await Follow.findOne({
      follower: userId,
      following: userToUnfollow._id
    });

    if (!follow) {
      return res.status(400).json({
        error: 'Not Following',
        message: 'You are not following this user'
      });
    }

    await Follow.findByIdAndDelete(follow._id);

    res.status(200).json({
      message: 'Successfully unfollowed user'
    });

  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not unfollow user'
    });
  }
};

// Get followers
const getFollowers = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { username } = req.query;
    const { page = 1, limit = 10 } = req.query;

    if (!username) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username is required'
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const followers = await Follow.find({ following: user._id, status: 'accepted' })
      .populate('follower', 'firstName lastName username avatar')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({ following: user._id, status: 'accepted' });

    res.status(200).json({
      data: followers.map(follow => ({
        id: follow.follower._id,
        firstName: follow.follower.firstName,
        lastName: follow.follower.lastName,
        username: follow.follower.username,
        avatar: follow.follower.avatar,
        followedAt: follow.createdAt
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get followers'
    });
  }
};

// Get following
const getFollowing = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { username } = req.query;
    const { page = 1, limit = 10 } = req.query;

    if (!username) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username is required'
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const following = await Follow.find({ follower: user._id, status: 'accepted' })
      .populate('following', 'firstName lastName username avatar')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({ follower: user._id, status: 'accepted' });

    res.status(200).json({
      data: following.map(follow => ({
        id: follow.following._id,
        firstName: follow.following.firstName,
        lastName: follow.following.lastName,
        username: follow.following.username,
        avatar: follow.following.avatar,
        followedAt: follow.createdAt
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get following'
    });
  }
};

// Send message
const sendMessage = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;
    const { content, recipientId, media } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!content || !recipientId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Content and recipient ID are required'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Content cannot be empty'
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'Recipient not found'
      });
    }

    if (recipientId === userId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Cannot send message to yourself'
      });
    }

    const message = new Message({
      content: content.trim(),
      sender: userId,
      recipient: recipientId,
      media: media || null
    });

    await message.save();
    await message.populate('sender', 'firstName lastName username avatar');
    await message.populate('recipient', 'firstName lastName username avatar');

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        id: message._id,
        content: message.content,
        media: message.media,
        sender: {
          id: message.sender._id,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
          username: message.sender.username,
          avatar: message.sender.avatar
        },
        recipient: {
          id: message.recipient._id,
          firstName: message.recipient.firstName,
          lastName: message.recipient.lastName,
          username: message.recipient.username,
          avatar: message.recipient.avatar
        },
        isRead: message.isRead,
        createdAt: message.createdAt
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not send message'
    });
  }
};

// Get conversations
const getConversations = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$recipient', userId] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            username: '$user.username',
            avatar: '$user.avatar'
          },
          lastMessage: {
            id: '$lastMessage._id',
            content: '$lastMessage.content',
            media: '$lastMessage.media',
            isRead: '$lastMessage.isRead',
            createdAt: '$lastMessage.createdAt'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limitNum
      }
    ]);

    const total = await Message.distinct('_id', {
      $or: [{ sender: userId }, { recipient: userId }]
    });

    res.status(200).json({
      data: conversations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total.length,
        pages: Math.ceil(total.length / limitNum)
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get conversations'
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
    // Debug endpoint to check user data (must be first)
    if (url === '/api/debug/user' && method === 'GET') {
      try {
        const { username } = req.query;
        if (!username) {
          return res.status(400).json({ error: 'Username required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
          rawUserData: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            location: user.location,
            bio: user.bio,
            website: user.website,
            avatar: user.avatar,
            banner: user.banner,
            isPrivate: user.isPrivate,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          database: 'MongoDB Atlas',
          collection: 'users'
        });
      } catch (error) {
        res.status(500).json({ error: 'Database error', message: error.message });
      }
      return;
    }

    // Debug endpoint to list all users
    if (url === '/api/debug/users' && method === 'GET') {
      try {
        const users = await User.find({}).select('_id firstName lastName username email location bio createdAt');
        res.status(200).json({
          totalUsers: users.length,
          users: users.map(user => ({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            location: user.location,
            bio: user.bio,
            createdAt: user.createdAt
          }))
        });
      } catch (error) {
        res.status(500).json({ error: 'Database error', message: error.message });
      }
      return;
    }

    // Debug endpoint to update user data (temporary)
    if (url === '/api/debug/update-user' && method === 'POST') {
      try {
        const { username, location, lastName } = req.body;
        if (!username) {
          return res.status(400).json({ error: 'Username required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        if (location) user.location = location;
        if (lastName) user.lastName = lastName;

        await user.save();

        res.status(200).json({
          message: 'User updated successfully',
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            location: user.location,
            bio: user.bio,
            website: user.website,
            avatar: user.avatar,
            banner: user.banner,
            isPrivate: user.isPrivate,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
      } catch (error) {
        res.status(500).json({ error: 'Database error', message: error.message });
      }
      return;
    }

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

    // User routes
    if (url?.startsWith('/api/v1/users/search') && method === 'GET') {
      return await searchUsers(req, res);
    }
    
    if (url === '/api/v1/users/me' && method === 'GET') {
      return authenticateToken(req, res, () => getCurrentUserProfile(req, res));
    }
    
    if (url?.startsWith('/api/v1/users/') && method === 'GET') {
      return await getUserProfile(req, res);
    }
    
    if (url === '/api/v1/users/profile' && method === 'PUT') {
      return authenticateToken(req, res, () => updateProfile(req, res));
    }
    
    if (url?.startsWith('/api/v1/users/') && url.includes('/bridges') && method === 'GET') {
      return authenticateToken(req, res, () => getUserBridges(req, res));
    }

    // Follow routes
    if (url?.startsWith('/api/v1/follows/') && method === 'POST') {
      return authenticateToken(req, res, () => followUser(req, res));
    }
    
    if (url?.startsWith('/api/v1/follows/') && method === 'DELETE') {
      return authenticateToken(req, res, () => unfollowUser(req, res));
    }
    
    if (url?.startsWith('/api/v1/follows/followers') && method === 'GET') {
      return await getFollowers(req, res);
    }
    
    if (url?.startsWith('/api/v1/follows/following') && method === 'GET') {
      return await getFollowing(req, res);
    }

    // Message routes
    if (url === '/api/v1/messages' && method === 'POST') {
      return authenticateToken(req, res, () => sendMessage(req, res));
    }
    
    if (url?.startsWith('/api/v1/messages/conversations') && method === 'GET') {
      return authenticateToken(req, res, () => getConversations(req, res));
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