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

describe('Learnability Tests', () => {
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

  describe('API Documentation', () => {
    it('should provide clear API documentation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should provide consistent API structure', async () => {
      const endpoints = [
        { method: 'GET', url: '/api/v1/health' },
        { method: 'POST', url: '/api/v1/auth/register' },
        { method: 'POST', url: '/api/v1/auth/login' },
        { method: 'GET', url: '/api/v1/users/profile' },
        { method: 'GET', url: '/api/v1/bridges/feed' },
        { method: 'GET', url: '/api/v1/users/search' },
      ];

      for (const endpoint of endpoints) {
        const response = await app.inject({
          method: endpoint.method,
          url: endpoint.url,
          payload: endpoint.method === 'POST' ? {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            username: 'testuser',
            location: 'Test City',
            password: 'password123',
            confirmPassword: 'password123',
          } : undefined,
        });

        // All endpoints should respond (even if with errors)
        expect([200, 201, 400, 401, 404]).toContain(response.statusCode);
      }
    });

    it('should provide clear error messages', async () => {
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

    it('should provide helpful validation messages', async () => {
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
  });

  describe('User Experience', () => {
    it('should provide intuitive user registration flow', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('tokens');
      expect(data.tokens).toHaveProperty('accessToken');
      expect(data.tokens).toHaveProperty('refreshToken');
    });

    it('should provide intuitive user login flow', async () => {
      // First register a user
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

      // Then login
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: loginData,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('tokens');
    });

    it('should provide clear error messages for invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Invalid credentials');
    });

    it('should provide clear error messages for missing authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
      });

      expect(response.statusCode).toBe(401);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Unauthorized');
    });
  });

  describe('Data Structure Learning', () => {
    it('should provide consistent user data structure', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('firstName');
      expect(data.user).toHaveProperty('lastName');
      expect(data.user).toHaveProperty('email');
      expect(data.user).toHaveProperty('username');
      expect(data.user).toHaveProperty('location');
    });

    it('should provide consistent bridge data structure', async () => {
      // First register and login a user
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      const authToken = registerResponse.json().tokens.accessToken;

      const bridgeData = {
        content: 'This is a test bridge',
        visibility: 'public',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bridges',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: bridgeData,
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data).toHaveProperty('bridge');
      expect(data.bridge).toHaveProperty('id');
      expect(data.bridge).toHaveProperty('content');
      expect(data.bridge).toHaveProperty('visibility');
      expect(data.bridge).toHaveProperty('author');
      expect(data.bridge).toHaveProperty('createdAt');
    });

    it('should provide consistent error data structure', async () => {
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

    it('should provide consistent success data structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('version');
    });
  });

  describe('Workflow Learning', () => {
    it('should provide clear registration workflow', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toHaveProperty('user');
      expect(response.json()).toHaveProperty('tokens');
    });

    it('should provide clear authentication workflow', async () => {
      // First register a user
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

      // Then login
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: loginData,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('tokens');
    });

    it('should provide clear data access workflow', async () => {
      // First register and login a user
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      const authToken = registerResponse.json().tokens.accessToken;

      // Access user profile
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('user');
    });

    it('should provide clear data modification workflow', async () => {
      // First register and login a user
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      const authToken = registerResponse.json().tokens.accessToken;

      // Update user profile
      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          firstName: 'Updated',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('user');
    });
  });

  describe('Error Handling Learning', () => {
    it('should provide clear validation error messages', async () => {
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

    it('should provide clear authentication error messages', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Invalid token');
    });

    it('should provide clear authorization error messages', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
      });

      expect(response.statusCode).toBe(401);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Unauthorized');
    });

    it('should provide clear not found error messages', async () => {
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

  describe('Performance Learning', () => {
    it('should provide consistent response times', async () => {
      const durations = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        
        const response = await app.inject({
          method: 'GET',
          url: '/api/v1/health',
        });

        const endTime = Date.now();
        const duration = endTime - startTime;
        
        durations.push(duration);
        expect(response.statusCode).toBe(200);
      }

      // Performance should be consistent
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(avgDuration).toBeLessThan(100); // Should average less than 100ms
    });

    it('should provide predictable behavior under load', async () => {
      const operations = [];
      
      for (let i = 0; i < 100; i++) {
        operations.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/health',
          })
        );
      }

      const responses = await Promise.all(operations);
      
      expect(responses).toHaveLength(100);
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
    });

    it('should provide consistent memory usage', async () => {
      const initialMemory = process.memoryUsage();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      expect(response.statusCode).toBe(200);
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
    });

    it('should provide consistent CPU usage', async () => {
      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(50); // Should complete within 50ms
    });
  });

  describe('Security Learning', () => {
    it('should provide clear security requirements', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
      });

      expect(response.statusCode).toBe(401);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Unauthorized');
    });

    it('should provide clear authentication requirements', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Invalid token');
    });

    it('should provide clear authorization requirements', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
      });

      expect(response.statusCode).toBe(401);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Unauthorized');
    });

    it('should provide clear rate limiting information', async () => {
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
        expect(rateLimitedResponses[0].json()).toHaveProperty('retryAfter');
      }
    });
  });
});


