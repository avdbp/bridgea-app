import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Colors } from '../constants/Colors';
import { TextStyles } from '../constants/Typography';
import notificationService from '../services/notificationService';

interface NotificationStatusProps {
  userId?: string;
}

export default function NotificationStatus({ userId }: NotificationStatusProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
      setHasPermission(false);
    }
  };

  const requestPermission = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        await notificationService.saveTokenToFirestore(userId);
        setHasPermission(true);
      } else {
        setHasPermission(false);
      }
    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.sendLocalNotification({
        title: '🔔 Notificación de prueba',
        body: '¡Las notificaciones están funcionando correctamente!',
        sound: true,
        // No incluir badge para evitar problemas
      });
    } catch (error) {
      console.error('❌ Error enviando notificación de prueba:', error);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Verificando permisos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Feather 
          name={hasPermission ? "bell" : "bell-off"} 
          size={16} 
          color={hasPermission ? Colors.success : Colors.error} 
        />
        <Text style={[styles.text, { color: hasPermission ? Colors.success : Colors.error }]}>
          {hasPermission ? "Notificaciones activadas" : "Notificaciones desactivadas"}
        </Text>
      </View>

      {!hasPermission && userId && (
        <Pressable 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={requestPermission}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Activando..." : "Activar notificaciones"}
          </Text>
        </Pressable>
      )}

      {hasPermission && (
        <Pressable style={styles.testButton} onPress={testNotification}>
          <Text style={styles.testButtonText}>Probar notificación</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginVertical: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  text: {
    ...TextStyles.body,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...TextStyles.body,
    color: Colors.text.white,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    ...TextStyles.body,
    color: Colors.text.white,
    fontWeight: '600',
  },
}); 