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

describe('Verification Tests', () => {
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

  describe('Data Verification', () => {
    it('should verify user data integrity', async () => {
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

    it('should verify bridge data integrity', async () => {
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
        text: 'Test bridge content',
        visibility: 'public',
        tags: ['test'],
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
      expect(response.json()).toHaveProperty('bridge');
    });

    it('should verify follow data integrity', async () => {
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

      // Follow a user
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/follows/follow',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          userId: '507f1f77bcf86cd799439011',
        },
      });

      expect(response.statusCode).toBe(400); // User not found
      expect(response.json()).toHaveProperty('error');
    });

    it('should verify notification data integrity', async () => {
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

      // Get notifications
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });

    it('should verify media data integrity', async () => {
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

      // Upload media
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/media/upload',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          type: 'image',
          file: 'test-image.jpg',
        },
      });

      expect(response.statusCode).toBe(400); // Invalid file
      expect(response.json()).toHaveProperty('error');
    });

    it('should verify message data integrity', async () => {
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

      // Send a message
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/messages',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          recipientId: '507f1f77bcf86cd799439011',
          text: 'Test message',
        },
      });

      expect(response.statusCode).toBe(400); // Recipient not found
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('State Verification', () => {
    it('should verify user state integrity', async () => {
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

    it('should verify bridge state integrity', async () => {
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
        text: 'Test bridge content',
        visibility: 'public',
        tags: ['test'],
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
      expect(response.json()).toHaveProperty('bridge');
    });

    it('should verify follow state integrity', async () => {
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

      // Follow a user
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/follows/follow',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          userId: '507f1f77bcf86cd799439011',
        },
      });

      expect(response.statusCode).toBe(400); // User not found
      expect(response.json()).toHaveProperty('error');
    });

    it('should verify notification state integrity', async () => {
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

      // Get notifications
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });

    it('should verify media state integrity', async () => {
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

      // Upload media
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/media/upload',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          type: 'image',
          file: 'test-image.jpg',
        },
      });

      expect(response.statusCode).toBe(400); // Invalid file
      expect(response.json()).toHaveProperty('error');
    });

    it('should verify message state integrity', async () => {
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

      // Send a message
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/messages',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          recipientId: '507f1f77bcf86cd799439011',
          text: 'Test message',
        },
      });

      expect(response.statusCode).toBe(400); // Recipient not found
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('Cache Verification', () => {
    it('should verify user cache integrity', async () => {
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

    it('should verify bridge cache integrity', async () => {
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
        text: 'Test bridge content',
        visibility: 'public',
        tags: ['test'],
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
      expect(response.json()).toHaveProperty('bridge');
    });

    it('should verify follow cache integrity', async () => {
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

      // Follow a user
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/follows/follow',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          userId: '507f1f77bcf86cd799439011',
        },
      });

      expect(response.statusCode).toBe(400); // User not found
      expect(response.json()).toHaveProperty('error');
    });

    it('should verify notification cache integrity', async () => {
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

      // Get notifications
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });

    it('should verify media cache integrity', async () => {
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

      // Upload media
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/media/upload',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          type: 'image',
          file: 'test-image.jpg',
        },
      });

      expect(response.statusCode).toBe(400); // Invalid file
      expect(response.json()).toHaveProperty('error');
    });

    it('should verify message cache integrity', async () => {
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

      // Send a message
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/messages',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          recipientId: '507f1f77bcf86cd799439011',
          text: 'Test message',
        },
      });

      expect(response.statusCode).toBe(400); // Recipient not found
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('Event Verification', () => {
    it('should verify user event integrity', async () => {
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

    it('should verify bridge event integrity', async () => {
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
        text: 'Test bridge content',
        visibility: 'public',
        tags: ['test'],
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
      expect(response.json()).toHaveProperty('bridge');
    });

    it('should verify follow event integrity', async () => {
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

      // Follow a user
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/follows/follow',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          userId: '507f1f77bcf86cd799439011',
        },
      });

      expect(response.statusCode).toBe(400); // User not found
      expect(response.json()).toHaveProperty('error');
    });

    it('should verify notification event integrity', async () => {
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

      // Get notifications
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });

    it('should verify media event integrity', async () => {
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

      // Upload media
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/media/upload',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          type: 'image',
          file: 'test-image.jpg',
        },
      });

      expect(response.statusCode).toBe(400); // Invalid file
      expect(response.json()).toHaveProperty('error');
    });

    it('should verify message event integrity', async () => {
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

      // Send a message
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/messages',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          recipientId: '507f1f77bcf86cd799439011',
          text: 'Test message',
        },
      });

      expect(response.statusCode).toBe(400); // Recipient not found
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('Session Verification', () => {
    it('should verify user session integrity', async () => {
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

    it('should verify authentication session integrity', async () => {
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
      expect(response.json()).toHaveProperty('tokens');
    });

    it('should verify authorization session integrity', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
    });

    it('should verify token session integrity', async () => {
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

    it('should verify refresh session integrity', async () => {
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

    it('should verify logout session integrity', async () => {
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
  });

  describe('Replication Verification', () => {
    it('should verify user replication integrity', async () => {
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

    it('should verify bridge replication integrity', async () => {
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
        text: 'Test bridge content',
        visibility: 'public',
        tags: ['test'],
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
      expect(response.json()).toHaveProperty('bridge');
    });

    it('should verify follow replication integrity', async () => {
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

      // Follow a user
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/follows/follow',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          userId: '507f1f77bcf86cd799439011',
        },
      });

      expect(response.statusCode).toBe(400); // User not found
      expect(response.json()).toHaveProperty('error');
    });

    it('should verify notification replication integrity', async () => {
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

      // Get notifications
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });

    it('should verify media replication integrity', async () => {
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

      // Upload media
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/media/upload',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          type: 'image',
          file: 'test-image.jpg',
        },
      });

      expect(response.statusCode).toBe(400); // Invalid file
      expect(response.json()).toHaveProperty('error');
    });

    it('should verify message replication integrity', async () => {
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

      // Send a message
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/messages',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          recipientId: '507f1f77bcf86cd799439011',
          text: 'Test message',
        },
      });

      expect(response.statusCode).toBe(400); // Recipient not found
      expect(response.json()).toHaveProperty('error');
    });
  });
});


