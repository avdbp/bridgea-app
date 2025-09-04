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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers and underscores';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website URL must start with http:// or https://';
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
      Alert.alert('Error', 'Could not select image');
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
          'Profile Updated',
          'Your profile has been updated successfully.'
        );
      }, 100);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        error?.message || 'Could not update profile. Please try again.'
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          style={styles.scrollView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Edit Profile</Text>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
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
              label="First Name"
              placeholder="Your first name"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              error={errors.firstName}
              required
            />

            <Input
              label="Last Name"
              placeholder="Your last name"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              error={errors.lastName}
              required
            />

            <Input
              label="Username"
              placeholder="your_username"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              error={errors.username}
              autoCapitalize="none"
              required
            />

            <Input
              label="Bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              error={errors.bio}
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <Input
              label="Location"
              placeholder="City, Country"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
            />

            <Input
              label="Website"
              placeholder="https://your-website.com"
              value={formData.website}
              onChangeText={(value) => handleInputChange('website', value)}
              error={errors.website}
              autoCapitalize="none"
              keyboardType="default"
            />

            {/* Privacy Settings */}
            <View style={styles.privacySection}>
              <Text style={styles.privacyLabel}>Privacy</Text>
              
              <TouchableOpacity
                style={styles.privacyOption}
                onPress={() => handleInputChange('isPrivate', !formData.isPrivate)}
              >
                <View style={styles.privacyOptionContent}>
                  <View>
                    <Text style={styles.privacyOptionTitle}>Private account</Text>
                    <Text style={styles.privacyOptionDescription}>
                      Only people you approve will be able to see your bridges
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
              <Text style={styles.changePasswordText}>Change password</Text>
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
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
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