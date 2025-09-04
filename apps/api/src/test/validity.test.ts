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

describe('Validity Tests', () => {
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

  describe('Data Validity', () => {
    it('should validate user data', async () => {
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

    it('should validate bridge data', async () => {
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

    it('should validate follow data', async () => {
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

    it('should validate notification data', async () => {
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

    it('should validate media data', async () => {
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

    it('should validate message data', async () => {
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

  describe('Input Validity', () => {
    it('should validate user input', async () => {
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

    it('should validate bridge input', async () => {
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

      // Create a bridge with invalid data
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bridges',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          text: '',
          visibility: 'invalid',
          tags: 'not-an-array',
        },
      });

      expect(response.statusCode).toBe(400);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('details');
      expect(Array.isArray(errorData.details)).toBe(true);
    });

    it('should validate follow input', async () => {
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

      // Follow a user with invalid data
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/follows/follow',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          userId: 'invalid-id',
        },
      });

      expect(response.statusCode).toBe(400);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('details');
      expect(Array.isArray(errorData.details)).toBe(true);
    });

    it('should validate notification input', async () => {
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

      // Get notifications with invalid parameters
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications?limit=invalid&offset=invalid',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(400);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('details');
      expect(Array.isArray(errorData.details)).toBe(true);
    });

    it('should validate media input', async () => {
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

      // Upload media with invalid data
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/media/upload',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          type: 'invalid-type',
          file: '',
        },
      });

      expect(response.statusCode).toBe(400);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('details');
      expect(Array.isArray(errorData.details)).toBe(true);
    });

    it('should validate message input', async () => {
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

      // Send a message with invalid data
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/messages',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          recipientId: 'invalid-id',
          text: '',
        },
      });

      expect(response.statusCode).toBe(400);
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('details');
      expect(Array.isArray(errorData.details)).toBe(true);
    });
  });

  describe('Output Validity', () => {
    it('should validate user output', async () => {
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
      const user = response.json().user;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('location');
      expect(user).not.toHaveProperty('password');
    });

    it('should validate bridge output', async () => {
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
      const bridge = response.json().bridge;
      expect(bridge).toHaveProperty('id');
      expect(bridge).toHaveProperty('text');
      expect(bridge).toHaveProperty('visibility');
      expect(bridge).toHaveProperty('tags');
      expect(bridge).toHaveProperty('author');
      expect(bridge).toHaveProperty('createdAt');
      expect(bridge).toHaveProperty('updatedAt');
    });

    it('should validate follow output', async () => {
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
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('statusCode');
      expect(errorData).toHaveProperty('timestamp');
    });

    it('should validate notification output', async () => {
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
      const notifications = response.json();
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should validate media output', async () => {
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
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('statusCode');
      expect(errorData).toHaveProperty('timestamp');
    });

    it('should validate message output', async () => {
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
      const errorData = response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('statusCode');
      expect(errorData).toHaveProperty('timestamp');
    });
  });

  describe('Format Validity', () => {
    it('should validate user format', async () => {
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
      const user = response.json().user;
      expect(typeof user.id).toBe('string');
      expect(typeof user.firstName).toBe('string');
      expect(typeof user.lastName).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.username).toBe('string');
      expect(typeof user.location).toBe('string');
    });

    it('should validate bridge format', async () => {
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
      const bridge = response.json().bridge;
      expect(typeof bridge.id).toBe('string');
      expect(typeof bridge.text).toBe('string');
      expect(typeof bridge.visibility).toBe('string');
      expect(Array.isArray(bridge.tags)).toBe(true);
      expect(typeof bridge.author).toBe('object');
      expect(typeof bridge.createdAt).toBe('string');
      expect(typeof bridge.updatedAt).toBe('string');
    });

    it('should validate follow format', async () => {
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
      const errorData = response.json();
      expect(typeof errorData.error).toBe('string');
      expect(typeof errorData.statusCode).toBe('number');
      expect(typeof errorData.timestamp).toBe('string');
    });

    it('should validate notification format', async () => {
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
      const notifications = response.json();
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should validate media format', async () => {
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
      const errorData = response.json();
      expect(typeof errorData.error).toBe('string');
      expect(typeof errorData.statusCode).toBe('number');
      expect(typeof errorData.timestamp).toBe('string');
    });

    it('should validate message format', async () => {
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
      const errorData = response.json();
      expect(typeof errorData.error).toBe('string');
      expect(typeof errorData.statusCode).toBe('number');
      expect(typeof errorData.timestamp).toBe('string');
    });
  });

  describe('Type Validity', () => {
    it('should validate user types', async () => {
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
      const user = response.json().user;
      expect(typeof user.id).toBe('string');
      expect(typeof user.firstName).toBe('string');
      expect(typeof user.lastName).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.username).toBe('string');
      expect(typeof user.location).toBe('string');
    });

    it('should validate bridge types', async () => {
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
      const bridge = response.json().bridge;
      expect(typeof bridge.id).toBe('string');
      expect(typeof bridge.text).toBe('string');
      expect(typeof bridge.visibility).toBe('string');
      expect(Array.isArray(bridge.tags)).toBe(true);
      expect(typeof bridge.author).toBe('object');
      expect(typeof bridge.createdAt).toBe('string');
      expect(typeof bridge.updatedAt).toBe('string');
    });

    it('should validate follow types', async () => {
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
      const errorData = response.json();
      expect(typeof errorData.error).toBe('string');
      expect(typeof errorData.statusCode).toBe('number');
      expect(typeof errorData.timestamp).toBe('string');
    });

    it('should validate notification types', async () => {
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
      const notifications = response.json();
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should validate media types', async () => {
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
      const errorData = response.json();
      expect(typeof errorData.error).toBe('string');
      expect(typeof errorData.statusCode).toBe('number');
      expect(typeof errorData.timestamp).toBe('string');
    });

    it('should validate message types', async () => {
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
      const errorData = response.json();
      expect(typeof errorData.error).toBe('string');
      expect(typeof errorData.statusCode).toBe('number');
      expect(typeof errorData.timestamp).toBe('string');
    });
  });
});


