import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Message, User } from '@/types';

export const useMessages = () => {
  const queryClient = useQueryClient();

  // Get conversations
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiService.getConversations(),
  });

  // Get unread message count
  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
  } = useQuery({
    queryKey: ['unread-message-count'],
    queryFn: () => apiService.getUnreadMessageCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: apiService.sendMessage,
    onSuccess: () => {
      // Invalidate conversations to refresh the list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: apiService.markMessageAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
    },
  });

  // Mark conversation as read mutation
  const markConversationAsReadMutation = useMutation({
    mutationFn: apiService.markConversationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: apiService.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const sendMessage = useCallback((data: {
    recipientId: string;
    content: string;
    media?: {
      url: string;
      type: 'image' | 'video' | 'audio';
      publicId: string;
    };
  }) => {
    return sendMessageMutation.mutateAsync(data);
  }, [sendMessageMutation]);

  const markAsRead = useCallback((messageId: string) => {
    return markAsReadMutation.mutateAsync(messageId);
  }, [markAsReadMutation]);

  const markConversationAsRead = useCallback((userId: string) => {
    return markConversationAsReadMutation.mutateAsync(userId);
  }, [markConversationAsReadMutation]);

  const deleteMessage = useCallback((messageId: string) => {
    return deleteMessageMutation.mutateAsync(messageId);
  }, [deleteMessageMutation]);

  return {
    // Data
    conversations: conversationsData?.conversations || [],
    unreadCount: unreadCountData?.unreadCount || 0,
    
    // Loading states
    isLoadingConversations,
    isSendingMessage: sendMessageMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeletingMessage: deleteMessageMutation.isPending,
    
    // Errors
    conversationsError,
    sendMessageError: sendMessageMutation.error,
    
    // Actions
    sendMessage,
    markAsRead,
    markConversationAsRead,
    deleteMessage,
    refetchConversations,
    refetchUnreadCount,
  };
};

export const useConversation = (userId: string) => {
  const queryClient = useQueryClient();

  // Get conversation messages
  const {
    data: conversationData,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['conversation', userId],
    queryFn: ({ pageParam = 1 }) => apiService.getConversation(userId, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Listen for new messages in real-time
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail;
      if (message.sender._id === userId || message.recipient._id === userId) {
        // Invalidate conversation to refresh messages
        queryClient.invalidateQueries({ queryKey: ['conversation', userId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('new-message', handleNewMessage as EventListener);
      return () => {
        window.removeEventListener('new-message', handleNewMessage as EventListener);
      };
    }
  }, [userId, queryClient]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: apiService.sendMessage,
    onSuccess: () => {
      // Invalidate conversation messages
      queryClient.invalidateQueries({ queryKey: ['conversation', userId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Mark conversation as read mutation
  const markConversationAsReadMutation = useMutation({
    mutationFn: apiService.markConversationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', userId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const sendMessage = useCallback((data: {
    recipientId: string;
    content: string;
    media?: {
      url: string;
      type: 'image' | 'video' | 'audio';
      publicId: string;
    };
  }) => {
    return sendMessageMutation.mutateAsync(data);
  }, [sendMessageMutation]);

  const markConversationAsRead = useCallback(() => {
    return markConversationAsReadMutation.mutateAsync(userId);
  }, [markConversationAsReadMutation, userId]);

  const loadMoreMessages = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten messages from all pages
  const messages = conversationData?.pages.flatMap(page => page.messages) || [];

  return {
    // Data
    messages,
    
    // Loading states
    isLoadingMessages,
    isSendingMessage: sendMessageMutation.isPending,
    isMarkingAsRead: markConversationAsReadMutation.isPending,
    isFetchingNextPage,
    hasNextPage,
    
    // Errors
    messagesError,
    sendMessageError: sendMessageMutation.error,
    
    // Actions
    sendMessage,
    markConversationAsRead,
    loadMoreMessages,
    refetchMessages,
  };
};

export const useTypingIndicator = () => {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const startTyping = useCallback((conversationId: string, recipientId: string) => {
    // This would be implemented with Socket.IO
    // socket.emit('typing-start', { conversationId, recipientId });
  }, []);

  const stopTyping = useCallback((conversationId: string, recipientId: string) => {
    // This would be implemented with Socket.IO
    // socket.emit('typing-stop', { conversationId, recipientId });
  }, []);

  const addTypingUser = useCallback((userId: string) => {
    setTypingUsers(prev => new Set(prev).add(userId));
  }, []);

  const removeTypingUser = useCallback((userId: string) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  return {
    typingUsers: Array.from(typingUsers),
    startTyping,
    stopTyping,
    addTypingUser,
    removeTypingUser,
  };
};

