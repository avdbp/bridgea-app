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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const { register, isRegistering, registerError } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    location: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers and underscores';
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim().toLowerCase(),
        location: formData.location.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      
      Alert.alert(
        'Registration Successful!',
        'Your account has been created successfully. You can now sign in.',
        [
          {
            text: 'OK',
            onPress: () => {
              setTimeout(() => {
                router.replace('/login');
              }, 100);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Registration Error',
        registerError?.message || 'There was an error creating your account. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🌉</Text>
            </View>
            
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Join Bridgea and start connecting
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={styles.nameInput}>
                <Input
                  label="First Name"
                  placeholder="Your first name"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  error={errors.firstName}
                  autoCapitalize="words"
                  required
                />
              </View>
              
              <View style={styles.nameInput}>
                <Input
                  label="Last Name"
                  placeholder="Your last name"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  error={errors.lastName}
                  autoCapitalize="words"
                  required
                />
              </View>
            </View>

            <Input
              label="Email"
              placeholder="your@email.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />

            <Input
              label="Username"
              placeholder="your_username"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              error={errors.username}
              autoCapitalize="none"
              autoCorrect={false}
              required
            />

            <Input
              label="Location"
              placeholder="City, Country"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              error={errors.location}
              autoCapitalize="words"
              required
            />

            <Input
              label="Password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              error={errors.password}
              secureTextEntry
              required
            />

            <Input
              label="Confirm Password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              error={errors.confirmPassword}
              secureTextEntry
              required
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isRegistering}
              disabled={isRegistering}
              fullWidth
              style={styles.registerButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <TouchableOpacity onPress={handleGoToLogin}>
                <Text style={styles.linkText}>Sign in here</Text>
              </TouchableOpacity>
            </Text>
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
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
  },
  
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  
  logoText: {
    fontSize: 40,
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
  
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  nameInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  
  registerButton: {
    marginTop: spacing.lg,
  },
  
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  
  footerText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  linkText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

