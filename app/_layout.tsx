import { Stack } from 'expo-router';
import { useNotifications } from '../hooks/useNotifications';

export default function RootLayout() {
  // Configurar notificaciones para toda la app
  useNotifications();

  return <Stack screenOptions={{ headerShown: false }} />;
}
