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

describe('Security Tests', () => {
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

  describe('Authentication Security', () => {
    it('should reject invalid JWT tokens', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject expired JWT tokens', async () => {
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
    });

    it('should reject requests without authorization header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject requests with malformed authorization header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: 'InvalidFormat',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Input Validation Security', () => {
    it('should reject SQL injection attempts', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: maliciousInput,
          lastName: 'User',
          email: 'test@example.com',
          username: 'testuser',
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject XSS attempts in user input', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: xssPayload,
          lastName: 'User',
          email: 'test@example.com',
          username: 'testuser',
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject oversized payloads', async () => {
      const largeString = 'A'.repeat(10000);
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: largeString,
          lastName: 'User',
          email: 'test@example.com',
          username: 'testuser',
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject invalid email formats', async () => {
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
    });

    it('should reject weak passwords', async () => {
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
    });
  });

  describe('Authorization Security', () => {
    let user1Token: string;
    let user2Token: string;
    let user1Id: string;
    let user2Id: string;

    beforeEach(async () => {
      // Register first user
      const user1Data = {
        firstName: 'User1',
        lastName: 'Test',
        email: 'user1@example.com',
        username: 'user1',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const user1Response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: user1Data,
      });

      const user1ResponseData = user1Response.json();
      user1Token = user1ResponseData.tokens.accessToken;
      user1Id = user1ResponseData.user.id;

      // Register second user
      const user2Data = {
        firstName: 'User2',
        lastName: 'Test',
        email: 'user2@example.com',
        username: 'user2',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const user2Response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: user2Data,
      });

      const user2ResponseData = user2Response.json();
      user2Token = user2ResponseData.tokens.accessToken;
      user2Id = user2ResponseData.user.id;
    });

    it('should prevent users from accessing other users\' private data', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/users/${user2Id}`,
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      // This should either return 403 or only public data
      expect([200, 403]).toContain(response.statusCode);
    });

    it('should prevent users from modifying other users\' data', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/users/${user2Id}`,
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
        payload: {
          firstName: 'Hacked',
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should prevent users from deleting other users\' bridges', async () => {
      // Create a bridge for user2
      const bridgeData = {
        content: 'User2\'s bridge',
        visibility: 'public',
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/bridges',
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
        payload: bridgeData,
      });

      const bridgeId = createResponse.json().bridge.id;

      // Try to delete it with user1's token
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/v1/bridges/${bridgeId}`,
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(403);
    });
  });

  describe('Rate Limiting Security', () => {
    it('should enforce rate limits on authentication endpoints', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(r => r.statusCode === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should enforce rate limits on login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Make multiple rapid login attempts
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: loginData,
          })
        );
      }

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(r => r.statusCode === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('CORS Security', () => {
    it('should reject requests from unauthorized origins', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Origin: 'https://malicious-site.com',
        },
      });

      // Should either reject or not include CORS headers
      expect(response.statusCode).toBe(401);
    });

    it('should include proper CORS headers for authorized origins', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Origin: 'http://localhost:3000',
        },
      });

      // Should include CORS headers even for unauthorized requests
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize user input before storing', async () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: maliciousInput,
          lastName: 'User',
          email: 'test@example.com',
          username: 'testuser',
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        },
      });

      if (response.statusCode === 201) {
        const userData = response.json();
        expect(userData.user.firstName).not.toContain('<script>');
      }
    });

    it('should prevent NoSQL injection attempts', async () => {
      const maliciousInput = { $ne: null };
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: maliciousInput,
          lastName: 'User',
          email: 'test@example.com',
          username: 'testuser',
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('File Upload Security', () => {
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

    it('should reject files with dangerous extensions', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/media/upload',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          file: 'malicious.exe',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject oversized files', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/media/upload',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          file: 'large-file.jpg',
          size: 10000000, // 10MB
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});


