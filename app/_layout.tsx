import { Stack } from 'expo-router';
import { useNotifications } from '../hooks/useNotifications';
import { useMessageNotifications } from '../hooks/useMessageNotifications';

export default function RootLayout() {
  // Configurar notificaciones para toda la app
  useNotifications();
  
  // Configurar notificaciones de mensajes en segundo plano
  useMessageNotifications();

  return <Stack screenOptions={{ headerShown: false }} />;
}
