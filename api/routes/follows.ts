import { VercelRequest, VercelResponse } from '@vercel/node';
import { Follow } from '../../apps/api/src/models/Follow';
import { User } from '../../apps/api/src/models/User';

// Follow user
export const followUser = async (req: VercelRequest, res: VercelResponse) => {
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

    // Check if trying to follow self
    if (userToFollow._id.toString() === userId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Cannot follow yourself'
      });
    }

    // Check if already following
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

    // Create follow request
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
export const unfollowUser = async (req: VercelRequest, res: VercelResponse) => {
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

// Respond to follow request
export const respondToFollowRequest = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { username } = req.query;
    const { action } = req.body; // 'accept' or 'reject'
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!username || !action) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username and action are required'
      });
    }

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Action must be either "accept" or "reject"'
      });
    }

    const requester = await User.findOne({ username });
    if (!requester) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    const follow = await Follow.findOne({
      follower: requester._id,
      following: userId,
      status: 'pending'
    });

    if (!follow) {
      return res.status(404).json({
        error: 'Request Not Found',
        message: 'No pending follow request found'
      });
    }

    if (action === 'accept') {
      follow.status = 'accepted';
      await follow.save();
    } else {
      await Follow.findByIdAndDelete(follow._id);
    }

    res.status(200).json({
      message: `Follow request ${action}ed successfully`
    });

  } catch (error) {
    console.error('Respond to follow request error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not respond to follow request'
    });
  }
};

// Get follow requests
export const getFollowRequests = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const requests = await Follow.find({ following: userId, status: 'pending' })
      .populate('follower', 'firstName lastName username avatar')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({ following: userId, status: 'pending' });

    res.status(200).json({
      data: requests.map(request => ({
        id: request.follower._id,
        firstName: request.follower.firstName,
        lastName: request.follower.lastName,
        username: request.follower.username,
        avatar: request.follower.avatar,
        requestedAt: request.createdAt
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get follow requests error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get follow requests'
    });
  }
};

// Get followers
export const getFollowers = async (req: VercelRequest, res: VercelResponse) => {
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
export const getFollowing = async (req: VercelRequest, res: VercelResponse) => {
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

// Check follow status
export const checkFollowStatus = async (req: VercelRequest, res: VercelResponse) => {
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

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    const follow = await Follow.findOne({
      follower: userId,
      following: user._id
    });

    res.status(200).json({
      isFollowing: follow?.status === 'accepted',
      status: follow?.status || 'not_following'
    });

  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not check follow status'
    });
  }
};

// Main follow routes handler
export const followRoutes = async (req: VercelRequest, res: VercelResponse) => {
  const { method, url } = req;
  const path = url?.replace('/api/v1/follows', '') || '';

  switch (method) {
    case 'POST':
      if (path.startsWith('/')) {
        return await followUser(req, res);
      }
      if (path.startsWith('/respond')) {
        return await respondToFollowRequest(req, res);
      }
      break;
    case 'DELETE':
      if (path.startsWith('/')) {
        return await unfollowUser(req, res);
      }
      break;
    case 'GET':
      if (path === '/requests' || path === '/requests/') {
        return await getFollowRequests(req, res);
      }
      if (path === '/followers' || path === '/followers/') {
        return await getFollowers(req, res);
      }
      if (path === '/following' || path === '/following/') {
        return await getFollowing(req, res);
      }
      if (path === '/status' || path === '/status/') {
        return await checkFollowStatus(req, res);
      }
      break;
  }

  res.status(404).json({
    error: 'Not Found',
    message: 'Follow endpoint not found'
  });
};
