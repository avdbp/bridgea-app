import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../services/api';

describe('Bridges API', () => {
  let authToken: string;
  let userId: string;

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
  });

  it('should create a new bridge', async () => {
    const bridgeData = {
      content: 'This is a test bridge',
      visibility: 'public' as const,
    };

    const response = await apiService.createBridge(bridgeData);
    
    expect(response.bridge).toBeDefined();
    expect(response.bridge.content).toBe(bridgeData.content);
    expect(response.bridge.author._id).toBe(userId);
  });

  it('should get user bridges', async () => {
    const response = await apiService.getUserBridges('testuser');
    
    expect(response.bridges).toBeDefined();
    expect(Array.isArray(response.bridges)).toBe(true);
  });

  it('should like a bridge', async () => {
    // First create a bridge
    const bridgeData = {
      content: 'This is a test bridge for liking',
      visibility: 'public' as const,
    };

    const bridgeResponse = await apiService.createBridge(bridgeData);
    const bridgeId = bridgeResponse.bridge._id;

    // Then like it
    const likeResponse = await apiService.likeBridge(bridgeId);
    
    expect(likeResponse.liked).toBe(true);
  });
});


