import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppLogo } from '../components/ui/AppLogo';
import { getStoredAccessToken } from '../services/api';
import { colors } from '../theme';

const ONBOARDING_KEY = '@vitaltron/onboarding-completed';
const BIOMETRIC_KEY = '@vitaltron/biometric-login';

export default function OpenSplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const pulseAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    pulseLoop.start();

    // Destination check & transition timer
    const timer = setTimeout(async () => {
      try {
        const token = await getStoredAccessToken();
        if (token) {
          const biometricEnabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
          if (biometricEnabled === 'true') {
            const result = await LocalAuthentication.authenticateAsync({
              promptMessage: 'Unlock Vitaltron',
              fallbackLabel: 'Use Passcode',
            });
            if (result.success) {
              router.replace('/(tabs)' as any);
            } else {
              // If they fail or cancel, route to login or give an option to retry
              router.replace('/welcome');
            }
          } else {
            router.replace('/(tabs)' as any);
          }
          return;
        }

        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (completed === 'true') {
          router.replace('/welcome');
        } else {
          router.replace('/onboarding');
        }
      } catch {
        router.replace('/onboarding');
      }
    }, 2200);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Background Pulsing Glow Circle */}
      <Animated.View
        style={[
          styles.pulseCircle,
          {
            transform: [{ scale: pulseAnim }],
            opacity: fadeAnim,
          },
        ]}
      />

      {/* Main Animated Branding Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <AppLogo size="large" showText={true} />
        <Text style={styles.tagline}>Portable Intelligent Health Identity</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  pulseCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.softBackground,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.8,
    textAlign: 'center',
    opacity: 0.85,
  },
});
