import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Colors } from '../constants/Colors';
import { TextStyles } from '../constants/Typography';
import { useAuth } from '../hooks/useAuth';

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

interface User {
  id: string;
  username: string;
  name: string;
  photoURL?: string;
}

export default function ConversationScreen() {
  const { user } = useAuth();
  const { otherUserId, otherUserName, otherUserUsername } = useLocalSearchParams<{
    otherUserId: string;
    otherUserName: string;
    otherUserUsername: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user || !otherUserId) return;

          // Usar polling temporal hasta que se configuren los índices
      const fetchMessages = async () => {
        try {
          const query1 = query(
            collection(db, 'messages'),
            where('senderId', '==', user.uid),
            where('recipientId', '==', otherUserId)
          );
          
          const query2 = query(
            collection(db, 'messages'),
            where('senderId', '==', otherUserId),
            where('recipientId', '==', user.uid)
          );

          const [snapshot1, snapshot2] = await Promise.all([
            getDocs(query1),
            getDocs(query2)
          ]);

          const messages1 = snapshot1.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Message[];

          const messages2 = snapshot2.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Message[];

          const conversationMessages = [...messages1, ...messages2]
            .sort((a, b) => {
              const aTime = a.createdAt?.toDate?.() || new Date(0);
              const bTime = b.createdAt?.toDate?.() || new Date(0);
              return aTime.getTime() - bTime.getTime();
            });

          setMessages(conversationMessages);
          setLoading(false);

          // Marcar mensajes como leídos si los recibió el usuario actual
          conversationMessages.forEach((msg) => {
            if (msg.recipientId === user.uid && !msg.read) {
              updateDoc(doc(db, 'messages', msg.id), { read: true });
            }
          });

          // Scroll al final después de un breve delay
          setTimeout(() => {
            if (flatListRef.current && conversationMessages.length > 0) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }, 100);
        } catch (error) {
          console.error('Error cargando conversación:', error);
          setLoading(false);
        }
      };

      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Polling cada 5 segundos

             return () => clearInterval(interval);
  }, [user, otherUserId]);

  const sendMessage = async () => {
    if (!user || !otherUserId || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: user.displayName || 'Usuario',
        recipientId: otherUserId,
        recipientName: otherUserName,
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
        read: false,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.uid;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {item.createdAt?.toDate?.().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) || 'Ahora'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUserName}</Text>
          <Text style={styles.headerUsername}>@{otherUserUsername}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton}>
            <Feather name="phone" size={20} color={Colors.text.primary} />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <Feather name="video" size={20} color={Colors.text.primary} />
          </Pressable>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (flatListRef.current && messages.length > 0) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Inicia la conversación</Text>
              </View>
            ) : null
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Mensaje..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
            placeholderTextColor={Colors.text.light}
          />
          <Pressable 
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Feather 
              name="send" 
              size={20} 
              color={newMessage.trim() ? Colors.text.white : Colors.text.light} 
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    ...TextStyles.cardTitle,
    fontWeight: '600',
  },
  headerUsername: {
    ...TextStyles.caption,
    color: Colors.text.light,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ownMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...TextStyles.body,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.text.white,
  },
  otherMessageText: {
    color: Colors.text.primary,
  },
  messageTime: {
    ...TextStyles.caption,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: Colors.text.white + '80',
  },
  otherMessageTime: {
    color: Colors.text.light,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.text.light,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    minHeight: 40,
    ...TextStyles.body,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
}); 