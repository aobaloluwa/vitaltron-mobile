import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  getSexualHealthRecords,
  logStiScreening,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';

export default function SexualHealthScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ logs: [], screenings: [] });

  // STI Screening Log Form
  const [testType, setTestType] = useState('Pap Smear / HPV');
  const [result, setResult] = useState('NORMAL');
  const [provider, setProvider] = useState('City Women Health Clinic');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const res = await getSexualHealthRecords();
      setData(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSaveScreening = async () => {
    setSaving(true);
    try {
      await logStiScreening({
        testDate,
        testType,
        result,
        provider,
      });
      void loadData();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Sexual & Reproductive Health" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader
        title="Sexual Health & Screenings"
        subtitle="Confidential Screening Records"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Privacy Banner */}
        <View style={styles.privacyCard}>
          <Ionicons name="lock-closed" size={20} color={colors.primary} />
          <Text style={styles.privacyText}>
            Private & Encrypted: Your reproductive and STI screening logs are strictly personal and stored securely.
          </Text>
        </View>

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

          <Text style={styles.label}>Test Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={testDate}
            onChangeText={setTestDate}
            placeholder="YYYY-MM-DD"
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

          <Text style={styles.label}>Clinic / Provider</Text>
          <TextInput
            style={styles.input}
            value={provider}
            onChangeText={setProvider}
            placeholder="Healthcare Provider"
          />

          <Pressable style={styles.saveBtn} onPress={() => void handleSaveScreening()} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save Screening Record</Text>
            )}
          </Pressable>
        </View>

        {/* Screening History */}
        <Text style={styles.sectionTitle}>Screening History</Text>
        {data.screenings?.length === 0 ? (
          <Text style={styles.emptyText}>No screening records saved yet.</Text>
        ) : (
          data.screenings.map((item: any) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.row}>
                <Text style={styles.histTitle}>{item.testType}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.result}</Text>
                </View>
              </View>
              <Text style={styles.histSub}>
                {new Date(item.testDate).toLocaleDateString()} • {item.provider || 'Private Clinic'}
              </Text>
            </View>
          ))
        )}

        <SafetyDisclaimerBanner text="Regular cervical screening and reproductive checkups promote long-term wellness. Consult your clinician for screening intervals." />
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
      marginVertical: 10,
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
      fontWeight: '800',
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
      fontSize: 15,
      fontWeight: '800',
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 16,
    },
    historyCard: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    histTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.darkText,
    },
    badge: {
      backgroundColor: colors.softBackground,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    histSub: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
  });
