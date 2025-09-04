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

describe('Usability Tests', () => {
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

  describe('API Usability', () => {
    it('should provide intuitive endpoint structure', async () => {
      // Test that endpoints follow RESTful conventions
      const endpoints = [
        { method: 'GET', url: '/api/v1/health', expectedStatus: 200 },
        { method: 'POST', url: '/api/v1/auth/register', expectedStatus: 201 },
        { method: 'POST', url: '/api/v1/auth/login', expectedStatus: 200 },
        { method: 'GET', url: '/api/v1/users/profile', expectedStatus: 401 }, // Requires auth
        { method: 'GET', url: '/api/v1/bridges/feed', expectedStatus: 401 }, // Requires auth
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

        expect(response.statusCode).toBe(endpoint.expectedStatus);
      }
    });

    it('should provide consistent response formats', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      // Response should have consistent structure
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('version');
    });

    it('should provide helpful error messages', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/invalid-endpoint',
      });

      expect(response.statusCode).toBe(404);
      const errorData = response.json();
      
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('statusCode');
      expect(errorData).toHaveProperty('timestamp');
      expect(errorData.error).toContain('Not Found');
    });

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
  });

  describe('Authentication Usability', () => {
    it('should provide clear registration process', async () => {
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

    it('should provide clear login process', async () => {
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
      expect(data.tokens).toHaveProperty('accessToken');
      expect(data.tokens).toHaveProperty('refreshToken');
    });

    it('should provide clear error messages for invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: loginData,
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

  describe('Data Usability', () => {
    it('should provide clear user profile data', async () => {
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

      // Get user profile
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('firstName');
      expect(data.user).toHaveProperty('lastName');
      expect(data.user).toHaveProperty('email');
      expect(data.user).toHaveProperty('username');
      expect(data.user).toHaveProperty('location');
    });

    it('should provide clear bridge data', async () => {
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
      const data = createResponse.json();
      
      expect(data).toHaveProperty('bridge');
      expect(data.bridge).toHaveProperty('id');
      expect(data.bridge).toHaveProperty('content');
      expect(data.bridge).toHaveProperty('visibility');
      expect(data.bridge).toHaveProperty('author');
      expect(data.bridge).toHaveProperty('createdAt');
    });

    it('should provide clear feed data', async () => {
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

      // Create some bridges
      for (let i = 0; i < 5; i++) {
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

      // Get feed
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bridges/feed',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data).toHaveProperty('bridges');
      expect(Array.isArray(data.bridges)).toBe(true);
      expect(data.bridges.length).toBeGreaterThan(0);
      
      // Each bridge should have clear structure
      data.bridges.forEach(bridge => {
        expect(bridge).toHaveProperty('id');
        expect(bridge).toHaveProperty('content');
        expect(bridge).toHaveProperty('visibility');
        expect(bridge).toHaveProperty('author');
        expect(bridge).toHaveProperty('createdAt');
      });
    });

    it('should provide clear search results', async () => {
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

        await app.inject({
          method: 'POST',
          url: '/api/v1/auth/register',
          payload: userData,
        });
      }

      // Search users
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data).toHaveProperty('users');
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.users.length).toBeGreaterThan(0);
      
      // Each user should have clear structure
      data.users.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('firstName');
        expect(user).toHaveProperty('lastName');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('location');
      });
    });
  });

  describe('Error Handling Usability', () => {
    it('should provide clear error messages for validation errors', async () => {
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
      
      // Details should be helpful
      errorData.details.forEach(detail => {
        expect(detail).toHaveProperty('field');
        expect(detail).toHaveProperty('message');
      });
    });

    it('should provide clear error messages for authentication errors', async () => {
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

    it('should provide clear error messages for authorization errors', async () => {
      // First register two users
      const user1Data = {
        firstName: 'User1',
        lastName: 'Test',
        email: 'user1@example.com',
        username: 'user1',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const user2Data = {
        firstName: 'User2',
        lastName: 'Test',
        email: 'user2@example.com',
        username: 'user2',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const user1Response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: user1Data,
      });

      const user2Response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: user2Data,
      });

      const user1Token = user1Response.json().tokens.accessToken;
      const user2Id = user2Response.json().user.id;

      // Try to access user2's profile with user1's token
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/users/${user2Id}`,
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      expect(response.statusCode).toBe(403);
      const errorData = response.json();
      
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Forbidden');
    });

    it('should provide clear error messages for not found errors', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/nonexistent-id',
      });

      expect(response.statusCode).toBe(404);
      const errorData = response.json();
      
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Not Found');
    });
  });

  describe('Performance Usability', () => {
    it('should respond quickly to simple requests', async () => {
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

    it('should respond quickly to authentication requests', async () => {
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
      expect(duration).toBeLessThan(500); // Should respond within 500ms
    });

    it('should respond quickly to data requests', async () => {
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
      expect(duration).toBeLessThan(300); // Should respond within 300ms
    });
  });
});


