import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import {
  getPregnancyProfile,
  createPregnancyProfile,
  PregnancyMetrics,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';

export default function PregnancyHubScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ profile: any; metrics: PregnancyMetrics } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Setup state
  const [dueDate, setDueDate] = useState('');
  const [provider, setProvider] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const res = await getPregnancyProfile();
      setData(res);
      if (res?.metrics?.dueDate) {
        setDueDate(res.metrics.dueDate);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await createPregnancyProfile({
        confirmedDueDate: dueDate,
        healthcareProvider: provider,
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
        <WomensHealthHeader title="Pregnancy Hub" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const m = data?.metrics;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader
        title="Pregnancy Hub"
        subtitle={m ? `Week ${m.gestationalAgeWeeks}, Day ${m.gestationalAgeDays}` : 'Gestational Tracker'}
        rightActionIcon="create-outline"
        onRightAction={() => setModalVisible(true)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Gestational Progress Card */}
        <View style={styles.heroCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTag}>{m?.trimesterName.toUpperCase() || 'TRIMESTER PROGRESS'}</Text>
              <Text style={styles.cardTitle}>
                Week {m?.gestationalAgeWeeks || 12}, Day {m?.gestationalAgeDays || 0}
              </Text>
            </View>
            <View style={styles.trimesterBadge}>
              <Text style={styles.trimesterBadgeText}>T{m?.currentTrimester || 1}</Text>
            </View>
          </View>

          {/* Baby Size Card */}
          <View style={styles.babyCard}>
            <Ionicons name="nutrition-outline" size={28} color={colors.primary} />
            <View style={styles.babyInfo}>
              <Text style={styles.babyTitle}>Size of a {m?.babySizeFruit || 'Plum'}</Text>
              <Text style={styles.babyStats}>
                ~{m?.babyLengthCm || 5.4} cm • ~{m?.babyWeightGrams || 14} g
              </Text>
            </View>
          </View>

          {/* Milestone Title & Summary */}
          <Text style={styles.milestoneTitle}>{m?.weeklyMilestoneTitle || 'Developmental Milestone'}</Text>
          <Text style={styles.milestoneSummary}>
            {m?.weeklySummary || 'Vital organs are developing rapidly.'}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${m?.progressPercent || 30}%` }]} />
            </View>
            <View style={styles.progressMeta}>
              <Text style={styles.progressMetaText}>{m?.progressPercent || 30}% Completed</Text>
              <Text style={styles.progressMetaText}>{m?.daysRemaining || 200} Days to Due Date</Text>
            </View>
          </View>
        </View>

        {/* Pregnancy Quick Tools Grid */}
        <Text style={styles.sectionTitle}>Pregnancy Tools & Features</Text>

        <View style={styles.toolsGrid}>
          <Pressable
            style={styles.toolCard}
            onPress={() => router.push('/womens-health/pregnancy/weekly-guide' as any)}
          >
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <Text style={styles.toolTitle}>Weekly Guide</Text>
            <Text style={styles.toolSub}>Weeks 1 to 42</Text>
          </Pressable>

          <Pressable
            style={styles.toolCard}
            onPress={() => router.push('/womens-health/pregnancy/kick-counter' as any)}
          >
            <MaterialCommunityIcons name="foot-print" size={24} color="#EC4899" />
            <Text style={styles.toolTitle}>Kick Counter</Text>
            <Text style={styles.toolSub}>Fetal Movement</Text>
          </Pressable>

          <Pressable
            style={styles.toolCard}
            onPress={() => router.push('/womens-health/pregnancy/contraction-timer' as any)}
          >
            <Ionicons name="stopwatch-outline" size={24} color="#F59E0B" />
            <Text style={styles.toolTitle}>Contractions</Text>
            <Text style={styles.toolSub}>Session Timer</Text>
          </Pressable>

          <Pressable
            style={styles.toolCard}
            onPress={() => router.push('/womens-health/pregnancy/journal' as any)}
          >
            <Ionicons name="journal-outline" size={24} color="#8B5CF6" />
            <Text style={styles.toolTitle}>Journal & Photos</Text>
            <Text style={styles.toolSub}>Bump Memories</Text>
          </Pressable>
        </View>

        <SafetyDisclaimerBanner text="Gestational dates and baby sizes are general guidelines. Follow your healthcare provider for clinical ultrasound dating." />
      </ScrollView>

      {/* Profile Setup Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Pregnancy Profile</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.darkText} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Estimated Due Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.inputLabel}>Healthcare Provider / OB-GYN</Text>
            <TextInput
              style={styles.input}
              value={provider}
              onChangeText={setProvider}
              placeholder="Dr. Sarah Jenkins"
            />

            <Pressable style={styles.saveBtn} onPress={() => void handleSaveProfile()} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save Pregnancy Profile</Text>
              )}
            </Pressable>
          </View>
        </View>
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
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    heroCard: {
      backgroundColor: colors.white,
      borderRadius: 22,
      padding: 20,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTag: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
    },
    cardTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 2,
    },
    trimesterBadge: {
      backgroundColor: colors.softBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
    },
    trimesterBadgeText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
    },
    babyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: 14,
      marginVertical: 14,
    },
    babyInfo: {
      marginLeft: 12,
    },
    babyTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
    },
    babyStats: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
    milestoneTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
    },
    milestoneSummary: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 4,
      marginBottom: 14,
    },
    progressContainer: {
      marginTop: 6,
    },
    progressBg: {
      height: 10,
      backgroundColor: colors.softBackground,
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 5,
    },
    progressMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    progressMetaText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.darkText,
      marginVertical: 12,
    },
    toolsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },
    toolCard: {
      width: '48%',
      backgroundColor: colors.white,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    toolTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 10,
    },
    toolSub: {
      fontSize: 11,
      fontWeight: '600',
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
      padding: 20,
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
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 20,
    },
    saveBtnText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '800',
    },
  });
