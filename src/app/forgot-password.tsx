
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppTextInput from '../components/ui/AppTextInput';
import PrimaryButton from '../components/ui/PrimaryButton';
import { colors, spacing, typography } from '../theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const handleSendResetLink = () => {
    Keyboard.dismiss();

    if (!email.trim()) {
      Alert.alert('Email required', 'Enter the email address linked to your account.');
      return;
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (!emailIsValid) {
      Alert.alert('Check your email', 'Please enter a valid email address.');
      return;
    }

    Alert.alert(
      'Ready to continue',
      'Your email is valid. Password reset requests will be connected to the Vitaltron API next.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backLink}>‹  Back</Text>
          </Pressable>

          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>v</Text>
            </View>
            <Text style={styles.brandName}>vitaltron</Text>
          </View>

          <View style={styles.illustration}>
            <View style={styles.iconCircle}>
              <Text style={styles.mailIcon}>✉</Text>
              <View style={styles.lockBadge}>
                <Text style={styles.lockIcon}>✓</Text>
              </View>
            </View>
          </View>

          <View style={styles.heading}>
            <Text style={styles.eyebrow}>ACCOUNT RECOVERY</Text>
            <Text style={styles.title}>Forgot your password?</Text>
            <Text style={styles.subtitle}>
              It happens. Enter the email address associated with your account
              and we'll help you get back in.
            </Text>
          </View>

          <View style={styles.form}>
            <AppTextInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="done"
              onSubmitEditing={handleSendResetLink}
            />

            <PrimaryButton
              title="Send reset link"
              onPress={handleSendResetLink}
              style={styles.submitButton}
            />

            <Pressable
              accessibilityRole="link"
              onPress={() => router.replace('/login')}
              style={styles.loginButton}
            >
              <Text style={styles.loginLink}>Return to log in</Text>
            </Pressable>
          </View>

          <View style={styles.helpNote}>
            <Text style={styles.helpText}>
              For your security, only use a password reset link sent to your
              registered email address.
            </Text>
          </View>

          <Text style={styles.footerNote}>
            Your health information belongs to you.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
  backLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: '700',
  },
  brandName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  illustration: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mailIcon: {
    color: colors.primary,
    fontSize: 47,
    lineHeight: 58,
  },
  lockBadge: {
    position: 'absolute',
    right: 1,
    bottom: 2,
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  heading: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 23,
    marginTop: spacing.md,
  },
  form: {
    gap: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  loginButton: {
    alignSelf: 'center',
    padding: spacing.sm,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  helpNote: {
    backgroundColor: '#F1EEF6',
    borderRadius: 14,
    padding: spacing.lg,
    marginTop: spacing.xxl,
  },
  helpText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
  footerNote: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xxl,
  },
});
