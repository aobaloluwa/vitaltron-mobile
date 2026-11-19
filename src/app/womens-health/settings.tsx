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
import { useTheme } from '../../theme';
import {
  getWomensHealthProfile,
  updateWomensHealthProfile,
  TrackingMode,
} from '../../services/womensHealth';
import { WomensHealthHeader } from '../../components/womens-health/WomensHealthHeader';

const MODES: { key: TrackingMode; title: string; desc: string }[] = [
  { key: 'MENSTRUAL', title: 'Menstrual Cycle Tracking', desc: 'Track periods, flow, PMS symptoms, and predictions.' },
  { key: 'CONCEPTION', title: 'Conception & Fertility', desc: 'Monitor BBT, LH surge, cervical mucus, and fertile windows.' },
  { key: 'PREGNANCY', title: 'Pregnancy Progress', desc: 'Gestational week tracking, kick counter, contractions, and weekly guides.' },
  { key: 'POSTPARTUM', title: 'Postpartum Care', desc: 'Maternal recovery, lochia status, mood, and breastfeeding timers.' },
  { key: 'MENOPAUSE', title: 'Menopause & Perimenopause', desc: 'Vasomotor hot flash tracking, night sweats, sleep, and brain fog.' },
];

export default function WomensHealthSettingsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<TrackingMode>('MENSTRUAL');
  const [avgCycleLength, setAvgCycleLength] = useState('28');
  const [avgPeriodDuration, setAvgPeriodDuration] = useState('5');
  const [isHighPrivacy, setIsHighPrivacy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await getWomensHealthProfile();
      if (data) {
        setActiveMode(data.activeMode || 'MENSTRUAL');
        setAvgCycleLength(data.averageCycleLength?.toString() || '28');
        setAvgPeriodDuration(data.averagePeriodDuration?.toString() || '5');
        setIsHighPrivacy(data.isHighPrivacy || false);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await updateWomensHealthProfile({
        activeMode,
        averageCycleLength: parseInt(avgCycleLength, 10) || 28,
        averagePeriodDuration: parseInt(avgPeriodDuration, 10) || 5,
        isHighPrivacy,
      });
      setSuccess(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Women's Health Settings" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Women's Health Settings" subtitle="Mode & Privacy Preferences" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Life Stage Mode Switcher */}
        <Text style={styles.sectionTitle}>Active Life Stage Mode</Text>
        {MODES.map((mode) => {
          const isSelected = activeMode === mode.key;
          return (
            <Pressable
              key={mode.key}
              style={[styles.modeCard, isSelected && styles.modeCardActive]}
              onPress={() => setActiveMode(mode.key)}
            >
              <View style={styles.row}>
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={isSelected ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.modeTitle, isSelected && styles.modeTitleActive]}>
                  {mode.title}
                </Text>
              </View>
              <Text style={styles.modeDesc}>{mode.desc}</Text>
            </Pressable>
          );
        })}

        {/* Cycle Parameters */}
        <Text style={styles.sectionTitle}>Cycle Parameters</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Average Cycle Length (Days)</Text>
          <TextInput
            style={styles.input}
            value={avgCycleLength}
            onChangeText={setAvgCycleLength}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Average Period Duration (Days)</Text>
          <TextInput
            style={styles.input}
            value={avgPeriodDuration}
            onChangeText={setAvgPeriodDuration}
            keyboardType="numeric"
          />
        </View>

        {/* Privacy & Notification Shield */}
        <Text style={styles.sectionTitle}>Privacy & Discretion</Text>
        <Pressable
          style={styles.privacyCard}
          onPress={() => setIsHighPrivacy(!isHighPrivacy)}
        >
          <View style={styles.row}>
            <Ionicons
              name={isHighPrivacy ? 'checkbox' : 'square-outline'}
              size={22}
              color={colors.primary}
            />
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyTitle}>Discreet Notification Text</Text>
              <Text style={styles.privacySub}>
                Hide explicit health terms in lock-screen notifications and emails.
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.saveBtn} onPress={() => void handleSave()} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Preferences</Text>
          )}
        </Pressable>

        {success ? <Text style={styles.successText}>✓ Preferences updated successfully!</Text> : null}
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
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 16,
      marginBottom: 10,
    },
    modeCard: {
      backgroundColor: colors.white,
      borderRadius: 18,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    modeCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.inputBackground,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    modeTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
    },
    modeTitleActive: {
      color: colors.primary,
    },
    modeDesc: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 17,
      marginTop: 6,
      marginLeft: 30,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
      marginTop: 8,
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
    privacyCard: {
      backgroundColor: colors.white,
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    privacyTextContainer: {
      flex: 1,
    },
    privacyTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.darkText,
    },
    privacySub: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 10,
    },
    saveBtnText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '800',
    },
    successText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.success,
      textAlign: 'center',
      marginTop: 12,
    },
  });
