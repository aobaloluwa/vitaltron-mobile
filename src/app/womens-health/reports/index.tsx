import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { getWomensHealthDashboard } from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 72;
const CHART_HEIGHT = 160;

export default function ReportsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getWomensHealthDashboard();
      setDashboard(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Health Reports" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonLoader height={240} borderRadius={22} style={{ marginVertical: 12 }} />
          <SkeletonLoader height={90} borderRadius={20} style={{ marginBottom: 16 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const pathD = `M 10 100 C 50 40, 100 120, 150 60 C 200 80, 250 30, 290 50`;
  const areaD = `${pathD} L 290 140 L 10 140 Z`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Health Reports & Charts" subtitle="Interactive Trend Analytics" />

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
        {/* Trend Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Cycle Length & BBT Trend</Text>
          <Text style={styles.chartSub}>Last 6 Months Historical Overview</Text>

          <View style={styles.svgWrapper}>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.primary} stopOpacity="0.3" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0.0" />
                </LinearGradient>
              </Defs>

              <Line x1="0" y1="40" x2={CHART_WIDTH} y2="40" stroke="#F3F4F6" strokeWidth="1" />
              <Line x1="0" y1="90" x2={CHART_WIDTH} y2="90" stroke="#F3F4F6" strokeWidth="1" />
              <Line x1="0" y1="130" x2={CHART_WIDTH} y2="130" stroke="#F3F4F6" strokeWidth="1" />

              <Path d={areaD} fill="url(#grad)" />
              <Path d={pathD} fill="none" stroke={colors.primary} strokeWidth="3" />
            </Svg>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>
              {dashboard?.cycleMetrics?.averageCycleLength || 28} Days
            </Text>
            <Text style={styles.statLabel}>Avg Cycle Length</Text>
          </View>

          <View style={styles.vDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statVal}>
              {dashboard?.cycleMetrics?.averagePeriodDuration || 5} Days
            </Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    chartCard: {
      backgroundColor: colors.white,
      borderRadius: 22,
      padding: 18,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.darkText,
    },
    chartSub: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 14,
    },
    svgWrapper: {
      alignItems: 'center',
    },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
    },
    statVal: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.darkText,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
    vDivider: {
      width: 1,
      backgroundColor: colors.softBackground,
    },
  });
