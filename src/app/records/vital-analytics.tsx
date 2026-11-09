import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { colors } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 72;
const CHART_HEIGHT = 180;

export default function VitalAnalyticsScreen() {
  const [activeFrame, setActiveFrame] = useState('Hourly');

  // Smooth SVG Bezier Path for Heart Rate Waveform
  // Data points corresponding to: 10:00am (60), 11:00am (70), 12:00pm (72), 13:00pm (90)
  const pathD = `M 10 110 C 40 80, 70 120, 100 90 C 130 110, 160 70, 190 85 C 220 100, 250 50, 280 20`;
  const areaD = `${pathD} L 280 160 L 10 160 Z`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={colors.darkText} />
          </Pressable>
          <AppLogo size="small" showText={false} />
          <Pressable style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={colors.darkText} />
          </Pressable>
        </View>

        {/* Title & Primary Readout */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Heart rate</Text>

          <View style={styles.readoutRow}>
            <Text style={styles.bigValue}>72 <Text style={styles.unitText}>BPM</Text></Text>

            <View style={styles.statusPill}>
              <Ionicons name="heart" size={14} color={colors.primary} />
              <Text style={styles.statusPillText}>Normal</Text>
            </View>
          </View>
        </View>

        {/* Smooth SVG Line Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.svgWrapper}>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
              <Defs>
                <LinearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.primary} stopOpacity="0.25" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0.0" />
                </LinearGradient>
              </Defs>

              {/* Horizontal Grid Lines */}
              <Line x1="0" y1="30" x2={CHART_WIDTH} y2="30" stroke="#F3F4F6" strokeDasharray="4 4" strokeWidth="1" />
              <Line x1="0" y1="70" x2={CHART_WIDTH} y2="70" stroke="#F3F4F6" strokeDasharray="4 4" strokeWidth="1" />
              <Line x1="0" y1="110" x2={CHART_WIDTH} y2="110" stroke="#F3F4F6" strokeDasharray="4 4" strokeWidth="1" />
              <Line x1="0" y1="150" x2={CHART_WIDTH} y2="150" stroke="#F3F4F6" strokeDasharray="4 4" strokeWidth="1" />

              {/* Y-Axis Labels */}
              <SvgText x="0" y="32" fontSize="10" fill="#9CA3AF" fontWeight="600">100</SvgText>
              <SvgText x="0" y="72" fontSize="10" fill="#9CA3AF" fontWeight="600">80</SvgText>
              <SvgText x="0" y="112" fontSize="10" fill="#9CA3AF" fontWeight="600">60</SvgText>
              <SvgText x="0" y="152" fontSize="10" fill="#9CA3AF" fontWeight="600">40</SvgText>

              {/* Gradient Area under Spline Curve */}
              <Path d={areaD} fill="url(#gradientFill)" />

              {/* Smooth Spline Curve Line */}
              <Path d={pathD} fill="none" stroke={colors.primary} strokeWidth="3" />

              {/* Vertical Beam Callout at 12:00pm (x=190) */}
              <Line x1="190" y1="85" x2="190" y2="160" stroke={colors.secondary} strokeWidth="6" opacity={0.4} />
              <Circle cx="190" cy="85" r="5" fill={colors.white} stroke={colors.primary} strokeWidth="3" />
            </Svg>

            {/* Floating Value Tooltip Pill above point */}
            <View style={styles.tooltipPill}>
              <Text style={styles.tooltipText}>72</Text>
            </View>
          </View>

          {/* X-Axis Timestamps */}
          <View style={styles.xAxisRow}>
            <Text style={styles.timeLabel}>10:00am</Text>
            <Text style={styles.timeLabel}>11:00am</Text>
            <Text style={[styles.timeLabel, styles.timeLabelActive]}>12:00pm</Text>
            <Text style={styles.timeLabel}>13:00pm</Text>
          </View>
        </View>

        {/* 3-Column Summary Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>78</Text>
            <Text style={styles.statUnit}>BPM</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Minimum</Text>
            <Text style={styles.statValue}>63</Text>
            <Text style={styles.statUnit}>BPM</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Maximum</Text>
            <Text style={styles.statValue}>102</Text>
            <Text style={styles.statUnit}>BPM</Text>
          </View>
        </View>

        {/* Bottom Timeframe Switcher */}
        <View style={styles.timeframeCard}>
          {['Hourly', 'Daily', 'Monthly', 'Yearly'].map((frame) => (
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
    marginBottom: 8,
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
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.5,
  },
  readoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  bigValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.darkText,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.softBackground,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  svgWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  tooltipPill: {
    position: 'absolute',
    top: 60,
    left: 172,
    backgroundColor: colors.darkText,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tooltipText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 10,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  timeLabelActive: {
    color: colors.darkText,
    fontWeight: '800',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.darkText,
  },
  statUnit: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.softBackground,
  },
  timeframeCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  framePill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  framePillActive: {
    backgroundColor: colors.darkText,
  },
  frameText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
  frameTextActive: {
    color: colors.white,
  },
});
