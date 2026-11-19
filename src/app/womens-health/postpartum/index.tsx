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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import {
  getPostpartumProfile,
  createPostpartumProfile,
  logBreastfeeding,
} from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';

export default function PostpartumCareScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Feeding log state
  const [breastSide, setBreastSide] = useState('LEFT');
  const [durationMins, setDurationMins] = useState('15');
  const [savingFeed, setSavingFeed] = useState(false);
  const [feedSuccess, setFeedSuccess] = useState(false);

  const loadData = async () => {
    try {
      const data = await getPostpartumProfile();
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

  const handleLogFeeding = async () => {
    setSavingFeed(true);
    setFeedSuccess(false);
    try {
      await logBreastfeeding({
        startTime: new Date().toISOString(),
        breastSide,
        durationMinutes: parseInt(durationMins, 10) || 15,
      });
      setFeedSuccess(true);
      void loadData();
    } catch {
      // ignore
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Postpartum Care" subtitle="Maternal Recovery & Breastfeeding" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Recovery Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTag}>POSTPARTUM RECOVERY</Text>
          <Text style={styles.cardTitle}>4th Trimester Support</Text>
          <Text style={styles.cardSub}>
            Delivery Date: {profile?.deliveryDate ? new Date(profile.deliveryDate).toLocaleDateString() : 'Recent Delivery'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile?.deliveryType || 'Vaginal'}</Text>
              <Text style={styles.statLabel}>Delivery Method</Text>
            </View>

            <View style={styles.vDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile?.moodRating || 8}/10</Text>
              <Text style={styles.statLabel}>Wellness Score</Text>
            </View>
          </View>
        </View>

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

          <Pressable style={styles.saveBtn} onPress={() => void handleLogFeeding()} disabled={savingFeed}>
            {savingFeed ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Log Feeding Session</Text>
            )}
          </Pressable>

          {feedSuccess ? <Text style={styles.successText}>✓ Feeding session recorded!</Text> : null}
        </View>

        <SafetyDisclaimerBanner text="URGENT: If you experience severe heavy bleeding, high fever, chest pain, or symptoms of postpartum depression, contact your obstetrician or emergency services immediately." isUrgent />
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
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
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
      fontSize: 16,
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
