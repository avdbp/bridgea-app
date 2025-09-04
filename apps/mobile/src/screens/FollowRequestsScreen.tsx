import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { User } from '@/types';

interface FollowRequestUser extends User {
  requestedAt?: string;
}

export const FollowRequestsScreen: React.FC = () => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState<FollowRequestUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadFollowRequests();
  }, []);

  const loadFollowRequests = async (pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await apiService.getFollowRequests(pageNum, 20);
      const newRequests = response.requests || [];
      
      if (append) {
        setRequests(prev => [...prev, ...newRequests]);
      } else {
        setRequests(newRequests);
      }
      
      setHasMore(newRequests.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading follow requests:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes de seguimiento');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadFollowRequests(page + 1, true);
    }
  };

  const handleUserPress = (userUsername: string) => {
    router.push(`/user/${userUsername}`);
  };

  const handleRespondToRequest = async (username: string, action: 'accept' | 'reject') => {
    try {
      await apiService.respondToFollowRequest(username, action);
      
      // Remove from requests list
      setRequests(prev => prev.filter(user => user.username !== username));
      
      Alert.alert(
        'Solicitud procesada',
        action === 'accept' 
          ? `Ahora sigues a @${username}` 
          : `Solicitud de @${username} rechazada`
      );
    } catch (error) {
      console.error('Error responding to follow request:', error);
      Alert.alert('Error', 'No se pudo procesar la solicitud');
    }
  };

  const handleAcceptRequest = (username: string) => {
    Alert.alert(
      'Aceptar solicitud',
      `¿Aceptar la solicitud de seguimiento de @${username}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Aceptar', 
          onPress: () => handleRespondToRequest(username, 'accept')
        },
      ]
    );
  };

  const handleRejectRequest = (username: string) => {
    Alert.alert(
      'Rechazar solicitud',
      `¿Rechazar la solicitud de seguimiento de @${username}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Rechazar', 
          style: 'destructive',
          onPress: () => handleRespondToRequest(username, 'reject')
        },
      ]
    );
  };

  const renderRequestItem = ({ item }: { item: FollowRequestUser }) => {
    return (
      <TouchableOpacity
        style={styles.requestItem}
        onPress={() => handleUserPress(item.username)}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>
                  {item.firstName?.[0]?.toUpperCase() || item.username[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.username}>@{item.username}</Text>
            <Text style={styles.fullName}>
              {item.firstName} {item.lastName}
            </Text>
            {item.bio && (
              <Text style={styles.bio} numberOfLines={2}>
                {item.bio}
              </Text>
            )}
            {item.requestedAt && (
              <Text style={styles.requestedAt}>
                Solicitó seguimiento el {new Date(item.requestedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptRequest(item.username)}
          >
            <Text style={styles.acceptButtonText}>Aceptar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleRejectRequest(item.username)}
          >
            <Text style={styles.rejectButtonText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📥</Text>
      <Text style={styles.emptyTitle}>No hay solicitudes pendientes</Text>
      <Text style={styles.emptySubtitle}>
        Cuando alguien quiera seguirte, aparecerá aquí para que puedas aprobarlo.
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando solicitudes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitudes de seguimiento</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    padding: spacing.xs,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  listContainer: {
    flexGrow: 1,
  },
  requestItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    marginRight: spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
  },
  fullName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bio: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  requestedAt: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  acceptButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  rejectButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rejectButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
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