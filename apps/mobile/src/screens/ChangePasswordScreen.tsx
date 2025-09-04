import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiService } from '@/services/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export const ChangePasswordScreen: React.FC = () => {
  const router = useRouter();
  const [isChanging, setIsChanging] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
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

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsChanging(true);
    try {
      await apiService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      Alert.alert(
        'Contraseña actualizada',
        'Tu contraseña ha sido cambiada exitosamente.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
              router.back();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error changing password:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.'
      );
    } finally {
      setIsChanging(false);
    }
  };

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
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
            
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.infoSection}>
              <Text style={styles.infoIcon}>🔒</Text>
              <Text style={styles.infoTitle}>Seguridad de tu cuenta</Text>
              <Text style={styles.infoText}>
                Cambia tu contraseña para mantener tu cuenta segura. 
                Asegúrate de usar una contraseña fuerte y única.
              </Text>
            </View>

            <Input
              label="Contraseña actual"
              placeholder="Ingresa tu contraseña actual"
              value={formData.currentPassword}
              onChangeText={(value) => handleInputChange('currentPassword', value)}
              error={errors.currentPassword}
              secureTextEntry={!showPasswords.current}
              rightIcon={
                <TouchableOpacity
                  onPress={() => togglePasswordVisibility('current')}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              }
              required
            />

            <Input
              label="Nueva contraseña"
              placeholder="Ingresa tu nueva contraseña"
              value={formData.newPassword}
              onChangeText={(value) => handleInputChange('newPassword', value)}
              error={errors.newPassword}
              secureTextEntry={!showPasswords.new}
              rightIcon={
                <TouchableOpacity
                  onPress={() => togglePasswordVisibility('new')}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              }
              required
            />

            <Input
              label="Confirmar nueva contraseña"
              placeholder="Confirma tu nueva contraseña"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              error={errors.confirmPassword}
              secureTextEntry={!showPasswords.confirm}
              rightIcon={
                <TouchableOpacity
                  onPress={() => togglePasswordVisibility('confirm')}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              }
              required
            />

            {/* Password Requirements */}
            <View style={styles.requirementsSection}>
              <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
              <View style={styles.requirementsList}>
                <View style={styles.requirementItem}>
                  <Text style={[
                    styles.requirementText,
                    formData.newPassword.length >= 8 && styles.requirementMet
                  ]}>
                    {formData.newPassword.length >= 8 ? '✅' : '❌'} Al menos 8 caracteres
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text style={[
                    styles.requirementText,
                    /(?=.*[a-z])/.test(formData.newPassword) && styles.requirementMet
                  ]}>
                    {/(?=.*[a-z])/.test(formData.newPassword) ? '✅' : '❌'} Una letra minúscula
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text style={[
                    styles.requirementText,
                    /(?=.*[A-Z])/.test(formData.newPassword) && styles.requirementMet
                  ]}>
                    {/(?=.*[A-Z])/.test(formData.newPassword) ? '✅' : '❌'} Una letra mayúscula
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text style={[
                    styles.requirementText,
                    /(?=.*\d)/.test(formData.newPassword) && styles.requirementMet
                  ]}>
                    {/(?=.*\d)/.test(formData.newPassword) ? '✅' : '❌'} Un número
                  </Text>
                </View>
              </View>
            </View>

            <Button
              title="Cambiar Contraseña"
              onPress={handleChangePassword}
              loading={isChanging}
              disabled={isChanging || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
              fullWidth
              style={styles.changeButton}
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
  
  form: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  
  infoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  
  infoIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  
  infoTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  eyeButton: {
    padding: spacing.sm,
  },
  
  eyeButtonText: {
    fontSize: 16,
  },
  
  requirementsSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  requirementsTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  
  requirementsList: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
  },
  
  requirementItem: {
    marginBottom: spacing.xs,
  },
  
  requirementText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  requirementMet: {
    color: colors.success,
  },
  
  changeButton: {
    marginTop: spacing.lg,
  },
});