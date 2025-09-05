import { VercelRequest, VercelResponse } from '@vercel/node';
import { User } from '../models/User';
import { Follow } from '../models/Follow';

// Get user profile
export const getUserProfile = async (req: VercelRequest, res: VercelResponse) => {
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

    // Get follow stats
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
export const updateProfile = async (req: VercelRequest, res: VercelResponse) => {
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

    // Update fields
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

// Update avatar
export const updateAvatar = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;
    const { avatar } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!avatar) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Avatar URL is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    user.avatar = avatar;
    await user.save();

    res.status(200).json({
      message: 'Avatar updated successfully',
      avatar: user.avatar
    });

  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not update avatar'
    });
  }
};

// Update banner
export const updateBanner = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;
    const { banner } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!banner) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Banner URL is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    user.banner = banner;
    await user.save();

    res.status(200).json({
      message: 'Banner updated successfully',
      banner: user.banner
    });

  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not update banner'
    });
  }
};

// Search users
export const searchUsers = async (req: VercelRequest, res: VercelResponse) => {
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

// Get user followers
export const getUserFollowers = async (req: VercelRequest, res: VercelResponse) => {
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
    console.error('Get user followers error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get user followers'
    });
  }
};

// Get user following
export const getUserFollowing = async (req: VercelRequest, res: VercelResponse) => {
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
    console.error('Get user following error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get user following'
    });
  }
};

// Main user routes handler
export const userRoutes = async (req: VercelRequest, res: VercelResponse) => {
  const { method, url } = req;
  const path = url?.replace('/api/v1/users', '') || '';

  switch (method) {
    case 'GET':
      if (path.startsWith('/search')) {
        return await searchUsers(req, res);
      }
      if (path.startsWith('/followers')) {
        return await getUserFollowers(req, res);
      }
      if (path.startsWith('/following')) {
        return await getUserFollowing(req, res);
      }
      if (path.startsWith('/')) {
        return await getUserProfile(req, res);
      }
      break;
    case 'PUT':
      if (path === '/profile' || path === '/profile/') {
        return await updateProfile(req, res);
      }
      if (path === '/avatar' || path === '/avatar/') {
        return await updateAvatar(req, res);
      }
      if (path === '/banner' || path === '/banner/') {
        return await updateBanner(req, res);
      }
      break;
  }

  res.status(404).json({
    error: 'Not Found',
    message: 'User endpoint not found'
  });
};
