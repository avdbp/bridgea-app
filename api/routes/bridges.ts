import { VercelRequest, VercelResponse } from '@vercel/node';
import { Bridge } from '../../apps/api/src/models/Bridge';
import { User } from '../../apps/api/src/models/User';
import { Follow } from '../../apps/api/src/models/Follow';

// Create bridge
export const createBridge = async (req: VercelRequest, res: VercelResponse) => {
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

    if (content.length > 2000) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Content cannot exceed 2000 characters'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
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

// Get bridges feed
export const getBridges = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const userId = (req as any).user?.userId;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { visibility: 'public' };

    // If user is authenticated, include their own bridges and followers' bridges
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        const followingIds = await Follow.find({ follower: userId, status: 'accepted' })
          .distinct('following');
        
        query = {
          $or: [
            { visibility: 'public' },
            { author: userId },
            { 
              visibility: 'followers',
              author: { $in: followingIds }
            }
          ]
        };
      }
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
    console.error('Get bridges error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get bridges'
    });
  }
};

// Get user bridges
export const getUserBridges = async (req: VercelRequest, res: VercelResponse) => {
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

    // If viewing someone else's profile, respect privacy settings
    if (currentUserId && currentUserId.toString() !== user._id.toString()) {
      if (user.isPrivate) {
        // Check if current user follows this user
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

      // Only show public and followers bridges for other users
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

// Get single bridge
export const getBridge = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    const userId = (req as any).user?.userId;

    if (!id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Bridge ID is required'
      });
    }

    const bridge = await Bridge.findById(id).populate('author', 'firstName lastName username avatar');
    if (!bridge) {
      return res.status(404).json({
        error: 'Bridge Not Found',
        message: 'Bridge not found'
      });
    }

    // Check visibility permissions
    if (bridge.visibility === 'private' && bridge.author._id.toString() !== userId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'This bridge is private'
      });
    }

    if (bridge.visibility === 'followers' && bridge.author._id.toString() !== userId) {
      if (userId) {
        const isFollowing = await Follow.findOne({
          follower: userId,
          following: bridge.author._id,
          status: 'accepted'
        });

        if (!isFollowing) {
          return res.status(403).json({
            error: 'Access Denied',
            message: 'This bridge is only visible to followers'
          });
        }
      } else {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'This bridge is only visible to followers'
        });
      }
    }

    res.status(200).json({
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
    console.error('Get bridge error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get bridge'
    });
  }
};

// Update bridge
export const updateBridge = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    const userId = (req as any).user?.userId;
    const { content, tags, visibility } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Bridge ID is required'
      });
    }

    const bridge = await Bridge.findById(id);
    if (!bridge) {
      return res.status(404).json({
        error: 'Bridge Not Found',
        message: 'Bridge not found'
      });
    }

    // Check if user owns the bridge
    if (bridge.author.toString() !== userId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only update your own bridges'
      });
    }

    // Update fields
    if (content !== undefined) {
      if (content.trim().length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Content cannot be empty'
        });
      }
      if (content.length > 2000) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Content cannot exceed 2000 characters'
        });
      }
      bridge.content = content.trim();
    }
    if (tags !== undefined) bridge.tags = tags;
    if (visibility !== undefined) bridge.visibility = visibility;

    await bridge.save();
    await bridge.populate('author', 'firstName lastName username avatar');

    res.status(200).json({
      message: 'Bridge updated successfully',
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
    console.error('Update bridge error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not update bridge'
    });
  }
};

// Delete bridge
export const deleteBridge = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Bridge ID is required'
      });
    }

    const bridge = await Bridge.findById(id);
    if (!bridge) {
      return res.status(404).json({
        error: 'Bridge Not Found',
        message: 'Bridge not found'
      });
    }

    // Check if user owns the bridge
    if (bridge.author.toString() !== userId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only delete your own bridges'
      });
    }

    await Bridge.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Bridge deleted successfully'
    });

  } catch (error) {
    console.error('Delete bridge error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not delete bridge'
    });
  }
};

// Main bridge routes handler
export const bridgeRoutes = async (req: VercelRequest, res: VercelResponse) => {
  const { method, url } = req;
  const path = url?.replace('/api/v1/bridges', '') || '';

  switch (method) {
    case 'POST':
      if (path === '/' || path === '') {
        return await createBridge(req, res);
      }
      break;
    case 'GET':
      if (path.startsWith('/user')) {
        return await getUserBridges(req, res);
      }
      if (path.startsWith('/')) {
        return await getBridge(req, res);
      }
      if (path === '/' || path === '') {
        return await getBridges(req, res);
      }
      break;
    case 'PUT':
      if (path.startsWith('/')) {
        return await updateBridge(req, res);
      }
      break;
    case 'DELETE':
      if (path.startsWith('/')) {
        return await deleteBridge(req, res);
      }
      break;
  }

  res.status(404).json({
    error: 'Not Found',
    message: 'Bridge endpoint not found'
  });
};
