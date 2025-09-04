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

describe('Load Tests', () => {
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

  describe('High Volume User Registration', () => {
    it('should handle 100 concurrent user registrations', async () => {
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

      const startTime = Date.now();
      const responses = await Promise.all(userPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(100);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle 500 concurrent user registrations', async () => {
      const userPromises = [];
      
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

      expect(responses).toHaveLength(500);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });
  });

  describe('High Volume Bridge Creation', () => {
    let authTokens: string[] = [];

    beforeEach(async () => {
      // Create 50 users for testing
      const userPromises = [];
      
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

        userPromises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      const responses = await Promise.all(userPromises);
      authTokens = responses.map(response => response.json().tokens.accessToken);
    });

    it('should handle 1000 concurrent bridge creations', async () => {
      const bridgePromises = [];
      
      for (let i = 0; i < 1000; i++) {
        const bridgeData = {
          content: `This is test bridge ${i}`,
          visibility: 'public',
        };

        const tokenIndex = i % authTokens.length;
        bridgePromises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/bridges',
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
            payload: bridgeData,
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(bridgePromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(1000);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle 5000 concurrent bridge creations', async () => {
      const bridgePromises = [];
      
      for (let i = 0; i < 5000; i++) {
        const bridgeData = {
          content: `This is test bridge ${i}`,
          visibility: 'public',
        };

        const tokenIndex = i % authTokens.length;
        bridgePromises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/bridges',
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
            payload: bridgeData,
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(bridgePromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(5000);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
    });
  });

  describe('High Volume Feed Requests', () => {
    let authTokens: string[] = [];

    beforeEach(async () => {
      // Create 100 users and 1000 bridges for testing
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

      const userResponses = await Promise.all(userPromises);
      authTokens = userResponses.map(response => response.json().tokens.accessToken);

      // Create 1000 bridges
      const bridgePromises = [];
      
      for (let i = 0; i < 1000; i++) {
        const bridgeData = {
          content: `This is test bridge ${i}`,
          visibility: 'public',
        };

        const tokenIndex = i % authTokens.length;
        bridgePromises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/bridges',
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
            payload: bridgeData,
          })
        );
      }

      await Promise.all(bridgePromises);
    });

    it('should handle 500 concurrent feed requests', async () => {
      const feedPromises = [];
      
      for (let i = 0; i < 500; i++) {
        const tokenIndex = i % authTokens.length;
        feedPromises.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/bridges/feed',
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(feedPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(500);
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle 1000 concurrent feed requests', async () => {
      const feedPromises = [];
      
      for (let i = 0; i < 1000; i++) {
        const tokenIndex = i % authTokens.length;
        feedPromises.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/bridges/feed',
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(feedPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(1000);
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
      expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
    });
  });

  describe('High Volume Search Requests', () => {
    let authTokens: string[] = [];

    beforeEach(async () => {
      // Create 1000 users for testing
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

      const userResponses = await Promise.all(userPromises);
      authTokens = userResponses.map(response => response.json().tokens.accessToken);
    });

    it('should handle 500 concurrent search requests', async () => {
      const searchPromises = [];
      
      for (let i = 0; i < 500; i++) {
        const tokenIndex = i % authTokens.length;
        searchPromises.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/users/search?q=test',
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(searchPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(500);
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle 1000 concurrent search requests', async () => {
      const searchPromises = [];
      
      for (let i = 0; i < 1000; i++) {
        const tokenIndex = i % authTokens.length;
        searchPromises.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/users/search?q=test',
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(searchPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(1000);
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
      expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
    });
  });

  describe('High Volume Like Operations', () => {
    let authTokens: string[] = [];
    let bridgeIds: string[] = [];

    beforeEach(async () => {
      // Create 100 users and 100 bridges for testing
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

      const userResponses = await Promise.all(userPromises);
      authTokens = userResponses.map(response => response.json().tokens.accessToken);

      // Create 100 bridges
      const bridgePromises = [];
      
      for (let i = 0; i < 100; i++) {
        const bridgeData = {
          content: `This is test bridge ${i}`,
          visibility: 'public',
        };

        const tokenIndex = i % authTokens.length;
        bridgePromises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/bridges',
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
            payload: bridgeData,
          })
        );
      }

      const bridgeResponses = await Promise.all(bridgePromises);
      bridgeIds = bridgeResponses.map(response => response.json().bridge.id);
    });

    it('should handle 1000 concurrent like operations', async () => {
      const likePromises = [];
      
      for (let i = 0; i < 1000; i++) {
        const tokenIndex = i % authTokens.length;
        const bridgeIndex = i % bridgeIds.length;
        
        likePromises.push(
          app.inject({
            method: 'POST',
            url: `/api/v1/bridges/${bridgeIds[bridgeIndex]}/like`,
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(likePromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(1000);
      responses.forEach(response => {
        expect([200, 201]).toContain(response.statusCode);
      });
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle 5000 concurrent like operations', async () => {
      const likePromises = [];
      
      for (let i = 0; i < 5000; i++) {
        const tokenIndex = i % authTokens.length;
        const bridgeIndex = i % bridgeIds.length;
        
        likePromises.push(
          app.inject({
            method: 'POST',
            url: `/api/v1/bridges/${bridgeIds[bridgeIndex]}/like`,
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(likePromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(5000);
      responses.forEach(response => {
        expect([200, 201]).toContain(response.statusCode);
      });
      expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
    });
  });

  describe('High Volume Comment Operations', () => {
    let authTokens: string[] = [];
    let bridgeIds: string[] = [];

    beforeEach(async () => {
      // Create 100 users and 100 bridges for testing
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

      const userResponses = await Promise.all(userPromises);
      authTokens = userResponses.map(response => response.json().tokens.accessToken);

      // Create 100 bridges
      const bridgePromises = [];
      
      for (let i = 0; i < 100; i++) {
        const bridgeData = {
          content: `This is test bridge ${i}`,
          visibility: 'public',
        };

        const tokenIndex = i % authTokens.length;
        bridgePromises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/bridges',
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
            payload: bridgeData,
          })
        );
      }

      const bridgeResponses = await Promise.all(bridgePromises);
      bridgeIds = bridgeResponses.map(response => response.json().bridge.id);
    });

    it('should handle 1000 concurrent comment operations', async () => {
      const commentPromises = [];
      
      for (let i = 0; i < 1000; i++) {
        const tokenIndex = i % authTokens.length;
        const bridgeIndex = i % bridgeIds.length;
        
        commentPromises.push(
          app.inject({
            method: 'POST',
            url: `/api/v1/bridges/${bridgeIds[bridgeIndex]}/comments`,
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
            payload: {
              content: `This is comment ${i}`,
            },
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(commentPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(1000);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle 5000 concurrent comment operations', async () => {
      const commentPromises = [];
      
      for (let i = 0; i < 5000; i++) {
        const tokenIndex = i % authTokens.length;
        const bridgeIndex = i % bridgeIds.length;
        
        commentPromises.push(
          app.inject({
            method: 'POST',
            url: `/api/v1/bridges/${bridgeIds[bridgeIndex]}/comments`,
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
            payload: {
              content: `This is comment ${i}`,
            },
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(commentPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(5000);
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });
      expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
    });
  });
});


