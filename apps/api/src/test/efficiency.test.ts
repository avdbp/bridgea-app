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

describe('Efficiency Tests', () => {
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

  describe('Response Time Efficiency', () => {
    it('should respond to health check within 50ms', async () => {
      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(50); // Should respond within 50ms
    });

    it('should respond to user registration within 200ms', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(201);
      expect(duration).toBeLessThan(200); // Should respond within 200ms
    });

    it('should respond to user login within 150ms', async () => {
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

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: loginData,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(150); // Should respond within 150ms
    });

    it('should respond to profile access within 100ms', async () => {
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

      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(100); // Should respond within 100ms
    });

    it('should respond to bridge creation within 250ms', async () => {
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

      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bridges',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: bridgeData,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(201);
      expect(duration).toBeLessThan(250); // Should respond within 250ms
    });
  });

  describe('Memory Efficiency', () => {
    it('should use minimal memory for simple operations', async () => {
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

    it('should use reasonable memory for user operations', async () => {
      const initialMemory = process.memoryUsage();
      
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

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      expect(response.statusCode).toBe(201);
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
    });

    it('should handle memory efficiently during bulk operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform bulk operations
      const operations = [];
      for (let i = 0; i < 100; i++) {
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

    it('should clean up memory after operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform operations
      for (let i = 0; i < 50; i++) {
        await app.inject({
          method: 'GET',
          url: '/api/v1/health',
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
    });
  });

  describe('CPU Efficiency', () => {
    it('should use minimal CPU for simple operations', async () => {
      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(10); // Should complete within 10ms
    });

    it('should use reasonable CPU for authentication operations', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(201);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle CPU-intensive operations efficiently', async () => {
      const startTime = Date.now();
      
      // Perform multiple operations
      const operations = [];
      for (let i = 0; i < 100; i++) {
        operations.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/health',
          })
        );
      }

      await Promise.all(operations);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Database Efficiency', () => {
    it('should handle database queries efficiently', async () => {
      const startTime = Date.now();
      
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

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(201);
      expect(duration).toBeLessThan(200); // Should complete within 200ms
    });

    it('should handle database connections efficiently', async () => {
      const startTime = Date.now();
      
      // Make multiple database operations
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
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle database transactions efficiently', async () => {
      const startTime = Date.now();
      
      // Perform operations that involve database transactions
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

      await app.inject({
        method: 'POST',
        url: '/api/v1/bridges',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: bridgeData,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Network Efficiency', () => {
    it('should handle network requests efficiently', async () => {
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

    it('should handle large payloads efficiently', async () => {
      const largeContent = 'A'.repeat(10000); // 10KB content
      
      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: largeContent,
          lastName: 'User',
          email: 'test@example.com',
          username: 'testuser',
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(400); // Should reject large payloads
      expect(duration).toBeLessThan(100); // Should respond quickly
    });

    it('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();
      
      // Make concurrent requests
      const operations = [];
      for (let i = 0; i < 100; i++) {
        operations.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/health',
          })
        );
      }

      await Promise.all(operations);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Resource Efficiency', () => {
    it('should use resources efficiently during normal operation', async () => {
      const initialMemory = process.memoryUsage();
      const startTime = Date.now();
      
      // Perform normal operations
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

      await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const endTime = Date.now();
      const finalMemory = process.memoryUsage();
      
      const duration = endTime - startTime;
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      expect(duration).toBeLessThan(300); // Should complete within 300ms
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });

    it('should handle resource constraints efficiently', async () => {
      const startTime = Date.now();
      
      // Perform operations under resource constraints
      const operations = [];
      for (let i = 0; i < 200; i++) {
        operations.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/health',
          })
        );
      }

      await Promise.all(operations);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should recover resources efficiently after operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform operations
      for (let i = 0; i < 100; i++) {
        await app.inject({
          method: 'GET',
          url: '/api/v1/health',
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
    });
  });
});


