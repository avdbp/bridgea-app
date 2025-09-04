import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../services/api';

describe('Users API', () => {
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

  it('should get user by username', async () => {
    const response = await apiService.getUser('testuser');
    
    expect(response.user).toBeDefined();
    expect(response.user.username).toBe('testuser');
    expect(response.user.email).toBe('test@example.com');
  });

  it('should update user profile', async () => {
    const updateData = {
      bio: 'This is a test bio',
      location: 'Updated City',
    };

    const response = await apiService.updateProfile(updateData);
    
    expect(response.user).toBeDefined();
    expect(response.user.bio).toBe(updateData.bio);
    expect(response.user.location).toBe(updateData.location);
  });

  it('should update user avatar', async () => {
    const avatarUrl = 'https://example.com/avatar.jpg';
    const response = await apiService.updateAvatar(avatarUrl);
    
    expect(response.user).toBeDefined();
    expect(response.user.avatar).toBe(avatarUrl);
  });

  it('should update user banner', async () => {
    const bannerUrl = 'https://example.com/banner.jpg';
    const response = await apiService.updateBanner(bannerUrl);
    
    expect(response.user).toBeDefined();
    expect(response.user.banner).toBe(bannerUrl);
  });

  it('should search users', async () => {
    const response = await apiService.searchUsers('test');
    
    expect(response.users).toBeDefined();
    expect(Array.isArray(response.users)).toBe(true);
    expect(response.pagination).toBeDefined();
  });

  it('should get user followers', async () => {
    const response = await apiService.getUserFollowers('testuser');
    
    expect(response.followers).toBeDefined();
    expect(Array.isArray(response.followers)).toBe(true);
    expect(response.pagination).toBeDefined();
  });

  it('should get user following', async () => {
    const response = await apiService.getUserFollowing('testuser');
    
    expect(response.following).toBeDefined();
    expect(Array.isArray(response.following)).toBe(true);
    expect(response.pagination).toBeDefined();
  });
});


