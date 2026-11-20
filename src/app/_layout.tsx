import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from '../i18n/LanguageContext';
import { ThemeProvider, useTheme } from '../theme';
import { usePushNotifications } from '../hooks/usePushNotifications';

function AppNavigator() {
  const { colors, isDarkMode } = useTheme();

  // Register and handle push notifications for the entire app
  usePushNotifications();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="records/vital-analytics" />
        <Stack.Screen name="records/lab-results" />
        <Stack.Screen name="records/lab-detail" />
        <Stack.Screen name="records/medication-history" />
        <Stack.Screen name="profile/health-vitals" />
        <Stack.Screen name="profile/health-passport" />
        <Stack.Screen name="profile/dependents" />
        <Stack.Screen name="profile/sharing-preferences" />
        <Stack.Screen name="profile/privacy-security" />
        <Stack.Screen name="profile/support" />
        <Stack.Screen name="profile/feedback" />
        <Stack.Screen name="womens-health/index" />
        <Stack.Screen name="womens-health/cycle/index" />
        <Stack.Screen name="womens-health/cycle/calendar" />
        <Stack.Screen name="womens-health/fertility/index" />
        <Stack.Screen name="womens-health/pregnancy/index" />
        <Stack.Screen name="womens-health/pregnancy/weekly-guide" />
        <Stack.Screen name="womens-health/pregnancy/journal" />
        <Stack.Screen name="womens-health/pregnancy/kick-counter" />
        <Stack.Screen name="womens-health/pregnancy/contraction-timer" />
        <Stack.Screen name="womens-health/postpartum/index" />
        <Stack.Screen name="womens-health/menopause/index" />
        <Stack.Screen name="womens-health/contraception/index" />
        <Stack.Screen name="womens-health/sexual-health/index" />
        <Stack.Screen name="womens-health/symptoms/index" />
        <Stack.Screen name="womens-health/education/index" />
        <Stack.Screen name="womens-health/reminders/index" />
        <Stack.Screen name="womens-health/reports/index" />
        <Stack.Screen name="womens-health/assistant/index" />
        <Stack.Screen name="womens-health/settings" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AppNavigator />
          </ThemeProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
