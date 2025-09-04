import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../services/api';

describe('Notifications API', () => {
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

  it('should get notifications', async () => {
    const response = await apiService.getNotifications();
    
    expect(response.notifications).toBeDefined();
    expect(response.unreadCount).toBeDefined();
    expect(Array.isArray(response.notifications)).toBe(true);
    expect(typeof response.unreadCount).toBe('number');
  });

  it('should get unread notifications count', async () => {
    const response = await apiService.getUnreadNotificationsCount();
    
    expect(response.unreadCount).toBeDefined();
    expect(typeof response.unreadCount).toBe('number');
  });

  it('should mark all notifications as read', async () => {
    const response = await apiService.markAllNotificationsAsRead();
    
    expect(response.message).toBeDefined();
  });

  it('should send test push notification', async () => {
    const response = await apiService.sendTestPushNotification('Test message');
    
    expect(response.message).toBeDefined();
    expect(response.notification).toBeDefined();
  });
});


