import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { connectDB } from '../utils/database';
import { User } from '../models/User';
import { Bridge } from '../models/Bridge';
import { Follow } from '../models/Follow';
import { Like } from '../models/Like';
import { Comment } from '../models/Comment';
import { Notification } from '../models/Notification';
import { Group } from '../models/Group';
import { Message } from '../models/Message';

describe('Database Models', () => {
  beforeEach(async () => {
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

  describe('User Model', () => {
    it('should create a new user', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      expect(user._id).toBeDefined();
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
      expect(user.location).toBe(userData.location);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should hash password before saving', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash length
    });

    it('should compare password correctly', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('password123');
      const isNotMatch = await user.comparePassword('wrongpassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });

    it('should not include password in JSON output', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      const userJSON = user.toJSON();
      expect(userJSON.password).toBeUndefined();
    });
  });

  describe('Bridge Model', () => {
    it('should create a new bridge', async () => {
      // First create a user
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      });
      await user.save();

      const bridgeData = {
        author: user._id,
        content: 'This is a test bridge',
        visibility: 'public',
      };

      const bridge = new Bridge(bridgeData);
      await bridge.save();

      expect(bridge._id).toBeDefined();
      expect(bridge.author.toString()).toBe(user._id.toString());
      expect(bridge.content).toBe(bridgeData.content);
      expect(bridge.visibility).toBe(bridgeData.visibility);
      expect(bridge.likesCount).toBe(0);
      expect(bridge.commentsCount).toBe(0);
      expect(bridge.sharesCount).toBe(0);
    });

    it('should update user bridges count when bridge is created', async () => {
      // First create a user
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      });
      await user.save();

      const initialBridgesCount = user.bridgesCount;

      const bridgeData = {
        author: user._id,
        content: 'This is a test bridge',
        visibility: 'public',
      };

      const bridge = new Bridge(bridgeData);
      await bridge.save();

      // Refresh user from database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.bridgesCount).toBe(initialBridgesCount + 1);
    });
  });

  describe('Follow Model', () => {
    it('should create a new follow relationship', async () => {
      // Create two users
      const user1 = new User({
        firstName: 'User',
        lastName: 'One',
        email: 'user1@example.com',
        username: 'user1',
        location: 'Test City',
        password: 'password123',
      });
      await user1.save();

      const user2 = new User({
        firstName: 'User',
        lastName: 'Two',
        email: 'user2@example.com',
        username: 'user2',
        location: 'Test City',
        password: 'password123',
      });
      await user2.save();

      const followData = {
        follower: user1._id,
        following: user2._id,
        status: 'approved',
      };

      const follow = new Follow(followData);
      await follow.save();

      expect(follow._id).toBeDefined();
      expect(follow.follower.toString()).toBe(user1._id.toString());
      expect(follow.following.toString()).toBe(user2._id.toString());
      expect(follow.status).toBe('approved');
    });

    it('should update follower/following counts when follow is created', async () => {
      // Create two users
      const user1 = new User({
        firstName: 'User',
        lastName: 'One',
        email: 'user1@example.com',
        username: 'user1',
        location: 'Test City',
        password: 'password123',
      });
      await user1.save();

      const user2 = new User({
        firstName: 'User',
        lastName: 'Two',
        email: 'user2@example.com',
        username: 'user2',
        location: 'Test City',
        password: 'password123',
      });
      await user2.save();

      const initialFollowingCount = user1.followingCount;
      const initialFollowersCount = user2.followersCount;

      const followData = {
        follower: user1._id,
        following: user2._id,
        status: 'approved',
      };

      const follow = new Follow(followData);
      await follow.save();

      // Refresh users from database
      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);

      expect(updatedUser1?.followingCount).toBe(initialFollowingCount + 1);
      expect(updatedUser2?.followersCount).toBe(initialFollowersCount + 1);
    });
  });

  describe('Like Model', () => {
    it('should create a new like', async () => {
      // Create user and bridge
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      });
      await user.save();

      const bridge = new Bridge({
        author: user._id,
        content: 'This is a test bridge',
        visibility: 'public',
      });
      await bridge.save();

      const likeData = {
        user: user._id,
        bridge: bridge._id,
      };

      const like = new Like(likeData);
      await like.save();

      expect(like._id).toBeDefined();
      expect(like.user.toString()).toBe(user._id.toString());
      expect(like.bridge.toString()).toBe(bridge._id.toString());
    });

    it('should update bridge likes count when like is created', async () => {
      // Create user and bridge
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      });
      await user.save();

      const bridge = new Bridge({
        author: user._id,
        content: 'This is a test bridge',
        visibility: 'public',
      });
      await bridge.save();

      const initialLikesCount = bridge.likesCount;

      const likeData = {
        user: user._id,
        bridge: bridge._id,
      };

      const like = new Like(likeData);
      await like.save();

      // Refresh bridge from database
      const updatedBridge = await Bridge.findById(bridge._id);
      expect(updatedBridge?.likesCount).toBe(initialLikesCount + 1);
    });
  });

  describe('Comment Model', () => {
    it('should create a new comment', async () => {
      // Create user and bridge
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      });
      await user.save();

      const bridge = new Bridge({
        author: user._id,
        content: 'This is a test bridge',
        visibility: 'public',
      });
      await bridge.save();

      const commentData = {
        user: user._id,
        bridge: bridge._id,
        content: 'This is a test comment',
      };

      const comment = new Comment(commentData);
      await comment.save();

      expect(comment._id).toBeDefined();
      expect(comment.user.toString()).toBe(user._id.toString());
      expect(comment.bridge.toString()).toBe(bridge._id.toString());
      expect(comment.content).toBe(commentData.content);
      expect(comment.likesCount).toBe(0);
      expect(comment.repliesCount).toBe(0);
    });

    it('should update bridge comments count when comment is created', async () => {
      // Create user and bridge
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      });
      await user.save();

      const bridge = new Bridge({
        author: user._id,
        content: 'This is a test bridge',
        visibility: 'public',
      });
      await bridge.save();

      const initialCommentsCount = bridge.commentsCount;

      const commentData = {
        user: user._id,
        bridge: bridge._id,
        content: 'This is a test comment',
      };

      const comment = new Comment(commentData);
      await comment.save();

      // Refresh bridge from database
      const updatedBridge = await Bridge.findById(bridge._id);
      expect(updatedBridge?.commentsCount).toBe(initialCommentsCount + 1);
    });
  });

  describe('Notification Model', () => {
    it('should create a new notification', async () => {
      // Create user
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      });
      await user.save();

      const notificationData = {
        recipient: user._id,
        type: 'NEW_LIKE',
        title: 'New Like',
        body: 'Someone liked your bridge',
        isRead: false,
      };

      const notification = new Notification(notificationData);
      await notification.save();

      expect(notification._id).toBeDefined();
      expect(notification.recipient.toString()).toBe(user._id.toString());
      expect(notification.type).toBe('NEW_LIKE');
      expect(notification.title).toBe(notificationData.title);
      expect(notification.body).toBe(notificationData.body);
      expect(notification.isRead).toBe(false);
    });
  });

  describe('Group Model', () => {
    it('should create a new group', async () => {
      // Create user
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
      });
      await user.save();

      const groupData = {
        name: 'Test Group',
        description: 'This is a test group',
        creator: user._id,
        admins: [user._id],
        members: [user._id],
        isPrivate: false,
      };

      const group = new Group(groupData);
      await group.save();

      expect(group._id).toBeDefined();
      expect(group.name).toBe(groupData.name);
      expect(group.description).toBe(groupData.description);
      expect(group.creator.toString()).toBe(user._id.toString());
      expect(group.admins).toContain(user._id);
      expect(group.members).toContain(user._id);
      expect(group.isPrivate).toBe(false);
      expect(group.membersCount).toBe(1);
    });
  });

  describe('Message Model', () => {
    it('should create a new message', async () => {
      // Create two users
      const user1 = new User({
        firstName: 'User',
        lastName: 'One',
        email: 'user1@example.com',
        username: 'user1',
        location: 'Test City',
        password: 'password123',
      });
      await user1.save();

      const user2 = new User({
        firstName: 'User',
        lastName: 'Two',
        email: 'user2@example.com',
        username: 'user2',
        location: 'Test City',
        password: 'password123',
      });
      await user2.save();

      const messageData = {
        sender: user1._id,
        recipient: user2._id,
        content: 'Hello, this is a test message',
        isRead: false,
      };

      const message = new Message(messageData);
      await message.save();

      expect(message._id).toBeDefined();
      expect(message.sender.toString()).toBe(user1._id.toString());
      expect(message.recipient.toString()).toBe(user2._id.toString());
      expect(message.content).toBe(messageData.content);
      expect(message.isRead).toBe(false);
    });
  });
});


