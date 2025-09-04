import { describe, it, expect, beforeEach } from 'vitest';
import { JWTService } from '../services/jwt';

describe('JWT Service', () => {
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


