import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../services/api';

describe('Follows API', () => {
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

  it('should follow a user', async () => {
    const response = await apiService.followUser('user2');
    
    expect(response.status).toBe('approved');
  });

  it('should get follow status', async () => {
    // First follow the user
    await apiService.followUser('user2');

    // Then check status
    const response = await apiService.getFollowStatus('user2');
    
    expect(response.isFollowing).toBe(true);
    expect(response.status).toBe('approved');
  });

  it('should unfollow a user', async () => {
    // First follow the user
    await apiService.followUser('user2');

    // Then unfollow
    const response = await apiService.unfollowUser('user2');
    
    expect(response.message).toBeDefined();
  });

  it('should get followers list', async () => {
    // First follow the user
    await apiService.followUser('user2');

    // Then get followers
    const response = await apiService.getMyFollowers();
    
    expect(response.followers).toBeDefined();
    expect(Array.isArray(response.followers)).toBe(true);
  });
});


