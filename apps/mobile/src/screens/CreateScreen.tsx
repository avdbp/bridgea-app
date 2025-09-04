import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useBridges } from '@/hooks/useBridges';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export const CreateScreen: React.FC = () => {
  const { createBridgeMutation } = useBridges();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    content: '',
    tags: '',
    visibility: 'public' as 'public' | 'private' | 'followers',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length > 2000) {
      newErrors.content = 'Content cannot exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCreateBridge = async () => {
    if (!validateForm()) return;

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      await createBridgeMutation.mutateAsync({
        content: formData.content.trim(),
        tags: tags.length > 0 ? tags : undefined,
        visibility: formData.visibility,
      });

      // Reset form
      setFormData({
        content: '',
        tags: '',
        visibility: 'public',
      });

      Alert.alert(
        'Bridge Created!',
        'Your bridge has been published successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Could not create bridge. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleAddMedia = () => {
    // TODO: Implement media picker
    Alert.alert('Media', 'Media functionality coming soon');
  };

  const handleAddLocation = () => {
    // TODO: Implement location picker
    Alert.alert('Location', 'Location functionality coming soon');
  };

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
            <Text style={styles.title}>Create Bridge</Text>
            <Text style={styles.subtitle}>
              Share something with your community
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="What are you thinking?"
              placeholder="Share your thoughts, experiences or special moments..."
              value={formData.content}
              onChangeText={(value) => handleInputChange('content', value)}
              error={errors.content}
              multiline
              numberOfLines={6}
              maxLength={2000}
              required
            />

            <Input
              label="Tags (optional)"
              placeholder="travel, photography, music (separated by commas)"
              value={formData.tags}
              onChangeText={(value) => handleInputChange('tags', value)}
              autoCapitalize="none"
            />

            {/* Media Options */}
            <View style={styles.mediaOptions}>
              <TouchableOpacity
                style={styles.mediaOption}
                onPress={handleAddMedia}
              >
                <Text style={styles.mediaIcon}>📷</Text>
                <Text style={styles.mediaText}>Photo/Video</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mediaOption}
                onPress={handleAddLocation}
              >
                <Text style={styles.mediaIcon}>📍</Text>
                <Text style={styles.mediaText}>Location</Text>
              </TouchableOpacity>
            </View>

            {/* Visibility Options */}
            <View style={styles.visibilitySection}>
              <Text style={styles.visibilityLabel}>Visibility</Text>
              <View style={styles.visibilityOptions}>
                <TouchableOpacity
                  style={[
                    styles.visibilityOption,
                    formData.visibility === 'public' && styles.visibilityOptionActive,
                  ]}
                  onPress={() => handleInputChange('visibility', 'public')}
                >
                  <Text style={[
                    styles.visibilityText,
                    formData.visibility === 'public' && styles.visibilityTextActive,
                  ]}>
                    🌍 Public
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.visibilityOption,
                    formData.visibility === 'followers' && styles.visibilityOptionActive,
                  ]}
                  onPress={() => handleInputChange('visibility', 'followers')}
                >
                  <Text style={[
                    styles.visibilityText,
                    formData.visibility === 'followers' && styles.visibilityTextActive,
                  ]}>
                    👥 Followers
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.visibilityOption,
                    formData.visibility === 'private' && styles.visibilityOptionActive,
                  ]}
                  onPress={() => handleInputChange('visibility', 'private')}
                >
                  <Text style={[
                    styles.visibilityText,
                    formData.visibility === 'private' && styles.visibilityTextActive,
                  ]}>
                    🔒 Private
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Publish Bridge"
              onPress={handleCreateBridge}
              loading={createBridgeMutation.isPending}
              disabled={createBridgeMutation.isPending || !formData.content.trim()}
              fullWidth
              style={styles.createButton}
            />
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
  },
  
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  
  form: {
    flex: 1,
  },
  
  mediaOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.lg,
  },
  
  mediaOption: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.borderRadius.md,
    minWidth: 100,
  },
  
  mediaIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  
  mediaText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  
  visibilitySection: {
    marginVertical: spacing.lg,
  },
  
  visibilityLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  visibilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  visibilityOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  
  visibilityOptionActive: {
    backgroundColor: colors.primary,
  },
  
  visibilityText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  
  visibilityTextActive: {
    color: colors.background,
  },
  
  createButton: {
    marginTop: spacing.xl,
  },
});


