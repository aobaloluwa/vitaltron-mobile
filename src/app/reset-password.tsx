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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../components/ui/AppLogo';
import { AppTextInput } from '../components/ui/AppTextInput';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { resetPassword } from '../services/auth';
import { colors } from '../theme';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const emailParam = params.email || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleResetPassword = async () => {
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!code.trim()) {
      setErrorMessage('Please enter the 6-digit reset code.');
      return;
    }
    if (!newPassword || newPassword.length < 12) {
      setErrorMessage('New password must be at least 12 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword,
      });

      Alert.alert(
        'Password Reset!',
        'Your password has been successfully reset. Please log in with your new password.',
        [{ text: 'Log In', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to reset password. Please try again.');
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the code sent to your email along with your new password.
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
              label="Reset Code"
              placeholder="123456"
              iconName="key-outline"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <AppTextInput
              label="New Password"
              placeholder="Min. 6 characters"
              iconName="lock-closed-outline"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
            />

            <PrimaryButton
              title="Reset Password"
              onPress={handleResetPassword}
              loading={loading}
              variant="primary"
              style={styles.submitBtn}
            />
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
  submitBtn: {
    marginTop: 12,
  },
});
