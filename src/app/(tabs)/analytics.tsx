import React, { useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { colors } from '../../theme';

const CHART_DATA = [
  { day: 'Mon', value: 44, heightPercent: 44 },
  { day: 'Tue', value: 34, heightPercent: 34 },
  { day: 'Wed', value: 110, heightPercent: 95, active: true },
  { day: 'Thu', value: 47, heightPercent: 47 },
  { day: 'Fri', value: 32, heightPercent: 32 },
  { day: 'Sat', value: 79, heightPercent: 79 },
  { day: 'Sun', value: 24, heightPercent: 24 },
];

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    void fetchAnalytics();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.darkText} />
          </Pressable>
          <Text style={styles.headerTitle}>Statistics</Text>
          <Pressable style={styles.iconBtn}>
            <Feather name="more-horizontal" size={22} color={colors.darkText} />
          </Pressable>
        </View>

        {loading ? (
          /* Skeleton Loader */
          <View style={{ gap: 16 }}>
            <SkeletonLoader width="100%" height={260} borderRadius={24} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonLoader width="48%" height={140} borderRadius={20} />
              <SkeletonLoader width="48%" height={140} borderRadius={20} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonLoader width="48%" height={140} borderRadius={20} />
              <SkeletonLoader width="48%" height={140} borderRadius={20} />
            </View>
          </View>
        ) : (
          <>
            {/* Hero Statistic Card */}
            <View style={styles.heroStatCard}>
              <View style={styles.heroTextRow}>
                <View>
                  <Text style={styles.statCategoryLabel}>Daily Vitals & Intake</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.heroValue}>1250</Text>
                    <Text style={styles.heroUnit}>Kcal</Text>
                  </View>
                </View>
                <View style={styles.targetBadge}>
                  <Text style={styles.targetText}>Target: <Text style={styles.targetBold}>1920 Kcal</Text></Text>
                </View>
              </View>

              {/* Bar Chart Container */}
              <View style={styles.chartContainer}>
                <View style={styles.barsRow}>
                  {CHART_DATA.map((item, idx) => (
                    <View key={idx} style={styles.columnContainer}>
                      {/* Percentage Tooltip Badge */}
                      <View
                        style={[
                          styles.tooltipBadge,
                          item.active && styles.tooltipBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tooltipText,
                            item.active && styles.tooltipTextActive,
                          ]}
                        >
                          {item.value}%
                        </Text>
                      </View>

                      {/* Vertical Bar Stack */}
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { height: `${item.heightPercent}%` },
                            item.active && styles.barFillActive,
                          ]}
                        />
                      </View>

                      <Text style={styles.dayLabel}>{item.day}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Health Metrics Grid (2x2) */}
            <View style={styles.vitalsGrid}>
              <View style={styles.vitalCard}>
                <View style={styles.vitalCardHeader}>
                  <View style={[styles.vitalIconBox, { backgroundColor: colors.softBackground }]}>
                    <Ionicons name="fitness-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.vitalCardTitle}>Exercise</Text>
                </View>

                <View style={styles.sparklineBarRow}>
                  <View style={[styles.miniBar, { height: 12 }]} />
                  <View style={[styles.miniBar, { height: 20 }]} />
                  <View style={[styles.miniBarActive, { height: 28 }]} />
                  <View style={[styles.miniBar, { height: 16 }]} />
                  <View style={[styles.miniBarActive, { height: 24 }]} />
                </View>

                <Text style={styles.vitalValue}>2.0 <Text style={styles.vitalUnit}>hours</Text></Text>
              </View>

              <View style={styles.vitalCard}>
                <View style={styles.vitalCardHeader}>
                  <View style={[styles.vitalIconBox, { backgroundColor: '#FEE2E2' }]}>
                    <Ionicons name="heart" size={18} color="#EF4444" />
                  </View>
                  <Text style={styles.vitalCardTitle}>BPM</Text>
                </View>

                <View style={styles.ecgWaveContainer}>
                  <Ionicons name="pulse" size={26} color="#EF4444" />
                  <View style={styles.waveLineActive} />
                </View>

                <Text style={styles.vitalValue}>86 <Text style={styles.vitalUnit}>bpm</Text></Text>
              </View>

              <View style={styles.vitalCard}>
                <View style={styles.vitalCardHeader}>
                  <View style={[styles.vitalIconBox, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="scale-outline" size={18} color="#D97706" />
                  </View>
                  <Text style={styles.vitalCardTitle}>Weight</Text>
                </View>

                <View style={styles.weightBarBox}>
                  <View style={styles.weightProgressFill} />
                </View>

                <Text style={styles.vitalValue}>68 <Text style={styles.vitalUnit}>kg</Text></Text>
              </View>

              <View style={styles.vitalCard}>
                <View style={styles.vitalCardHeader}>
                  <View style={[styles.vitalIconBox, { backgroundColor: '#E0F2FE' }]}>
                    <Ionicons name="water-outline" size={18} color="#0284C7" />
                  </View>
                  <Text style={styles.vitalCardTitle}>Water</Text>
                </View>

                <View style={styles.dropsRow}>
                  <Ionicons name="water" size={16} color="#0284C7" />
                  <Ionicons name="water" size={16} color="#0284C7" />
                  <Ionicons name="water" size={16} color="#0284C7" />
                  <Ionicons name="water-outline" size={16} color="#94A3B8" />
                </View>

                <Text style={styles.vitalValue}>12 <Text style={styles.vitalUnit}>glasses</Text></Text>
              </View>
            </View>
          </>
        )}
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
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBtn: {
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
  heroStatCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statCategoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkText,
    opacity: 0.6,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.5,
  },
  heroUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  targetBadge: {
    backgroundColor: colors.softBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  targetText: {
    fontSize: 12,
    color: colors.darkText,
    opacity: 0.8,
  },
  targetBold: {
    fontWeight: '800',
    color: colors.primary,
  },
  chartContainer: {
    marginTop: 8,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
  },
  columnContainer: {
    alignItems: 'center',
    flex: 1,
  },
  tooltipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.softBackground,
    marginBottom: 8,
  },
  tooltipBadgeActive: {
    backgroundColor: colors.primary,
  },
  tooltipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  tooltipTextActive: {
    color: colors.white,
  },
  barTrack: {
    width: 14,
    height: 110,
    backgroundColor: colors.softBackground,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 7,
  },
  barFillActive: {
    backgroundColor: colors.primary,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 8,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  vitalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  vitalIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vitalCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
  },
  sparklineBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 32,
    marginBottom: 12,
  },
  miniBar: {
    width: 6,
    backgroundColor: colors.softBackground,
    borderRadius: 3,
  },
  miniBarActive: {
    width: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  ecgWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    gap: 6,
    marginBottom: 12,
  },
  waveLineActive: {
    flex: 1,
    height: 3,
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },
  weightBarBox: {
    height: 8,
    backgroundColor: colors.softBackground,
    borderRadius: 4,
    marginBottom: 28,
    marginTop: 8,
  },
  weightProgressFill: {
    width: '70%',
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 4,
  },
  dropsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
    marginTop: 8,
  },
  vitalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.darkText,
  },
  vitalUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
