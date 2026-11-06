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
import { registerUser, resendVerification } from '../services/auth';
import { colors } from '../theme';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/welcome');
    }
  };

  const handleRegister = async () => {
    setErrorMessage('');

    const formattedEmail = email.trim().toLowerCase();

    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name.');
      return;
    }
    if (!formattedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }
    if (password.length < 12) {
      setErrorMessage('Password must be at least 12 characters long.');
      return;
    }
    if (!confirmPassword) {
      setErrorMessage('Please confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check and try again.');
      return;
    }

    setLoading(true);
    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();

      await registerUser({
        email: formattedEmail,
        password,
        displayName,
      });

      // Navigate to Email Verification Screen passing the email
      router.push({
        pathname: '/verify-email',
        params: { email: formattedEmail },
      });
    } catch (error: any) {
      const msg = error.message || '';

      if (msg.toLowerCase().includes('already exists')) {
        try {
          // Automatically resend verification code in case they haven't verified
          await resendVerification({ email: formattedEmail });
        } catch {
          // Ignore resend errors
        }

        Alert.alert(
          'Account Exists',
          "An account with this email already exists. If you haven't verified it yet, we have sent a new 6-digit code to your email.",
          [
            {
              text: 'Verify Email',
              onPress: () => {
                router.push({
                  pathname: '/verify-email',
                  params: { email: formattedEmail },
                });
              },
            },
            {
              text: 'Log In Instead',
              onPress: () => router.push('/login'),
            },
          ]
        );
        return;
      }

      setErrorMessage(msg || 'Registration failed. Please try again.');
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Start your journey with a portable, intelligent health identity.
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
            <View style={styles.nameRow}>
              <View style={styles.halfInput}>
                <AppTextInput
                  label="First Name"
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.halfInput}>
                <AppTextInput
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

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
              placeholder="Min. 12 characters"
              iconName="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

            <AppTextInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              iconName="shield-checkmark-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
            />

            <PrimaryButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/login')} hitSlop={8}>
              <Text style={styles.loginText}>Log In</Text>
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
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  submitBtn: {
    marginTop: 12,
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
  loginText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
});
