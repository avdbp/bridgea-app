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

describe('Integration Tests', () => {
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

  describe('User Registration and Login Flow', () => {
    it('should complete full registration and login flow', async () => {
      // Register a new user
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
      const registerData = registerResponse.json();
      expect(registerData.user).toBeDefined();
      expect(registerData.tokens).toBeDefined();

      // Login with the registered user
      const loginData = {
        emailOrUsername: 'test@example.com',
        password: 'password123',
      };

      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: loginData,
      });

      expect(loginResponse.statusCode).toBe(200);
      const loginData = loginResponse.json();
      expect(loginData.user).toBeDefined();
      expect(loginData.tokens).toBeDefined();

      // Get current user
      const meResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          Authorization: `Bearer ${loginData.tokens.accessToken}`,
        },
      });

      expect(meResponse.statusCode).toBe(200);
      const meData = meResponse.json();
      expect(meData.user).toBeDefined();
      expect(meData.user.email).toBe(userData.email);
      expect(meData.user.username).toBe(userData.username);
    });
  });

  describe('Bridge Creation and Interaction Flow', () => {
    let authToken: string;
    let userId: string;

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
      userId = registerData.user._id;
    });

    it('should create bridge and interact with it', async () => {
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
      const createData = createResponse.json();
      expect(createData.bridge).toBeDefined();
      const bridgeId = createData.bridge._id;

      // Like the bridge
      const likeResponse = await app.inject({
        method: 'POST',
        url: `/api/v1/bridges/${bridgeId}/like`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(likeResponse.statusCode).toBe(200);
      const likeData = likeResponse.json();
      expect(likeData.liked).toBe(true);

      // Comment on the bridge
      const commentData = {
        content: 'This is a test comment',
      };

      const commentResponse = await app.inject({
        method: 'POST',
        url: `/api/v1/bridges/${bridgeId}/comments`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: commentData,
      });

      expect(commentResponse.statusCode).toBe(201);
      const commentData = commentResponse.json();
      expect(commentData.comment).toBeDefined();

      // Get bridge details
      const bridgeResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/bridges/${bridgeId}`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(bridgeResponse.statusCode).toBe(200);
      const bridgeData = bridgeResponse.json();
      expect(bridgeData.bridge).toBeDefined();
      expect(bridgeData.bridge.likesCount).toBe(1);
      expect(bridgeData.bridge.commentsCount).toBe(1);
    });
  });

  describe('Follow Flow', () => {
    let user1Token: string;
    let user2Token: string;
    let user1Id: string;
    let user2Id: string;

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
      user1Id = user1Data.user._id;
      user2Id = user2Data.user._id;
    });

    it('should complete follow flow', async () => {
      // User1 follows User2
      const followResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/follows/user2',
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      expect(followResponse.statusCode).toBe(201);
      const followData = followResponse.json();
      expect(followData.status).toBe('approved');

      // Check follow status
      const statusResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/follows/user2/status',
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      expect(statusResponse.statusCode).toBe(200);
      const statusData = statusResponse.json();
      expect(statusData.isFollowing).toBe(true);
      expect(statusData.status).toBe('approved');

      // Get User1's following list
      const followingResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/follows/me/following',
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      expect(followingResponse.statusCode).toBe(200);
      const followingData = followingResponse.json();
      expect(followingData.following).toBeDefined();
      expect(followingData.following).toHaveLength(1);
      expect(followingData.following[0].username).toBe('user2');

      // Get User2's followers list
      const followersResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/follows/me/followers',
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
      });

      expect(followersResponse.statusCode).toBe(200);
      const followersData = followersResponse.json();
      expect(followersData.followers).toBeDefined();
      expect(followersData.followers).toHaveLength(1);
      expect(followersData.followers[0].username).toBe('user1');

      // User1 unfollows User2
      const unfollowResponse = await app.inject({
        method: 'DELETE',
        url: '/api/v1/follows/user2',
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      expect(unfollowResponse.statusCode).toBe(200);
      const unfollowData = unfollowResponse.json();
      expect(unfollowData.message).toBe('Successfully unfollowed user');
    });
  });

  describe('Search and Discovery Flow', () => {
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

    it('should search users and get user profile', async () => {
      // Search for users
      const searchResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(searchResponse.statusCode).toBe(200);
      const searchData = searchResponse.json();
      expect(searchData.users).toBeDefined();
      expect(Array.isArray(searchData.users)).toBe(true);
      expect(searchData.pagination).toBeDefined();

      // Get user profile
      const profileResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/users/testuser',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(profileResponse.statusCode).toBe(200);
      const profileData = profileResponse.json();
      expect(profileData.user).toBeDefined();
      expect(profileData.user.username).toBe('testuser');
    });
  });

  describe('Notification Flow', () => {
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

    it('should handle notifications', async () => {
      // Get notifications
      const notificationsResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(notificationsResponse.statusCode).toBe(200);
      const notificationsData = notificationsResponse.json();
      expect(notificationsData.notifications).toBeDefined();
      expect(notificationsData.unreadCount).toBeDefined();
      expect(Array.isArray(notificationsData.notifications)).toBe(true);
      expect(typeof notificationsData.unreadCount).toBe('number');

      // Get unread count
      const unreadResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications/unread-count',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(unreadResponse.statusCode).toBe(200);
      const unreadData = unreadResponse.json();
      expect(unreadData.unreadCount).toBeDefined();
      expect(typeof unreadData.unreadCount).toBe('number');

      // Mark all as read
      const markAllResponse = await app.inject({
        method: 'PATCH',
        url: '/api/v1/notifications/read-all',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(markAllResponse.statusCode).toBe(200);
      const markAllData = markAllResponse.json();
      expect(markAllData.message).toBe('All notifications marked as read');
    });
  });

  describe('Media Flow', () => {
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

    it('should handle media upload signatures', async () => {
      // Get upload signature for image
      const imageSignatureResponse = await app.inject({
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

      expect(imageSignatureResponse.statusCode).toBe(200);
      const imageSignatureData = imageSignatureResponse.json();
      expect(imageSignatureData.signature).toBeDefined();
      expect(imageSignatureData.timestamp).toBeDefined();
      expect(imageSignatureData.folder).toBe('test/');
      expect(imageSignatureData.resource_type).toBe('image');
      expect(imageSignatureData.upload_preset).toBeDefined();
      expect(imageSignatureData.cloud_name).toBeDefined();

      // Get upload signature for video
      const videoSignatureResponse = await app.inject({
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

      expect(videoSignatureResponse.statusCode).toBe(200);
      const videoSignatureData = videoSignatureResponse.json();
      expect(videoSignatureData.signature).toBeDefined();
      expect(videoSignatureData.timestamp).toBeDefined();
      expect(videoSignatureData.folder).toBe('test/');
      expect(videoSignatureData.resource_type).toBe('video');
      expect(videoSignatureData.upload_preset).toBeDefined();
      expect(videoSignatureData.cloud_name).toBeDefined();
    });
  });
});


