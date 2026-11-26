import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { WomensHealthDashboardData } from '../../services/womensHealth';

interface PersonalizedChartsCardProps {
  dashboard: WomensHealthDashboardData | null;
}

export const PersonalizedChartsCard: React.FC<PersonalizedChartsCardProps> = ({ dashboard }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const cycle = dashboard?.cycleMetrics;
  const preg = dashboard?.pregnancyMetrics;
  const insights = dashboard?.symptomInsights;
  const topSymptoms = insights?.topRecentSymptoms || [];

  const currentDay = cycle?.currentCycleDay || 14;
  const totalDays = cycle?.averageCycleLength || 28;
  const cyclePercent = Math.min(100, Math.max(0, Math.round((currentDay / totalDays) * 100)));

  // Clamp pin left position between 2% and 96% to prevent sticking out of card boundaries
  const pinLeftPercent = Math.min(96, Math.max(2, cyclePercent));

  return (
    <View style={styles.card}>
      {/* Header Title */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="stats-chart" size={18} color={colors.primary} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            PERSONALIZED HEALTH CHARTS
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {dashboard?.activeMode || 'MENSTRUAL'}
          </Text>
        </View>
      </View>

      {/* Chart 1: Personal Cycle & Phase Horizon */}
      <View style={styles.chartBlock}>
        <View style={styles.chartBlockHeader}>
          <Text style={styles.chartTitle} numberOfLines={1}>
            1. Personal Cycle Progression
          </Text>
          <Text style={styles.chartValueText}>
            Day {currentDay} of {totalDays}
          </Text>
        </View>

        {/* Multi-Segment Phase Bar Container */}
        <View style={styles.phaseBarContainer}>
          <View style={styles.phaseBarTrack}>
            {/* Menses Segment (~18% of total) */}
            <View style={[styles.phaseSegment, { width: '18%', backgroundColor: '#F43F5E' }]} />
            {/* Follicular Segment (~28% of total) */}
            <View style={[styles.phaseSegment, { width: '28%', backgroundColor: '#3B82F6' }]} />
            {/* Ovulatory Segment (~14% of total) */}
            <View style={[styles.phaseSegment, { width: '14%', backgroundColor: '#EC4899' }]} />
            {/* Luteal Segment (~40% of total) */}
            <View style={[styles.phaseSegment, { width: '40%', backgroundColor: '#8B5CF6' }]} />
          </View>

          {/* Current Day Pointer Pin with transform centering */}
          <View
            style={[
              styles.currentDayPin,
              {
                left: `${pinLeftPercent}%`,
                transform: [{ translateX: -3 }],
              },
            ]}
          />
        </View>

        {/* Phase Legend with FlexWrap for small screens */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#F43F5E' }]} />
            <Text style={styles.legendText}>Menses</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Follicular</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#EC4899' }]} />
            <Text style={styles.legendText}>Ovulation</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.legendText}>Luteal</Text>
          </View>
        </View>
      </View>

      {/* Chart 2: Symptom Frequency Distribution Spectrum */}
      <View style={styles.chartBlock}>
        <View style={styles.chartBlockHeader}>
          <Text style={styles.chartTitle} numberOfLines={1}>
            2. Recent Symptom Spectrum
          </Text>
          <Text style={styles.chartSubText}>Past 14 Days</Text>
        </View>

        {topSymptoms.length === 0 ? (
          <View style={styles.emptyChartBox}>
            <Text style={styles.emptyText}>
              Log daily symptoms to build your personalized frequency chart.
            </Text>
          </View>
        ) : (
          <View style={styles.symptomBarList}>
            {topSymptoms.map((item, idx) => {
              const maxCount = Math.max(...topSymptoms.map((s) => s.count), 1);
              const barPercent = Math.min(100, Math.max(15, Math.round((item.count / maxCount) * 100)));
              const barColors = ['#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#06B6D4'];
              const barColor = barColors[idx % barColors.length];

              return (
                <View key={item.name} style={styles.symptomBarRow}>
                  <Text style={styles.symNameText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.symBarTrack}>
                    <View
                      style={[
                        styles.symBarFill,
                        { width: `${barPercent}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>
                  <Text style={styles.symCountText}>{item.count}x</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Chart 3: Gestational / Fertility Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={styles.metricVal} numberOfLines={1}>
            {cycle?.averageCycleLength || 28} Days
          </Text>
          <Text style={styles.metricLabel} numberOfLines={1}>
            Avg. Cycle
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Ionicons name="water-outline" size={18} color="#F43F5E" />
          <Text style={styles.metricVal} numberOfLines={1}>
            {cycle?.averagePeriodDuration || 5} Days
          </Text>
          <Text style={styles.metricLabel} numberOfLines={1}>
            Period
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Ionicons name="sparkles-outline" size={18} color="#EC4899" />
          <Text style={styles.metricVal} numberOfLines={1}>
            {preg ? `Week ${preg.gestationalAgeWeeks}` : `${cycle?.phaseDisplayName || 'Follicular'}`}
          </Text>
          <Text style={styles.metricLabel} numberOfLines={1}>
            Phase
          </Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderRadius: 22,
      padding: 16,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
      shadowColor: colors.darkText,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
      gap: 8,
    },
    titleGroup: {
      flexShrink: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    badge: {
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      flexShrink: 0,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.darkText,
    },
    chartBlock: {
      marginBottom: 16,
    },
    chartBlockHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      gap: 6,
    },
    chartTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.darkText,
      flexShrink: 1,
    },
    chartValueText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      flexShrink: 0,
    },
    chartSubText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textMuted,
      flexShrink: 0,
    },
    phaseBarContainer: {
      position: 'relative',
      marginVertical: 8,
      justifyContent: 'center',
    },
    phaseBarTrack: {
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.inputBackground,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    phaseSegment: {
      height: '100%',
    },
    currentDayPin: {
      position: 'absolute',
      top: -3,
      width: 6,
      height: 18,
      backgroundColor: colors.darkText,
      borderRadius: 3,
      borderWidth: 1.5,
      borderColor: colors.white,
      zIndex: 10,
    },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 6,
      gap: 6,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
    },
    legendText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textMuted,
    },
    emptyChartBox: {
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      padding: 12,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
      textAlign: 'center',
    },
    symptomBarList: {
      gap: 8,
      marginTop: 4,
    },
    symptomBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    symNameText: {
      width: 75,
      fontSize: 11,
      fontWeight: '700',
      color: colors.darkText,
    },
    symBarTrack: {
      flex: 1,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.inputBackground,
      overflow: 'hidden',
    },
    symBarFill: {
      height: '100%',
      borderRadius: 5,
    },
    symCountText: {
      width: 25,
      fontSize: 11,
      fontWeight: '800',
      color: colors.textMuted,
      textAlign: 'right',
    },
    metricsGrid: {
      flexDirection: 'row',
      gap: 8,
    },
    metricBox: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      padding: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    metricVal: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 4,
      textAlign: 'center',
    },
    metricLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
      textAlign: 'center',
    },
  });
