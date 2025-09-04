import { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from '../../apps/api/src/config';

// Get media info
export const getMediaInfo = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Media URL is required'
      });
    }

    // Basic media info response
    res.status(200).json({
      url,
      type: 'image', // Default type
      size: null,
      dimensions: null,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get media info error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get media info'
    });
  }
};

// Delete media
export const deleteMedia = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { url } = req.query;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated'
      });
    }

    if (!url) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Media URL is required'
      });
    }

    // TODO: Implement actual media deletion from Cloudinary
    // For now, just return success
    res.status(200).json({
      message: 'Media deleted successfully'
    });

  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not delete media'
    });
  }
};

// Main media routes handler
export const mediaRoutes = async (req: VercelRequest, res: VercelResponse) => {
  const { method, url } = req;
  const path = url?.replace('/api/v1/media', '') || '';

  switch (method) {
    case 'GET':
      if (path === '/info' || path === '/info/') {
        return await getMediaInfo(req, res);
      }
      break;
    case 'DELETE':
      if (path === '/delete' || path === '/delete/') {
        return await deleteMedia(req, res);
      }
      break;
  }

  res.status(404).json({
    error: 'Not Found',
    message: 'Media endpoint not found'
  });
};
