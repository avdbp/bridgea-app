import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../services/api';

describe('Comments API', () => {
  let authToken: string;
  let userId: string;
  let bridgeId: string;

  beforeEach(async () => {
    // Setup test user and get auth token
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'testuser',
      location: 'Test City',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const response = await apiService.register(userData);
    authToken = response.tokens.accessToken;
    userId = response.user._id;

    // Create a test bridge
    const bridgeData = {
      content: 'This is a test bridge for comments',
      visibility: 'public' as const,
    };

    const bridgeResponse = await apiService.createBridge(bridgeData);
    bridgeId = bridgeResponse.bridge._id;
  });

  it('should add a comment to a bridge', async () => {
    const commentData = {
      content: 'This is a test comment',
    };

    const response = await apiService.addComment(bridgeId, commentData);
    
    expect(response.comment).toBeDefined();
    expect(response.comment.content).toBe(commentData.content);
    expect(response.comment.user._id).toBe(userId);
  });

  it('should get bridge comments', async () => {
    // First add a comment
    const commentData = {
      content: 'This is a test comment',
    };
    await apiService.addComment(bridgeId, commentData);

    // Then get comments
    const response = await apiService.getBridgeComments(bridgeId);
    
    expect(response.comments).toBeDefined();
    expect(Array.isArray(response.comments)).toBe(true);
    expect(response.comments.length).toBeGreaterThan(0);
    expect(response.pagination).toBeDefined();
  });

  it('should add a reply to a comment', async () => {
    // First add a parent comment
    const parentCommentData = {
      content: 'This is a parent comment',
    };
    const parentResponse = await apiService.addComment(bridgeId, parentCommentData);
    const parentCommentId = parentResponse.comment._id;

    // Then add a reply
    const replyData = {
      content: 'This is a reply',
      parentCommentId: parentCommentId,
    };

    const response = await apiService.addComment(bridgeId, replyData);
    
    expect(response.comment).toBeDefined();
    expect(response.comment.content).toBe(replyData.content);
    expect(response.comment.parentComment).toBe(parentCommentId);
  });
});


