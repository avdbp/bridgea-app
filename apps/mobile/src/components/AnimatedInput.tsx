import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface AnimatedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: any;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  const labelScale = useSharedValue(1);
  const labelTranslateY = useSharedValue(0);
  const borderColor = useSharedValue(0);

  const animatedLabelStyle = useAnimatedStyle(() => {
    const scale = withSpring(isFocused || hasValue ? 0.8 : 1, {
      damping: 15,
      stiffness: 150,
    });
    
    const translateY = withTiming(isFocused || hasValue ? -20 : 0, {
      duration: 200,
    });

    const color = interpolateColor(
      borderColor.value,
      [0, 1, 2],
      [colors.textSecondary, colors.primary, colors.error]
    );

    return {
      transform: [{ scale }, { translateY }],
      color,
    };
  });

  const animatedBorderStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      borderColor.value,
      [0, 1, 2],
      [colors.border, colors.primary, colors.error]
    );

    return {
      borderColor: color,
    };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    labelScale.value = withSpring(0.8);
    labelTranslateY.value = withTiming(-20);
    borderColor.value = withTiming(1);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!hasValue) {
      labelScale.value = withSpring(1);
      labelTranslateY.value = withTiming(0);
    }
    borderColor.value = withTiming(0);
    onBlur?.(e);
  };

  const handleTextChange = (text: string) => {
    setHasValue(text.length > 0);
    props.onChangeText?.(text);
  };

  const handleLabelPress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.inputContainer, animatedBorderStyle]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <View style={styles.inputWrapper}>
          {label && (
            <TouchableOpacity
              style={styles.labelContainer}
              onPress={handleLabelPress}
              activeOpacity={1}
            >
              <Animated.Text style={[styles.label, animatedLabelStyle]}>
                {label}
              </Animated.Text>
            </TouchableOpacity>
          )}
          
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                color: colors.text,
                fontSize: typography.fontSize.md,
              },
            ]}
            placeholderTextColor={colors.textSecondary}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={handleTextChange}
            {...props}
          />
        </View>
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Animated.View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
  },
  
  leftIcon: {
    marginRight: spacing.sm,
  },
  
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  
  labelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  
  input: {
    paddingTop: spacing.sm,
    paddingBottom: 0,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
  
  rightIcon: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  
  errorContainer: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  
  errorText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
