import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../services/api';

describe('Groups API', () => {
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

  it('should create a new group', async () => {
    const groupData = {
      name: 'Test Group',
      description: 'This is a test group',
      isPrivate: false,
    };

    const response = await apiService.createGroup(groupData);
    
    expect(response.group).toBeDefined();
    expect(response.group.name).toBe(groupData.name);
    expect(response.group.description).toBe(groupData.description);
    expect(response.group.creator._id).toBe(userId);
  });

  it('should get groups', async () => {
    const response = await apiService.getGroups();
    
    expect(response.groups).toBeDefined();
    expect(Array.isArray(response.groups)).toBe(true);
    expect(response.pagination).toBeDefined();
  });

  it('should join a group', async () => {
    // First create a group
    const groupData = {
      name: 'Test Group for Joining',
      description: 'This is a test group for joining',
      isPrivate: false,
    };

    const groupResponse = await apiService.createGroup(groupData);
    const groupId = groupResponse.group._id;

    // Then join it
    const response = await apiService.joinGroup(groupId);
    
    expect(response.message).toBeDefined();
  });

  it('should leave a group', async () => {
    // First create and join a group
    const groupData = {
      name: 'Test Group for Leaving',
      description: 'This is a test group for leaving',
      isPrivate: false,
    };

    const groupResponse = await apiService.createGroup(groupData);
    const groupId = groupResponse.group._id;

    await apiService.joinGroup(groupId);

    // Then leave it
    const response = await apiService.leaveGroup(groupId);
    
    expect(response.message).toBeDefined();
  });

  it('should get group members', async () => {
    // First create a group
    const groupData = {
      name: 'Test Group for Members',
      description: 'This is a test group for members',
      isPrivate: false,
    };

    const groupResponse = await apiService.createGroup(groupData);
    const groupId = groupResponse.group._id;

    // Then get members
    const response = await apiService.getGroupMembers(groupId);
    
    expect(response.members).toBeDefined();
    expect(Array.isArray(response.members)).toBe(true);
    expect(response.pagination).toBeDefined();
  });
});


