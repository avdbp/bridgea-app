import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../services/api';

describe('Media API', () => {
  let authToken: string;

  beforeEach(async () => {
    // Setup test user and get auth token
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'testuser',
      location: 'Test City',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const response = await apiService.register(userData);
    authToken = response.tokens.accessToken;
  });

  it('should get upload signature for image', async () => {
    const response = await apiService.getUploadSignature('image', 'test/');
    
    expect(response.signature).toBeDefined();
    expect(response.timestamp).toBeDefined();
    expect(response.folder).toBe('test/');
    expect(response.resource_type).toBe('image');
    expect(response.upload_preset).toBeDefined();
    expect(response.cloud_name).toBeDefined();
  });

  it('should get upload signature for video', async () => {
    const response = await apiService.getUploadSignature('video', 'test/');
    
    expect(response.signature).toBeDefined();
    expect(response.timestamp).toBeDefined();
    expect(response.folder).toBe('test/');
    expect(response.resource_type).toBe('video');
    expect(response.upload_preset).toBeDefined();
    expect(response.cloud_name).toBeDefined();
  });

  it('should get optimized image URL', async () => {
    const publicId = 'test/sample-image';
    const response = await apiService.getOptimizedImageUrl(publicId, {
      width: 300,
      height: 200,
      quality: 'auto',
    });
    
    expect(response.url).toBeDefined();
    expect(response.url).toContain(publicId);
  });

  it('should get video thumbnail URL', async () => {
    const publicId = 'test/sample-video';
    const response = await apiService.getVideoThumbnailUrl(publicId, {
      width: 300,
      height: 200,
      time: '00:00:01',
    });
    
    expect(response.url).toBeDefined();
    expect(response.url).toContain(publicId);
  });
});


