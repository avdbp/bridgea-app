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

describe('Performance Tests', () => {
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

  describe('User Registration Performance', () => {
    it('should register user within acceptable time', async () => {
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
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple concurrent registrations', async () => {
      const userPromises = [];
      
      for (let i = 0; i < 10; i++) {
        const userData = {
          firstName: `Test${i}`,
          lastName: 'User',
          email: `test${i}@example.com`,
          username: `testuser${i}`,
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        };

        userPromises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(userPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(10);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Bridge Creation Performance', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login a user
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

      const registerData = registerResponse.json();
      authToken = registerData.tokens.accessToken;
    });

    it('should create bridge within acceptable time', async () => {
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
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple concurrent bridge creations', async () => {
      const bridgePromises = [];
      
      for (let i = 0; i < 20; i++) {
        const bridgeData = {
          content: `This is test bridge ${i}`,
          visibility: 'public',
        };

        bridgePromises.push(
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

      const startTime = Date.now();
      const responses = await Promise.all(bridgePromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(20);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Feed Performance', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login a user
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

      const registerData = registerResponse.json();
      authToken = registerData.tokens.accessToken;

      // Create multiple bridges for testing
      for (let i = 0; i < 50; i++) {
        const bridgeData = {
          content: `This is test bridge ${i}`,
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
    });

    it('should load feed within acceptable time', async () => {
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
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle pagination efficiently', async () => {
      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bridges/feed?page=1&limit=20',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      
      const data = response.json();
      expect(data.bridges).toHaveLength(20);
    });
  });

  describe('Search Performance', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login a user
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

      const registerData = registerResponse.json();
      authToken = registerData.tokens.accessToken;

      // Create multiple users for testing
      for (let i = 0; i < 100; i++) {
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
    });

    it('should search users within acceptable time', async () => {
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
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle paginated search efficiently', async () => {
      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test&page=1&limit=20',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      
      const data = response.json();
      expect(data.users).toHaveLength(20);
    });
  });

  describe('Database Performance', () => {
    it('should handle large dataset efficiently', async () => {
      // Create a large number of users
      const userPromises = [];
      
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

        userPromises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(userPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(1000);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle complex queries efficiently', async () => {
      // Create users and bridges
      const userPromises = [];
      
      for (let i = 0; i < 100; i++) {
        const userData = {
          firstName: `Test${i}`,
          lastName: 'User',
          email: `test${i}@example.com`,
          username: `testuser${i}`,
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        };

        userPromises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      await Promise.all(userPromises);

      // Create bridges for each user
      const bridgePromises = [];
      
      for (let i = 0; i < 100; i++) {
        const bridgeData = {
          content: `This is test bridge ${i}`,
          visibility: 'public',
        };

        bridgePromises.push(
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

      await Promise.all(bridgePromises);

      // Test complex query performance
      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bridges/feed?page=1&limit=50',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});


