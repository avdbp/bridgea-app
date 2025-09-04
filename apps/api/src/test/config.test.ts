import { describe, it, expect } from 'vitest';
import { config } from '../config';

describe('Config', () => {
  it('should have all required configuration values', () => {
    expect(config.MONGODB_URI).toBeDefined();
    expect(config.MONGODB_DB).toBeDefined();
    expect(config.JWT_SECRET).toBeDefined();
    expect(config.JWT_EXPIRES_IN).toBeDefined();
    expect(config.REFRESH_TOKEN_EXPIRES_IN).toBeDefined();
    expect(config.CLOUDINARY_CLOUD_NAME).toBeDefined();
    expect(config.CLOUDINARY_API_KEY).toBeDefined();
    expect(config.CLOUDINARY_API_SECRET).toBeDefined();
    expect(config.CLOUDINARY_UPLOAD_PRESET).toBeDefined();
    expect(config.PORT).toBeDefined();
    expect(config.NODE_ENV).toBeDefined();
    expect(config.CLIENT_URL).toBeDefined();
    expect(config.ALLOWED_ORIGINS).toBeDefined();
  });

  it('should have correct data types', () => {
    expect(typeof config.MONGODB_URI).toBe('string');
    expect(typeof config.MONGODB_DB).toBe('string');
    expect(typeof config.JWT_SECRET).toBe('string');
    expect(typeof config.JWT_EXPIRES_IN).toBe('string');
    expect(typeof config.REFRESH_TOKEN_EXPIRES_IN).toBe('string');
    expect(typeof config.CLOUDINARY_CLOUD_NAME).toBe('string');
    expect(typeof config.CLOUDINARY_API_KEY).toBe('string');
    expect(typeof config.CLOUDINARY_API_SECRET).toBe('string');
    expect(typeof config.CLOUDINARY_UPLOAD_PRESET).toBe('string');
    expect(typeof config.PORT).toBe('number');
    expect(typeof config.NODE_ENV).toBe('string');
    expect(typeof config.CLIENT_URL).toBe('string');
    expect(typeof config.ALLOWED_ORIGINS).toBe('string');
  });

  it('should have valid PORT number', () => {
    expect(config.PORT).toBeGreaterThan(0);
    expect(config.PORT).toBeLessThan(65536);
  });

  it('should have valid JWT secret length', () => {
    expect(config.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it('should have valid NODE_ENV', () => {
    expect(['development', 'production', 'test']).toContain(config.NODE_ENV);
  });

  it('should have valid CLOUDINARY configuration', () => {
    expect(config.CLOUDINARY_CLOUD_NAME).toBeTruthy();
    expect(config.CLOUDINARY_API_KEY).toBeTruthy();
    expect(config.CLOUDINARY_API_SECRET).toBeTruthy();
    expect(config.CLOUDINARY_UPLOAD_PRESET).toBeTruthy();
  });

  it('should have valid MongoDB configuration', () => {
    expect(config.MONGODB_URI).toBeTruthy();
    expect(config.MONGODB_DB).toBeTruthy();
  });

  it('should have valid CORS configuration', () => {
    expect(config.CLIENT_URL).toBeTruthy();
    expect(config.ALLOWED_ORIGINS).toBeTruthy();
    expect(config.ALLOWED_ORIGINS.split(',')).toHaveLength(2);
  });
});


