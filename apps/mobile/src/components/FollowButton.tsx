import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFollow } from '@/hooks/useFollow';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface FollowButtonProps {
  username: string;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  username,
  size = 'medium',
  style,
}) => {
  const {
    isFollowing,
    followStatus,
    isLoadingStatus,
    isFollowingUser,
    isUnfollowingUser,
    follow,
    unfollow,
  } = useFollow(username);

  const handlePress = async () => {
    try {
      if (isFollowing) {
        await unfollow();
      } else {
        await follow();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const getButtonText = () => {
    if (isLoadingStatus) return '...';
    if (isFollowingUser) return 'Siguiendo...';
    if (isUnfollowingUser) return 'Dejando de seguir...';
    
    if (isFollowing) {
      return 'Siguiendo';
    }
    
    if (followStatus === 'pending') {
      return 'Pendiente';
    }
    
    return 'Seguir';
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (isLoadingStatus || isFollowingUser || isUnfollowingUser) {
      return [...baseStyle, styles.loadingButton];
    }
    
    if (isFollowing) {
      return [...baseStyle, styles.followingButton];
    }
    
    if (followStatus === 'pending') {
      return [...baseStyle, styles.pendingButton];
    }
    
    return [...baseStyle, styles.followButton];
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    if (isLoadingStatus || isFollowingUser || isUnfollowingUser) {
      return [...baseStyle, styles.loadingText];
    }
    
    if (isFollowing) {
      return [...baseStyle, styles.followingText];
    }
    
    if (followStatus === 'pending') {
      return [...baseStyle, styles.pendingText];
    }
    
    return [...baseStyle, styles.followText];
  };

  const isDisabled = isLoadingStatus || isFollowingUser || isUnfollowingUser;

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={isDisabled}
    >
      {isLoadingStatus || isFollowingUser || isUnfollowingUser ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? colors.textSecondary : colors.background}
        />
      ) : (
        <Text style={getTextStyle()}>{getButtonText()}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Sizes
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 80,
  },
  
  medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 100,
  },
  
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minWidth: 120,
  },
  
  // States
  followButton: {
    backgroundColor: colors.primary,
  },
  
  followingButton: {
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  pendingButton: {
    backgroundColor: colors.warning,
  },
  
  loadingButton: {
    backgroundColor: colors.borderLight,
  },
  
  // Text styles
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
  
  smallText: {
    fontSize: typography.fontSize.xs,
  },
  
  mediumText: {
    fontSize: typography.fontSize.sm,
  },
  
  largeText: {
    fontSize: typography.fontSize.base,
  },
  
  // Text colors
  followText: {
    color: colors.background,
  },
  
  followingText: {
    color: colors.text,
  },
  
  pendingText: {
    color: colors.background,
  },
  
  loadingText: {
    color: colors.textSecondary,
  },
});


