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

describe('Benchmark Tests', () => {
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

  describe('Response Time Benchmarks', () => {
    it('should respond to health check within 100ms', async () => {
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

    it('should register user within 500ms', async () => {
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
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('should login user within 300ms', async () => {
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
      expect(duration).toBeLessThan(300); // Should complete within 300ms
    });

    it('should create bridge within 400ms', async () => {
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
      expect(duration).toBeLessThan(400); // Should complete within 400ms
    });

    it('should load feed within 800ms', async () => {
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

      // Create some bridges for the feed
      for (let i = 0; i < 10; i++) {
        const bridgeData = {
          content: `Test bridge ${i}`,
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
      }

      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bridges/feed',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(800); // Should complete within 800ms
    });

    it('should search users within 600ms', async () => {
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

      // Create some users for searching
      for (let i = 0; i < 50; i++) {
        const userData = {
          firstName: `Test${i}`,
          lastName: 'User',
          email: `test${i}@example.com`,
          username: `testuser${i}`,
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        };

        await app.inject({
          method: 'POST',
          url: '/api/v1/auth/register',
          payload: userData,
        });
      }

      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(600); // Should complete within 600ms
    });
  });

  describe('Throughput Benchmarks', () => {
    it('should handle 100 requests per second', async () => {
      const requests = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        requests.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/health',
          })
        );
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(100);
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
      
      const requestsPerSecond = 100 / (duration / 1000);
      expect(requestsPerSecond).toBeGreaterThan(50); // At least 50 RPS
    });

    it('should handle 50 user registrations per second', async () => {
      const requests = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        const userData = {
          firstName: `Test${i}`,
          lastName: 'User',
          email: `test${i}@example.com`,
          username: `testuser${i}`,
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        };

        requests.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(50);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      
      const requestsPerSecond = 50 / (duration / 1000);
      expect(requestsPerSecond).toBeGreaterThan(25); // At least 25 RPS
    });

    it('should handle 200 bridge creations per second', async () => {
      // First create a user for authentication
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

      const requests = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 200; i++) {
        const bridgeData = {
          content: `Test bridge ${i}`,
          visibility: 'public',
        };

        requests.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/bridges',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            payload: bridgeData,
          })
        );
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(200);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      
      const requestsPerSecond = 200 / (duration / 1000);
      expect(requestsPerSecond).toBeGreaterThan(100); // At least 100 RPS
    });
  });

  describe('Memory Usage Benchmarks', () => {
    it('should use less than 100MB for 1000 operations', async () => {
      const initialMemory = process.memoryUsage();
      
      const operations = [];
      for (let i = 0; i < 1000; i++) {
        operations.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/health',
          })
        );
      }

      await Promise.all(operations);

      const finalMemory = process.memoryUsage();
      const memoryUsed = finalMemory.heapUsed - initialMemory.heapUsed;

      expect(memoryUsed).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });

    it('should use less than 200MB for 1000 user registrations', async () => {
      const initialMemory = process.memoryUsage();
      
      const operations = [];
      for (let i = 0; i < 1000; i++) {
        const userData = {
          firstName: `Test${i}`,
          lastName: 'User',
          email: `test${i}@example.com`,
          username: `testuser${i}`,
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        };

        operations.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      await Promise.all(operations);

      const finalMemory = process.memoryUsage();
      const memoryUsed = finalMemory.heapUsed - initialMemory.heapUsed;

      expect(memoryUsed).toBeLessThan(200 * 1024 * 1024); // Less than 200MB
    });
  });

  describe('Database Performance Benchmarks', () => {
    it('should handle 1000 concurrent database reads', async () => {
      const startTime = Date.now();
      
      const operations = [];
      for (let i = 0; i < 1000; i++) {
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

      expect(responses).toHaveLength(1000);
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
      
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle 500 concurrent database writes', async () => {
      const startTime = Date.now();
      
      const operations = [];
      for (let i = 0; i < 500; i++) {
        const userData = {
          firstName: `Test${i}`,
          lastName: 'User',
          email: `test${i}@example.com`,
          username: `testuser${i}`,
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        };

        operations.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      const responses = await Promise.all(operations);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(500);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
    });
  });

  describe('API Endpoint Benchmarks', () => {
    it('should benchmark all major endpoints', async () => {
      const endpoints = [
        { method: 'GET', url: '/api/v1/health', expectedStatus: 200 },
        { method: 'POST', url: '/api/v1/auth/register', payload: { firstName: 'Test', lastName: 'User', email: 'test@example.com', username: 'testuser', location: 'Test City', password: 'password123', confirmPassword: 'password123' }, expectedStatus: 201 },
        { method: 'POST', url: '/api/v1/auth/login', payload: { email: 'test@example.com', password: 'password123' }, expectedStatus: 200 },
      ];

      const results = [];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        
        const response = await app.inject({
          method: endpoint.method,
          url: endpoint.url,
          payload: endpoint.payload,
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        results.push({
          endpoint: endpoint.url,
          method: endpoint.method,
          statusCode: response.statusCode,
          duration: duration,
        });

        expect(response.statusCode).toBe(endpoint.expectedStatus);
        expect(duration).toBeLessThan(1000); // All endpoints should respond within 1 second
      }

      // Log results for analysis
      console.log('Benchmark Results:', results);
    });
  });
});


