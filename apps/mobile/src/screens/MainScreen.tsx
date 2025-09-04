import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

// Import screens
import { HomeScreen } from './HomeScreen';
import { CreateBridgeScreen } from './CreateBridgeScreen';
import { GroupsScreen } from './GroupsScreen';
import { ProfileScreen } from './ProfileScreen';
import { ChatListScreen } from './ChatListScreen';

const Tab = createBottomTabNavigator();

export const MainScreen: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color, fontSize: size }]}>🏠</Text>
          ),
          tabBarLabel: 'Inicio',
        }}
      />
      
      <Tab.Screen
        name="Create"
        component={CreateBridgeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={styles.createButton}>
              <Text style={[styles.createIcon, { fontSize: size }]}>+</Text>
            </View>
          ),
          tabBarLabel: 'Crear',
        }}
      />
      
      <Tab.Screen
        name="Messages"
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color, fontSize: size }]}>💬</Text>
          ),
          tabBarLabel: 'Mensajes',
        }}
      />
      
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color, fontSize: size }]}>👥</Text>
          ),
          tabBarLabel: 'Grupos',
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color, fontSize: size }]}>👤</Text>
          ),
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    height: spacing.tabBarHeight,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  
  tabBarLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
  },
  
  tabBarIcon: {
    marginTop: spacing.xs,
  },
  
  tabIcon: {
    fontSize: 20,
  },
  
  createButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  createIcon: {
    color: colors.background,
    fontWeight: typography.fontWeight.bold,
  },
});
