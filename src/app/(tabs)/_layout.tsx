import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme';
import { FluidGlassTabBar } from '../../components/navigation/FluidGlassTabBar';

export default function TabLayout() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const bottomInset = Math.max(insets.bottom, 8);
  const isIos = Platform.OS === 'ios';

  return (
    <Tabs
      tabBar={isIos ? (props) => <FluidGlassTabBar {...props} /> : undefined}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: [
          styles.tabBar,
          {
            height: 60 + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
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
          tabBarIcon: () => (
            <View style={styles.centerScanBtn}>
              <Ionicons name="scan-outline" size={26} color={colors.white} />
            </View>
          ),
          tabBarLabel: () => null,
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

const createStyles = (colors: any) => StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.softBackground,
    paddingTop: 6,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  centerScanBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});
