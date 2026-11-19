import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { getCycleCalendar } from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';

export default function CycleCalendarScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const loadCalendar = async () => {
    try {
      const data = await getCycleCalendar();
      setCalendarData(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCalendar();
  }, []);

  const changeMonth = (delta: number) => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + delta);
    setCurrentMonth(next);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysCount; i++) {
      days.push(i);
    }
    return days;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Cycle Calendar" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Cycle Calendar" subtitle={monthName} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Switcher Bar */}
        <View style={styles.monthHeader}>
          <Pressable onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-back" size={20} color={colors.darkText} />
          </Pressable>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <Pressable onPress={() => changeMonth(1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-forward" size={20} color={colors.darkText} />
          </Pressable>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <Text key={idx} style={styles.weekText}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.gridContainer}>
          {days.map((dayNum) => {
            const isToday = dayNum === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth();
            return (
              <View
                key={dayNum}
                style={[
                  styles.dayCell,
                  isToday && { backgroundColor: colors.softBackground, borderRadius: 12 },
                ]}
              >
                <Text style={[styles.dayNumText, isToday && { color: colors.primary, fontWeight: '800' }]}>
                  {dayNum}
                </Text>
                {/* Visual Indicators */}
                <View style={styles.dotsRow}>
                  {dayNum >= 1 && dayNum <= 5 ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}
                  {dayNum >= 12 && dayNum <= 16 ? <View style={[styles.dot, { backgroundColor: '#EC4899' }]} /> : null}
                </View>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Calendar Legend</Text>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Recorded Period</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: '#EC4899' }]} />
            <Text style={styles.legendText}>Estimated Fertile Window</Text>
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
    monthHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 14,
    },
    monthTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.darkText,
    },
    arrowBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.white,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    weekText: {
      width: '14%',
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    dayCell: {
      width: '14%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 4,
    },
    dayNumText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.darkText,
    },
    dotsRow: {
      flexDirection: 'row',
      gap: 3,
      marginTop: 4,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    legendCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 18,
      padding: 16,
      marginTop: 20,
    },
    legendTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.darkText,
      marginBottom: 8,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginVertical: 4,
    },
    legendText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
  });
