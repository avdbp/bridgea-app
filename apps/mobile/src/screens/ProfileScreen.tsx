import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleFollowers = () => {
    router.push(`/followers/${user?.username}`);
  };

  const handleFollowing = () => {
    router.push(`/following/${user?.username}`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          style: 'destructive', 
          onPress: () => {
            logout();
            // Force navigation to welcome screen
            setTimeout(() => {
              router.replace('/welcome');
            }, 100);
          }
        },
      ]
    );
  };

  const handleSearch = () => {
    router.push('/search');
  };

  const handleFollowRequests = () => {
    router.push('/follow-requests');
  };

  const menuItems = [
    {
      icon: '🔍',
      title: 'Buscar usuarios',
      onPress: handleSearch,
    },
    {
      icon: '📥',
      title: 'Solicitudes de seguimiento',
      onPress: handleFollowRequests,
    },
    {
      icon: '✏️',
      title: 'Editar perfil',
      onPress: handleEditProfile,
    },
    {
      icon: '👥',
      title: 'Mis seguidores',
      onPress: handleFollowers,
    },
    {
      icon: '👤',
      title: 'Siguiendo',
      onPress: handleFollowing,
    },
    {
      icon: '⚙️',
      title: 'Configuración',
      onPress: handleSettings,
    },
    {
      icon: '❓',
      title: 'Ayuda y soporte',
      onPress: () => Alert.alert('Ayuda', 'Funcionalidad de ayuda próximamente'),
    },
    {
      icon: '📄',
      title: 'Términos y privacidad',
      onPress: () => Alert.alert('Términos', 'Funcionalidad de términos próximamente'),
    },
  ];

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al cargar el perfil</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.firstName[0]}{user.lastName[0]}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.username}>@{user.username}</Text>
          
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
          
          <Text style={styles.location}>📍 {user.location}</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem} onPress={handleFollowers}>
              <Text style={styles.statNumber}>{user.followersCount}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem} onPress={handleFollowing}>
              <Text style={styles.statNumber}>{user.followingCount}</Text>
              <Text style={styles.statLabel}>Siguiendo</Text>
            </TouchableOpacity>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.bridgesCount}</Text>
              <Text style={styles.statLabel}>Puentes</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Bridgea v1.0.0</Text>
          <Text style={styles.appInfoText}>Hecho con ❤️ para conectar personas</Text>
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
  
  scrollContent: {
    paddingBottom: spacing['2xl'],
  },
  
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xl,
  },
  
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarText: {
    color: colors.background,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xl,
  },
  
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  username: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  
  bio: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  
  location: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.lg,
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  editButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.md,
  },
  
  editButtonText: {
    color: colors.background,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.base,
  },
  
  menuSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.screenPadding,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 24,
  },
  
  menuTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  
  menuArrow: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  
  logoutButton: {
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.error,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
  },
  
  logoutButtonText: {
    color: colors.background,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.base,
  },
  
  appInfo: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.screenPadding,
  },
  
  appInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
  },
});
