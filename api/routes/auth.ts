import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../apps/api/src/models/User';
import { config } from '../../apps/api/src/config';

// Register user
export const register = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { firstName, lastName, email, username, password, location, confirmPassword } = req.body;

    // Validation
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

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User Exists',
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: config.REFRESH_TOKEN_EXPIRES_IN }
    );

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

// Login user
export const login = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Validation
    if (!emailOrUsername || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email/username and password are required'
      });
    }

    // Find user by email or username
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

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: config.REFRESH_TOKEN_EXPIRES_IN }
    );

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

// Refresh token
export const refreshToken = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET) as { userId: string };
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: 'Authentication Failed',
      message: 'Invalid refresh token'
    });
  }
};

// Forgot password
export const forgotPassword = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'No user found with this email'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // For now, just return success
    res.status(200).json({
      message: 'Password reset email sent',
      resetToken // In production, don't return this
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not process forgot password request'
    });
  }
};

// Change password
export const changePassword = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'All password fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'New password must be at least 6 characters'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not change password'
    });
  }
};

// Main auth routes handler
export const authRoutes = async (req: VercelRequest, res: VercelResponse) => {
  const { method, url } = req;
  const path = url?.replace('/api/v1/auth', '') || '';

  switch (method) {
    case 'POST':
      if (path === '/register' || path === '/register/') {
        return await register(req, res);
      }
      if (path === '/login' || path === '/login/') {
        return await login(req, res);
      }
      if (path === '/refresh' || path === '/refresh/') {
        return await refreshToken(req, res);
      }
      if (path === '/forgot-password' || path === '/forgot-password/') {
        return await forgotPassword(req, res);
      }
      if (path === '/change-password' || path === '/change-password/') {
        return await changePassword(req, res);
      }
      break;
  }

  res.status(404).json({
    error: 'Not Found',
    message: 'Auth endpoint not found'
  });
};
