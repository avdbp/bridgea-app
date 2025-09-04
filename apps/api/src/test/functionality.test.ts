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

describe('Functionality Tests', () => {
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

  describe('Health Check Functionality', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'ok');
    });

    it('should return version information', async () => {
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

  describe('User Registration Functionality', () => {
    it('should register a new user successfully', async () => {
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

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: 'Test',
          // Missing other required fields
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });

    it('should validate email format', async () => {
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
      expect(response.json()).toHaveProperty('error');
    });

    it('should validate password strength', async () => {
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
      expect(response.json()).toHaveProperty('error');
    });

    it('should validate password confirmation', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          username: 'testuser',
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'differentpassword',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });

    it('should prevent duplicate usernames', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      // Register first user
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      // Try to register second user with same username
      const duplicateUserData = {
        firstName: 'Test2',
        lastName: 'User2',
        email: 'test2@example.com',
        username: 'testuser', // Same username
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: duplicateUserData,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });

    it('should prevent duplicate emails', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      // Register first user
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      // Try to register second user with same email
      const duplicateUserData = {
        firstName: 'Test2',
        lastName: 'User2',
        email: 'test@example.com', // Same email
        username: 'testuser2',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: duplicateUserData,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('User Login Functionality', () => {
    beforeEach(async () => {
      // Register a user for testing
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
    });

    it('should login with email successfully', async () => {
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

    it('should login with username successfully', async () => {
      const loginData = {
        email: 'testuser', // Using username instead of email
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

    it('should reject invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: loginData,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
    });

    it('should reject invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: loginData,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@example.com',
          // Missing password
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('User Profile Functionality', () => {
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

      authToken = registerResponse.json().tokens.accessToken;
    });

    it('should get user profile', async () => {
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

    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
        location: 'Updated City',
      };

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/users/profile',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('user');
      expect(data.user.firstName).toBe('Updated');
      expect(data.user.lastName).toBe('User');
      expect(data.user.location).toBe('Updated City');
    });

    it('should require authentication for profile access', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
    });

    it('should require authentication for profile updates', async () => {
      const updateData = {
        firstName: 'Updated',
      };

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/users/profile',
        payload: updateData,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('Bridge Creation Functionality', () => {
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

      authToken = registerResponse.json().tokens.accessToken;
    });

    it('should create a new bridge', async () => {
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

    it('should create a private bridge', async () => {
      const bridgeData = {
        content: 'This is a private bridge',
        visibility: 'private',
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
      expect(data.bridge.visibility).toBe('private');
    });

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bridges',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          // Missing content
          visibility: 'public',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const bridgeData = {
        content: 'This is a test bridge',
        visibility: 'public',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bridges',
        payload: bridgeData,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('Bridge Feed Functionality', () => {
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

      authToken = registerResponse.json().tokens.accessToken;

      // Create some bridges for the feed
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
    });

    it('should get bridge feed', async () => {
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
    });

    it('should support pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bridges/feed?page=1&limit=3',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('bridges');
      expect(data.bridges.length).toBeLessThanOrEqual(3);
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bridges/feed',
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('User Search Functionality', () => {
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

      authToken = registerResponse.json().tokens.accessToken;

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
    });

    it('should search users by query', async () => {
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
    });

    it('should support pagination in search', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test&page=1&limit=5',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('users');
      expect(data.users.length).toBeLessThanOrEqual(5);
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test',
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
    });
  });
});


