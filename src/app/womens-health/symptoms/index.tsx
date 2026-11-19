import React, { useState } from 'react';
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
import { logDailyCycle } from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';

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

  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, number>>({});
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) => {
      const next = { ...prev };
      if (next[sym]) {
        delete next[sym];
      } else {
        next[sym] = 5; // default severity 5/10
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Symptoms & Mood" subtitle="Daily Wellness Log" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        {savedSuccess ? <Text style={styles.successText}>✓ Daily symptoms logged!</Text> : null}
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
