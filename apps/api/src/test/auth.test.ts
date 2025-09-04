import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../services/api';

describe('Auth API', () => {
  beforeEach(() => {
    // Reset any test data
  });

  it('should register a new user', async () => {
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
    
    expect(response.user).toBeDefined();
    expect(response.tokens).toBeDefined();
    expect(response.user.email).toBe(userData.email);
    expect(response.user.username).toBe(userData.username);
  });

  it('should login with valid credentials', async () => {
    const credentials = {
      emailOrUsername: 'test@example.com',
      password: 'password123',
    };

    const response = await apiService.login(credentials);
    
    expect(response.user).toBeDefined();
    expect(response.tokens).toBeDefined();
    expect(response.tokens.accessToken).toBeDefined();
    expect(response.tokens.refreshToken).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const credentials = {
      emailOrUsername: 'test@example.com',
      password: 'wrongpassword',
    };

    await expect(apiService.login(credentials)).rejects.toThrow();
  });
});


