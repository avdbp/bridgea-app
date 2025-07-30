import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: Date;
  lastUpdated: Date;
}

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
}

class NotificationService {
  private static instance: NotificationService;
  private currentToken: string | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Solicitar permisos de notificación
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('❌ Permisos de notificación no otorgados');
          return false;
        }
        
        console.log('✅ Permisos de notificación otorgados');
        return true;
      } else {
        console.log('⚠️ No es un dispositivo físico, usando simulador');
        return false;
      }
    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * Obtener token de notificación
   */
  async getToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('⚠️ No es un dispositivo físico');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId || projectId === 'your-project-id-here') {
        console.log('⚠️ ProjectId no configurado, usando notificaciones locales únicamente');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      this.currentToken = token.data;
      console.log('🔔 Token de notificación obtenido:', token.data);
      return token.data;
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Guardar token en Firestore
   */
  async saveTokenToFirestore(userId: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ No se pudo obtener el token, pero las notificaciones locales funcionarán');
        return true; // Retornamos true para que no falle el flujo
      }

      const notificationToken: NotificationToken = {
        userId,
        token,
        platform: Platform.OS as 'ios' | 'android' | 'web',
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      await setDoc(doc(db, 'notificationTokens', userId), notificationToken);
      console.log('✅ Token guardado en Firestore para usuario:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error guardando token:', error);
      return false;
    }
  }

  /**
   * Obtener token de un usuario desde Firestore
   */
  async getUserToken(userId: string): Promise<string | null> {
    try {
      const tokenDoc = await getDoc(doc(db, 'notificationTokens', userId));
      if (tokenDoc.exists()) {
        const data = tokenDoc.data() as NotificationToken;
        return data.token;
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo token de usuario:', error);
      return null;
    }
  }

  /**
   * Enviar notificación local
   */
  async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
          badge: notification.badge,
        },
        trigger: null, // Enviar inmediatamente
      });
      console.log('✅ Notificación local enviada');
    } catch (error) {
      console.error('❌ Error enviando notificación local:', error);
    }
  }

  /**
   * Enviar notificación push a un usuario específico
   */
  async sendPushNotification(userId: string, notification: NotificationData): Promise<boolean> {
    try {
      const token = await this.getUserToken(userId);
      if (!token) {
        console.log('⚠️ No se encontró token para el usuario:', userId, '- usando notificación local');
        // Fallback a notificación local
        await this.sendLocalNotification(notification);
        return true;
      }

      const message = {
        to: token,
        sound: notification.sound !== false ? 'default' : undefined,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log('✅ Notificación push enviada a usuario:', userId);
        return true;
      } else {
        console.log('⚠️ Error enviando notificación push, usando notificación local');
        // Fallback a notificación local
        await this.sendLocalNotification(notification);
        return true;
      }
    } catch (error) {
      console.error('❌ Error enviando notificación push:', error);
      // Fallback a notificación local
      try {
        await this.sendLocalNotification(notification);
        return true;
      } catch (localError) {
        console.error('❌ Error enviando notificación local:', localError);
        return false;
      }
    }
  }

  /**
   * Enviar notificación de bridge recibido
   */
  async sendBridgeReceivedNotification(
    recipientId: string, 
    senderName: string, 
    bridgeTitle: string,
    isPrivate: boolean = false
  ): Promise<boolean> {
    const notification: NotificationData = {
      title: isPrivate ? `🔒 Bridge privado de ${senderName}` : `🌍 Bridge público de ${senderName}`,
      body: `"${bridgeTitle}" - Toca para ver el bridge`,
      data: {
        type: 'bridge_received',
        senderName,
        bridgeTitle,
        isPrivate,
      },
      sound: true,
      badge: 1,
    };

    return await this.sendPushNotification(recipientId, notification);
  }

  /**
   * Configurar listeners de notificación
   */
  setupNotificationListeners() {
    // Listener para cuando se recibe una notificación
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notificación recibida:', notification);
    });

    // Listener para cuando se toca una notificación
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notificación tocada:', response);
      
      // Aquí puedes manejar la navegación cuando se toca la notificación
      const data = response.notification.request.content.data;
      if (data?.type === 'bridge_received') {
        // Navegar a la pantalla de bridges
        // router.push('/bridges');
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  /**
   * Limpiar badge
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
      console.log('✅ Badge limpiado');
    } catch (error) {
      console.error('❌ Error limpiando badge:', error);
    }
  }
}

export default NotificationService.getInstance(); 