import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
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
import {
  getMenopauseProfile,
  logMenopauseSymptom,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';
import { MenopauseInsightsCard } from '../../../components/womens-health/MenopauseInsightsCard';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

export default function MenopauseTrackerScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menopauseData, setMenopauseData] = useState<any>(null);

  // Symptom log state
  const [hotFlash, setHotFlash] = useState(3);
  const [nightSweats, setNightSweats] = useState(false);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [brainFog, setBrainFog] = useState(2);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getMenopauseProfile();
      setMenopauseData(data);
      const activeLog = data?.todayLog || data?.profile?.symptoms?.[0];
      if (activeLog) {
        if (activeLog.hotFlashSeverity !== undefined && activeLog.hotFlashSeverity !== null) {
          setHotFlash(activeLog.hotFlashSeverity);
        }
        if (activeLog.nightSweats !== undefined && activeLog.nightSweats !== null) {
          setNightSweats(activeLog.nightSweats);
        }
        if (activeLog.sleepQuality !== undefined && activeLog.sleepQuality !== null) {
          setSleepQuality(activeLog.sleepQuality);
        }
        if (activeLog.brainFogRating !== undefined && activeLog.brainFogRating !== null) {
          setBrainFog(activeLog.brainFogRating);
        }
      }
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

  const handleSaveSymptom = async () => {
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage(null);
    try {
      await logMenopauseSymptom({
        date: new Date().toISOString().split('T')[0],
        hotFlashSeverity: hotFlash,
        nightSweats,
        sleepQuality,
        brainFogRating: brainFog,
      });
      setSavedSuccess(true);
      void loadData();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save symptoms. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Menopause Tracker" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonLoader height={110} borderRadius={22} style={{ marginVertical: 12 }} />
          <SkeletonLoader height={120} borderRadius={22} style={{ marginBottom: 14 }} />
          <SkeletonLoader height={240} borderRadius={22} style={{ marginBottom: 16 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const profile = menopauseData?.profile;
  const symptomLogs = profile?.symptoms || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Menopause Tracker" subtitle="Perimenopause & Menopause Symptoms" />

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
        {/* Profile Stage Overview Card */}
        <View style={styles.card}>
          <Text style={styles.cardTag}>LIFE STAGE OVERVIEW</Text>
          <Text style={styles.cardTitle}>{profile?.stage || 'Perimenopause Management'}</Text>
          <Text style={styles.cardSub}>
            Track hormonal transitions, vasomotor symptoms, sleep quality, and mood changes.
          </Text>
        </View>

        {/* Personalized Real-Time Menopause Insights Card */}
        <MenopauseInsightsCard insights={menopauseData?.menopauseInsights} />

        {/* Symptom Entry Card */}
        <Text style={styles.sectionTitle}>Log Today's Symptoms</Text>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Hot Flash Severity ({hotFlash}/10)</Text>
          <View style={styles.pillRow}>
            {[1, 3, 5, 7, 9].map((val) => (
              <Pressable
                key={val}
                style={[styles.pill, hotFlash === val && styles.pillActive]}
                onPress={() => setHotFlash(val)}
              >
                <Text style={[styles.pillText, hotFlash === val && styles.pillTextActive]}>{val}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.checkboxRow}
            onPress={() => setNightSweats(!nightSweats)}
          >
            <Ionicons
              name={nightSweats ? 'checkbox' : 'square-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.checkboxLabel}>Experienced Night Sweats</Text>
          </Pressable>

          <Text style={styles.label}>Sleep Quality ({sleepQuality}/10)</Text>
          <View style={styles.pillRow}>
            {[2, 4, 6, 8, 10].map((val) => (
              <Pressable
                key={val}
                style={[styles.pill, sleepQuality === val && styles.pillActive]}
                onPress={() => setSleepQuality(val)}
              >
                <Text style={[styles.pillText, sleepQuality === val && styles.pillTextActive]}>{val}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Brain Fog / Focus Rating ({brainFog}/10)</Text>
          <View style={styles.pillRow}>
            {[1, 3, 5, 7, 9].map((val) => (
              <Pressable
                key={val}
                style={[styles.pill, brainFog === val && styles.pillActive]}
                onPress={() => setBrainFog(val)}
              >
                <Text style={[styles.pillText, brainFog === val && styles.pillTextActive]}>{val}</Text>
              </Pressable>
            ))}
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable style={styles.saveBtn} onPress={() => void handleSaveSymptom()} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save Menopause Symptoms</Text>
            )}
          </Pressable>

          {savedSuccess ? (
            <Text style={styles.successText}>✓ Symptoms saved & insights updated!</Text>
          ) : null}
        </View>

        {/* Menopause Symptom History */}
        <Text style={styles.sectionTitle}>Recent Symptom Log History</Text>
        {symptomLogs.length === 0 ? (
          <View style={styles.historyCard}>
            <Text style={styles.emptyHistoryText}>No menopause symptoms logged yet.</Text>
          </View>
        ) : (
          <View style={styles.historyCard}>
            {symptomLogs.map((item: any, idx: number) => (
              <View key={item.id || idx} style={styles.historyRow}>
                <View style={styles.historyIconBg}>
                  <Ionicons name="flame" size={18} color="#F59E0B" />
                </View>

                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>
                    Hot Flashes: {item.hotFlashSeverity || 0}/10 • Sleep: {item.sleepQuality || 0}/10
                  </Text>
                  <Text style={styles.historySub}>
                    {new Date(item.date).toLocaleDateString()}
                    {item.nightSweats ? ' • Night Sweats Logged' : ''}
                    {item.brainFogRating ? ` • Brain Fog: ${item.brainFogRating}/10` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <SafetyDisclaimerBanner text="Menopause timing and symptoms vary significantly. Discuss severe symptoms or hormone replacement therapy options with your gynecologist." />
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
      paddingBottom: Platform.OS === 'ios' ? 115 : 32,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 22,
      padding: 18,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    cardTag: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 2,
    },
    cardSub: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 16,
      marginBottom: 10,
    },
    inputCard: {
      backgroundColor: colors.white,
      borderRadius: 22,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
      marginTop: 10,
      marginBottom: 6,
    },
    pillRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 10,
    },
    pill: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
    },
    pillActive: {
      backgroundColor: colors.primary,
    },
    pillText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.darkText,
    },
    pillTextActive: {
      color: colors.white,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginVertical: 10,
    },
    checkboxLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.darkText,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 16,
    },
    saveBtnText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '800',
    },
    errorText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#EF4444',
      textAlign: 'center',
      marginTop: 10,
    },
    successText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.success,
      textAlign: 'center',
      marginTop: 10,
    },
    historyCard: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    emptyHistoryText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.softBackground,
    },
    historyIconBg: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#FEF3C7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    historyInfo: {
      flex: 1,
    },
    historyTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.darkText,
    },
    historySub: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
  });
