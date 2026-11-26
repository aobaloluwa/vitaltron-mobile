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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import {
  getPostpartumProfile,
  createPostpartumProfile,
  logBreastfeeding,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';
import { PostpartumInsightsCard } from '../../../components/womens-health/PostpartumInsightsCard';
import { DatePickerInput } from '../../../components/ui/DatePickerInput';

export default function PostpartumCareScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [postpartumData, setPostpartumData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Postpartum Setup State
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryType, setDeliveryType] = useState('VAGINAL');
  const [moodRating, setMoodRating] = useState(8);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(null);

  // Feeding log state
  const [breastSide, setBreastSide] = useState('LEFT');
  const [durationMins, setDurationMins] = useState('15');
  const [savingFeed, setSavingFeed] = useState(false);
  const [feedSuccess, setFeedSuccess] = useState(false);
  const [feedErrorMessage, setFeedErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await getPostpartumProfile();
      setPostpartumData(data);
      if (data?.profile?.deliveryDate) {
        setDeliveryDate(data.profile.deliveryDate.split('T')[0]);
      }
      if (data?.profile?.deliveryType) {
        setDeliveryType(data.profile.deliveryType);
      }
      if (data?.profile?.moodRating) {
        setMoodRating(data.profile.moodRating);
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
    setProfileErrorMessage(null);
    if (!deliveryDate || !deliveryDate.trim()) {
      setProfileErrorMessage('⚠️ Please select your delivery date.');
      return;
    }
    setSavingProfile(true);
    try {
      await createPostpartumProfile({
        deliveryDate: deliveryDate.trim(),
        deliveryType,
        moodRating,
      });
      setProfileErrorMessage(null);
      setModalVisible(false);
      void loadData();
    } catch (err: any) {
      setProfileErrorMessage(err?.message || 'Failed to update postpartum profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogFeeding = async () => {
    setFeedErrorMessage(null);
    setFeedSuccess(false);

    const mins = parseInt(durationMins, 10);
    if (isNaN(mins) || mins <= 0) {
      setFeedErrorMessage('⚠️ Please enter a valid feeding duration in minutes.');
      return;
    }

    setSavingFeed(true);
    try {
      await logBreastfeeding({
        startTime: new Date().toISOString(),
        breastSide,
        durationMinutes: mins,
      });
      setFeedSuccess(true);
      setFeedErrorMessage(null);
      void loadData();
    } catch (err: any) {
      setFeedErrorMessage(err?.message || 'Failed to record feeding session.');
    } finally {
      setSavingFeed(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Postpartum Care" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const profile = postpartumData?.profile;
  const feedHistory = profile?.breastfeedings || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader
        title="Postpartum Care"
        subtitle="Maternal Recovery & Breastfeeding"
        rightActionIcon="create-outline"
        onRightAction={() => setModalVisible(true)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Recovery Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTag}>POSTPARTUM RECOVERY</Text>
              <Text style={styles.cardTitle}>
                {postpartumData?.weeksPostpartum !== undefined
                  ? `Week ${postpartumData.weeksPostpartum} Postpartum`
                  : '4th Trimester Support'}
              </Text>
              <Text style={styles.cardSub}>
                Delivery Date:{' '}
                {profile?.deliveryDate
                  ? new Date(profile.deliveryDate).toLocaleDateString()
                  : 'Recent Delivery'}
              </Text>
            </View>
            <Pressable style={styles.editBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile?.deliveryType || 'VAGINAL'}</Text>
              <Text style={styles.statLabel}>Delivery Method</Text>
            </View>

            <View style={styles.vDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile?.moodRating || 8}/10</Text>
              <Text style={styles.statLabel}>Mood Score</Text>
            </View>
          </View>
        </View>

        {/* Personalized Real-Time 4th Trimester Insights Card */}
        <PostpartumInsightsCard insights={postpartumData?.postpartumInsights} />

        {/* Breastfeeding Tracker */}
        <Text style={styles.sectionTitle}>Log Breastfeeding / Expressed Milk</Text>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Breast Side</Text>
          <View style={styles.pillRow}>
            {['LEFT', 'RIGHT', 'BOTH'].map((side) => (
              <Pressable
                key={side}
                style={[styles.pill, breastSide === side && styles.pillActive]}
                onPress={() => setBreastSide(side)}
              >
                <Text style={[styles.pillText, breastSide === side && styles.pillTextActive]}>
                  {side}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Duration (Minutes)</Text>
          <TextInput
            style={styles.input}
            value={durationMins}
            onChangeText={setDurationMins}
            keyboardType="numeric"
            placeholder="15"
          />

          {feedErrorMessage ? <Text style={styles.errorText}>{feedErrorMessage}</Text> : null}

          <Pressable style={styles.saveBtn} onPress={() => void handleLogFeeding()} disabled={savingFeed}>
            {savingFeed ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Log Feeding Session</Text>
            )}
          </Pressable>

          {feedSuccess ? <Text style={styles.successText}>✓ Feeding session recorded!</Text> : null}
        </View>

        {/* Feeding History */}
        <Text style={styles.sectionTitle}>Recent Feeding History</Text>
        {feedHistory.length === 0 ? (
          <View style={styles.historyCard}>
            <Text style={styles.emptyHistoryText}>No feeding sessions logged yet.</Text>
          </View>
        ) : (
          <View style={styles.historyCard}>
            {feedHistory.map((item: any, idx: number) => (
              <View key={item.id || idx} style={styles.historyRow}>
                <MaterialCommunityIcons name="baby-bottle" size={20} color={colors.primary} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>
                    {item.breastSide} Breast ({item.durationMinutes || 15} mins)
                  </Text>
                  <Text style={styles.historySub}>
                    {new Date(item.startTime).toLocaleDateString()} at{' '}
                    {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <SafetyDisclaimerBanner
          text="URGENT: If you experience severe heavy bleeding, high fever, chest pain, or symptoms of postpartum depression, contact your obstetrician or emergency services immediately."
          isUrgent
        />
      </ScrollView>

      {/* Postpartum Setup Modal */}
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
                <Text style={styles.modalTitle}>Update Postpartum Profile</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={22} color={colors.darkText} />
                </Pressable>
              </View>

              <DatePickerInput
                label="Delivery Date"
                value={deliveryDate}
                onChange={setDeliveryDate}
                placeholder="Select Delivery Date"
              />

              <Text style={styles.label}>Delivery Method</Text>
              <View style={styles.pillRow}>
                {['VAGINAL', 'CESAREAN', 'VBAC'].map((type) => (
                  <Pressable
                    key={type}
                    style={[styles.pill, deliveryType === type && styles.pillActive]}
                    onPress={() => setDeliveryType(type)}
                  >
                    <Text style={[styles.pillText, deliveryType === type && styles.pillTextActive]}>
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Current Mood / Wellness Rating ({moodRating}/10)</Text>
              <View style={styles.moodRow}>
                {[2, 4, 6, 8, 10].map((rating) => (
                  <Pressable
                    key={rating}
                    style={[styles.moodPill, moodRating === rating && styles.moodPillActive]}
                    onPress={() => setMoodRating(rating)}
                  >
                    <Text
                      style={[styles.moodPillText, moodRating === rating && styles.moodPillTextActive]}
                    >
                      {rating}/10
                    </Text>
                  </Pressable>
                ))}
              </View>

              {profileErrorMessage ? <Text style={styles.errorText}>{profileErrorMessage}</Text> : null}

              <Pressable
                style={styles.saveBtn}
                onPress={() => void handleSaveProfile()}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Postpartum Profile</Text>
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
    card: {
      backgroundColor: colors.white,
      borderRadius: 22,
      padding: 18,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
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
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
    editBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: 14,
      marginTop: 14,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
    },
    statVal: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
    vDivider: {
      width: 1,
      backgroundColor: colors.softBackground,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 16,
      marginBottom: 10,
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
      gap: 8,
      marginBottom: 8,
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
    moodRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 6,
    },
    moodPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    moodPillActive: {
      backgroundColor: colors.primary,
    },
    moodPillText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.darkText,
    },
    moodPillTextActive: {
      color: colors.white,
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
    errorText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#EF4444',
      textAlign: 'center',
      marginTop: 12,
    },
    successText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.success,
      textAlign: 'center',
      marginTop: 10,
    },
    historyCard: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    emptyHistoryText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.softBackground,
    },
    historyInfo: {
      flex: 1,
    },
    historyTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.darkText,
    },
    historySub: {
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
  });
