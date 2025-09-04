import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../services/api';

describe('Messages API', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;

  beforeEach(async () => {
    // Setup two test users
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

    const user1Response = await apiService.register(user1Data);
    const user2Response = await apiService.register(user2Data);

    user1Token = user1Response.tokens.accessToken;
    user2Token = user2Response.tokens.accessToken;
    user1Id = user1Response.user._id;
    user2Id = user2Response.user._id;
  });

  it('should send a message', async () => {
    const messageData = {
      recipientId: user2Id,
      content: 'Hello, this is a test message',
    };

    const response = await apiService.sendMessage(messageData);
    
    expect(response.message).toBeDefined();
    expect(response.message.content).toBe(messageData.content);
    expect(response.message.sender._id).toBe(user1Id);
    expect(response.message.recipient._id).toBe(user2Id);
  });

  it('should get conversation messages', async () => {
    // First send a message
    const messageData = {
      recipientId: user2Id,
      content: 'Hello, this is a test message',
    };
    await apiService.sendMessage(messageData);

    // Then get conversation messages
    const response = await apiService.getConversationMessages(user2Id);
    
    expect(response.messages).toBeDefined();
    expect(Array.isArray(response.messages)).toBe(true);
    expect(response.messages.length).toBeGreaterThan(0);
    expect(response.pagination).toBeDefined();
  });

  it('should mark message as read', async () => {
    // First send a message
    const messageData = {
      recipientId: user2Id,
      content: 'Hello, this is a test message',
    };
    const messageResponse = await apiService.sendMessage(messageData);
    const messageId = messageResponse.message._id;

    // Then mark it as read
    const response = await apiService.markMessageAsRead(messageId);
    
    expect(response.message).toBeDefined();
    expect(response.message.isRead).toBe(true);
  });

  it('should get unread messages count', async () => {
    // First send a message
    const messageData = {
      recipientId: user2Id,
      content: 'Hello, this is a test message',
    };
    await apiService.sendMessage(messageData);

    // Then get unread count
    const response = await apiService.getUnreadMessagesCount();
    
    expect(response.unreadCount).toBeDefined();
    expect(typeof response.unreadCount).toBe('number');
  });
});


