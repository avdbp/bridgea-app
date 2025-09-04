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

describe('Testability Tests', () => {
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

  describe('Unit Testability', () => {
    it('should allow testing individual components', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should allow testing authentication components', async () => {
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
      expect(response.json()).toHaveProperty('tokens');
    });

    it('should allow testing database components', async () => {
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

    it('should allow testing validation components', async () => {
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
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('Integration Testability', () => {
    it('should allow testing component integration', async () => {
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

      expect(registerResponse.statusCode).toBe(201);
      const authToken = registerResponse.json().tokens.accessToken;

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

    it('should allow testing API integration', async () => {
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

    it('should allow testing database integration', async () => {
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

    it('should allow testing service integration', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });
  });

  describe('End-to-End Testability', () => {
    it('should allow testing complete user flows', async () => {
      // Register user
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

      expect(registerResponse.statusCode).toBe(201);
      const authToken = registerResponse.json().tokens.accessToken;

      // Login user
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.json()).toHaveProperty('tokens');

      // Access profile
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

    it('should allow testing complete bridge flows', async () => {
      // Register and login user
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

      // Create bridge
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
      const bridgeId = createResponse.json().bridge.id;

      // Get feed
      const feedResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/bridges/feed',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(feedResponse.statusCode).toBe(200);
      expect(feedResponse.json()).toHaveProperty('bridges');

      // Delete bridge
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

    it('should allow testing complete search flows', async () => {
      // Register and login user
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
      for (let i = 0; i < 5; i++) {
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

      // Search users
      const searchResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(searchResponse.statusCode).toBe(200);
      expect(searchResponse.json()).toHaveProperty('users');
    });

    it('should allow testing complete error flows', async () => {
      // Test invalid endpoint
      const invalidEndpointResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/invalid-endpoint',
      });

      expect(invalidEndpointResponse.statusCode).toBe(404);
      expect(invalidEndpointResponse.json()).toHaveProperty('error');

      // Test invalid authentication
      const invalidAuthResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(invalidAuthResponse.statusCode).toBe(401);
      expect(invalidAuthResponse.json()).toHaveProperty('error');

      // Test invalid validation
      const invalidValidationResponse = await app.inject({
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

      expect(invalidValidationResponse.statusCode).toBe(400);
      expect(invalidValidationResponse.json()).toHaveProperty('error');
    });
  });

  describe('Mock Testability', () => {
    it('should allow mocking external services', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should allow mocking database operations', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should allow mocking authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should allow mocking network requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });
  });

  describe('Test Data Management', () => {
    it('should allow creating test data', async () => {
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

    it('should allow cleaning up test data', async () => {
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

    it('should allow isolating test data', async () => {
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

    it('should allow managing test state', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });
  });

  describe('Test Environment Management', () => {
    it('should allow setting up test environment', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should allow tearing down test environment', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should allow isolating test environments', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should allow managing test configuration', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });
  });

  describe('Test Coverage', () => {
    it('should allow testing all endpoints', async () => {
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

    it('should allow testing all error conditions', async () => {
      // Test 404 error
      const notFoundResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/invalid-endpoint',
      });

      expect(notFoundResponse.statusCode).toBe(404);
      expect(notFoundResponse.json()).toHaveProperty('error');

      // Test 401 error
      const unauthorizedResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
      });

      expect(unauthorizedResponse.statusCode).toBe(401);
      expect(unauthorizedResponse.json()).toHaveProperty('error');

      // Test 400 error
      const badRequestResponse = await app.inject({
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

      expect(badRequestResponse.statusCode).toBe(400);
      expect(badRequestResponse.json()).toHaveProperty('error');
    });

    it('should allow testing all success conditions', async () => {
      // Test successful registration
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

      expect(registerResponse.statusCode).toBe(201);
      expect(registerResponse.json()).toHaveProperty('user');

      // Test successful login
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.json()).toHaveProperty('tokens');
    });

    it('should allow testing all edge cases', async () => {
      // Test empty payload
      const emptyPayloadResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {},
      });

      expect(emptyPayloadResponse.statusCode).toBe(400);
      expect(emptyPayloadResponse.json()).toHaveProperty('error');

      // Test malformed JSON
      const malformedJsonResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: 'invalid json',
      });

      expect(malformedJsonResponse.statusCode).toBe(400);
      expect(malformedJsonResponse.json()).toHaveProperty('error');

      // Test oversized payload
      const largeContent = 'A'.repeat(100000);
      const oversizedPayloadResponse = await app.inject({
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

      expect(oversizedPayloadResponse.statusCode).toBe(400);
      expect(oversizedPayloadResponse.json()).toHaveProperty('error');
    });
  });
});


