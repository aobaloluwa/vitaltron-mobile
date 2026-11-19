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
  getMenopauseProfile,
  logMenopauseSymptom,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';

export default function MenopauseTrackerScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Symptom log state
  const [hotFlash, setHotFlash] = useState(3);
  const [nightSweats, setNightSweats] = useState(false);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [brainFog, setBrainFog] = useState(2);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadData = async () => {
    try {
      const data = await getMenopauseProfile();
      setProfile(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSaveSymptom = async () => {
    setSaving(true);
    setSavedSuccess(false);
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
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Menopause Tracker" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Menopause Tracker" subtitle="Perimenopause & Menopause Symptoms" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Stage Overview Card */}
        <View style={styles.card}>
          <Text style={styles.cardTag}>LIFE STAGE OVERVIEW</Text>
          <Text style={styles.cardTitle}>{profile?.stage || 'Perimenopause Management'}</Text>
          <Text style={styles.cardSub}>
            Track hormonal transitions, vasomotor symptoms, sleep quality, and mood changes.
          </Text>
        </View>

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

          <Pressable style={styles.saveBtn} onPress={() => void handleSaveSymptom()} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save Menopause Symptoms</Text>
            )}
          </Pressable>

          {savedSuccess ? <Text style={styles.successText}>✓ Symptoms saved!</Text> : null}
        </View>

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
      paddingBottom: 32,
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
    successText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.success,
      textAlign: 'center',
      marginTop: 10,
    },
  });
