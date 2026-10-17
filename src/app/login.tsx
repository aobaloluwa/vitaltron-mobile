import { FontAwesome } from '@expo/vector-icons';
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
import { apiRequest } from '../services/api';
import { colors, radii, spacing, typography } from '../theme';

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id?: string;
    email?: string;
    emailVerified?: boolean;
  };
  message?: string | string[];
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();

    const cleanEmail = email.trim().toLowerCase();
    let isValid = true;

    setEmailError('');
    setPasswordError('');

    if (!cleanEmail) {
      setEmailError('Please enter your email address.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const response = await apiRequest<LoginResponse>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        },
      );

      if (!response.accessToken || !response.refreshToken) {
        throw new Error('The server returned an unexpected login response.');
      }

      Alert.alert(
        'Login successful',
        'Your credentials have been accepted. Secure session storage is the next step.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/'),
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to log in. Please try again.';

      Alert.alert('Login failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert(
      'Google Sign-In',
      'Google authentication will be connected after the standard login flow is tested.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => router.replace('/')}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <FontAwesome
                name="arrow-left"
                size={18}
                color={colors.text}
              />
            </Pressable>

            <View style={styles.logoMark}>
              <FontAwesome
                name="heart"
                size={18}
                color={colors.primary}
              />
            </View>

            <Text style={styles.brand}>vitaltron</Text>
            <Text style={styles.tagline}>Your health, your hands.</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Sign in to access your personal health records.
            </Text>

            <View style={styles.form}>
              <AppTextInput
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={emailError}
              />

              <AppTextInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={passwordError}
              />

              <Pressable
                onPress={() => router.push('/forgot-password')}
                style={styles.forgotButton}
                accessibilityRole="button"
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              <PrimaryButton
                title="Log in"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                onPress={handleGoogleSignIn}
                style={styles.googleButton}
                accessibilityRole="button"
                disabled={isLoading}
              >
                <FontAwesome
                  name="google"
                  size={19}
                  color="#4285F4"
                />
                <Text style={styles.googleText}>Continue with Google</Text>
              </Pressable>
            </View>

            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>
                Don't have an account?
              </Text>

              <Pressable
                onPress={() => router.push('/register')}
                accessibilityRole="button"
              >
                <Text style={styles.registerLink}> Sign up</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <FontAwesome
              name="lock"
              size={13}
              color={colors.textSecondary}
            />
            <Text style={styles.footerText}>
              Your health information deserves privacy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  brand: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: 3,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.lg,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: spacing.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  googleButton: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.button,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  googleText: {
    color: colors.text,
    fontSize: typography.button,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  registerPrompt: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  registerLink: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: 'auto',
    paddingTop: spacing.xxl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
});