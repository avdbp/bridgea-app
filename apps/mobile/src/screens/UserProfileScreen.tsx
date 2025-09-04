import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { User } from '@/types';

const { width } = Dimensions.get('window');

export const UserProfileScreen: React.FC = () => {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState<'pending' | 'approved' | null>(null);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);

  const loadUserProfile = async () => {
    if (!username) return;

    setIsLoading(true);
    try {
      const [userResponse, followStatusResponse] = await Promise.all([
        apiService.getUser(username),
        apiService.getFollowStatus(username),
      ]);

      setUser(userResponse.user);
      setIsFollowing(followStatusResponse.isFollowing);
      setFollowStatus(followStatusResponse.status);
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil del usuario');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !username) return;

    setIsLoadingFollow(true);
    try {
      if (isFollowing) {
        await apiService.unfollowUser(username);
        setIsFollowing(false);
        setFollowStatus(null);
      } else {
        const response = await apiService.followUser(username);
        setIsFollowing(true);
        setFollowStatus(response.status);
      }
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
      Alert.alert('Error', 'No se pudo realizar la acción');
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleMessage = () => {
    if (!user) return;
    router.push(`/chat/${user._id}`);
  };

  const handleFollowers = () => {
    if (!user) return;
    router.push(`/followers/${user.username}`);
  };

  const handleFollowing = () => {
    if (!user) return;
    router.push(`/following/${user.username}`);
  };

  const getFollowButtonText = () => {
    if (isLoadingFollow) return 'Cargando...';
    if (isFollowing) {
      return followStatus === 'pending' ? 'Solicitado' : 'Siguiendo';
    }
    return 'Seguir';
  };

  const getFollowButtonStyle = () => {
    if (isFollowing) {
      return [styles.followButton, styles.followingButton];
    }
    return [styles.followButton, styles.followButtonActive];
  };

  const getFollowButtonTextStyle = () => {
    if (isFollowing) {
      return [styles.followButtonText, styles.followingButtonText];
    }
    return [styles.followButtonText, styles.followButtonTextActive];
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Usuario no encontrado</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentUser = currentUser?._id === user._id;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>@{user.username}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          {/* Avatar and Banner */}
          <View style={styles.avatarSection}>
            {user.banner && (
              <Image source={{ uri: user.banner }} style={styles.banner} />
            )}
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatarText}>
                    {user.firstName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.fullName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.username}>@{user.username}</Text>
            
            {user.bio && (
              <Text style={styles.bio}>{user.bio}</Text>
            )}
            
            {user.location && (
              <Text style={styles.location}>📍 {user.location}</Text>
            )}

            <View style={styles.statsContainer}>
              <TouchableOpacity style={styles.statItem} onPress={handleFollowers}>
                <Text style={styles.statNumber}>{user.followersCount || 0}</Text>
                <Text style={styles.statLabel}>Seguidores</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.statItem} onPress={handleFollowing}>
                <Text style={styles.statNumber}>{user.followingCount || 0}</Text>
                <Text style={styles.statLabel}>Siguiendo</Text>
              </TouchableOpacity>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.bridgesCount || 0}</Text>
                <Text style={styles.statLabel}>Puentes</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {!isCurrentUser && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={getFollowButtonStyle()}
                onPress={handleFollow}
                disabled={isLoadingFollow}
              >
                <Text style={getFollowButtonTextStyle()}>
                  {getFollowButtonText()}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}
              >
                <Text style={styles.messageButtonText}>Mensaje</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Puentes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Media</Text>
          </TouchableOpacity>
        </View>

        {/* Content Placeholder */}
        <View style={styles.contentPlaceholder}>
          <Text style={styles.placeholderText}>
            Los puentes de @{user.username} aparecerán aquí
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
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
    width: 60, // Same width as back button for centering
  },
  profileSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  banner: {
    width: width - (spacing.md * 2),
    height: 120,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.background,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  avatarText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: 'bold',
  },
  userInfo: {
    marginTop: spacing.lg,
  },
  fullName: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  username: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bio: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  followButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
  },
  followButtonActive: {
    backgroundColor: colors.primary,
  },
  followingButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    ...typography.body,
    fontWeight: 'bold',
  },
  followButtonTextActive: {
    color: colors.white,
  },
  followingButtonText: {
    color: colors.text,
  },
  messageButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  contentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});