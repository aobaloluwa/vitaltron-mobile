import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme';
import { FluidGlassTabBar } from '../../components/navigation/FluidGlassTabBar';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <FluidGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={focused ? colors.primary : '#9CA3AF'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Women's Health",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'rose' : 'rose-outline'}
              size={22}
              color={focused ? colors.primary : '#9CA3AF'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: t('scan'),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'scan' : 'scan-outline'}
              size={22}
              color={focused ? colors.primary : '#9CA3AF'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="briefs"
        options={{
          title: t('sharing'),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'share-social' : 'share-social-outline'}
              size={22}
              color={focused ? colors.primary : '#9CA3AF'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={focused ? colors.primary : '#9CA3AF'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
