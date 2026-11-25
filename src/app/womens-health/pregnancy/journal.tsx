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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import {
  getPregnancyJournals,
  createPregnancyJournal,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';

export default function PregnancyJournalScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [journals, setJournals] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Entry Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [weekNumber, setWeekNumber] = useState('14');
  const [mood, setMood] = useState('Happy');
  const [saving, setSaving] = useState(false);

  const loadJournals = async () => {
    try {
      const data = await getPregnancyJournals();
      setJournals(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJournals();
  }, []);

  const handleCreateEntry = async () => {
    if (!title || !content) return;
    setSaving(true);
    try {
      await createPregnancyJournal({
        title,
        content,
        weekNumber: parseInt(weekNumber, 10) || 14,
        mood,
      });
      setTitle('');
      setContent('');
      setModalVisible(false);
      void loadJournals();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Pregnancy Journal" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader
        title="Pregnancy Journal"
        subtitle="Memories & Reflections Timeline"
        rightActionIcon="add-circle-outline"
        onRightAction={() => setModalVisible(true)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="create-outline" size={20} color={colors.white} />
          <Text style={styles.addBtnText}>Write New Journal Entry</Text>
        </Pressable>

        {journals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="journal-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Journal Entries Yet</Text>
            <Text style={styles.emptySub}>
              Capture your pregnancy milestones, ultrasound memories, and weekly thoughts.
            </Text>
          </View>
        ) : (
          journals.map((item) => (
            <View key={item.id} style={styles.journalCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.weekTag}>Week {item.weekNumber || 14}</Text>
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.journalTitle}>{item.title}</Text>
              <Text style={styles.journalContent}>{item.content}</Text>

              {item.mood ? (
                <View style={styles.moodPill}>
                  <Text style={styles.moodText}>Mood: {item.mood}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Entry with KeyboardAvoidingView */}
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
                <Text style={styles.modalTitle}>New Journal Entry</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={22} color={colors.darkText} />
                </Pressable>
              </View>

              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="First Kick / Ultrasound Day"
              />

              <Text style={styles.label}>Gestational Week Number</Text>
              <TextInput
                style={styles.input}
                value={weekNumber}
                onChangeText={setWeekNumber}
                keyboardType="numeric"
                placeholder="14"
              />

              <Text style={styles.label}>Reflection & Content</Text>
              <TextInput
                style={[styles.input, { height: 90 }]}
                value={content}
                onChangeText={setContent}
                placeholder="How are you feeling today?"
                multiline
              />

              <Pressable style={styles.saveBtn} onPress={() => void handleCreateEntry()} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Memory Entry</Text>
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
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 115 : 32,
    },
    addBtn: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 12,
      gap: 8,
    },
    addBtnText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '800',
    },
    emptyState: {
      alignItems: 'center',
      marginTop: 40,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 12,
    },
    emptySub: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 4,
    },
    journalCard: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    weekTag: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
    },
    dateText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
    },
    journalTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 4,
    },
    journalContent: {
      fontSize: 13,
      color: colors.darkText,
      lineHeight: 18,
      marginTop: 6,
    },
    moodPill: {
      backgroundColor: colors.inputBackground,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      marginTop: 10,
    },
    moodText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
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
      marginBottom: 14,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.darkText,
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
  });
