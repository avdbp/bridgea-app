import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  duration?: number;
  resource_type: 'image' | 'video';
}

export class CloudinaryService {
  /**
   * Generate upload signature for client-side uploads
   */
  static generateUploadSignature(folder: string = 'bridgea/', resourceType: 'image' | 'video' = 'image') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const params = {
      folder,
      resource_type: resourceType,
      timestamp,
      upload_preset: config.CLOUDINARY_UPLOAD_PRESET,
    };
    
    const signature = cloudinary.utils.api_sign_request(params, config.CLOUDINARY_API_SECRET);
    
    return {
      signature,
      timestamp,
      folder,
      resource_type: resourceType,
      upload_preset: config.CLOUDINARY_UPLOAD_PRESET,
      cloud_name: config.CLOUDINARY_CLOUD_NAME,
    };
  }
  
  /**
   * Upload file from server
   */
  static async uploadFile(
    file: Buffer | string,
    folder: string = 'bridgea/',
    resourceType: 'image' | 'video' = 'image'
  ): Promise<UploadResult> {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: resourceType,
        upload_preset: config.CLOUDINARY_UPLOAD_PRESET,
        quality: 'auto',
        fetch_format: 'auto',
      });
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        duration: result.duration,
        resource_type: result.resource_type as 'image' | 'video',
      };
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error}`);
    }
  }
  
  /**
   * Delete file by public_id
   */
  static async deleteFile(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    } catch (error) {
      throw new Error(`Cloudinary delete failed: ${error}`);
    }
  }
  
  /**
   * Generate optimized URL for images
   */
  static getOptimizedImageUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
  } = {}): string {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
    } = options;
    
    return cloudinary.url(publicId, {
      width,
      height,
      quality,
      format,
      crop,
      fetch_format: 'auto',
    });
  }
  
  /**
   * Generate video thumbnail URL
   */
  static getVideoThumbnailUrl(publicId: string, options: {
    width?: number;
    height?: number;
    time?: string;
  } = {}): string {
    const {
      width = 300,
      height = 200,
      time = '00:00:01',
    } = options;
    
    return cloudinary.url(publicId, {
      resource_type: 'video',
      width,
      height,
      crop: 'fill',
      format: 'jpg',
      start_offset: time,
    });
  }
}


