import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';

const ONBOARDING_KEY = '@vitaltron/onboarding-completed';

export default function HomeScreen() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkOnboarding() {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);

        if (!active) return;

        if (completed !== 'true') {
          router.replace('/onboarding');
          return;
        }

        router.replace('/welcome');
      } catch {
        if (active) {
          router.replace('/onboarding');
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    void checkOnboarding();

    return () => {
      active = false;
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checking && <ActivityIndicator size="small" color={colors.text} />}
    </View>
  );
}