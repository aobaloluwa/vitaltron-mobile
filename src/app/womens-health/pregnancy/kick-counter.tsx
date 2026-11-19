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
import { logKickSession } from '../../../services/womensHealth';
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
    if (kickCount === 0) return;
    setSaving(true);
    try {
      await logKickSession({
        startTime: (startTime || new Date()).toISOString(),
        endTime: new Date().toISOString(),
        kickCount,
      });
      setIsActive(false);
      setSuccessMsg(true);
    } catch {
      // ignore
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

          {successMsg ? (
            <Text style={styles.successText}>✓ Kick count session saved successfully!</Text>
          ) : null}
        </View>

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
    successText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.success,
      marginTop: 14,
    },
  });
