import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { colors } from '../../theme';

export default function PrivacySecurityScreen() {
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
              <Text style={styles.infoBody}>Local Face ID and Fingerprint protection prevents unauthorized access if your phone is unlocked.</Text>
            </View>
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
