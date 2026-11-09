import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { createHealthRecord, getTimeline, HealthRecord, RecordType } from '../../services/healthRecords';
import { getUserProfile } from '../../services/users';
import { colors } from '../../theme';

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [timeline, setTimeline] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add Record Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [recordType, setRecordType] = useState<RecordType>('DIAGNOSIS');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const fullUser = await getUserProfile().catch(() => null);
      if (fullUser) {
        setUserName(fullUser.displayName || 'Patient Identity');
      }

      const timelineData = await getTimeline({ limit: 10 }).catch(() => ({ records: [] }));
      setTimeline(timelineData.records || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    void fetchData();
  };

  const handleCreateRecord = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a record title.');
      return;
    }

    setSubmitting(true);
    try {
      await createHealthRecord({
        type: recordType,
        title: title.trim(),
        description: description.trim(),
        facilityName: facilityName.trim(),
      });

      setTitle('');
      setDescription('');
      setFacilityName('');
      setModalVisible(false);
      Alert.alert('Record Saved', 'New record added to your universal timeline.');
      void fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        {loading ? (
          /* Skeleton Loader */
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonHeader}>
              <SkeletonLoader width={48} height={48} borderRadius={24} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <SkeletonLoader width={40} height={40} borderRadius={20} />
                <SkeletonLoader width={40} height={40} borderRadius={20} />
              </View>
            </View>

            <SkeletonLoader width="100%" height={100} borderRadius={22} style={{ marginBottom: 16 }} />
            <SkeletonLoader width="100%" height={120} borderRadius={22} style={{ marginBottom: 16 }} />

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <SkeletonLoader width="48%" height={120} borderRadius={22} />
              <SkeletonLoader width="48%" height={120} borderRadius={22} />
            </View>
          </View>
        ) : (
          <>
            {/* Top Bar */}
            <View style={styles.topHeaderBar}>
              <Pressable onPress={() => router.push('/profile/health-vitals')}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={24} color={colors.white} />
                </View>
              </Pressable>

              <View style={styles.topRightActions}>
                <Pressable style={styles.iconBtn}>
                  <Ionicons name="search-outline" size={20} color={colors.darkText} />
                </Pressable>
                <Pressable style={styles.iconBtn}>
                  <Ionicons name="notifications-outline" size={20} color={colors.darkText} />
                  <View style={styles.notifDot} />
                </Pressable>
              </View>
            </View>

            {/* Health Overview & Appointment Card Header */}
            <View style={styles.overviewHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.overviewTitle}>Health</Text>
                <Text style={styles.overviewTitle}>overview</Text>
              </View>

              {/* Appointment / Clinical Grant Card */}
              <Pressable
                style={styles.appointmentCard}
                onPress={() => router.push('/profile/sharing-preferences')}
              >
                <View style={styles.dateBox}>
                  <Text style={styles.dateNum}>13</Text>
                  <Text style={styles.dateLabel}>WED</Text>
                </View>

                <View>
                  <Text style={styles.docName}>Dr. Minois</Text>
                  <View style={styles.timeRow}>
                    <Feather name="clock" size={11} color={colors.textMuted} />
                    <Text style={styles.timeText}>9:00am</Text>
                  </View>
                </View>
              </Pressable>
            </View>

            {/* Todays Medication Carousel */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Todays medication</Text>
              <Pressable onPress={() => router.push('/records/medication-history')}>
                <Text style={styles.viewAllText}>View all &gt;</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.medsScroll}>
              <View style={styles.medCard}>
                <View style={styles.medCardTop}>
                  <View style={styles.pillBadge}>
                    <MaterialCommunityIcons name="pill" size={16} color={colors.primary} />
                    <Text style={styles.pillBadgeText}>30</Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.medName}>Sertraline 100mg</Text>
                    <Text style={styles.medInstruction}>Take one tablet once a day</Text>
                  </View>

                  <Feather name="more-vertical" size={18} color={colors.textMuted} />
                </View>

                <View style={styles.medCardFooter}>
                  <Text style={styles.dueText}>Due to be taken at</Text>
                  <View style={styles.dueTimePill}>
                    <Feather name="clock" size={12} color={colors.darkText} />
                    <Text style={styles.dueTimeText}>9:00am</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* My Health 2x2 Grid */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My health</Text>
              <Pressable onPress={() => router.push('/records/lab-results')}>
                <Text style={styles.viewAllText}>View all &gt;</Text>
              </Pressable>
            </View>

            <View style={styles.grid2x2}>
              {/* Card 1: Blood pressure */}
              <View style={styles.healthTile}>
                <View style={styles.tileHeader}>
                  <View style={styles.tileIconCircle}>
                    <Ionicons name="water-outline" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.tileTitle}>Blood pressure</Text>
                </View>

                {/* Smooth Sine Wave Line Sparkline */}
                <View style={styles.sparklineBox}>
                  <Svg width="100%" height="28" viewBox="0 0 120 28">
                    <Path
                      d="M 0 14 C 20 4, 40 24, 60 14 C 80 4, 100 24, 120 14"
                      fill="none"
                      stroke={colors.primary}
                      strokeWidth="2.5"
                    />
                  </Svg>
                </View>

                <Text style={styles.tileBigVal}>102/80 <Text style={styles.tileUnit}>mmHg</Text></Text>
              </View>

              {/* Card 2: Heart rate (Brand Highlighted) */}
              <Pressable
                style={[styles.healthTile, styles.healthTileActive]}
                onPress={() => router.push('/records/vital-analytics')}
              >
                <View style={styles.tileHeader}>
                  <View style={[styles.tileIconCircle, { backgroundColor: colors.white }]}>
                    <Ionicons name="heart" size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.tileTitle, { color: colors.white }]}>Heart rate</Text>
                </View>

                {/* Smooth Pulse Wave Sparkline */}
                <View style={styles.sparklineBox}>
                  <Svg width="100%" height="28" viewBox="0 0 120 28">
                    <Path
                      d="M 0 18 L 30 18 L 40 4 L 50 24 L 60 10 L 70 18 L 120 18"
                      fill="none"
                      stroke={colors.white}
                      strokeWidth="2.5"
                    />
                  </Svg>
                </View>

                <Text style={[styles.tileBigVal, { color: colors.white }]}>72 <Text style={[styles.tileUnit, { color: colors.secondary }]}>BPM</Text></Text>
              </Pressable>

              {/* Card 3: Sleep */}
              <View style={styles.healthTile}>
                <View style={styles.tileHeader}>
                  <View style={styles.tileIconCircle}>
                    <Ionicons name="moon-outline" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.tileTitle}>Sleep</Text>
                </View>

                {/* Vertical Bar Sparkline */}
                <View style={styles.barSparklineBox}>
                  <Svg width="100%" height="28" viewBox="0 0 100 28">
                    <Rect x="5" y="10" width="8" height="18" rx="4" fill={colors.primary} />
                    <Rect x="25" y="4" width="8" height="24" rx="4" fill={colors.primary} />
                    <Rect x="45" y="14" width="8" height="14" rx="4" fill={colors.secondary} />
                    <Rect x="65" y="2" width="8" height="26" rx="4" fill={colors.primary} />
                    <Rect x="85" y="8" width="8" height="20" rx="4" fill={colors.secondary} />
                  </Svg>
                </View>

                <Text style={styles.tileBigVal}>9 <Text style={styles.tileUnit}>Hours</Text></Text>
              </View>

              {/* Card 4: Calories / Intake */}
              <View style={styles.healthTile}>
                <View style={styles.tileHeader}>
                  <View style={styles.tileIconCircle}>
                    <Ionicons name="flame-outline" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.tileTitle}>Calories</Text>
                </View>

                {/* SVG Donut Ring Sparkline */}
                <View style={styles.donutSparklineBox}>
                  <Svg width="40" height="40" viewBox="0 0 40 40">
                    <Circle cx="20" cy="20" r="15" stroke={colors.softBackground} strokeWidth="5" fill="none" />
                    <Circle
                      cx="20"
                      cy="20"
                      r="15"
                      stroke={colors.primary}
                      strokeWidth="5"
                      strokeDasharray="94"
                      strokeDashoffset="28"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </Svg>
                </View>

                <Text style={styles.tileBigVal}>342 <Text style={styles.tileUnit}>Kcal</Text></Text>
              </View>
            </View>

            {/* Universal Health Timeline Entries */}
            <View style={styles.timelineCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Universal Timeline</Text>
                <Pressable style={styles.addPillBtn} onPress={() => setModalVisible(true)}>
                  <Ionicons name="add" size={16} color={colors.white} />
                  <Text style={styles.addPillText}>Add</Text>
                </Pressable>
              </View>

              {timeline.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="medical-outline" size={38} color={colors.secondary} />
                  <Text style={styles.emptyTitle}>No Timeline Entries</Text>
                  <Text style={styles.emptySub}>Tap '+ Add' or use Scan to ingest reports.</Text>
                </View>
              ) : (
                timeline.map((item, idx) => (
                  <View key={item.id}>
                    <View style={styles.timelineRow}>
                      <View style={styles.itemIconBox}>
                        <MaterialCommunityIcons
                          name={
                            item.type === 'MEDICATION'
                              ? 'pill'
                              : item.type === 'LAB_TEST'
                              ? 'flask-outline'
                              : 'stethoscope'
                          }
                          size={20}
                          color={colors.primary}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemSub}>{item.facilityName ? `${item.facilityName} • ` : ''}{item.type}</Text>
                      </View>

                      <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>{item.verificationStatus || 'VERIFIED'}</Text>
                      </View>
                    </View>

                    {idx < timeline.length - 1 && <View style={styles.divider} />}
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Add Health Record Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Health Record</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.darkText} />
              </Pressable>
            </View>

            <AppTextInput
              label="Record Title"
              placeholder="e.g. Annual Blood Panel"
              value={title}
              onChangeText={setTitle}
            />

            <AppTextInput
              label="Facility / Hospital Name"
              placeholder="e.g. City General Hospital"
              value={facilityName}
              onChangeText={setFacilityName}
            />

            <AppTextInput
              label="Clinical Description"
              placeholder="e.g. Normal cholesterol levels"
              value={description}
              onChangeText={setDescription}
            />

            <PrimaryButton
              title="Save Record"
              onPress={handleCreateRecord}
              loading={submitting}
              variant="primary"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  skeletonContainer: {
    paddingTop: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topHeaderBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  overviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  appointmentCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  dateBox: {
    backgroundColor: colors.softBackground,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  dateNum: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkText,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  docName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.darkText,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  medsScroll: {
    paddingBottom: 16,
  },
  medCard: {
    width: 280,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  medCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pillBadgeText: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.darkText,
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
  },
  medName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.darkText,
  },
  medInstruction: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  medCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.softBackground,
  },
  dueText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  dueTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueTimeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.darkText,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  healthTile: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  healthTileActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  tileIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
  sparklineBox: {
    height: 32,
    justifyContent: 'center',
    marginBottom: 8,
  },
  barSparklineBox: {
    height: 32,
    justifyContent: 'center',
    marginBottom: 8,
  },
  donutSparklineBox: {
    height: 40,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tileBigVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.darkText,
  },
  tileUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  addPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginTop: 6,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
  },
  itemSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: colors.softBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.softBackground,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.darkText,
  },
});
