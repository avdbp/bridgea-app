import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize notifications inside QueryClientProvider
  useNotifications();
  
  return <>{children}</>;
};
