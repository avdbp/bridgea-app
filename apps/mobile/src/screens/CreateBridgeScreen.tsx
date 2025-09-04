import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useCreateBridge } from '@/hooks/useBridges';
import { uploadMultipleToServer } from '@/services/upload';
import { compressMultipleImages } from '@/services/imageCompression';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Media } from '@/types';

const { width } = Dimensions.get('window');

export const CreateBridgeScreen: React.FC = () => {
  const { mutateAsync: createBridge, isPending: isCreatingBridge } = useCreateBridge();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    content: '',
    tags: '',
    visibility: 'public' as 'public' | 'private' | 'followers',
  });
  
  const [media, setMedia] = useState<Media[]>([]);
  const [location, setLocation] = useState<{ name: string; coordinates?: { lat: number; lng: number } } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length > 2000) {
      newErrors.content = 'Content cannot exceed 2000 characters';
    }

    if (media.length > 10) {
      newErrors.media = 'Maximum 10 media files';
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

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newMedia: Media[] = result.assets.map(asset => ({
          url: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          publicId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          width: asset.width,
          height: asset.height,
          duration: asset.type === 'video' ? (asset.duration || 0) : undefined,
        }));

        setMedia(prev => [...prev, ...newMedia].slice(0, 10));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Could not select image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newMedia: Media[] = result.assets.map(asset => ({
          url: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          publicId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          width: asset.width,
          height: asset.height,
          duration: asset.type === 'video' ? (asset.duration || 0) : undefined,
        }));

        setMedia(prev => [...prev, ...newMedia].slice(0, 10));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Could not take photo');
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddLocation = () => {
    // TODO: Implement location picker
    Alert.alert('Location', 'Location functionality coming soon');
  };

  const handleCreateBridge = async () => {
    if (!validateForm()) return;

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      let uploadedMedia = undefined;
      
      // Si hay media, subir a Cloudinary primero
      if (media.length > 0) {
        console.log('Iniciando subida a Cloudinary...', media);
        
        const mediaToUpload = media.map(item => ({
          uri: item.url,
          type: item.type,
        }));
        
        console.log('Media a subir:', mediaToUpload);
        
        // Comprimir imágenes antes de subir
        console.log('Comprimiendo imágenes...');
        const compressedUris = await compressMultipleImages(
          mediaToUpload.map(item => item.uri),
          {
            maxWidth: 1080,
            maxHeight: 1080,
            quality: 0.8,
            format: 'jpeg'
          }
        );
        
        // Actualizar las URIs con las comprimidas
        const compressedMediaToUpload = mediaToUpload.map((item, index) => ({
          ...item,
          uri: compressedUris[index]
        }));
        
        console.log('Imágenes comprimidas, subiendo a Cloudinary...');
        const cloudinaryResults = await uploadMultipleToServer(compressedMediaToUpload, 'bridge');
        
        console.log('Resultados de Cloudinary:', cloudinaryResults);
        
        uploadedMedia = cloudinaryResults.map((result, index) => ({
          url: result.url,
          type: media[index].type,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          duration: result.duration,
        }));
        
        console.log('Media procesada para el puente:', uploadedMedia);
      }

      await createBridge({
        content: formData.content.trim(),
        media: uploadedMedia,
        tags: tags.length > 0 ? tags : undefined,
        location: location || undefined,
        isPrivate: formData.visibility === 'private',
      });

      // Reset form
      setFormData({
        content: '',
        tags: '',
        visibility: 'public',
      });
      setMedia([]);
      setLocation(null);

      Alert.alert(
        'Bridge Created!',
        'Your bridge has been published successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error creating bridge:', error);
      Alert.alert(
        'Error',
        'Could not create bridge. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderMediaPreview = () => {
    if (media.length === 0) return null;

    return (
      <View style={styles.mediaPreview}>
        <Text style={styles.mediaLabel}>Media ({media.length}/10)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {media.map((item, index) => (
            <View key={index} style={styles.mediaItem}>
              <Image source={{ uri: item.url }} style={styles.mediaImage} />
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => handleRemoveMedia(index)}
              >
                <Text style={styles.removeMediaText}>×</Text>
              </TouchableOpacity>
              {item.type === 'video' && (
                <View style={styles.videoIndicator}>
                  <Text style={styles.videoIcon}>▶️</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
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

            {/* Media Preview */}
            {renderMediaPreview()}

            {/* Media Options */}
            <View style={styles.mediaOptions}>
              <TouchableOpacity
                style={styles.mediaOption}
                onPress={handlePickImage}
              >
                <Text style={styles.mediaIcon}>📷</Text>
                <Text style={styles.mediaText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mediaOption}
                onPress={handleTakePhoto}
              >
                <Text style={styles.mediaIcon}>📸</Text>
                <Text style={styles.mediaText}>Camera</Text>
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
              loading={isCreatingBridge}
              disabled={isCreatingBridge || !formData.content.trim()}
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
  
  mediaPreview: {
    marginVertical: spacing.lg,
  },
  
  mediaLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  
  mediaItem: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  
  mediaImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  removeMediaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  videoIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    padding: 2,
  },
  
  videoIcon: {
    color: colors.white,
    fontSize: 12,
  },
  
  mediaOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.lg,
  },
  
  mediaOption: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    minWidth: 80,
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
    backgroundColor: colors.surface,
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
    color: colors.white,
  },
  
  createButton: {
    marginTop: spacing.xl,
  },
});