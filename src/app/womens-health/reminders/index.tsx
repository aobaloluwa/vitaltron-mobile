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
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../../theme';
import {
  getWomensHealthReminders,
  createWomensHealthReminder,
  deleteWomensHealthReminder,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { DatePickerInput } from '../../../components/ui/DatePickerInput';
import { TimePickerInput } from '../../../components/ui/TimePickerInput';

const REMINDER_CATEGORIES = [
  'MEDICATION',
  'PRENATAL',
  'CYCLE',
  'FERTILITY',
  'APPOINTMENT',
  'HYDRATION',
];

export default function RemindersScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('MEDICATION');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00 AM');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReminders = async () => {
    try {
      const data = await getWomensHealthReminders();
      setReminders(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReminders();
  }, []);

  const triggerLocalPush = async (titleStr: string, catStr: string, fullTimeStr: string) => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        finalStatus = newStatus;
      }

      if (finalStatus === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🔔 Reminder Scheduled: ${titleStr}`,
            body: `Your ${catStr.toLowerCase().replace('_', ' ')} reminder is active for ${fullTimeStr}. Check your Notifications tab!`,
            sound: true,
            data: { type: 'REMINDER' },
          },
          trigger: null, // null trigger = fires immediately as push notification on device!
        });
      }
    } catch (err) {
      console.warn('Could not fire local push notification:', err);
    }
  };

  const handleCreate = async () => {
    setErrorMessage(null);
    if (!title || !title.trim()) {
      setErrorMessage('⚠️ Please enter a title for your reminder.');
      return;
    }

    if (!date) {
      setErrorMessage('⚠️ Please select a start date for your reminder.');
      return;
    }

    setSaving(true);
    const fullScheduleTime = `${date} at ${time}`;

    try {
      await createWomensHealthReminder({
        title: title.trim(),
        category,
        reminderTime: fullScheduleTime,
      });

      // Fire real push notification on device
      void triggerLocalPush(title.trim(), category, fullScheduleTime);

      setTitle('');
      setErrorMessage(null);
      setModalVisible(false);
      void loadReminders();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create reminder. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWomensHealthReminder(id);
      void loadReminders();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Reminders" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader
        title="Health Reminders"
        subtitle="Medications, Cycles & Appointments"
        rightActionIcon="add-circle-outline"
        onRightAction={() => setModalVisible(true)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="notifications-outline" size={20} color={colors.white} />
          <Text style={styles.addBtnText}>Schedule New Reminder</Text>
        </Pressable>

        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="alarm-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Reminders Scheduled</Text>
            <Text style={styles.emptySub}>Set daily or custom reminders for prenatal care, supplements, or cycles.</Text>
          </View>
        ) : (
          reminders.map((item) => (
            <View key={item.id} style={styles.reminderCard}>
              <View style={styles.row}>
                <View style={styles.reminderInfo}>
                  <View style={styles.catBadge}>
                    <Text style={styles.catTag}>{item.category.replace('_', ' ')}</Text>
                  </View>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.timeText}>⏰ Scheduled for: {item.reminderTime}</Text>
                </View>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => void handleDelete(item.id)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Entry with DatePickerInput & TimePickerInput */}
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
                <Text style={styles.modalTitle}>New Health Reminder</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={22} color={colors.darkText} />
                </Pressable>
              </View>

              <Text style={styles.label}>Reminder Category</Text>
              <View style={styles.pillRow}>
                {REMINDER_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.catPill, category === cat && styles.catPillActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[styles.catPillText, category === cat && styles.catPillTextActive]}
                    >
                      {cat.replace('_', ' ')}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Reminder Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Prenatal Vitamin / Fertile Window"
              />

              <DatePickerInput
                label="Reminder Start Date"
                value={date}
                onChange={setDate}
                placeholder="Select Date"
              />

              <TimePickerInput
                label="Preferred Reminder Time"
                value={time}
                onChange={setTime}
              />

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <Pressable style={styles.saveBtn} onPress={() => void handleCreate()} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save & Enable Push Notification</Text>
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
    reminderCard: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.softBackground,
      shadowColor: colors.darkText,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reminderInfo: {
      flex: 1,
    },
    catBadge: {
      backgroundColor: colors.inputBackground,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      marginBottom: 4,
    },
    catTag: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.primary,
    },
    title: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
    },
    timeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 4,
    },
    deleteBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#FEF2F2',
      alignItems: 'center',
      justifyContent: 'center',
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
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 8,
    },
    catPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
    },
    catPillActive: {
      backgroundColor: colors.primary,
    },
    catPillText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.darkText,
    },
    catPillTextActive: {
      color: colors.white,
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
    errorText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#EF4444',
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 2,
    },
  });
