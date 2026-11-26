import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { getPregnancyProfile, logContractionSession } from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

export default function ContractionTimerScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timing, setTiming] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [lastContractionTime, setLastContractionTime] = useState<Date | null>(null);
  const [intervalMin, setIntervalMin] = useState<number | null>(null);
  const [severity, setSeverity] = useState(5);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await getPregnancyProfile();
      if (res?.profile?.contractionSessions) {
        setHistory(res.profile.contractionSessions);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadHistory();
  };

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
      const now = new Date();
      setStartTime(now);
      if (lastContractionTime) {
        const diffMs = now.getTime() - lastContractionTime.getTime();
        setIntervalMin(Math.round((diffMs / (1000 * 60)) * 10) / 10);
      }
      setDurationSec(0);
      setTiming(true);
      setSuccessMsg(false);
    } else {
      setTiming(false);
      const now = new Date();
      setLastContractionTime(now);
      void handleSave(durationSec, intervalMin);
    }
  };

  const handleSave = async (durSec: number, intMin: number | null) => {
    if (durSec === 0) return;
    setSaving(true);
    try {
      await logContractionSession({
        startTime: (startTime || new Date()).toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: durSec,
        intervalMinutes: intMin || undefined,
        severity,
      });
      setSuccessMsg(true);
      void loadHistory();
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

  const is511Pattern =
    history.length >= 3 &&
    history.slice(0, 3).every((h) => (h.durationSeconds || 0) >= 45) &&
    history.slice(0, 3).some((h) => h.intervalMinutes && h.intervalMinutes <= 6);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Contraction Timer" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonLoader height={220} borderRadius={24} style={{ marginVertical: 12 }} />
          <SkeletonLoader height={80} borderRadius={20} style={{ marginBottom: 14 }} />
          <SkeletonLoader height={140} borderRadius={20} style={{ marginBottom: 16 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Contraction Timer" subtitle="Labor Duration & Interval Tracker" />

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
        {/* 5-1-1 Active Labor Warning Banner */}
        {is511Pattern ? (
          <View style={styles.alertBanner}>
            <Ionicons name="warning" size={20} color="#DC2626" />
            <View style={styles.alertTextWrapper}>
              <Text style={styles.alertTitle}>Possible Active Labor Pattern (5-1-1)</Text>
              <Text style={styles.alertSub}>
                Your recent contractions are averaging ~5 minutes apart. Consider contacting your OB-GYN or maternity hospital triage.
              </Text>
            </View>
          </View>
        ) : null}

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
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name={timing ? 'stop-circle' : 'play-circle'} size={28} color={colors.white} />
                <Text style={styles.startStopBtnText}>
                  {timing ? 'Stop Contraction' : 'Start Contraction'}
                </Text>
              </>
            )}
          </Pressable>

          {successMsg ? (
            <Text style={styles.successText}>✓ Contraction saved to database!</Text>
          ) : null}
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
        <Text style={styles.sectionTitle}>Recent Contraction Log</Text>
        {history.length === 0 ? (
          <View style={styles.historySection}>
            <Text style={styles.historyEmptyText}>No contractions logged in this session.</Text>
          </View>
        ) : (
          <View style={styles.historySection}>
            {history.map((item, idx) => (
              <View key={item.id || idx} style={styles.historyRow}>
                <View style={styles.historyCol}>
                  <Text style={styles.histTitle}>
                    {item.durationSeconds || 0} seconds long
                  </Text>
                  <Text style={styles.histSub}>
                    {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <View style={styles.historyColRight}>
                  <Text style={styles.histMeta}>
                    {item.intervalMinutes ? `${item.intervalMinutes}m apart` : 'First'}
                  </Text>
                  <Text style={styles.histMetaSub}>Intensity: {item.severity || 5}/10</Text>
                </View>
              </View>
            ))}
          </View>
        )}

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
    alertBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: '#FEF2F2',
      borderRadius: 18,
      padding: 14,
      marginTop: 12,
      borderWidth: 1,
      borderColor: '#FCA5A5',
    },
    alertTextWrapper: {
      flex: 1,
    },
    alertTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: '#991B1B',
    },
    alertSub: {
      fontSize: 11,
      fontWeight: '600',
      color: '#B91C1C',
      marginTop: 2,
      lineHeight: 16,
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
    successText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.success,
      marginTop: 12,
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
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 6,
      marginBottom: 10,
    },
    historySection: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    historyEmptyText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
    },
    historyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.softBackground,
    },
    historyCol: {
      flex: 1,
    },
    historyColRight: {
      alignItems: 'flex-end',
    },
    histTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.darkText,
    },
    histSub: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
    histMeta: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    histMetaSub: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
  });
