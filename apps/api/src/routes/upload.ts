import { FastifyInstance } from 'fastify';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.post('/upload', async (request, reply) => {
    try {
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({ error: 'No file provided' });
      }

      const buffer = await data.toBuffer();
      const fileType = data.fields.type?.value || 'image';
      const mimeType = data.mimetype;

      // Determinar el preset y folder según el tipo
      const isProfile = request.headers['x-upload-type'] === 'profile';
      const preset = isProfile ? config.CLOUDINARY_PROFILES_PRESET : config.CLOUDINARY_BRIDGES_PRESET;
      const folder = isProfile ? 'images/profiles' : 'images/bridges';
      const publicIdPrefix = isProfile ? 'profile' : 'bridge';

      // Convertir el buffer a base64 para Cloudinary
      const base64 = buffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64}`;

      // Subir a Cloudinary
      const result = await cloudinary.uploader.upload(dataUri, {
        resource_type: fileType === 'video' ? 'video' : 'image',
        upload_preset: preset,
        folder: folder,
        public_id: `${publicIdPrefix}_${Date.now()}`,
      });

      return reply.send({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        duration: result.duration,
      });
    } catch (error) {
      fastify.log.error('Upload error:', error);
      return reply.status(500).send({
        error: 'Failed to upload file',
        details: error.message
      });
    }
  });
}
