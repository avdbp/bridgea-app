import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  
  // Use theme colors if available, fallback to default colors
  const currentColors = theme?.colors || colors;
  const styles = createStyles(currentColors);

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Configuración de Privacidad',
      'Esta funcionalidad estará disponible próximamente.',
      [{ text: 'OK' }]
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Configuración de Notificaciones',
      'Esta funcionalidad estará disponible próximamente.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Acerca de Bridgea',
      'Bridgea v1.0.0\n\nUna aplicación para conectar personas a través de puentes digitales.\n\nDesarrollado con ❤️',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Ayuda y Soporte',
      '¿Necesitas ayuda?\n\n• Revisa nuestra documentación\n• Contacta al soporte técnico\n• Reporta un problema',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Force navigation to welcome screen
              setTimeout(() => {
                router.replace('/welcome');
              }, 100);
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    showArrow = true 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingItemContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingItemRight}>
        {rightElement || (showArrow && <Text style={styles.arrow}>›</Text>)}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Configuración</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>@{user?.username}</Text>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          
          <SettingItem
            icon="👤"
            title="Editar Perfil"
            subtitle="Actualiza tu información personal"
            onPress={handleEditProfile}
          />
          
          <SettingItem
            icon="🔒"
            title="Cambiar Contraseña"
            subtitle="Actualiza tu contraseña de seguridad"
            onPress={handleChangePassword}
          />
          
          <SettingItem
            icon="🔐"
            title="Privacidad"
            subtitle="Controla quién puede ver tu contenido"
            onPress={handlePrivacySettings}
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplicación</Text>
          
          <SettingItem
            icon="🔔"
            title="Notificaciones"
            subtitle="Gestiona tus notificaciones"
            onPress={handleNotificationSettings}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
            showArrow={false}
          />
          
          <SettingItem
            icon="🌙"
            title="Modo Oscuro"
            subtitle="Cambia el tema de la aplicación"
            rightElement={<ThemeToggle showLabel={false} size="small" />}
            showArrow={false}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          
          <SettingItem
            icon="❓"
            title="Ayuda"
            subtitle="Obtén ayuda y soporte"
            onPress={handleHelp}
          />
          
          <SettingItem
            icon="ℹ️"
            title="Acerca de"
            subtitle="Información de la aplicación"
            onPress={handleAbout}
          />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <SettingItem
            icon="🚪"
            title="Cerrar Sesión"
            subtitle="Salir de tu cuenta"
            onPress={handleLogout}
            showArrow={false}
          />
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Bridgea v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollContent: {
    flexGrow: 1,
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
    padding: spacing.sm,
  },
  
  backButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  
  headerSpacer: {
    width: 60,
  },
  
  userSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  userInfo: {
    alignItems: 'center',
  },
  
  userName: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
  },
  
  section: {
    marginTop: spacing.lg,
  },
  
  sectionTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  settingIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  
  settingItemContent: {
    flex: 1,
  },
  
  settingTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  
  settingSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  settingItemRight: {
    marginLeft: spacing.sm,
  },
  
  arrow: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  
  versionSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  
  versionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});