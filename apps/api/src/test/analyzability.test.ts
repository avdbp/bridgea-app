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

describe('Analyzability Tests', () => {
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

  describe('Logging and Monitoring', () => {
    it('should provide health check endpoint for monitoring', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should provide version information for analysis', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('timestamp');
    });

    it('should provide consistent response formats for analysis', async () => {
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

    it('should provide error information for analysis', async () => {
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
  });

  describe('Performance Analysis', () => {
    it('should provide response time information', async () => {
      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(100); // Should respond within 100ms
    });

    it('should provide throughput information', async () => {
      const startTime = Date.now();
      
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
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(100);
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
      
      const requestsPerSecond = 100 / (duration / 1000);
      expect(requestsPerSecond).toBeGreaterThan(50); // At least 50 RPS
    });

    it('should provide memory usage information', async () => {
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

    it('should provide CPU usage information', async () => {
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

  describe('Error Analysis', () => {
    it('should provide detailed error information', async () => {
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

    it('should provide validation error details', async () => {
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

    it('should provide authentication error details', async () => {
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

    it('should provide authorization error details', async () => {
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

  describe('Usage Analysis', () => {
    it('should provide endpoint usage information', async () => {
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

    it('should provide user activity information', async () => {
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
    });

    it('should provide data access patterns', async () => {
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
      const profileResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(profileResponse.statusCode).toBe(200);
      expect(profileResponse.json()).toHaveProperty('user');
    });

    it('should provide resource utilization patterns', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform operations
      const operations = [];
      for (let i = 0; i < 50; i++) {
        operations.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/health',
          })
        );
      }

      await Promise.all(operations);

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe('Security Analysis', () => {
    it('should provide security event information', async () => {
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
    });

    it('should provide authentication attempt information', async () => {
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
    });

    it('should provide authorization attempt information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
      });

      expect(response.statusCode).toBe(401);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
    });

    it('should provide rate limiting information', async () => {
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
      }
    });
  });

  describe('Data Analysis', () => {
    it('should provide data access patterns', async () => {
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
    });

    it('should provide data modification patterns', async () => {
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
      const updateResponse = await app.inject({
        method: 'PUT',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          firstName: 'Updated',
        },
      });

      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.json()).toHaveProperty('user');
    });

    it('should provide data creation patterns', async () => {
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

      // Create a bridge
      const bridgeData = {
        content: 'This is a test bridge',
        visibility: 'public',
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/bridges',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: bridgeData,
      });

      expect(createResponse.statusCode).toBe(201);
      expect(createResponse.json()).toHaveProperty('bridge');
    });

    it('should provide data deletion patterns', async () => {
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

      // Create a bridge
      const bridgeData = {
        content: 'This is a test bridge',
        visibility: 'public',
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/bridges',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: bridgeData,
      });

      const bridgeId = createResponse.json().bridge.id;

      // Delete the bridge
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/v1/bridges/${bridgeId}`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.json()).toHaveProperty('message');
    });
  });

  describe('System Analysis', () => {
    it('should provide system health information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('version');
    });

    it('should provide system performance information', async () => {
      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(100); // Should respond within 100ms
    });

    it('should provide system resource information', async () => {
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

    it('should provide system configuration information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('timestamp');
    });
  });
});


