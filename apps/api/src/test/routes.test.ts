import { describe, it, expect, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { build } from '../index';

describe('Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = build();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Auth Routes', () => {
    it('should register a new user', async () => {
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
      expect(data.message).toBe('User registered successfully');
      expect(data.user).toBeDefined();
      expect(data.tokens).toBeDefined();
    });

    it('should login with valid credentials', async () => {
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
        emailOrUsername: 'test@example.com',
        password: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: loginData,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.message).toBe('Login successful');
      expect(data.user).toBeDefined();
      expect(data.tokens).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        emailOrUsername: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: loginData,
      });

      expect(response.statusCode).toBe(401);
      const data = response.json();
      expect(data.error).toBe('Invalid credentials');
    });
  });

  describe('User Routes', () => {
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

    it('should get user by username', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/testuser',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.user).toBeDefined();
      expect(data.user.username).toBe('testuser');
    });

    it('should update user profile', async () => {
      const updateData = {
        bio: 'This is a test bio',
        location: 'Updated City',
      };

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/users/me',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.message).toBe('Profile updated successfully');
      expect(data.user.bio).toBe(updateData.bio);
      expect(data.user.location).toBe(updateData.location);
    });

    it('should search users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.users).toBeDefined();
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.pagination).toBeDefined();
    });
  });

  describe('Bridge Routes', () => {
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
      expect(data.message).toBe('Bridge created successfully');
      expect(data.bridge).toBeDefined();
      expect(data.bridge.content).toBe(bridgeData.content);
    });

    it('should get feed', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bridges/feed',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.bridges).toBeDefined();
      expect(Array.isArray(data.bridges)).toBe(true);
      expect(data.pagination).toBeDefined();
    });

    it('should get user bridges', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bridges/user/testuser',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.bridges).toBeDefined();
      expect(Array.isArray(data.bridges)).toBe(true);
      expect(data.pagination).toBeDefined();
    });
  });

  describe('Follow Routes', () => {
    let user1Token: string;
    let user2Token: string;

    beforeEach(async () => {
      // Register two users
      const user1Data = {
        firstName: 'User',
        lastName: 'One',
        email: 'user1@example.com',
        username: 'user1',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const user2Data = {
        firstName: 'User',
        lastName: 'Two',
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

      const user1Data = user1Response.json();
      const user2Data = user2Response.json();
      user1Token = user1Data.tokens.accessToken;
      user2Token = user2Data.tokens.accessToken;
    });

    it('should follow a user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/follows/user2',
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data.message).toBe('Successfully followed user');
      expect(data.status).toBe('approved');
    });

    it('should get follow status', async () => {
      // First follow the user
      await app.inject({
        method: 'POST',
        url: '/api/v1/follows/user2',
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      // Then check status
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/follows/user2/status',
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.isFollowing).toBe(true);
      expect(data.status).toBe('approved');
    });

    it('should unfollow a user', async () => {
      // First follow the user
      await app.inject({
        method: 'POST',
        url: '/api/v1/follows/user2',
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      // Then unfollow
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/follows/user2',
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.message).toBe('Successfully unfollowed user');
    });
  });

  describe('Notification Routes', () => {
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

    it('should get notifications', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.notifications).toBeDefined();
      expect(data.unreadCount).toBeDefined();
      expect(Array.isArray(data.notifications)).toBe(true);
      expect(typeof data.unreadCount).toBe('number');
    });

    it('should get unread notifications count', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications/unread-count',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.unreadCount).toBeDefined();
      expect(typeof data.unreadCount).toBe('number');
    });

    it('should mark all notifications as read', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/notifications/read-all',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.message).toBe('All notifications marked as read');
    });
  });

  describe('Media Routes', () => {
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

    it('should get upload signature for image', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/media/signature',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          type: 'image',
          folder: 'test/',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.signature).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(data.folder).toBe('test/');
      expect(data.resource_type).toBe('image');
      expect(data.upload_preset).toBeDefined();
      expect(data.cloud_name).toBeDefined();
    });

    it('should get upload signature for video', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/media/signature',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          type: 'video',
          folder: 'test/',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.signature).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(data.folder).toBe('test/');
      expect(data.resource_type).toBe('video');
      expect(data.upload_preset).toBeDefined();
      expect(data.cloud_name).toBeDefined();
    });
  });
});


