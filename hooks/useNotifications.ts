import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import notificationService from '../services/notificationService';

export const useNotifications = () => {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Configurar listeners de notificación
    const setupListeners = () => {
      // Listener para cuando se recibe una notificación
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('🔔 Notificación recibida:', notification);
      });

      // Listener para cuando se toca una notificación
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notificación tocada:', response);
        
        // Manejar la navegación cuando se toca la notificación
        const data = response.notification.request.content.data;
        if (data?.type === 'bridge_received') {
          // Navegar a la pantalla de bridges
          router.push('/bridges');
        } else if (data?.type === 'message_received') {
          // Navegar a la conversación
          router.push({
            pathname: '/conversation',
            params: {
              otherUserId: data.senderId,
              otherUserName: data.senderName,
              otherUserUsername: data.senderName // Usar el nombre como username temporal
            }
          });
        }
      });
    };

    // Limpiar badge al abrir la app
    const clearBadge = async () => {
      try {
        await notificationService.clearBadge();
      } catch (error) {
        console.error('❌ Error limpiando badge:', error);
      }
    };

    setupListeners();
    clearBadge();

    // Cleanup function
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    // Función para solicitar permisos
    requestPermissions: notificationService.requestPermissions.bind(notificationService),
    // Función para enviar notificación local
    sendLocalNotification: notificationService.sendLocalNotification.bind(notificationService),
    // Función para limpiar badge
    clearBadge: notificationService.clearBadge.bind(notificationService),
  };
}; 