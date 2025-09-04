import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useConversation } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Message } from '@/types';

const { width } = Dimensions.get('window');

export const ChatScreen: React.FC = () => {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    isLoadingMessages,
    isSendingMessage,
    sendMessage,
    markConversationAsRead,
    loadMoreMessages,
    hasNextPage,
    isFetchingNextPage,
  } = useConversation(userId || '');

  useEffect(() => {
    if (userId) {
      markConversationAsRead();
    }
  }, [userId, markConversationAsRead]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !userId) return;

    try {
      await sendMessage({
        recipientId: userId,
        content: messageText.trim(),
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  const handleSendMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && userId) {
        const asset = result.assets[0];
        await sendMessage({
          recipientId: userId,
          content: '',
          media: {
            url: asset.uri,
            type: asset.type === 'video' ? 'video' : 'image',
            publicId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          },
        });
      }
    } catch (error) {
      console.error('Error sending media:', error);
      Alert.alert('Error', 'Could not send file');
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);
    // TODO: Implement typing indicator with Socket.IO
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.sender._id === currentUser?._id;
    const isLastMessage = index === messages.length - 1;
    const showTime = isLastMessage || 
      (index < messages.length - 1 && 
       new Date(item.createdAt).getTime() - new Date(messages[index + 1].createdAt).getTime() > 300000); // 5 minutes

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          {item.media && (
            <View style={styles.mediaContainer}>
              {item.media.type === 'image' ? (
                <Image source={{ uri: item.media.url }} style={styles.mediaImage} />
              ) : (
                <View style={styles.videoPlaceholder}>
                  <Text style={styles.videoIcon}>🎥</Text>
                  <Text style={styles.videoText}>Video</Text>
                </View>
              )}
            </View>
          )}
          
          {item.content && (
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText
            ]}>
              {item.content}
            </Text>
          )}
          
          {showTime && (
            <Text style={[
              styles.messageTime,
              isCurrentUser ? styles.currentUserTime : styles.otherUserTime
            ]}>
              {formatMessageTime(item.createdAt)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    if (messages.length === 0) return null;
    
    const otherUser = messages.find((m: any) => m.sender._id !== currentUser?._id)?.sender;
    if (!otherUser) return null;

    return (
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {otherUser.avatar ? (
              <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {otherUser.firstName?.[0]?.toUpperCase() || otherUser.username[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {otherUser.firstName} {otherUser.lastName}
            </Text>
            <Text style={styles.userStatus}>Online</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>Start the conversation</Text>
      <Text style={styles.emptySubtitle}>
        Send a message to start chatting
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (isLoadingMessages) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        {renderHeader()}
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.1}
          inverted={false}
        />

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={handleSendMedia}
        >
          <Text style={styles.mediaButtonText}>📷</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          value={messageText}
          onChangeText={handleTyping}
          multiline
          maxLength={1000}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!messageText.trim() || isSendingMessage) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || isSendingMessage}
        >
          {isSendingMessage ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.sendButtonText}>→</Text>
          )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  
  backButtonText: {
    ...typography.h3,
    color: colors.primary,
  },
  
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatarContainer: {
    marginRight: spacing.sm,
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  
  userDetails: {
    flex: 1,
  },
  
  userName: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
  },
  
  userStatus: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  messageContainer: {
    marginVertical: spacing.xs,
  },
  
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  
  currentUserBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  
  otherUserBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  
  mediaContainer: {
    marginBottom: spacing.xs,
  },
  
  mediaImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  
  videoPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  videoIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  
  videoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  messageText: {
    ...typography.body,
    lineHeight: 20,
  },
  
  currentUserText: {
    color: colors.white,
  },
  
  otherUserText: {
    color: colors.text,
  },
  
  messageTime: {
    ...typography.caption,
    marginTop: spacing.xs,
    fontSize: 11,
  },
  
  currentUserTime: {
    color: colors.white,
    opacity: 0.7,
  },
  
  otherUserTime: {
    color: colors.textSecondary,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  
  mediaButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  
  mediaButtonText: {
    fontSize: 20,
  },
  
  textInput: {
    flex: 1,
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  
  sendButtonText: {
    ...typography.h3,
    color: colors.white,
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});