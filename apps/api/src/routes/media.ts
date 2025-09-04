import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CloudinaryService } from '../services/cloudinary';
import { authenticate } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { mediaUploadSchema } from '../types/schemas';
import { z } from 'zod';

const publicIdParamSchema = z.object({
  publicId: z.string().min(1),
});

export default async function mediaRoutes(fastify: FastifyInstance) {
  // Generate upload signature for client-side uploads
  fastify.post('/signature', {
    preHandler: [authenticate, validateBody(mediaUploadSchema)],
  }, async (request: FastifyRequest<{ Body: { type: 'image' | 'video'; folder?: string } }>, reply: FastifyReply) => {
    try {
      const { type, folder = 'bridgea/' } = request.body;
      
      const signature = CloudinaryService.generateUploadSignature(folder, type);
      
      return reply.send({
        signature,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to generate upload signature' });
    }
  });
  
  // Delete media by public_id
  fastify.delete('/:publicId', {
    preHandler: [authenticate, validateParams(publicIdParamSchema)],
  }, async (request: FastifyRequest<{ 
    Params: { publicId: string };
    Querystring: { type?: 'image' | 'video' };
  }>, reply: FastifyReply) => {
    try {
      const { publicId } = request.params;
      const { type = 'image' } = request.query;
      
      await CloudinaryService.deleteFile(publicId, type);
      
      return reply.send({
        message: 'Media deleted successfully',
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete media' });
    }
  });
  
  // Get optimized image URL
  fastify.get('/optimize/:publicId', {
    preHandler: [authenticate, validateParams(publicIdParamSchema)],
  }, async (request: FastifyRequest<{ 
    Params: { publicId: string };
    Querystring: { 
      width?: string;
      height?: string;
      quality?: string;
      format?: string;
      crop?: string;
    };
  }>, reply: FastifyReply) => {
    try {
      const { publicId } = request.params;
      const { width, height, quality, format, crop } = request.query;
      
      const options = {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        quality,
        format,
        crop,
      };
      
      const optimizedUrl = CloudinaryService.getOptimizedImageUrl(publicId, options);
      
      return reply.send({
        url: optimizedUrl,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to generate optimized URL' });
    }
  });
  
  // Get video thumbnail URL
  fastify.get('/thumbnail/:publicId', {
    preHandler: [authenticate, validateParams(publicIdParamSchema)],
  }, async (request: FastifyRequest<{ 
    Params: { publicId: string };
    Querystring: { 
      width?: string;
      height?: string;
      time?: string;
    };
  }>, reply: FastifyReply) => {
    try {
      const { publicId } = request.params;
      const { width, height, time } = request.query;
      
      const options = {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        time,
      };
      
      const thumbnailUrl = CloudinaryService.getVideoThumbnailUrl(publicId, options);
      
      return reply.send({
        url: thumbnailUrl,
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to generate thumbnail URL' });
    }
  });
}


