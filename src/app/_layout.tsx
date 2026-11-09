import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
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
      </Stack>
    </SafeAreaProvider>
  );
}
