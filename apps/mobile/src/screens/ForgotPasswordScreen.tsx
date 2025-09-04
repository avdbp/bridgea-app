import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '@/services/api';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'El correo electrónico es obligatorio');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    try {
      await apiService.forgotPassword(email.trim());
      Alert.alert(
        'Enlace Enviado',
        'Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar el enlace de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar Contraseña</Text>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
        <View style={styles.formSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔐</Text>
          </View>

          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitle}>
            No te preocupes, te enviaremos un enlace para restablecer tu contraseña a tu correo electrónico.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSendResetLink}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={styles.sendButtonText}>Enviar Enlace</Text>
            )}
          </TouchableOpacity>

          <View style={styles.helpSection}>
            <Text style={styles.helpText}>
              ¿Recordaste tu contraseña?
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
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
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  backButton: {
    marginRight: spacing.md,
  },
  
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
  },
  
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  
  content: {
    flex: 1,
  },
  
  formSection: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing['2xl'],
  },
  
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  icon: {
    fontSize: 64,
  },
  
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing['2xl'],
  },
  
  inputGroup: {
    marginBottom: spacing.xl,
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  
  input: {
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  
  sendButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  
  helpSection: {
    alignItems: 'center',
  },
  
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  
  loginLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});


