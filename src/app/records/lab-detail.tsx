import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { colors } from '../../theme';

const CHART_YEARS = [
  { year: '2020', min: 20, max: 55, active: false },
  { year: '2021', min: 30, max: 65, active: false },
  { year: '2022', min: 40, max: 75, active: false },
  { year: '2023', min: 25, max: 95, active: true },
  { year: '2024', min: 35, max: 60, active: false },
];

export default function LabDetailScreen() {
  const params = useLocalSearchParams<{ title?: string; value?: string }>();
  const testTitle = params.title || 'Potassium';
  const [activeFrame, setActiveFrame] = useState('1d');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={colors.darkText} />
          </Pressable>
          <Text style={styles.headerTitle}>{testTitle}</Text>
          <AppLogo size="small" showText={false} />
        </View>

        {/* Range Headline Banner */}
        <View style={styles.rangeBanner}>
          <Text style={styles.rangeSubLabel}>Normal Range</Text>
          <View style={styles.rangeValueRow}>
            <MaterialCommunityIcons name="flask-outline" size={32} color={colors.primary} />
            <Text style={styles.rangeHeadlineText}>4.2 - 4.6 <Text style={styles.rangeUnitText}>mEq/L</Text></Text>
          </View>
          <Text style={styles.dateRangeText}>Jan 2, 2026 - Jan 4, 2027</Text>
        </View>

        {/* Range Candlestick Bar Chart */}
        <View style={styles.chartCard}>
          <View style={styles.candlestickRow}>
            {CHART_YEARS.map((item, idx) => (
              <View key={idx} style={styles.candleColumn}>
                <View style={styles.candleTrack}>
                  <View
                    style={[
                      styles.candleBar,
                      {
                        bottom: `${item.min}%`,
                        height: `${item.max - item.min}%`,
                      },
                      item.active && styles.candleBarActive,
                    ]}
                  />
                </View>
                <Text style={styles.yearText}>{item.year}</Text>
              </View>
            ))}
          </View>

          {/* Timeframe Selector Pills */}
          <View style={styles.timeframeRow}>
            {['1d', '1w', '1m', '1y', 'All'].map((frame) => (
              <Pressable
                key={frame}
                style={[
                  styles.framePill,
                  activeFrame === frame && styles.framePillActive,
                ]}
                onPress={() => setActiveFrame(frame)}
              >
                <Text
                  style={[
                    styles.frameText,
                    activeFrame === frame && styles.frameTextActive,
                  ]}
                >
                  {frame}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Highlights Card */}
        <View style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>Highlights</Text>

          <View style={styles.highlightContentBox}>
            <View style={styles.highlightTopRow}>
              <View style={styles.testBadgeRow}>
                <MaterialCommunityIcons name="flask-outline" size={20} color={colors.primary} />
                <Text style={styles.highlightTestName}>{testTitle}</Text>
              </View>

              <View style={styles.comparisonBox}>
                <View style={styles.compBarRow}>
                  <Text style={styles.compLabel}>Old</Text>
                  <View style={styles.compTrack}>
                    <View style={[styles.compPill, { backgroundColor: '#3B82F6', left: '30%' }]} />
                  </View>
                </View>

                <View style={styles.compBarRow}>
                  <Text style={styles.compLabel}>New</Text>
                  <View style={styles.compTrack}>
                    <View style={[styles.compPill, { backgroundColor: colors.primary, left: '60%' }]} />
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.explanationText}>
              Your latest lab value is higher than your previous result. Please consult your physician during your next visit.
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
    marginBottom: 12,
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
  rangeBanner: {
    marginBottom: 20,
  },
  rangeSubLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  rangeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeHeadlineText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.5,
  },
  rangeUnitText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  dateRangeText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  candlestickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: 20,
  },
  candleColumn: {
    alignItems: 'center',
    flex: 1,
  },
  candleTrack: {
    width: 20,
    height: 150,
    backgroundColor: colors.softBackground,
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  candleBar: {
    position: 'absolute',
    width: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 10,
  },
  candleBarActive: {
    backgroundColor: colors.primary,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 8,
  },
  timeframeRow: {
    flexDirection: 'row',
    backgroundColor: colors.softBackground,
    borderRadius: 16,
    padding: 4,
  },
  framePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  framePillActive: {
    backgroundColor: colors.white,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  frameText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  frameTextActive: {
    color: colors.primary,
  },
  highlightCard: {
    width: '100%',
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
    marginBottom: 12,
  },
  highlightContentBox: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  highlightTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  testBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightTestName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkText,
  },
  comparisonBox: {
    gap: 6,
    width: 120,
  },
  compBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    width: 24,
  },
  compTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.softBackground,
    borderRadius: 3,
    position: 'relative',
  },
  compPill: {
    position: 'absolute',
    width: 10,
    height: 6,
    borderRadius: 3,
  },
  explanationText: {
    fontSize: 13,
    color: colors.darkText,
    lineHeight: 19,
    opacity: 0.8,
  },
});
