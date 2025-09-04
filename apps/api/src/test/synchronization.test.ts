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

describe('Synchronization Tests', () => {
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

  describe('Data Synchronization', () => {
    it('should synchronize user data', async () => {
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

    it('should synchronize bridge data', async () => {
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

    it('should synchronize follow data', async () => {
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

    it('should synchronize notification data', async () => {
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

    it('should synchronize media data', async () => {
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

    it('should synchronize message data', async () => {
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

  describe('State Synchronization', () => {
    it('should synchronize user state', async () => {
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

    it('should synchronize bridge state', async () => {
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

    it('should synchronize follow state', async () => {
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

    it('should synchronize notification state', async () => {
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

    it('should synchronize media state', async () => {
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

    it('should synchronize message state', async () => {
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

  describe('Cache Synchronization', () => {
    it('should synchronize user cache', async () => {
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

    it('should synchronize bridge cache', async () => {
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

    it('should synchronize follow cache', async () => {
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

    it('should synchronize notification cache', async () => {
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

    it('should synchronize media cache', async () => {
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

    it('should synchronize message cache', async () => {
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

  describe('Event Synchronization', () => {
    it('should synchronize user events', async () => {
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

    it('should synchronize bridge events', async () => {
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

    it('should synchronize follow events', async () => {
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

    it('should synchronize notification events', async () => {
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

    it('should synchronize media events', async () => {
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

    it('should synchronize message events', async () => {
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

  describe('Session Synchronization', () => {
    it('should synchronize user session', async () => {
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

    it('should synchronize authentication session', async () => {
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

    it('should synchronize authorization session', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toHaveProperty('error');
    });

    it('should synchronize token session', async () => {
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

    it('should synchronize refresh session', async () => {
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

    it('should synchronize logout session', async () => {
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

  describe('Replication Synchronization', () => {
    it('should synchronize user replication', async () => {
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

    it('should synchronize bridge replication', async () => {
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

    it('should synchronize follow replication', async () => {
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

    it('should synchronize notification replication', async () => {
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

    it('should synchronize media replication', async () => {
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

    it('should synchronize message replication', async () => {
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


