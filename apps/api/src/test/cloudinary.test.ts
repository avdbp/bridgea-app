import { describe, it, expect, beforeEach } from 'vitest';
import { CloudinaryService } from '../services/cloudinary';

describe('Cloudinary Service', () => {
  it('should generate upload signature for image', () => {
    const signature = CloudinaryService.generateUploadSignature('test/', 'image');
    
    expect(signature.signature).toBeDefined();
    expect(signature.timestamp).toBeDefined();
    expect(signature.folder).toBe('test/');
    expect(signature.resource_type).toBe('image');
    expect(signature.upload_preset).toBeDefined();
    expect(signature.cloud_name).toBeDefined();
  });

  it('should generate upload signature for video', () => {
    const signature = CloudinaryService.generateUploadSignature('test/', 'video');
    
    expect(signature.signature).toBeDefined();
    expect(signature.timestamp).toBeDefined();
    expect(signature.folder).toBe('test/');
    expect(signature.resource_type).toBe('video');
    expect(signature.upload_preset).toBeDefined();
    expect(signature.cloud_name).toBeDefined();
  });

  it('should generate optimized image URL', () => {
    const publicId = 'test/sample-image';
    const url = CloudinaryService.getOptimizedImageUrl(publicId, {
      width: 300,
      height: 200,
      quality: 'auto',
    });
    
    expect(url).toBeDefined();
    expect(url).toContain(publicId);
    expect(url).toContain('w_300');
    expect(url).toContain('h_200');
  });

  it('should generate video thumbnail URL', () => {
    const publicId = 'test/sample-video';
    const url = CloudinaryService.getVideoThumbnailUrl(publicId, {
      width: 300,
      height: 200,
      time: '00:00:01',
    });
    
    expect(url).toBeDefined();
    expect(url).toContain(publicId);
    expect(url).toContain('w_300');
    expect(url).toContain('h_200');
  });

  it('should generate responsive image URL', () => {
    const publicId = 'test/sample-image';
    const url = CloudinaryService.getResponsiveImageUrl(publicId, 400);
    
    expect(url).toBeDefined();
    expect(url).toContain(publicId);
    expect(url).toContain('w_auto:breakpoints_400');
  });

  it('should generate avatar URL', () => {
    const publicId = 'test/sample-avatar';
    const url = CloudinaryService.getAvatarUrl(publicId, 100);
    
    expect(url).toBeDefined();
    expect(url).toContain(publicId);
    expect(url).toContain('w_100');
    expect(url).toContain('h_100');
    expect(url).toContain('c_fill');
    expect(url).toContain('g_face');
    expect(url).toContain('r_max');
  });

  it('should generate banner URL', () => {
    const publicId = 'test/sample-banner';
    const url = CloudinaryService.getBannerUrl(publicId, 400, 200);
    
    expect(url).toBeDefined();
    expect(url).toContain(publicId);
    expect(url).toContain('w_400');
    expect(url).toContain('h_200');
    expect(url).toContain('c_fill');
  });
});


