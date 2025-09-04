import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { User } from '@/types';

export const EditProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    isPrivate: false,
  });
  
  const [avatar, setAvatar] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        isPrivate: user.isPrivate || false,
      });
      setAvatar(user.avatar || null);
      setBanner(user.banner || null);
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'La biografía no puede exceder 500 caracteres';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'La URL del sitio web debe comenzar con http:// o https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePickImage = async (type: 'avatar' | 'banner') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: type === 'avatar' ? [1, 1] : [3, 1],
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        if (type === 'avatar') {
          setAvatar(asset.uri);
        } else {
          setBanner(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Update profile data
      await apiService.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
        website: formData.website.trim() || undefined,
        isPrivate: formData.isPrivate,
      });

      // Update avatar if changed
      if (avatar && avatar !== user?.avatar) {
        await apiService.updateAvatar({ avatar });
      }

      // Update banner if changed
      if (banner && banner !== user?.banner) {
        await apiService.updateBanner({ banner });
      }

      // Update local user data using updateProfile
      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
        website: formData.website.trim() || undefined,
        isPrivate: formData.isPrivate,
        avatar: avatar || undefined,
        banner: banner || undefined,
      });

      // Navigate back to profile immediately
      router.replace('/(tabs)/profile');
      
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert(
          'Perfil actualizado',
          'Tu perfil ha sido actualizado exitosamente.'
        );
      }, 100);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudo actualizar el perfil. Intenta de nuevo.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    router.push('/change-password');
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Editar Perfil</Text>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Profile Images */}
          <View style={styles.imagesSection}>
            {/* Banner */}
            <View style={styles.bannerContainer}>
              {banner ? (
                <Image source={{ uri: banner }} style={styles.banner} />
              ) : (
                <View style={styles.bannerPlaceholder} />
              )}
              <TouchableOpacity
                style={styles.bannerEditButton}
                onPress={() => handlePickImage('banner')}
              >
                <Text style={styles.editButtonText}>📷</Text>
              </TouchableOpacity>
            </View>

            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {formData.firstName[0]?.toUpperCase() || formData.username[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.avatarEditButton}
                onPress={() => handlePickImage('avatar')}
              >
                <Text style={styles.editButtonText}>📷</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Nombre"
              placeholder="Tu nombre"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              error={errors.firstName}
              required
            />

            <Input
              label="Apellido"
              placeholder="Tu apellido"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              error={errors.lastName}
              required
            />

            <Input
              label="Nombre de usuario"
              placeholder="tu_usuario"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              error={errors.username}
              autoCapitalize="none"
              required
            />

            <Input
              label="Biografía"
              placeholder="Cuéntanos sobre ti..."
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              error={errors.bio}
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <Input
              label="Ubicación"
              placeholder="Ciudad, País"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
            />

            <Input
              label="Sitio web"
              placeholder="https://tu-sitio.com"
              value={formData.website}
              onChangeText={(value) => handleInputChange('website', value)}
              error={errors.website}
              autoCapitalize="none"
              keyboardType="default"
            />

            {/* Privacy Settings */}
            <View style={styles.privacySection}>
              <Text style={styles.privacyLabel}>Privacidad</Text>
              
              <TouchableOpacity
                style={styles.privacyOption}
                onPress={() => handleInputChange('isPrivate', !formData.isPrivate)}
              >
                <View style={styles.privacyOptionContent}>
                  <View>
                    <Text style={styles.privacyOptionTitle}>Cuenta privada</Text>
                    <Text style={styles.privacyOptionDescription}>
                      Solo las personas que apruebes podrán ver tus puentes
                    </Text>
                  </View>
                  <View style={[
                    styles.toggle,
                    formData.isPrivate && styles.toggleActive
                  ]}>
                    <View style={[
                      styles.toggleThumb,
                      formData.isPrivate && styles.toggleThumbActive
                    ]} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Change Password */}
            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.changePasswordText}>Cambiar contraseña</Text>
              <Text style={styles.changePasswordIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  cancelButton: {
    padding: spacing.sm,
  },
  
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  
  saveButton: {
    padding: spacing.sm,
  },
  
  saveButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  
  imagesSection: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  
  bannerContainer: {
    position: 'relative',
    height: 120,
  },
  
  banner: {
    width: '100%',
    height: '100%',
  },
  
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  
  bannerEditButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarContainer: {
    position: 'absolute',
    bottom: -30,
    left: spacing.md,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.background,
  },
  
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  
  avatarText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: 'bold',
  },
  
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  
  editButtonText: {
    fontSize: 14,
  },
  
  form: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  
  privacySection: {
    marginTop: spacing.lg,
  },
  
  privacyLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  
  privacyOption: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
  },
  
  privacyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  privacyOptionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  
  privacyOptionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  
  toggleActive: {
    backgroundColor: colors.primary,
  },
  
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
  },
  
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  
  changePasswordText: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
  },
  
  changePasswordIcon: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});