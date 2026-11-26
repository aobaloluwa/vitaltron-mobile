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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { getPregnancyProfile, logKickSession } from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';

export default function KickCounterScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [kickCount, setKickCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [kickHistory, setKickHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    try {
      const res = await getPregnancyProfile();
      if (res?.profile?.kickSessions) {
        setKickHistory(res.profile.kickSessions);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  useEffect(() => {
    let timer: any;
    if (isActive) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const startSession = () => {
    setKickCount(0);
    setElapsedSeconds(0);
    setStartTime(new Date());
    setIsActive(true);
    setSuccessMsg(false);
    setErrorMessage(null);
  };

  const handleTapKick = () => {
    if (!isActive) {
      startSession();
      setKickCount(1);
    } else {
      setKickCount((prev) => prev + 1);
    }
  };

  const handleSaveSession = async () => {
    setErrorMessage(null);
    if (kickCount === 0) {
      setErrorMessage('⚠️ Tap the footprint button to count kicks before saving.');
      return;
    }
    setSaving(true);
    try {
      await logKickSession({
        startTime: (startTime || new Date()).toISOString(),
        endTime: new Date().toISOString(),
        kickCount,
      });
      setIsActive(false);
      setSuccessMsg(true);
      void loadHistory();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save kick session. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Kick Counter" subtitle="Fetal Movement Monitor" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Kick Counter Circle Card */}
        <View style={styles.counterCard}>
          <Text style={styles.sessionTimer}>Session Duration: {formatTime(elapsedSeconds)}</Text>

          <Pressable style={styles.kickCircleBtn} onPress={handleTapKick}>
            <MaterialCommunityIcons name="foot-print" size={48} color={colors.white} />
            <Text style={styles.kickCountText}>{kickCount}</Text>
            <Text style={styles.kickCircleSub}>Tap to Count Movement</Text>
          </Pressable>

          <Text style={styles.targetText}>
            Target: 10 movements within a 2-hour window during active periods.
          </Text>

          {kickCount > 0 ? (
            <View style={styles.actionsRow}>
              <Pressable
                style={styles.resetBtn}
                onPress={() => {
                  setKickCount(0);
                  setIsActive(false);
                  setErrorMessage(null);
                }}
              >
                <Text style={styles.resetBtnText}>Reset</Text>
              </Pressable>

              <Pressable
                style={styles.saveBtn}
                onPress={() => void handleSaveSession()}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Session ({kickCount} Kicks)</Text>
                )}
              </Pressable>
            </View>
          ) : null}

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {successMsg ? (
            <Text style={styles.successText}>✓ Kick count session saved to database!</Text>
          ) : null}
        </View>

        {/* Kick Sessions History List */}
        <Text style={styles.sectionTitle}>Recent Saved Kick Sessions</Text>

        {kickHistory.length === 0 ? (
          <View style={styles.historyCard}>
            <Text style={styles.historyEmptyText}>No kick sessions saved yet.</Text>
          </View>
        ) : (
          <View style={styles.historyCard}>
            {kickHistory.map((item, idx) => (
              <View key={item.id || idx} style={styles.historyItem}>
                <View style={styles.historyIconWrapper}>
                  <MaterialCommunityIcons name="foot-print" size={20} color={colors.primary} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>
                    {item.kickCount} Movements ({item.kickCount >= 10 ? 'Target Met ✓' : 'Partial Session'})
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(item.startTime).toLocaleDateString()} at{' '}
                    {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <SafetyDisclaimerBanner
          text="IMPORTANT: If you notice a sudden decrease, reduction, or absence of fetal movement, do not wait for an app threshold. Immediately contact your maternity care provider or hospital triage."
          isUrgent
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
    counterCard: {
      backgroundColor: colors.white,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    sessionTimer: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 20,
    },
    kickCircleBtn: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    kickCountText: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.white,
      marginTop: 4,
    },
    kickCircleSub: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.white,
      opacity: 0.9,
    },
    targetText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 20,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
      width: '100%',
    },
    resetBtn: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
    },
    resetBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.darkText,
    },
    saveBtn: {
      flex: 2,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
    },
    saveBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.white,
    },
    errorText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#EF4444',
      textAlign: 'center',
      marginTop: 14,
    },
    successText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.success,
      marginTop: 14,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 16,
      marginBottom: 10,
    },
    historyCard: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    historyEmptyText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.softBackground,
    },
    historyIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#FCE7F3',
      alignItems: 'center',
      justifyContent: 'center',
    },
    historyInfo: {
      flex: 1,
    },
    historyTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.darkText,
    },
    historyDate: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
  });
