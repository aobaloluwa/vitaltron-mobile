import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppLogo } from '../../components/ui/AppLogo';
import { colors } from '../../theme';

export const BIOMETRIC_KEY = '@vitaltron/biometric-login';

export default function PrivacySecurityScreen() {
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(BIOMETRIC_KEY).then(val => {
      if (val === 'true') {
        setBiometricsEnabled(true);
      }
    });
  }, []);

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert('Unavailable', 'Biometrics are not set up or not available on this device.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
      });

      if (result.success) {
        await AsyncStorage.setItem(BIOMETRIC_KEY, 'true');
        setBiometricsEnabled(true);
      }
    } else {
      await AsyncStorage.removeItem(BIOMETRIC_KEY);
      setBiometricsEnabled(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.darkText} />
          </Pressable>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <AppLogo size="small" showText={false} />
        </View>

        {/* Security Shield Hero */}
        <View style={styles.shieldHeroCard}>
          <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
          <Text style={styles.heroTitle}>Encrypted Health Security</Text>
          <Text style={styles.heroSub}>
            Your health records are stored with AES-256 encryption and accessible only by you and clinicians you explicitly authorize.
          </Text>
        </View>

        {/* Security Standards Cards */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Patient Consent First</Text>
              <Text style={styles.infoBody}>No hospital, doctor, or third party can access your health passport without an active access grant token.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Biometric Authentication</Text>
              <Text style={styles.infoBody}>Require Face ID or Fingerprint when opening the app.</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: colors.softBackground, true: colors.primary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="globe-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>HL7 FHIR International Standard</Text>
              <Text style={styles.infoBody}>Full compliance with international health data exchange protocols across countries and systems.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
  },
  shieldHeroCard: {
    backgroundColor: colors.softBackground,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 10,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: colors.darkText,
    textAlign: 'center',
    lineHeight: 19,
    opacity: 0.8,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.softBackground,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 2,
  },
  infoBody: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.softBackground,
    marginVertical: 4,
  },
});
