import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import {
  createPeriodRecord,
  getWomensHealthDashboard,
  FlowIntensity,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

export default function MenstrualCycleScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [flow, setFlow] = useState<FlowIntensity>('MEDIUM');
  const [isSpotting, setIsSpotting] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleSavePeriod = async () => {
    setSaving(true);
    try {
      await createPeriodRecord({
        startDate,
        flow,
        isSpotting,
        notes,
      });
      setModalVisible(false);
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
        <WomensHealthHeader title="Menstrual Cycle" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonLoader width="100%" height={120} borderRadius={22} style={{ marginVertical: 10 }} />
          <SkeletonLoader width="100%" height={48} borderRadius={16} style={{ marginVertical: 12 }} />
          <SkeletonLoader width="100%" height={90} borderRadius={18} style={{ marginBottom: 16 }} />
          <SkeletonLoader width={180} height={20} borderRadius={10} style={{ marginVertical: 10 }} />
          <SkeletonLoader width="100%" height={60} borderRadius={16} style={{ marginBottom: 10 }} />
          <SkeletonLoader width="100%" height={60} borderRadius={16} style={{ marginBottom: 10 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const cycle = dashboard?.cycleMetrics;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader
        title="Menstrual Cycle"
        subtitle="Tracking & Prediction Engine"
        rightActionIcon="calendar-outline"
        onRightAction={() => router.push('/womens-health/cycle/calendar' as any)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeaderTag}>CYCLE ANALYSIS</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>
                {cycle?.currentCycleDay ? `Day ${cycle.currentCycleDay}` : '-'}
              </Text>
              <Text style={styles.metricLabel}>Current Cycle</Text>
            </View>

            <View style={styles.vDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{cycle?.averageCycleLength || 28}d</Text>
              <Text style={styles.metricLabel}>Avg Length</Text>
            </View>

            <View style={styles.vDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{cycle?.averagePeriodDuration || 5}d</Text>
              <Text style={styles.metricLabel}>Avg Duration</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <Pressable style={styles.logBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.logBtnText}>Log Period / Flow</Text>
        </Pressable>

        {/* Phase Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{cycle?.phaseDisplayName || 'Follicular Phase'}</Text>
          <Text style={styles.infoDesc}>
            {cycle?.phaseDescription ||
              'Log your period start date to unlock dynamic phase calculations and cycle predictions.'}
          </Text>
        </View>

        {/* Key Dates Prediction List */}
        <Text style={styles.sectionTitle}>Key Predictions & Estimates</Text>

        <View style={styles.dateCard}>
          <Ionicons name="water-outline" size={22} color={colors.primary} />
          <View style={styles.dateInfo}>
            <Text style={styles.dateTitle}>Next Predicted Period</Text>
            <Text style={styles.dateSub}>
              {cycle?.estimatedNextPeriod ? cycle.estimatedNextPeriod : 'Log period start to estimate date'}
            </Text>
          </View>
        </View>

        <View style={styles.dateCard}>
          <Ionicons name="sparkles-outline" size={22} color="#EC4899" />
          <View style={styles.dateInfo}>
            <Text style={styles.dateTitle}>Estimated Ovulation</Text>
            <Text style={styles.dateSub}>
              {cycle?.estimatedOvulation ? cycle.estimatedOvulation : 'Log period start to estimate ovulation'}
            </Text>
          </View>
        </View>

        <View style={styles.dateCard}>
          <Ionicons name="heart-outline" size={22} color="#8B5CF6" />
          <View style={styles.dateInfo}>
            <Text style={styles.dateTitle}>Estimated Fertile Window</Text>
            <Text style={styles.dateSub}>
              {cycle?.fertileWindowStart
                ? `${cycle.fertileWindowStart} to ${cycle.fertileWindowEnd}`
                : 'Log period start to calculate fertile window'}
            </Text>
          </View>
        </View>

        <SafetyDisclaimerBanner text="Calendar-based predictions are estimates based on your logged cycle dates and cannot guarantee contraception." />
      </ScrollView>

      {/* Period Logging Modal with KeyboardAvoidingView & ScrollView */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Log Period Entry</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={22} color={colors.darkText} />
                </Pressable>
              </View>

              <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.inputLabel}>Flow Intensity</Text>
              <View style={styles.flowRow}>
                {(['LIGHT', 'MEDIUM', 'HEAVY', 'VERY_HEAVY'] as FlowIntensity[]).map((f) => (
                  <Pressable
                    key={f}
                    style={[styles.flowPill, flow === f && styles.flowPillActive]}
                    onPress={() => setFlow(f)}
                  >
                    <Text style={[styles.flowText, flow === f && styles.flowTextActive]}>{f}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={styles.checkboxRow}
                onPress={() => setIsSpotting(!isSpotting)}
              >
                <Ionicons
                  name={isSpotting ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.checkboxLabel}>Light Spotting Only</Text>
              </Pressable>

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any symptoms or observations..."
                multiline
              />

              <Pressable style={styles.saveBtn} onPress={() => void handleSavePeriod()} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Period Entry</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    summaryCard: {
      backgroundColor: colors.white,
      borderRadius: 22,
      padding: 18,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    cardHeaderTag: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 12,
    },
    metricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    metricItem: {
      flex: 1,
      alignItems: 'center',
    },
    metricVal: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.darkText,
    },
    metricLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
    vDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.softBackground,
    },
    logBtn: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 12,
      gap: 6,
    },
    logBtnText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '800',
    },
    infoCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
    },
    infoDesc: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.darkText,
      marginVertical: 10,
    },
    dateCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    dateInfo: {
      marginLeft: 12,
      flex: 1,
    },
    dateTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.darkText,
    },
    dateSub: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
      maxHeight: '85%',
    },
    modalScrollContent: {
      flexGrow: 1,
      paddingBottom: 16,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.darkText,
    },
    inputLabel: {
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
    flowRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 10,
    },
    flowPill: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
    },
    flowPillActive: {
      backgroundColor: colors.primary,
    },
    flowText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.darkText,
    },
    flowTextActive: {
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
  });
