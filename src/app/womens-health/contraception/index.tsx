import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
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
import { getContraception, updateContraception } from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';
import { DatePickerInput } from '../../../components/ui/DatePickerInput';
import { ContraceptionInsightsCard } from '../../../components/womens-health/ContraceptionInsightsCard';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

export default function ContraceptionScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contraceptionData, setContraceptionData] = useState<any>(null);

  const [methodType, setMethodType] = useState('PILL');
  const [brandName, setBrandName] = useState('Yasmin');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [replacementDate, setReplacementDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getContraception();
      setContraceptionData(data);
      const profile = data?.profile;
      if (profile) {
        setMethodType(profile.type || 'PILL');
        setBrandName(profile.brandName || '');
        if (profile.startDate) setStartDate(profile.startDate.split('T')[0]);
        if (profile.replacementDate) setReplacementDate(profile.replacementDate.split('T')[0]);
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

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccess(false);
    if (!startDate || !startDate.trim()) {
      setErrorMessage('⚠️ Please select a start date for your contraception method.');
      return;
    }

    setSaving(true);
    try {
      await updateContraception({
        type: methodType,
        brandName: brandName ? brandName.trim() : undefined,
        startDate: startDate.trim(),
        replacementDate: replacementDate ? replacementDate.trim() : undefined,
      });
      setSuccess(true);
      setErrorMessage(null);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update contraception method. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Birth Control Tracker" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonLoader height={140} borderRadius={22} style={{ marginVertical: 12 }} />
          <SkeletonLoader height={260} borderRadius={22} style={{ marginBottom: 16 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Birth Control Tracker" subtitle="Contraceptive Schedule & Method" />

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
        {/* Real-Time Contraception Insights Card */}
        <ContraceptionInsightsCard insights={contraceptionData?.contraceptionInsights} />

        {/* Method Setup Card */}
        <View style={styles.inputCard}>
          <Text style={styles.sectionHeader}>Contraceptive Method Setup</Text>

          <Text style={styles.label}>Contraceptive Method</Text>
          <View style={styles.pillRow}>
            {['PILL', 'IUD_HORMONAL', 'IMPLANT', 'PATCH', 'RING', 'CONDOM'].map((type) => (
              <Pressable
                key={type}
                style={[styles.pill, methodType === type && styles.pillActive]}
                onPress={() => setMethodType(type)}
              >
                <Text style={[styles.pillText, methodType === type && styles.pillTextActive]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Brand / Prescription Name</Text>
          <TextInput
            style={styles.input}
            value={brandName}
            onChangeText={setBrandName}
            placeholder="Yasmin / Mirena / Nexplanon"
          />

          <DatePickerInput
            label="Start / Insertion Date"
            value={startDate}
            onChange={setStartDate}
            placeholder="Select Start Date"
          />

          <DatePickerInput
            label="Expected Replacement / Renewal Date"
            value={replacementDate}
            onChange={setReplacementDate}
            placeholder="Select Replacement Date"
            optional
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable style={styles.saveBtn} onPress={() => void handleSave()} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save Contraception Method</Text>
            )}
          </Pressable>

          {success ? <Text style={styles.successText}>✓ Contraception profile updated!</Text> : null}
        </View>

        {/* Missed Dose Guidance Card */}
        <View style={styles.guidanceCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <View style={styles.guidanceInfo}>
            <Text style={styles.guidanceTitle}>Missed Dose Safety Note</Text>
            <Text style={styles.guidanceText}>
              For pill or patch missed doses, follow the official product pack instructions or consult your pharmacist/doctor promptly.
            </Text>
          </View>
        </View>

        <SafetyDisclaimerBanner text="Birth control tracking assists schedule management but does not replace prescription instructions from your healthcare provider." />
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
    inputCard: {
      backgroundColor: colors.white,
      borderRadius: 22,
      padding: 18,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    sectionHeader: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
      marginBottom: 10,
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
      marginTop: 18,
    },
    saveBtnText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '800',
    },
    successText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.success,
      textAlign: 'center',
      marginTop: 10,
    },
    errorText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#EF4444',
      textAlign: 'center',
      marginTop: 10,
    },
    guidanceCard: {
      flexDirection: 'row',
      backgroundColor: colors.inputBackground,
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      gap: 10,
    },
    guidanceInfo: {
      flex: 1,
    },
    guidanceTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.darkText,
    },
    guidanceText: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 17,
      marginTop: 2,
    },
  });
