import { useEffect, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './useAuth';
import notificationService from '../services/notificationService';

export const useMessageNotifications = () => {
  const { user } = useAuth();
  const lastMessageId = useRef<string | null>(null);
  const isActive = useRef(false);

  useEffect(() => {
    if (!user) return;

    isActive.current = true;

    const checkForNewMessages = async () => {
      if (!isActive.current) return;

      try {
        // Consulta ultra-simple: solo por recipientId (sin índices complejos)
        const messagesQuery = query(
          collection(db, 'messages'),
          where('recipientId', '==', user.uid)
        );

        const snapshot = await getDocs(messagesQuery);
        
        // Procesar mensajes en el cliente
        const unreadMessages = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(msg => {
            // Solo mensajes no leídos
            if (msg.read === true) return false;
            
            const messageTime = msg.createdAt?.toDate?.();
            if (!messageTime) return false;
            
            // Solo procesar mensajes de los últimos 60 segundos
            const isRecent = messageTime > new Date(Date.now() - 60000);
            
            // Solo procesar si es un mensaje nuevo (no procesado antes)
            const isNew = !lastMessageId.current || msg.id !== lastMessageId.current;
            
            return isRecent && isNew;
          })
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(0);
            return bTime.getTime() - aTime.getTime(); // Orden descendente
          });

        if (unreadMessages.length > 0) {
          // Tomar el mensaje más reciente
          const latestMsg = unreadMessages[0];
          
          // Actualizar el ID del último mensaje procesado
          lastMessageId.current = latestMsg.id;

          // Enviar notificación
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
        // Silenciar errores de índices para evitar spam en logs
        if (error.message && error.message.includes('index')) {
          console.log('⏳ Índices de Firestore en configuración...');
        } else {
          console.error('Error verificando mensajes nuevos:', error);
        }
      }
    };

    // Verificar mensajes nuevos cada 10 segundos (menos frecuente para reducir errores)
    const interval = setInterval(checkForNewMessages, 10000);

    // Verificación inicial
    checkForNewMessages();

    return () => {
      isActive.current = false;
      clearInterval(interval);
    };
  }, [user]);

  return null;
}; 