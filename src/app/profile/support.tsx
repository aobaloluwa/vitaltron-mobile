import React from 'react';
import {
  Alert,
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

export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.darkText} />
          </Pressable>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <AppLogo size="small" showText={false} />
        </View>

        {/* 24/7 Clinical Support Banner */}
        <View style={styles.supportBanner}>
          <Ionicons name="call-outline" size={28} color={colors.white} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>24/7 Clinical Support</Text>
            <Text style={styles.bannerSub}>Need assistance with record ingestion or doctor grants?</Text>
          </View>

          <Pressable
            style={styles.callBtn}
            onPress={() => Alert.alert('Clinical Support Hotline', 'Dialing Vitaltron Support (+1-800-VITALTRON)...')}
          >
            <Text style={styles.callBtnText}>Call Now</Text>
          </Pressable>
        </View>

        {/* FAQ List */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>How does Vitaltron make my records portable?</Text>
            <Text style={styles.faqA}>
              Your health history is converted into international HL7 FHIR standards, allowing doctors anywhere to view your timeline via secure 24-hour access links.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>How does AI document ingestion work?</Text>
            <Text style={styles.faqA}>
              When you photograph paper lab results or upload PDFs, our AI extracts diagnosis titles, dosages, and test readings, flagging details for your review before saving.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>Can I revoke doctor access?</Text>
            <Text style={styles.faqA}>
              Yes! You have full control. Go to 'Sharing Preferences' anytime and tap 'Revoke Access' to immediately cut off access to your records.
            </Text>
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
  supportBanner: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  bannerSub: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  callBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  faqSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  faqQ: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 6,
  },
  faqA: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
});
