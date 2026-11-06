import React, { useEffect, useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../components/ui/AppLogo';
import { AppTextInput } from '../components/ui/AppTextInput';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { resendVerification, verifyEmail } from '../services/auth';
import { colors } from '../theme';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const emailParam = params.email || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!code.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail({
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });

      Alert.alert(
        'Email Verified!',
        'Your account has been successfully verified. Please log in.',
        [{ text: 'Log In', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to verify code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email.trim()) return;

    setResending(true);
    setErrorMessage('');
    try {
      await resendVerification({ email: email.trim().toLowerCase() });
      setTimer(60);
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to resend code.');
    } finally {
      setResending(false);
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
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={24} color={colors.darkText} />
            </Pressable>
            <AppLogo size="small" showText={true} />
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Titles */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit verification code to{' '}
              <Text style={styles.emailHighlight}>{email || 'your email'}</Text>.
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
            {!emailParam && (
              <AppTextInput
                label="Email Address"
                placeholder="name@example.com"
                iconName="mail-outline"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}

            <AppTextInput
              label="Verification Code"
              placeholder="123456"
              iconName="key-outline"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <PrimaryButton
              title="Verify Email"
              onPress={handleVerify}
              loading={loading}
              variant="primary"
              style={styles.submitBtn}
            />

            {/* Resend Action */}
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn't receive code? </Text>
              <Pressable onPress={handleResend} disabled={timer > 0 || resending}>
                <Text
                  style={[
                    styles.resendBtnText,
                    timer > 0 && styles.resendBtnDisabled,
                  ]}
                >
                  {resending
                    ? 'Sending...'
                    : timer > 0
                    ? `Resend in ${timer}s`
                    : 'Resend Code'}
                </Text>
              </Pressable>
            </View>
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
  emailHighlight: {
    fontWeight: '700',
    color: colors.primary,
    opacity: 1,
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
  submitBtn: {
    marginTop: 12,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resendLabel: {
    fontSize: 14,
    color: colors.darkText,
    opacity: 0.7,
  },
  resendBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  resendBtnDisabled: {
    color: colors.textMuted,
    fontWeight: '600',
  },
});
