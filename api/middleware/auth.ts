import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { User } from '../../apps/api/src/models/User';
import { config } from '../../apps/api/src/config';

export const authenticateToken = async (req: VercelRequest, res: VercelResponse, next?: () => void) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid token'
      });
    }

    // Add user to request object
    (req as any).user = { userId: user._id.toString(), user };

    if (next) {
      next();
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'Invalid token'
    });
  }
};

export const optionalAuth = async (req: VercelRequest, res: VercelResponse, next?: () => void) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId).select('-password');

      if (user) {
        (req as any).user = { userId: user._id.toString(), user };
      }
    }

    if (next) {
      next();
    }

  } catch (error) {
    // Optional auth - continue without user
    if (next) {
      next();
    }
  }
};
