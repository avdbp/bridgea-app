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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { User } from '@/types';

interface FollowingUser extends User {
  followedAt?: string;
}

export const FollowingScreen: React.FC = () => {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadFollowing();
  }, [username]);

  const loadFollowing = async (pageNum: number = 1, append: boolean = false) => {
    if (!username) return;

    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await apiService.getFollowing(username, pageNum, 20);
      const newFollowing = response.following || [];
      
      if (append) {
        setFollowing(prev => [...prev, ...newFollowing]);
      } else {
        setFollowing(newFollowing);
      }
      
      setHasMore(newFollowing.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading following:', error);
      Alert.alert('Error', 'No se pudo cargar la lista de seguidos');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadFollowing(page + 1, true);
    }
  };

  const handleUserPress = (userUsername: string) => {
    router.push(`/user/${userUsername}`);
  };

  const handleUnfollow = async (userId: string, username: string) => {
    Alert.alert(
      'Dejar de seguir',
      `¿Estás seguro de que quieres dejar de seguir a @${username}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Dejar de seguir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.unfollowUser(username);
              
              // Remove from following list
              setFollowing(prev => prev.filter(user => user._id !== userId));
            } catch (error) {
              console.error('Unfollow error:', error);
              Alert.alert('Error', 'No se pudo dejar de seguir al usuario');
            }
          }
        },
      ]
    );
  };

  const renderFollowingItem = ({ item }: { item: FollowingUser }) => {
    const isCurrentUser = currentUser?._id === item._id;
    const isOwnFollowing = username === currentUser?.username;

    return (
      <TouchableOpacity
        style={styles.followingItem}
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
            {item.followedAt && (
              <Text style={styles.followedAt}>
                Seguido desde el {new Date(item.followedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {!isCurrentUser && isOwnFollowing && (
          <TouchableOpacity
            style={styles.unfollowButton}
            onPress={() => handleUnfollow(item._id, item.username)}
          >
            <Text style={styles.unfollowButtonText}>Dejar de seguir</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>👤</Text>
      <Text style={styles.emptyTitle}>No está siguiendo a nadie</Text>
      <Text style={styles.emptySubtitle}>
        {username === currentUser?.username 
          ? '¡Descubre personas interesantes para seguir!'
          : `@${username} aún no está siguiendo a nadie.`
        }
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
          <Text style={styles.loadingText}>Cargando seguidos...</Text>
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
        <Text style={styles.headerTitle}>
          Siguiendo a @{username}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={following}
        renderItem={renderFollowingItem}
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
  followingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  followedAt: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 12,
  },
  unfollowButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unfollowButtonText: {
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