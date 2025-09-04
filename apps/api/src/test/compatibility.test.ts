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

describe('Compatibility Tests', () => {
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

  describe('HTTP Method Compatibility', () => {
    it('should handle GET requests correctly', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should handle POST requests correctly', async () => {
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

    it('should handle PUT requests correctly', async () => {
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

    it('should handle DELETE requests correctly', async () => {
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
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/bridges/${bridgeId}`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('message');
    });

    it('should handle PATCH requests correctly', async () => {
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

      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      const authToken = registerResponse.json().tokens.accessToken;

      // Update user profile with PATCH
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          firstName: 'Patched',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('user');
    });

    it('should handle OPTIONS requests correctly', async () => {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });
  });

  describe('Content Type Compatibility', () => {
    it('should handle application/json content type', async () => {
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
        headers: {
          'Content-Type': 'application/json',
        },
        payload: userData,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toHaveProperty('user');
    });

    it('should handle application/x-www-form-urlencoded content type', async () => {
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
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        payload: userData,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toHaveProperty('user');
    });

    it('should handle multipart/form-data content type', async () => {
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        payload: userData,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toHaveProperty('user');
    });

    it('should handle text/plain content type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'Content-Type': 'text/plain',
        },
        payload: 'invalid data',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('Header Compatibility', () => {
    it('should handle standard HTTP headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
        headers: {
          'User-Agent': 'Test Client/1.0',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should handle custom headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
        headers: {
          'X-Custom-Header': 'custom-value',
          'X-Request-ID': 'test-request-123',
          'X-Client-Version': '1.0.0',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should handle authorization headers correctly', async () => {
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

      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      const authToken = registerResponse.json().tokens.accessToken;

      // Test with Bearer token
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('user');
    });
  });

  describe('Query Parameter Compatibility', () => {
    it('should handle query parameters correctly', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('users');
    });

    it('should handle special characters in query parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test%20user&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('users');
    });

    it('should handle empty query parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('users');
    });

    it('should handle missing query parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('users');
    });
  });

  describe('URL Path Compatibility', () => {
    it('should handle standard URL paths', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should handle URL paths with parameters', async () => {
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

      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      const userId = registerResponse.json().user.id;

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/users/${userId}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('user');
    });

    it('should handle URL paths with special characters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test%20user',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('users');
    });

    it('should handle URL paths with trailing slashes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health/',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });
  });

  describe('Response Format Compatibility', () => {
    it('should return JSON responses by default', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should return JSON responses for errors', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/invalid-endpoint',
      });

      expect(response.statusCode).toBe(404);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.json()).toHaveProperty('error');
    });

    it('should return consistent response structure', async () => {
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

  describe('Client Compatibility', () => {
    it('should work with curl-like requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
        headers: {
          'User-Agent': 'curl/7.68.0',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should work with Postman-like requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.8',
          'Accept': '*/*',
          'Postman-Token': 'test-token',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should work with browser-like requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });
  });
});


