import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../components/ui/AppLogo';
import { AppTextInput } from '../components/ui/AppTextInput';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { loginUser, resendVerification } from '../services/auth';
import { colors } from '../theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/welcome');
    }
  };

  const handleLogin = async () => {
    setErrorMessage('');

    const formattedEmail = email.trim().toLowerCase();

    if (!formattedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await loginUser({
        email: formattedEmail,
        password,
      });

      // Successful login
      Alert.alert('Success', 'Logged in successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/welcome'),
        },
      ]);
    } catch (error: any) {
      const msg = (error.message || '').toString();
      const lowerMsg = msg.toLowerCase();

      // If account is unverified, immediately resend code & redirect to verify-email
      if (
        lowerMsg.includes('verify') ||
        lowerMsg.includes('verification') ||
        lowerMsg.includes('unverified')
      ) {
        try {
          await resendVerification({ email: formattedEmail });
        } catch {
          // Ignore resend rate limit error if a code was sent recently
        }

        // Immediately redirect to verify-email screen
        router.push({
          pathname: '/verify-email',
          params: { email: formattedEmail },
        });
        return;
      }

      setErrorMessage(msg || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <Pressable onPress={handleBack} style={styles.backButton} hitSlop={10}>
              <Ionicons name="arrow-back" size={24} color={colors.darkText} />
            </Pressable>
            <AppLogo size="small" showText={true} />
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Titles */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage your portable health records securely.
            </Text>
          </View>

          {/* Error Banner */}
          {!!errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.formSection}>
            <AppTextInput
              label="Email Address"
              placeholder="name@example.com"
              iconName="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AppTextInput
              label="Password"
              placeholder="••••••••"
              iconName="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

            {/* Forgot Password Link */}
            <Pressable
              onPress={() => router.push('/forgot-password')}
              style={styles.forgotPassWrapper}
            >
              <Text style={styles.forgotPassText}>Forgot password?</Text>
            </Pressable>

            {/* Submit Button */}
            <PrimaryButton
              title="Log In"
              onPress={handleLogin}
              loading={loading}
              variant="primary"
              style={styles.submitBtn}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In */}
          <Pressable
            style={styles.googleBtn}
            onPress={() => Alert.alert('Google Sign-In', 'Google Sign-In integration ready.')}
          >
            <Ionicons name="logo-google" size={20} color={colors.primary} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </Pressable>

          {/* Footer Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/register')} hitSlop={8}>
              <Text style={styles.signupText}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.darkText,
    opacity: 0.7,
    lineHeight: 22,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    marginBottom: 18,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
  formSection: {
    width: '100%',
  },
  forgotPassWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotPassText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  submitBtn: {
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  googleBtn: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
