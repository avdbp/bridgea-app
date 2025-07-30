import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/Colors';
import { TextStyles } from '../constants/Typography';
import BottomNav from '../components/BottomNav';

interface Notification {
  id: string;
  type: 'bridge_received' | 'message_received' | 'bridge_comment';
  title: string;
  body: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  read: boolean;
  createdAt: any;
  data?: any;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  content: string;
  createdAt: any;
  read: boolean;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Solución temporal: usar getDocs en lugar de onSnapshot para evitar errores de índices
    const fetchData = async () => {
      try {
        // Fetch notifications
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('recipientId', '==', user.uid)
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const notifications = notificationsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a: any, b: any) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(0);
            return bTime.getTime() - aTime.getTime();
          }) as Notification[];
        setNotifications(notifications);

        // Fetch messages
        const messagesQuery = query(
          collection(db, 'messages'),
          where('recipientId', '==', user.uid)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages = messagesSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a: any, b: any) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(0);
            return bTime.getTime() - aTime.getTime();
          }) as Message[];
        setMessages(messages);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Polling cada 10 segundos para actualizaciones
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marcando como leído:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !newMessageRecipient.trim() || !newMessageContent.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      // Buscar el usuario destinatario
      const usersQuery = query(
        collection(db, 'users'),
        where('username', '==', newMessageRecipient.toLowerCase())
      );
      
      const userSnapshot = await getDocs(usersQuery);
      if (userSnapshot.empty) {
        Alert.alert('Error', 'Usuario no encontrado');
        return;
      }

      const recipientUser = userSnapshot.docs[0].data();
      
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: user.displayName || 'Usuario',
        recipientId: userSnapshot.docs[0].id,
        recipientName: recipientUser.name,
        content: newMessageContent.trim(),
        createdAt: serverTimestamp(),
        read: false,
      });

      setNewMessageRecipient('');
      setNewMessageContent('');
      setShowNewMessage(false);
      Alert.alert('Éxito', 'Mensaje enviado correctamente');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Los datos se actualizarán automáticamente por onSnapshot
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Pressable 
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationTime}>
          {item.createdAt?.toDate?.().toLocaleDateString() || 'Ahora'}
        </Text>
      </View>
      <Text style={styles.notificationBody}>{item.body}</Text>
      {!item.read && <View style={styles.unreadDot} />}
    </Pressable>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <Pressable style={[styles.messageItem, !item.read && styles.unreadItem]}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageSender}>{item.senderName}</Text>
        <Text style={styles.messageTime}>
          {item.createdAt?.toDate?.().toLocaleDateString() || 'Ahora'}
        </Text>
      </View>
      <Text style={styles.messageContent}>{item.content}</Text>
      {!item.read && <View style={styles.unreadDot} />}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Buzón</Text>
        <Pressable onPress={() => setShowNewMessage(true)}>
          <Feather name="plus" size={24} color={Colors.text.primary} />
        </Pressable>
      </View>

      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
            Notificaciones
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => setActiveTab('messages')}
        >
          <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
            Mensajes
          </Text>
        </Pressable>
      </View>

      {activeTab === 'notifications' ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="bell" size={48} color={Colors.text.light} />
              <Text style={styles.emptyText}>No hay notificaciones</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="message-circle" size={48} color={Colors.text.light} />
              <Text style={styles.emptyText}>No hay mensajes</Text>
            </View>
          }
        />
      )}

      {showNewMessage && (
        <View style={styles.newMessageModal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Mensaje</Text>
            <TextInput
              style={styles.input}
              placeholder="Usuario destinatario (@username)"
              value={newMessageRecipient}
              onChangeText={setNewMessageRecipient}
              placeholderTextColor={Colors.text.light}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mensaje..."
              value={newMessageContent}
              onChangeText={setNewMessageContent}
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.text.light}
            />
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowNewMessage(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, styles.sendButton]}
                onPress={sendMessage}
              >
                <Text style={styles.sendButtonText}>Enviar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...TextStyles.largeTitle,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...TextStyles.body,
    color: Colors.text.light,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  messageItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  unreadItem: {
    backgroundColor: Colors.primary + '10',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    ...TextStyles.body,
    fontWeight: '600',
    flex: 1,
  },
  messageSender: {
    ...TextStyles.body,
    fontWeight: '600',
    color: Colors.primary,
  },
  notificationTime: {
    ...TextStyles.caption,
    color: Colors.text.light,
  },
  messageTime: {
    ...TextStyles.caption,
    color: Colors.text.light,
  },
  notificationBody: {
    ...TextStyles.body,
    color: Colors.text.secondary,
  },
  messageContent: {
    ...TextStyles.body,
    color: Colors.text.secondary,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.text.light,
    marginTop: 16,
  },
  newMessageModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    margin: 24,
    width: '90%',
  },
  modalTitle: {
    ...TextStyles.largeTitle,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    ...TextStyles.body,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.border,
  },
  sendButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    ...TextStyles.body,
    color: Colors.text.secondary,
  },
  sendButtonText: {
    ...TextStyles.body,
    color: Colors.text.white,
    fontWeight: '600',
  },
}); 