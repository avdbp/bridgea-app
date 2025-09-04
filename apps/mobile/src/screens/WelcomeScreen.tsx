import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

const { width, height } = Dimensions.get('window');

export const WelcomeScreen: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Logo size={80} />
            </View>
            <Text style={styles.appName}>Bridgea</Text>
            <Text style={styles.tagline}>
              Connect, share and build bridges between people
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureText}>Share moments</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureText}>Connect with friends</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>💬</Text>
              <Text style={styles.featureText}>Instant messaging</Text>
            </View>
          </View>

          {/* Buttons Section */}
          <View style={styles.buttonsSection}>
            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="secondary"
              size="large"
              fullWidth
              style={styles.loginButton}
            />
            
            <Button
              title="Create Account"
              onPress={handleRegister}
              variant="primary"
              size="large"
              fullWidth
              style={styles.registerButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Al continuar, aceptas nuestros{' '}
              <Text style={styles.linkText}>Términos de Servicio</Text>
              {' '}y{' '}
              <Text style={styles.linkText}>Política de Privacidad</Text>
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  gradient: {
    flex: 1,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    justifyContent: 'space-between',
  },
  
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  logoText: {
    fontSize: 60,
  },
  
  appName: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  
  tagline: {
    fontSize: typography.fontSize.lg,
    color: colors.background,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
    paddingHorizontal: spacing.lg,
  },
  
  featuresSection: {
    alignItems: 'center',
    marginVertical: spacing['2xl'],
  },
  
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    width: '100%',
  },
  
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  
  featureText: {
    fontSize: typography.fontSize.base,
    color: colors.background,
    fontWeight: typography.fontWeight.medium,
  },
  
  buttonsSection: {
    marginBottom: spacing['2xl'],
  },
  
  loginButton: {
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  
  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: colors.background,
  },
  
  footer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.background,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: typography.fontWeight.medium,
  },
});

