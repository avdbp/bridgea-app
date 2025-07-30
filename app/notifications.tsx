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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
  uniqueKey?: string; // Key única para evitar duplicados
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { openMessages, recipientUsername } = useLocalSearchParams<{ 
    openMessages?: string; 
    recipientUsername?: string 
  }>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>(
    openMessages === 'true' ? 'messages' : 'notifications'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);


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

        // Fetch messages (recibidos y enviados)
        const receivedMessagesQuery = query(
          collection(db, 'messages'),
          where('recipientId', '==', user.uid)
        );
        const sentMessagesQuery = query(
          collection(db, 'messages'),
          where('senderId', '==', user.uid)
        );
        
        const [receivedSnapshot, sentSnapshot] = await Promise.all([
          getDocs(receivedMessagesQuery),
          getDocs(sentMessagesQuery)
        ]);

        const receivedMessages = receivedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];

        const sentMessages = sentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];

        // Combinar y ordenar todos los mensajes con keys únicas
        const allMessages = [...receivedMessages, ...sentMessages]
          .map((msg, index) => ({
            ...msg,
            uniqueKey: `${msg.id}_${msg.senderId}_${index}` // Crear key única
          }))
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(0);
            return bTime.getTime() - aTime.getTime();
          });

        setMessages(allMessages);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Polling cada 10 segundos para actualizaciones
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Cargar destinatario automáticamente si se proporciona un username
  useEffect(() => {
    if (recipientUsername && openMessages === 'true') {
      setNewMessageRecipient(recipientUsername);
      setShowNewMessage(true);
    }
  }, [recipientUsername, openMessages]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marcando como leído:', error);
    }
  };

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Buscar usuarios por username (más preciso)
      const usersQuery = query(
        collection(db, 'users'),
        where('username', '>=', searchTerm.toLowerCase()),
        where('username', '<=', searchTerm.toLowerCase() + '\uf8ff')
      );
      
      const userSnapshot = await getDocs(usersQuery);
      const results = userSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((userData: any) => userData.id !== user?.uid) // Excluir al usuario actual
        .slice(0, 10); // Limitar a 10 resultados

      console.log('🔍 Resultados de búsqueda:', results.length);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectUser = (selectedUser: any) => {
    setNewMessageRecipient(selectedUser.username);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const openConversation = async (message: Message) => {
    if (!user) return;
    
    const otherUserId = message.senderId === user.uid ? message.recipientId : message.senderId;
    const otherUserName = message.senderId === user.uid ? message.recipientName : message.senderName;
    
    // Buscar el username del otro usuario
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('__name__', '==', otherUserId)
      );
      const userSnapshot = await getDocs(userQuery);
      const otherUserUsername = userSnapshot.docs[0]?.data()?.username || 'usuario';
      
      router.push({
        pathname: '/conversation',
        params: {
          otherUserId,
          otherUserName,
          otherUserUsername
        }
      });
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      // Navegar con datos básicos si hay error
      router.push({
        pathname: '/conversation',
        params: {
          otherUserId,
          otherUserName,
          otherUserUsername: 'usuario'
        }
      });
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
      setShowSearchResults(false);
      setSearchResults([]);
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
    <Pressable 
      key={item.uniqueKey || item.id}
      style={[styles.messageItem, !item.read && styles.unreadItem]}
      onPress={() => openConversation(item)}
    >
      <View style={styles.messageHeader}>
        <Text style={styles.messageSender}>
          {item.senderId === user?.uid ? 'Tú' : item.senderName}
        </Text>
        <Text style={styles.messageTime}>
          {item.createdAt?.toDate?.().toLocaleDateString() || 'Ahora'}
        </Text>
      </View>
      <Text style={styles.messageContent}>{item.content}</Text>
      <View style={styles.messageDirection}>
        <Text style={styles.messageDirectionText}>
          {item.senderId === user?.uid ? 'Enviado' : 'Recibido'}
        </Text>
      </View>
      {!item.read && item.senderId !== user?.uid && <View style={styles.unreadDot} />}
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
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Nuevo Mensaje</Text>
                
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Buscar usuario (@username o nombre)"
                    value={newMessageRecipient}
                    onChangeText={(text) => {
                      setNewMessageRecipient(text);
                      searchUsers(text);
                    }}
                    placeholderTextColor={Colors.text.light}
                  />
                  {isSearching && (
                    <View style={styles.searchingIndicator}>
                      <Text style={styles.searchingText}>Buscando...</Text>
                    </View>
                  )}
                  
                  {showSearchResults && searchResults.length > 0 && (
                    <View style={styles.searchResults}>
                      {searchResults.map((user) => (
                        <Pressable
                          key={user.id}
                          style={styles.searchResultItem}
                          onPress={() => selectUser(user)}
                        >
                          <View style={styles.userInfo}>
                            <Text style={styles.username}>@{user.username}</Text>
                            <Text style={styles.userName}>{user.name}</Text>
                          </View>
                          <Feather name="chevron-right" size={16} color={Colors.text.light} />
                        </Pressable>
                      ))}
                    </View>
                  )}
                  
                  {showSearchResults && searchResults.length === 0 && newMessageRecipient.length >= 2 && (
                    <View style={styles.noResults}>
                      <Text style={styles.noResultsText}>No se encontraron usuarios</Text>
                    </View>
                  )}
                </View>
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Mensaje..."
                  value={newMessageContent}
                  onChangeText={setNewMessageContent}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={Colors.text.light}
                  textAlignVertical="top"
                />
                <View style={styles.modalButtons}>
                  <Pressable 
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setShowNewMessage(false);
                      setShowSearchResults(false);
                      setSearchResults([]);
                    }}
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
            </ScrollView>
          </KeyboardAvoidingView>
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
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchingIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  searchingText: {
    ...TextStyles.caption,
    color: Colors.text.light,
  },
  searchResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...TextStyles.body,
    fontWeight: '600',
    color: Colors.primary,
  },
  userName: {
    ...TextStyles.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  noResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    zIndex: 1000,
  },
  noResultsText: {
    ...TextStyles.body,
    color: Colors.text.light,
    textAlign: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  messageDirection: {
    marginTop: 4,
  },
  messageDirectionText: {
    ...TextStyles.caption,
    color: Colors.text.light,
    fontSize: 10,
  },

}); 