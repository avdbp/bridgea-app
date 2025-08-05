import { useEffect, useRef } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './useAuth';
import notificationService from '../services/notificationService';

export const useMessageNotifications = () => {
  const { user } = useAuth();
  const lastMessageTime = useRef<Date | null>(null);
  const isActive = useRef(false);

  useEffect(() => {
    if (!user) return;

    isActive.current = true;

    const checkForNewMessages = async () => {
      if (!isActive.current) return;

      try {
        // Buscar mensajes recientes dirigidos al usuario actual
        const messagesQuery = query(
          collection(db, 'messages'),
          where('recipientId', '==', user.uid),
          where('read', '==', false),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const snapshot = await getDocs(messagesQuery);
        const newMessages = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(msg => {
            const messageTime = msg.createdAt?.toDate?.();
            if (!messageTime) return false;
            
            // Solo procesar mensajes de los últimos 30 segundos
            const isRecent = messageTime > new Date(Date.now() - 30000);
            
            // Solo procesar si es más reciente que el último mensaje procesado
            const isNewer = !lastMessageTime.current || messageTime > lastMessageTime.current;
            
            return isRecent && isNewer;
          });

        if (newMessages.length > 0) {
          // Actualizar el tiempo del último mensaje procesado
          const latestMessage = newMessages[0];
          const messageTime = latestMessage.createdAt?.toDate?.();
          if (messageTime) {
            lastMessageTime.current = messageTime;
          }

          // Enviar notificación para el mensaje más reciente
          const latestMsg = newMessages[0];
          try {
            await notificationService.sendLocalNotification({
              title: `💬 Nuevo mensaje de ${latestMsg.senderName || 'Usuario'}`,
              body: latestMsg.content,
              data: {
                type: 'message_received',
                senderId: latestMsg.senderId,
                senderName: latestMsg.senderName,
                conversationId: [user.uid, latestMsg.senderId].sort().join('_')
              },
              sound: true,
            });
            console.log('🔔 Notificación de mensaje enviada desde hook');
          } catch (notificationError) {
            console.log('Error enviando notificación desde hook:', notificationError);
          }
        }
      } catch (error) {
        console.error('Error verificando mensajes nuevos:', error);
      }
    };

    // Verificar mensajes nuevos cada 3 segundos
    const interval = setInterval(checkForNewMessages, 3000);

    // Verificación inicial
    checkForNewMessages();

    return () => {
      isActive.current = false;
      clearInterval(interval);
    };
  }, [user]);

  return null;
}; 