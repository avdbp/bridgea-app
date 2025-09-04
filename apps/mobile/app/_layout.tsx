import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store/auth';
import { socketService } from '@/services/socket';
import { NotificationProvider } from '@/components/NotificationProvider';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Connect to socket when authenticated
    if (isAuthenticated) {
      // Add a small delay to ensure the auth state is fully loaded
      const timer = setTimeout(() => {
        socketService.connect();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="search" />
          <Stack.Screen name="user/[username]" />
          <Stack.Screen name="followers/[username]" />
          <Stack.Screen name="following/[username]" />
          <Stack.Screen name="follow-requests" />
          <Stack.Screen name="chat/[userId]" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="change-password" />
          <Stack.Screen name="settings" />
          </Stack>
        </NotificationProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
