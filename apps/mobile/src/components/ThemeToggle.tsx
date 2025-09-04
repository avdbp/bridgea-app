import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { colors as defaultColors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  showLabel = true, 
  size = 'medium' 
}) => {
  const theme = useTheme();
  const { isDark, toggleTheme, colors } = theme || { 
    isDark: false, 
    toggleTheme: () => {}, 
    colors: defaultColors 
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          toggle: styles.toggleSmall,
          thumb: styles.thumbSmall,
          icon: styles.iconSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          toggle: styles.toggleLarge,
          thumb: styles.thumbLarge,
          icon: styles.iconLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          toggle: styles.toggleMedium,
          thumb: styles.thumbMedium,
          icon: styles.iconMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <Text style={[styles.label, { color: colors.text }]}>
          Modo Oscuro
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          sizeStyles.toggle,
          { backgroundColor: isDark ? colors.primary : colors.border },
        ]}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <View
          style={[
            sizeStyles.thumb,
            {
              backgroundColor: colors.white,
              transform: [{ translateX: isDark ? 20 : 2 }],
            },
          ]}
        >
          <Text style={sizeStyles.icon}>
            {isDark ? '🌙' : '☀️'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  label: {
    ...typography.body,
    fontWeight: '500',
    marginRight: spacing.sm,
  },
  
  // Small size
  containerSmall: {
    width: 40,
    height: 24,
  },
  
  toggleSmall: {
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  
  thumbSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  iconSmall: {
    fontSize: 10,
  },
  
  // Medium size
  containerMedium: {
    width: 50,
    height: 30,
  },
  
  toggleMedium: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  
  thumbMedium: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  iconMedium: {
    fontSize: 12,
  },
  
  // Large size
  containerLarge: {
    width: 60,
    height: 36,
  },
  
  toggleLarge: {
    width: 60,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  
  thumbLarge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  iconLarge: {
    fontSize: 14,
  },
});
