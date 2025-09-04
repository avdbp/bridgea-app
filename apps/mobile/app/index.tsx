import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useEffect, useState } from 'react';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Wait for the auth state to be hydrated from storage
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('Auth state changed - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  }, [isAuthenticated, isLoading]);
  
  console.log('Index component - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'isReady:', isReady);
  
  if (!isReady) {
    return null; // or a loading screen
  }
  
  if (isAuthenticated) {
    console.log('Redirecting to /(tabs)');
    return <Redirect href="/(tabs)" />;
  }
  
  console.log('Redirecting to /welcome');
  return <Redirect href="/welcome" />;
}