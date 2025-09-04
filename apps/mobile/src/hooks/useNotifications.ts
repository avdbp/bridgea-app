import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { notificationService } from '@/services/notifications';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  useEffect(() => {
    if (user && isInitialized) {
      setupNotificationListeners();
    }

    return () => {
      notificationService.removeNotificationListeners();
    };
  }, [user, isInitialized]);

  const initializeNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      setExpoPushToken(token);
      setIsInitialized(true);
      
      if (token) {
        console.log('Push notifications initialized with token:', token);
        // TODO: Send token to backend to register for push notifications
        // await apiService.registerPushToken(token);
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      setIsInitialized(true);
    }
  };

  const setupNotificationListeners = () => {
    notificationService.setupNotificationListeners(
      // Handle notification received while app is running
      (notification) => {
        console.log('Notification received:', notification);
        // You can show a toast or update UI here
      },
      // Handle user tap on notification
      (response) => {
        handleNotificationResponse(response);
      }
    );
  };

  const handleNotificationResponse = (response: any) => {
    const { type, data } = response.notification.request.content.data;

    switch (type) {
      case 'message':
        if (data?.chatId) {
          router.push(`/chat/${data.chatId}`);
        }
        break;
      case 'like':
      case 'comment':
      case 'mention':
        if (data?.bridgeId) {
          // Navigate to bridge detail or home feed
          router.push('/(tabs)');
        }
        break;
      case 'follow':
        if (data?.userId) {
          router.push(`/user/${data.userId}`);
        }
        break;
      default:
        // Default navigation
        router.push('/(tabs)');
    }
  };

  const sendTestNotification = async () => {
    await notificationService.sendLocalNotification({
      type: 'message',
      title: 'Notificación de prueba',
      body: 'Esta es una notificación de prueba de Bridgea',
      data: { test: true },
    });
  };

  const clearAllNotifications = async () => {
    await notificationService.clearAllNotifications();
  };

  const setBadgeCount = async (count: number) => {
    await notificationService.setBadgeCount(count);
  };

  return {
    expoPushToken,
    isInitialized,
    sendTestNotification,
    clearAllNotifications,
    setBadgeCount,
    notificationService,
  };
};
