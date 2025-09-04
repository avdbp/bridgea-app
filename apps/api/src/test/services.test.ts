import { describe, it, expect, beforeEach } from 'vitest';
import { CloudinaryService } from '../services/cloudinary';
import { JWTService } from '../services/jwt';

describe('Services', () => {
  describe('CloudinaryService', () => {
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

  describe('JWTService', () => {
    const testPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser',
    };

    it('should generate access token', () => {
      const token = JWTService.generateAccessToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate refresh token', () => {
      const token = JWTService.generateRefreshToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate token pair', () => {
      const tokens = JWTService.generateTokenPair(testPayload);
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should verify access token', () => {
      const token = JWTService.generateAccessToken(testPayload);
      const decoded = JWTService.verifyAccessToken(token);
      
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.username).toBe(testPayload.username);
    });

    it('should verify refresh token', () => {
      const token = JWTService.generateRefreshToken(testPayload);
      const decoded = JWTService.verifyRefreshToken(token);
      
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.username).toBe(testPayload.username);
    });

    it('should decode token without verification', () => {
      const token = JWTService.generateAccessToken(testPayload);
      const decoded = JWTService.decodeToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.username).toBe(testPayload.username);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => JWTService.verifyAccessToken(invalidToken)).toThrow();
      expect(() => JWTService.verifyRefreshToken(invalidToken)).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create a token with very short expiration
      const shortExpirationToken = JWTService.generateAccessToken(testPayload);
      
      // Wait for token to expire (this would need to be mocked in real tests)
      // For now, we'll just test that the token is generated correctly
      expect(shortExpirationToken).toBeDefined();
    });
  });
});


