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
import { useTranslation } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>{t('healthAnalytics')}</Text>
        </View>

        {/* Women's Health Hub Banner Card */}
        <Pressable
          style={styles.womensHealthBanner}
          onPress={() => router.push('/womens-health' as any)}
        >
          <View style={styles.bannerRow}>
            <View style={styles.bannerIconBg}>
              <Ionicons name="rose-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTag}>FEATURED MODULE</Text>
              <Text style={styles.bannerTitle}>Women's Health & Wellness</Text>
              <Text style={styles.bannerSub}>
                Cycle, Ovulation, Pregnancy, Kick Counter, Postpartum & Menopause
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </View>
        </Pressable>

        {/* Vital Analytics Card */}
        <Pressable
          style={styles.card}
          onPress={() => router.push('/records/vital-analytics' as any)}
        >
          <View style={styles.cardRow}>
            <View style={[styles.iconBg, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="pulse-outline" size={24} color="#DC2626" />
            </View>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>Vital Signs & Waveforms</Text>
              <Text style={styles.cardSub}>Heart Rate, Blood Pressure & Oxygen Saturation</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </Pressable>

        {/* Reports Card */}
        <Pressable
          style={styles.card}
          onPress={() => router.push('/womens-health/reports' as any)}
        >
          <View style={styles.cardRow}>
            <View style={[styles.iconBg, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="stats-chart-outline" size={24} color="#0284C7" />
            </View>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>Historical Health Trends</Text>
              <Text style={styles.cardSub}>Long-term cycle, BBT & weight reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  headerBar: {
    height: 56,
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.darkText,
  },
  womensHealthBanner: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkText,
    marginTop: 2,
  },
  bannerSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.darkText,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
