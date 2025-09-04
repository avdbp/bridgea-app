import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useLikeBridge, useUnlikeBridge } from '@/hooks/useBridges';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Bridge } from '@/types';

interface BridgeCardProps {
  bridge: Bridge;
}

export const BridgeCard: React.FC<BridgeCardProps> = ({ bridge }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(bridge.isLiked || false);
  const [likesCount, setLikesCount] = useState(bridge.likesCount || 0);
  
  const likeBridge = useLikeBridge();
  const unlikeBridge = useUnlikeBridge();

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikeBridge.mutateAsync(bridge._id);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await likeBridge.mutateAsync(bridge._id);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo realizar la acción');
    }
  };

  const handleComment = () => {
    Alert.alert('Comentarios', 'Funcionalidad próximamente');
  };

  const handleShare = () => {
    Alert.alert('Compartir', 'Funcionalidad próximamente');
  };

  const handleUserPress = () => {
    if (bridge.author._id !== user?._id) {
      router.push(`/user/${bridge.author.username}`);
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const bridgeDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - bridgeDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Ahora';
    } else if (diffInHours < 24) {
      return `hace ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `hace ${diffInDays}d`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} onPress={handleUserPress}>
          <View style={styles.avatarContainer}>
            {bridge.author.avatar ? (
              <Image source={{ uri: bridge.author.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {bridge.author.firstName[0]}{bridge.author.lastName[0]}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {bridge.author.firstName} {bridge.author.lastName}
            </Text>
            <Text style={styles.username}>@{bridge.author.username}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.metaInfo}>
          <Text style={styles.timestamp}>{formatDate(bridge.createdAt)}</Text>
          {bridge.isPrivate && (
            <Text style={styles.privateIcon}>🔒</Text>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.bridgeText}>{bridge.content}</Text>
        
        {bridge.media && bridge.media.length > 0 && (
          <View style={styles.mediaContainer}>
            {bridge.media.map((item, index) => (
              <View key={index} style={styles.mediaItem}>
                {item.type === 'image' ? (
                  <Image source={{ uri: item.url }} style={styles.mediaImage} />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Text style={styles.videoIcon}>🎥</Text>
                    <Text style={styles.videoText}>Video</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
        >
          <Text style={[styles.actionIcon, isLiked && styles.actionIconActive]}>
            {isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleComment}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{bridge.commentsCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  avatarContainer: {
    marginRight: spacing.md,
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarText: {
    color: colors.background,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
  },
  
  userDetails: {
    flex: 1,
  },
  
  userName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  
  username: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  metaInfo: {
    alignItems: 'flex-end',
  },
  
  timestamp: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  privateIcon: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  
  content: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
  },
  
  bridgeText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.md,
  },
  
  mediaContainer: {
    gap: spacing.sm,
  },
  
  mediaItem: {
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
  },
  
  mediaImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  videoIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  
  videoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  
  actionIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  
  actionIconActive: {
    // Color is handled by emoji
  },
  
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  
  actionTextActive: {
    color: colors.primary,
  },
});