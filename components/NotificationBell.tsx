import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { TextStyles } from '../constants/Typography';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';

interface NotificationBellProps {
  onPress: () => void;
}

export default function NotificationBell({ onPress }: NotificationBellProps) {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { user } = useAuth();
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (!user) return;

    // Solución temporal: usar getDocs en lugar de onSnapshot para evitar errores de índices
    const fetchUnreadCount = async () => {
      try {
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('recipientId', '==', user.uid),
          where('read', '==', false)
        );
        const snapshot = await getDocs(notificationsQuery);
        const count = snapshot.size;
        setNotificationCount(count);
        setHasUnreadNotifications(count > 0);

        // Animar la campana si hay notificaciones nuevas
        if (count > 0) {
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();

    // Polling cada 5 segundos para actualizaciones
    const interval = setInterval(fetchUnreadCount, 5000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Feather 
          name="bell" 
          size={24} 
          color={Colors.text.primary} 
        />
        {hasUnreadNotifications && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  badgeText: {
    ...TextStyles.caption,
    color: Colors.text.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
}); 