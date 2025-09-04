import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'message' | 'like' | 'follow' | 'comment' | 'mention';
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  async initialize(): Promise<string | null> {
    try {
      // Check if device is physical
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      // Get existing token
      const existingToken = await AsyncStorage.getItem('expoPushToken');
      if (existingToken) {
        this.expoPushToken = existingToken;
        return existingToken;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get push token (only if projectId is available)
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId) {
        console.log('No projectId found, skipping push token generation');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = token.data;
      await AsyncStorage.setItem('expoPushToken', token.data);

      console.log('Expo push token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    const token = await this.initialize();
    
    if (token && Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: {
            type: notification.type,
            ...notification.data,
          },
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  async sendPushNotification(
    expoPushToken: string,
    notification: NotificationData
  ): Promise<void> {
    try {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: {
          type: notification.type,
          ...notification.data,
        },
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Listen for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        onNotificationResponse?.(response);
      }
    );
  }

  removeNotificationListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Helper methods for different notification types
  async notifyNewMessage(senderName: string, message: string, chatId: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'message',
      title: `Nuevo mensaje de ${senderName}`,
      body: message,
      data: { chatId },
    });
  }

  async notifyNewLike(userName: string, bridgeId: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'like',
      title: `${userName} le dio like a tu puente`,
      body: 'Ve a ver qué piensan de tu contenido',
      data: { bridgeId },
    });
  }

  async notifyNewFollow(userName: string, userId: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'follow',
      title: `${userName} empezó a seguirte`,
      body: 'Tienes un nuevo seguidor',
      data: { userId },
    });
  }

  async notifyNewComment(userName: string, bridgeId: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'comment',
      title: `${userName} comentó en tu puente`,
      body: 'Ve a ver qué opinan',
      data: { bridgeId },
    });
  }

  async notifyMention(userName: string, bridgeId: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'mention',
      title: `${userName} te mencionó`,
      body: 'Te mencionaron en un puente',
      data: { bridgeId },
    });
  }
}

export const notificationService = new NotificationService();
