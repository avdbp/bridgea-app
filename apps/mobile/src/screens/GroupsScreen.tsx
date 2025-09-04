import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export const GroupsScreen: React.FC = () => {
  const [groups] = useState([
    {
      id: '1',
      name: 'Desarrolladores React Native',
      description: 'Comunidad de desarrolladores de React Native',
      memberCount: 245,
      isJoined: true,
    },
    {
      id: '2',
      name: 'Diseño UX/UI',
      description: 'Comparte tus diseños y obtén feedback',
      memberCount: 189,
      isJoined: false,
    },
    {
      id: '3',
      name: 'Emprendedores Tech',
      description: 'Conecta con otros emprendedores del sector tecnológico',
      memberCount: 156,
      isJoined: true,
    },
  ]);

  const handleCreateGroup = () => {
    Alert.alert(
      'Crear Grupo',
      'Esta funcionalidad estará disponible próximamente.',
      [{ text: 'OK' }]
    );
  };

  const handleJoinGroup = (groupId: string) => {
    Alert.alert(
      'Unirse al Grupo',
      'Esta funcionalidad estará disponible próximamente.',
      [{ text: 'OK' }]
    );
  };

  const handleLeaveGroup = (groupId: string) => {
    Alert.alert(
      'Abandonar Grupo',
      '¿Estás seguro de que quieres abandonar este grupo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abandonar', style: 'destructive' }
      ]
    );
  };

  const handleGroupPress = (groupId: string) => {
    Alert.alert(
      'Ver Grupo',
      'Esta funcionalidad estará disponible próximamente.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Grupos</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateGroup}
          >
            <Text style={styles.createButtonText}>Crear</Text>
          </TouchableOpacity>
        </View>

        {/* My Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Grupos</Text>
          
          {groups.filter(group => group.isJoined).length > 0 ? (
            groups
              .filter(group => group.isJoined)
              .map(group => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupCard}
                  onPress={() => handleGroupPress(group.id)}
                >
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupDescription}>{group.description}</Text>
                    <Text style={styles.groupMembers}>
                      {group.memberCount} miembros
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.leaveButton}
                    onPress={() => handleLeaveGroup(group.id)}
                  >
                    <Text style={styles.leaveButtonText}>Abandonar</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>👥</Text>
              <Text style={styles.emptyStateTitle}>No estás en ningún grupo</Text>
              <Text style={styles.emptyStateText}>
                Únete a grupos para conectar con personas que comparten tus intereses
              </Text>
            </View>
          )}
        </View>

        {/* Discover Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descubrir Grupos</Text>
          
          {groups
            .filter(group => !group.isJoined)
            .map(group => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => handleGroupPress(group.id)}
              >
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupDescription}>{group.description}</Text>
                  <Text style={styles.groupMembers}>
                    {group.memberCount} miembros
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinGroup(group.id)}
                >
                  <Text style={styles.joinButtonText}>Unirse</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
        </View>

        {/* Coming Soon */}
        <View style={styles.comingSoonSection}>
          <Text style={styles.comingSoonIcon}>🚀</Text>
          <Text style={styles.comingSoonTitle}>Próximamente</Text>
          <Text style={styles.comingSoonText}>
            • Crear y gestionar grupos{'\n'}
            • Chat grupal{'\n'}
            • Eventos y reuniones{'\n'}
            • Moderación avanzada
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollContent: {
    flexGrow: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
  },
  
  createButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
  },
  
  section: {
    marginTop: spacing.lg,
  },
  
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  groupInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  
  groupName: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  
  groupDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  
  groupMembers: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
  
  joinButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  
  leaveButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
  
  leaveButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  comingSoonSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.md,
  },
  
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  
  comingSoonTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  
  comingSoonText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});