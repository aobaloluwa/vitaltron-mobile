import React, { useState, useEffect } from 'react';
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
import { logContractionSession } from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';

export default function ContractionTimerScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [timing, setTiming] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [lastContractionTime, setLastContractionTime] = useState<Date | null>(null);
  const [intervalMin, setIntervalMin] = useState<number | null>(null);
  const [severity, setSeverity] = useState(5);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    let interval: any;
    if (timing) {
      interval = setInterval(() => {
        setDurationSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timing]);

  const toggleTimer = () => {
    if (!timing) {
      // Start contraction
      const now = new Date();
      setStartTime(now);
      if (lastContractionTime) {
        const diffMs = now.getTime() - lastContractionTime.getTime();
        setIntervalMin(Math.round((diffMs / (1000 * 60)) * 10) / 10);
      }
      setDurationSec(0);
      setTiming(true);
    } else {
      // Stop contraction & log
      setTiming(false);
      const now = new Date();
      setLastContractionTime(now);
      void handleSave(durationSec, intervalMin);
    }
  };

  const handleSave = async (durSec: number, intMin: number | null) => {
    setSaving(true);
    try {
      const record = await logContractionSession({
        startTime: (startTime || new Date()).toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: durSec,
        intervalMinutes: intMin || undefined,
        severity,
      });
      setHistory((prev) => [record, ...prev]);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const formatTimerText = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Contraction Timer" subtitle="Labor Duration & Interval Tracker" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Contraction Timer Card */}
        <View style={styles.timerCard}>
          <Text style={styles.timerTitle}>{timing ? 'Contraction Active...' : 'Ready to Time'}</Text>
          <Text style={styles.timerDisplay}>{formatTimerText(durationSec)}</Text>

          {intervalMin !== null ? (
            <Text style={styles.intervalText}>
              Frequency: {intervalMin} mins apart
            </Text>
          ) : null}

          <Pressable
            style={[styles.startStopBtn, timing ? styles.stopBtnBg : styles.startBtnBg]}
            onPress={toggleTimer}
          >
            <Ionicons name={timing ? 'stop-circle' : 'play-circle'} size={28} color={colors.white} />
            <Text style={styles.startStopBtnText}>
              {timing ? 'Stop Contraction' : 'Start Contraction'}
            </Text>
          </Pressable>
        </View>

        {/* Severity Selector */}
        <View style={styles.severityCard}>
          <Text style={styles.severityLabel}>Contraction Intensity: {severity}/10</Text>
          <View style={styles.severityRow}>
            {[1, 3, 5, 7, 9, 10].map((val) => (
              <Pressable
                key={val}
                style={[styles.sevPill, severity === val && styles.sevPillActive]}
                onPress={() => setSeverity(val)}
              >
                <Text style={[styles.sevPillText, severity === val && styles.sevPillTextActive]}>
                  {val}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Contraction History */}
        {history.length > 0 ? (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Logged Contractions</Text>
            {history.map((item, idx) => (
              <View key={idx} style={styles.historyRow}>
                <Text style={styles.histText}>Duration: {item.durationSeconds || 0}s</Text>
                <Text style={styles.histText}>
                  {item.intervalMinutes ? `Interval: ${item.intervalMinutes}m` : 'First'}
                </Text>
                <Text style={styles.histText}>Intensity: {item.severity || 5}/10</Text>
              </View>
            ))}
          </View>
        ) : null}

        <SafetyDisclaimerBanner
          text="CLINICAL ADVICE: If contractions occur 5 minutes apart, last 60 seconds each, for over 1 hour (5-1-1 rule), or if your water breaks, call your maternity care unit immediately."
        />
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
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    timerCard: {
      backgroundColor: colors.white,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    timerTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 10,
    },
    timerDisplay: {
      fontSize: 48,
      fontWeight: '800',
      color: colors.darkText,
      letterSpacing: 1,
    },
    intervalText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      marginTop: 8,
    },
    startStopBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingVertical: 16,
      borderRadius: 18,
      marginTop: 20,
      gap: 10,
    },
    startBtnBg: {
      backgroundColor: colors.primary,
    },
    stopBtnBg: {
      backgroundColor: '#DC2626',
    },
    startStopBtnText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '800',
    },
    severityCard: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    severityLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.darkText,
      marginBottom: 10,
    },
    severityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    sevPill: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sevPillActive: {
      backgroundColor: colors.primary,
    },
    sevPillText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.darkText,
    },
    sevPillTextActive: {
      color: colors.white,
    },
    historySection: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    historyTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.darkText,
      marginBottom: 10,
    },
    historyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.softBackground,
    },
    histText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.darkText,
    },
  });
