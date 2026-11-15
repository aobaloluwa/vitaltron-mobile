import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppLogo } from '../components/ui/AppLogo';
import { getStoredAccessToken } from '../services/api';
import { useTheme } from '../theme';

const ONBOARDING_KEY = '@vitaltron/onboarding-completed';
const BIOMETRIC_KEY = '@vitaltron/biometric-login';

export default function OpenSplashScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Entrance Animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(12)).current;

  // Exit Animations
  const pageOpacity = useRef(new Animated.Value(1)).current;
  const pageScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance Sequence
    Animated.sequence([
      // Logo fades and gently springs in
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Tagline slides up and fades in
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
    ]).start();

    // 2. Auth Check & Routing logic (run in background)
    const processRouting = async () => {
      let nextRoute: any = '/onboarding';
      try {
        const token = await getStoredAccessToken();
        if (token) {
          const biometricEnabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
          if (biometricEnabled === 'true') {
            try {
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock Vitaltron',
                fallbackLabel: '',
                disableDeviceFallback: true,
              });
              if (result.success) {
                nextRoute = '/(tabs)';
              } else {
                nextRoute = '/welcome';
              }
            } catch (error) {
              nextRoute = '/welcome';
            }
          } else {
            nextRoute = '/(tabs)';
          }
        } else {
          const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
          if (completed === 'true') {
            nextRoute = '/welcome';
          }
        }
      } catch {
        nextRoute = '/onboarding';
      }

      // Wait for reading/animation to feel natural (min time ~1.6s total)
      setTimeout(() => {
        // 3. Exit Animation (Zoom in and Fade out before transitioning)
        Animated.parallel([
          Animated.timing(pageOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
          Animated.timing(pageScale, {
            toValue: 1.1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
        ]).start(() => {
          // Finally execute the route change
          router.replace(nextRoute);
        });
      }, 1600);
    };

    processRouting();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View
        style={[
          styles.pageWrapper,
          {
            opacity: pageOpacity,
            transform: [{ scale: pageScale }],
          },
        ]}
      >
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
            alignItems: 'center',
          }}
        >
          <AppLogo size="large" showText={true} />
        </Animated.View>

        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
            marginTop: 24,
          }}
        >
          <Text style={styles.tagline}>INTELLIGENT HEALTH IDENTITY</Text>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 2.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    width: 220, // Forces the text to wrap tightly under the logo
  },
});
