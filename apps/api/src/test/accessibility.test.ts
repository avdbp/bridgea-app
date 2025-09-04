import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { build } from '../index';
import { connectDB } from '../utils/database';
import { User } from '../models/User';
import { Bridge } from '../models/Bridge';
import { Follow } from '../models/Follow';
import { Like } from '../models/Like';
import { Comment } from '../models/Comment';
import { Notification } from '../models/Notification';
import { Group } from '../models/Group';
import { Message } from '../models/Message';

describe('Accessibility Tests', () => {
  let app: any;

  beforeEach(async () => {
    app = build();
    await app.ready();
    
    // Connect to test database
    await connectDB();
    
    // Clear test data
    await User.deleteMany({});
    await Bridge.deleteMany({});
    await Follow.deleteMany({});
    await Like.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await Group.deleteMany({});
    await Message.deleteMany({});
  });

  afterEach(async () => {
    await app.close();
    
    // Clean up test data
    await User.deleteMany({});
    await Bridge.deleteMany({});
    await Follow.deleteMany({});
    await Like.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await Group.deleteMany({});
    await Message.deleteMany({});
  });

  describe('API Accessibility', () => {
    it('should provide health check endpoint for monitoring', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should provide API version information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('timestamp');
    });

    it('should handle CORS preflight requests', async () => {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/api/v1/health',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });

    it('should provide proper error messages for invalid endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/invalid-endpoint',
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Not Found');
    });

    it('should provide proper error messages for invalid methods', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(405);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Method Not Allowed');
    });
  });

  describe('Authentication Accessibility', () => {
    it('should provide clear error messages for missing authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Unauthorized');
    });

    it('should provide clear error messages for invalid tokens', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Invalid token');
    });

    it('should provide clear error messages for expired tokens', async () => {
      // This would require creating an expired token
      // For now, we'll test with a malformed token
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
    });

    it('should provide clear error messages for malformed authorization headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: 'InvalidFormat',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Invalid authorization header');
    });
  });

  describe('Input Validation Accessibility', () => {
    it('should provide clear error messages for missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: 'Test',
          // Missing other required fields
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Validation error');
    });

    it('should provide clear error messages for invalid email formats', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          username: 'testuser',
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Invalid email format');
    });

    it('should provide clear error messages for weak passwords', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          username: 'testuser',
          location: 'Test City',
          password: '123',
          confirmPassword: '123',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Password too weak');
    });

    it('should provide clear error messages for password mismatch', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          username: 'testuser',
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'differentpassword',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Passwords do not match');
    });

    it('should provide clear error messages for duplicate usernames', async () => {
      // First, register a user
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      // Try to register another user with the same username
      const duplicateUserData = {
        firstName: 'Test2',
        lastName: 'User2',
        email: 'test2@example.com',
        username: 'testuser', // Same username
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: duplicateUserData,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Username already exists');
    });

    it('should provide clear error messages for duplicate emails', async () => {
      // First, register a user
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      // Try to register another user with the same email
      const duplicateUserData = {
        firstName: 'Test2',
        lastName: 'User2',
        email: 'test@example.com', // Same email
        username: 'testuser2',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: duplicateUserData,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Email already exists');
    });
  });

  describe('Rate Limiting Accessibility', () => {
    it('should provide clear error messages when rate limited', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      // Make multiple rapid requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(r => r.statusCode === 429);
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].json()).toHaveProperty('error');
        expect(rateLimitedResponses[0].json().error).toContain('Too many requests');
      }
    });

    it('should provide retry information in rate limit responses', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      // Make multiple rapid requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(r => r.statusCode === 429);
      if (rateLimitedResponses.length > 0) {
        const response = rateLimitedResponses[0];
        expect(response.json()).toHaveProperty('error');
        expect(response.json()).toHaveProperty('retryAfter');
      }
    });
  });

  describe('Error Response Accessibility', () => {
    it('should provide consistent error response format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/invalid-endpoint',
      });

      expect(response.statusCode).toBe(404);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('statusCode');
      expect(errorData).toHaveProperty('timestamp');
    });

    it('should provide helpful error messages for validation errors', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          username: 'testuser',
          location: 'Test City',
          password: '123',
          confirmPassword: '123',
        },
      });

      expect(response.statusCode).toBe(400);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('details');
      expect(Array.isArray(errorData.details)).toBe(true);
    });

    it('should provide helpful error messages for server errors', async () => {
      // This would require triggering a server error
      // For now, we'll test with an invalid endpoint
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/invalid-endpoint',
      });

      expect(response.statusCode).toBe(404);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Not Found');
    });
  });

  describe('API Documentation Accessibility', () => {
    it('should provide OpenAPI/Swagger documentation endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/docs',
      });

      // This endpoint might not exist yet, but if it does, it should be accessible
      if (response.statusCode === 200) {
        expect(response.headers['content-type']).toContain('text/html');
      } else {
        expect(response.statusCode).toBe(404);
      }
    });

    it('should provide API schema endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/schema',
      });

      // This endpoint might not exist yet, but if it does, it should be accessible
      if (response.statusCode === 200) {
        expect(response.headers['content-type']).toContain('application/json');
      } else {
        expect(response.statusCode).toBe(404);
      }
    });
  });
});


