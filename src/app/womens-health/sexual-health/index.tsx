import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
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
  getSexualHealthRecords,
  logStiScreening,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';
import { DatePickerInput } from '../../../components/ui/DatePickerInput';
import { SexualHealthInsightsCard } from '../../../components/womens-health/SexualHealthInsightsCard';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

export default function SexualHealthScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sexualHealthData, setSexualHealthData] = useState<any>(null);
  const [screenings, setScreenings] = useState<any[]>([]);

  // Form State
  const [testType, setTestType] = useState('Pap Smear');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState('NORMAL');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getSexualHealthRecords();
      setSexualHealthData(data);
      setScreenings(data?.screenings || []);
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

  const handleSaveScreening = async () => {
    setErrorMessage(null);
    setSavedSuccess(false);

    if (!testType || !testType.trim()) {
      setErrorMessage('⚠️ Please enter the screening test type (e.g. Pap Smear / HPV).');
      return;
    }

    if (!testDate || !testDate.trim()) {
      setErrorMessage('⚠️ Please select the test date.');
      return;
    }

    setSaving(true);
    try {
      await logStiScreening({
        testType: testType.trim(),
        testDate: testDate.trim(),
        result,
        notes: notes ? notes.trim() : undefined,
      });
      setSavedSuccess(true);
      setNotes('');
      setErrorMessage(null);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save screening record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Sexual & Reproductive Health" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonLoader height={60} borderRadius={16} style={{ marginVertical: 12 }} />
          <SkeletonLoader height={140} borderRadius={22} style={{ marginBottom: 14 }} />
          <SkeletonLoader height={240} borderRadius={22} style={{ marginBottom: 16 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader
        title="Sexual Health & Screenings"
        subtitle="Confidential Screening Records"
      />

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
        {/* Privacy Banner */}
        <View style={styles.privacyCard}>
          <Ionicons name="lock-closed" size={20} color={colors.primary} />
          <Text style={styles.privacyText}>
            Private & Encrypted: Your reproductive and STI screening logs are strictly personal and stored securely.
          </Text>
        </View>

        {/* Real-Time Screening & Preventive Care Insights Card */}
        <SexualHealthInsightsCard insights={sexualHealthData?.sexualHealthInsights} />

        {/* Log Screening Form */}
        <Text style={styles.sectionTitle}>Record STI / Pap Screening</Text>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Screening Test Type</Text>
          <TextInput
            style={styles.input}
            value={testType}
            onChangeText={setTestType}
            placeholder="Pap Smear / HPV / Full Panel"
          />

          <DatePickerInput
            label="Test Date"
            value={testDate}
            onChange={setTestDate}
            placeholder="Select Test Date"
          />

          <Text style={styles.label}>Result Status</Text>
          <View style={styles.pillRow}>
            {['NORMAL', 'NEGATIVE', 'PENDING', 'FOLLOW_UP'].map((res) => (
              <Pressable
                key={res}
                style={[styles.pill, result === res && styles.pillActive]}
                onPress={() => setResult(res)}
              >
                <Text style={[styles.pillText, result === res && styles.pillTextActive]}>{res}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Notes / Provider Remarks</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Clinic name, doctor notes..."
            multiline
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            style={styles.saveBtn}
            onPress={() => void handleSaveScreening()}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save Screening Record</Text>
            )}
          </Pressable>

          {savedSuccess ? (
            <Text style={styles.successText}>✓ Screening entry saved confidentially!</Text>
          ) : null}
        </View>

        {/* Historical Screenings List */}
        <Text style={styles.sectionTitle}>Screening History</Text>
        {screenings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="shield-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>No screening records logged yet.</Text>
          </View>
        ) : (
          screenings.map((item) => (
            <View key={item.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordTitle}>{item.testType}</Text>
                <Text style={styles.recordResult}>{item.result}</Text>
              </View>
              <Text style={styles.recordDate}>
                {new Date(item.testDate).toLocaleDateString()}
              </Text>
              {item.notes ? <Text style={styles.recordNotes}>{item.notes}</Text> : null}
            </View>
          ))
        )}

        <SafetyDisclaimerBanner text="Self-reported screening logs do not constitute an official lab report. Maintain official records with your physician." />
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
    privacyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.softBackground,
      borderRadius: 16,
      padding: 14,
      marginVertical: 12,
      gap: 10,
    },
    privacyText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.darkText,
      lineHeight: 17,
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
    emptyCard: {
      backgroundColor: colors.white,
      borderRadius: 18,
      padding: 24,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 8,
    },
    recordCard: {
      backgroundColor: colors.white,
      borderRadius: 18,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    recordHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    recordTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
    },
    recordResult: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
    },
    recordDate: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
    recordNotes: {
      fontSize: 12,
      color: colors.darkText,
      marginTop: 6,
      lineHeight: 16,
    },
  });
