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
import { getWomensHealthDashboard, logDailyCycle } from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

const COMMON_SYMPTOMS = [
  'Cramps',
  'Headache',
  'Bloating',
  'Breast Tenderness',
  'Fatigue',
  'Acne',
  'Back Pain',
  'Nausea',
  'Cravings',
  'Pelvic Pain',
];

const MOODS = ['Happy', 'Calm', 'Anxious', 'Irritable', 'Sad', 'Energetic', 'Emotional'];

export default function SymptomsTrackerScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, number>>({});
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadTodayLog = useCallback(async () => {
    try {
      const dashboard = await getWomensHealthDashboard();
      if (dashboard?.todayLog) {
        if (dashboard.todayLog.mood) {
          setSelectedMood(dashboard.todayLog.mood);
        }
        if (dashboard.todayLog.symptoms && typeof dashboard.todayLog.symptoms === 'object') {
          setSelectedSymptoms(dashboard.todayLog.symptoms);
        }
        if (dashboard.todayLog.notes) {
          setNotes(dashboard.todayLog.notes);
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
    void loadTodayLog();
  }, [loadTodayLog]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadTodayLog();
  };

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) => {
      const next = { ...prev };
      if (next[sym]) {
        delete next[sym];
      } else {
        next[sym] = 5;
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await logDailyCycle({
        date: new Date().toISOString().split('T')[0],
        symptoms: selectedSymptoms,
        mood: selectedMood,
        notes,
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
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <WomensHealthHeader title="Symptoms & Mood" subtitle="Daily Wellness Log" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonLoader height={24} width="60%" style={{ marginVertical: 12 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonLoader key={i} height={40} width={100} borderRadius={14} />
            ))}
          </View>

          <SkeletonLoader height={24} width="50%" style={{ marginVertical: 16 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonLoader key={i} height={40} width={110} borderRadius={14} />
            ))}
          </View>

          <SkeletonLoader height={80} borderRadius={16} style={{ marginTop: 20 }} />
          <SkeletonLoader height={50} borderRadius={16} style={{ marginTop: 20 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Symptoms & Mood" subtitle="Daily Wellness Log" />

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
        {/* Mood Selector */}
        <Text style={styles.sectionTitle}>How are you feeling today?</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((m) => (
            <Pressable
              key={m}
              style={[styles.moodPill, selectedMood === m && styles.moodPillActive]}
              onPress={() => setSelectedMood(m)}
            >
              <Text style={[styles.moodText, selectedMood === m && styles.moodTextActive]}>{m}</Text>
            </Pressable>
          ))}
        </View>

        {/* Symptoms Grid */}
        <Text style={styles.sectionTitle}>Symptoms Experienced</Text>
        <View style={styles.symptomGrid}>
          {COMMON_SYMPTOMS.map((sym) => {
            const isSelected = !!selectedSymptoms[sym];
            return (
              <Pressable
                key={sym}
                style={[styles.symPill, isSelected && styles.symPillActive]}
                onPress={() => toggleSymptom(sym)}
              >
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                  size={16}
                  color={isSelected ? colors.white : colors.primary}
                />
                <Text style={[styles.symText, isSelected && styles.symTextActive]}>{sym}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Additional Notes */}
        <Text style={styles.sectionTitle}>Additional Daily Notes</Text>
        <TextInput
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any sleep quality, stress levels, or triggers..."
          multiline
        />

        <Pressable style={styles.saveBtn} onPress={() => void handleSave()} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Symptoms & Mood Log</Text>
          )}
        </Pressable>

        {savedSuccess ? (
          <Text style={styles.successText}>✓ Daily symptoms logged & dashboard updated!</Text>
        ) : null}
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
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 16,
      marginBottom: 10,
    },
    moodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    moodPill: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    moodPillActive: {
      backgroundColor: colors.primary,
    },
    moodText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
    },
    moodTextActive: {
      color: colors.white,
    },
    symptomGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    symPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    symPillActive: {
      backgroundColor: colors.primary,
    },
    symText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
    },
    symTextActive: {
      color: colors.white,
    },
    input: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 14,
      fontSize: 14,
      color: colors.darkText,
      borderWidth: 1,
      borderColor: colors.softBackground,
      height: 80,
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
    successText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.success,
      textAlign: 'center',
      marginTop: 12,
    },
  });
