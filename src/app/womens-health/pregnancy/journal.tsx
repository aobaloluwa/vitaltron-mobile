import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../theme';
import {
  getPregnancyJournals,
  createPregnancyJournal,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';

const MOODS = ['Happy', 'Calm', 'Emotional', 'Anxious', 'Excited', 'Tired'];

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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
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

  const handlePickImage = async (useCamera = false) => {
    try {
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          alert('Camera permission is required to capture photos.');
          return;
        }
        const res = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.6,
          base64: true,
        });
        if (!res.canceled && res.assets?.[0]) {
          const asset = res.assets[0];
          const uri = asset.base64
            ? `data:image/jpeg;base64,${asset.base64}`
            : asset.uri;
          setPhotoUrl(uri);
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          alert('Photo library permission is required to choose photos.');
          return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.6,
          base64: true,
        });
        if (!res.canceled && res.assets?.[0]) {
          const asset = res.assets[0];
          const uri = asset.base64
            ? `data:image/jpeg;base64,${asset.base64}`
            : asset.uri;
          setPhotoUrl(uri);
        }
      }
    } catch (err) {
      console.error('Failed to pick image:', err);
    }
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateEntry = async () => {
    setErrorMessage(null);
    if (!title || !title.trim()) {
      setErrorMessage('⚠️ Please enter a title for your journal entry.');
      return;
    }
    if (!content || !content.trim()) {
      setErrorMessage('⚠️ Please enter reflection notes for your entry.');
      return;
    }

    setSaving(true);
    try {
      await createPregnancyJournal({
        title: title.trim(),
        content: content.trim(),
        weekNumber: parseInt(weekNumber, 10) || 14,
        mood,
        photoUrl: photoUrl || undefined,
      });
      setTitle('');
      setContent('');
      setPhotoUrl(null);
      setErrorMessage(null);
      setModalVisible(false);
      void loadJournals();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save entry. Please try again.');
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
        subtitle="Memories & Ultrasound Photos"
        rightActionIcon="add-circle-outline"
        onRightAction={() => setModalVisible(true)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="camera-outline" size={20} color={colors.white} />
          <Text style={styles.addBtnText}>Write Entry & Upload Photo</Text>
        </Pressable>

        {journals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Memories Uploaded Yet</Text>
            <Text style={styles.emptySub}>
              Upload your ultrasound scans, bump progress photos, and weekly reflections.
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

              {/* Memory Photo Preview */}
              {item.photoUrl ? (
                <View style={styles.imageCardWrapper}>
                  <Image
                    source={{ uri: item.photoUrl }}
                    style={styles.journalImage}
                    resizeMode="cover"
                  />
                </View>
              ) : null}

              {item.mood ? (
                <View style={styles.moodPill}>
                  <Text style={styles.moodText}>Mood: {item.mood}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Entry with Photo Uploader */}
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
                <Text style={styles.modalTitle}>New Memory & Photo Entry</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={22} color={colors.darkText} />
                </Pressable>
              </View>

              <Text style={styles.label}>Memory Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ultrasound Scan / Baby Bump Day"
              />

              <Text style={styles.label}>Gestational Week Number</Text>
              <TextInput
                style={styles.input}
                value={weekNumber}
                onChangeText={setWeekNumber}
                keyboardType="numeric"
                placeholder="14"
              />

              <Text style={styles.label}>Mood / Feeling</Text>
              <View style={styles.moodRow}>
                {MOODS.map((m) => (
                  <Pressable
                    key={m}
                    style={[styles.moodOption, mood === m && styles.moodOptionActive]}
                    onPress={() => setMood(m)}
                  >
                    <Text style={[styles.moodOptionText, mood === m && styles.moodOptionTextActive]}>
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Reflection & Notes</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={content}
                onChangeText={setContent}
                placeholder="Write your memories and milestone notes..."
                multiline
              />

              {/* Photo Upload Options */}
              <Text style={styles.label}>Attach Photo or Ultrasound Scan</Text>
              {photoUrl ? (
                <View style={styles.previewWrapper}>
                  <Image source={{ uri: photoUrl }} style={styles.previewImage} resizeMode="cover" />
                  <Pressable style={styles.removePhotoBtn} onPress={() => setPhotoUrl(null)}>
                    <Ionicons name="trash-outline" size={16} color={colors.white} />
                    <Text style={styles.removePhotoText}>Remove Photo</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.photoPickerRow}>
                  <Pressable
                    style={styles.pickerBtn}
                    onPress={() => void handlePickImage(false)}
                  >
                    <Ionicons name="images-outline" size={20} color={colors.primary} />
                    <Text style={styles.pickerBtnText}>Choose from Gallery</Text>
                  </Pressable>

                  <Pressable
                    style={styles.pickerBtn}
                    onPress={() => void handlePickImage(true)}
                  >
                    <Ionicons name="camera-outline" size={20} color={colors.primary} />
                    <Text style={styles.pickerBtnText}>Take Photo</Text>
                  </Pressable>
                </View>
              )}

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <Pressable
                style={styles.saveBtn}
                onPress={() => void handleCreateEntry()}
                disabled={saving}
              >
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
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.softBackground,
      shadowColor: colors.darkText,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
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
    imageCardWrapper: {
      marginTop: 12,
      borderRadius: 16,
      overflow: 'hidden',
    },
    journalImage: {
      width: '100%',
      height: 200,
      borderRadius: 16,
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
      maxHeight: '90%',
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
    moodRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    moodOption: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
    },
    moodOptionActive: {
      backgroundColor: colors.primary,
    },
    moodOptionText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.darkText,
    },
    moodOptionTextActive: {
      color: colors.white,
    },
    photoPickerRow: {
      flexDirection: 'row',
      gap: 10,
    },
    pickerBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    pickerBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
    },
    previewWrapper: {
      position: 'relative',
      borderRadius: 16,
      overflow: 'hidden',
    },
    previewImage: {
      width: '100%',
      height: 180,
      borderRadius: 16,
    },
    removePhotoBtn: {
      position: 'absolute',
      top: 10,
      right: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(239, 68, 68, 0.9)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    removePhotoText: {
      color: colors.white,
      fontSize: 11,
      fontWeight: '700',
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
    errorText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#EF4444',
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 2,
    },
  });
