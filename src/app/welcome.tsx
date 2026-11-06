import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../components/ui/AppLogo';
import { WelcomeHeroIllustration } from '../components/illustrations/WelcomeHeroIllustration';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { colors } from '../theme';

export default function WelcomeScreen() {
  const handleAccessAccount = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <AppLogo size="small" showText={true} />

        <Pressable style={styles.languagePill}>
          <Ionicons name="globe-outline" size={14} color={colors.darkText} />
          <Text style={styles.languageText}>English</Text>
        </Pressable>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Illustration Banner */}
        <View style={styles.illustrationBox}>
          <WelcomeHeroIllustration />
        </View>

        {/* Text Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to Vitaltron!</Text>
          <Text style={styles.subtitle}>
            The ultimate platform for making your personal health identity portable,
            secure, and accessible anywhere.
          </Text>

          {/* Indicator Dots */}

        </View>

        {/* Buttons Section */}
        <View style={styles.actionContainer}>
          <PrimaryButton
            title="Access Your Account"
            onPress={handleAccessAccount}
            variant="primary"
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={handleSignup} hitSlop={8}>
              <Text style={styles.signupText}>Signup</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerBar: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.softBackground,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.darkText,
    opacity: 0.8,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 24,
    paddingTop: 12,
  },
  illustrationBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 280,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.darkText,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.darkText,
    textAlign: 'center',
    lineHeight: 21,
    opacity: 0.68,
    maxWidth: 320,
    marginBottom: 20,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  indicatorBar: {
    height: 8,
    borderRadius: 4,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionContainer: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.darkText,
    opacity: 0.7,
  },
  signupText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
});
