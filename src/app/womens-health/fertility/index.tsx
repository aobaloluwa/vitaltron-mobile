import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import {
  getWomensHealthDashboard,
  logDailyCycle,
  CervicalMucusType,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

export default function FertilityTrackerScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);

  // Observations State
  const [bbt, setBbt] = useState('');
  const [mucus, setMucus] = useState<CervicalMucusType>('CREAMY');
  const [lhTest, setLhTest] = useState('NEGATIVE');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadData = async () => {
    try {
      const data = await getWomensHealthDashboard();
      setDashboard(data);
    } catch {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSaveObservation = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await logDailyCycle({
        date: new Date().toISOString().split('T')[0],
        bbt: bbt ? parseFloat(bbt) : undefined,
        cervicalMucus: mucus,
        ovulationTestResult: lhTest,
      });
      setSavedSuccess(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Ovulation & Fertility" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonLoader width="100%" height={140} borderRadius={22} style={{ marginVertical: 12 }} />
          <SkeletonLoader width={200} height={20} borderRadius={10} style={{ marginVertical: 12 }} />
          <SkeletonLoader width="100%" height={260} borderRadius={22} style={{ marginBottom: 16 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const cycle = dashboard?.cycleMetrics;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Ovulation & Fertility" subtitle="Conception & Vitals Tracker" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Fertile Window Card */}
        <View style={styles.fertileCard}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardTag}>FERTILITY ESTIMATE</Text>
              <Text style={styles.cardTitle}>Peak Fertile Window</Text>
            </View>
            <Ionicons name="sparkles" size={24} color="#EC4899" />
          </View>

          <Text style={styles.datesText}>
            {cycle?.fertileWindowStart
              ? `${cycle.fertileWindowStart} to ${cycle.fertileWindowEnd}`
              : 'Log period start date to calculate fertile window'}
          </Text>

          <View style={styles.ovulationPill}>
            <Ionicons name="ellipse" size={10} color="#EC4899" />
            <Text style={styles.ovulationPillText}>
              Estimated Ovulation: {cycle?.estimatedOvulation || 'Log period start to estimate date'}
            </Text>
          </View>
        </View>

        {/* Observation Entry Section */}
        <Text style={styles.sectionTitle}>Log Today's Fertility Observations</Text>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Basal Body Temperature (°C)</Text>
          <TextInput
            style={styles.input}
            value={bbt}
            onChangeText={setBbt}
            keyboardType="numeric"
            placeholder="e.g. 36.6"
          />

          <Text style={styles.label}>Cervical Mucus Consistency</Text>
          <View style={styles.pillRow}>
            {(['DRY', 'STICKY', 'CREAMY', 'EGG_WHITE', 'WATERY'] as CervicalMucusType[]).map((m) => (
              <Pressable
                key={m}
                style={[styles.pill, mucus === m && styles.pillActive]}
                onPress={() => setMucus(m)}
              >
                <Text style={[styles.pillText, mucus === m && styles.pillTextActive]}>{m}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Ovulation Test (LH Surge)</Text>
          <View style={styles.pillRow}>
            {['NEGATIVE', 'POSITIVE', 'PEAK'].map((t) => (
              <Pressable
                key={t}
                style={[styles.pill, lhTest === t && styles.pillActive]}
                onPress={() => setLhTest(t)}
              >
                <Text style={[styles.pillText, lhTest === t && styles.pillTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.saveBtn}
            onPress={() => void handleSaveObservation()}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save Fertility Record</Text>
            )}
          </Pressable>

          {savedSuccess ? (
            <Text style={styles.successMsg}>✓ Fertility observations logged successfully!</Text>
          ) : null}
        </View>

        <SafetyDisclaimerBanner text="Fertility estimates rely on statistical historical averages and do not guarantee conception or act as birth control." />
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
    fertileCard: {
      backgroundColor: colors.white,
      borderRadius: 22,
      padding: 18,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTag: {
      fontSize: 11,
      fontWeight: '800',
      color: '#EC4899',
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 2,
    },
    datesText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      marginTop: 10,
    },
    ovulationPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#FCE7F3',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginTop: 12,
      alignSelf: 'flex-start',
    },
    ovulationPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#DB2777',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.darkText,
      marginVertical: 12,
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
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      color: colors.darkText,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 10,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    pillActive: {
      backgroundColor: colors.primary,
    },
    pillText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.darkText,
    },
    pillTextActive: {
      color: colors.white,
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
      fontSize: 14,
      fontWeight: '800',
    },
    successMsg: {
      fontSize: 12,
      color: colors.success,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 10,
    },
  });
