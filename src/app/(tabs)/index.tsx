import React, { useEffect, useState, useCallback } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
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
  const [selectedRecordItem, setSelectedRecordItem] = useState<HealthRecord | null>(null);

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

      const timelineData = await getTimeline({ limit: 20 }).catch(() => ({ records: [] }));
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

  useFocusEffect(
    useCallback(() => {
      void fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
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
              <Text style={styles.sectionTitle}>Active Medications</Text>
              <Pressable onPress={() => router.push('/records/medication-history')}>
                <Text style={styles.viewAllText}>View all &gt;</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.medsScroll}>
              {(() => {
                const meds = timeline.filter((item) => item.type === 'MEDICATION');
                if (meds.length === 0) {
                  return (
                    <Pressable style={styles.medCard} onPress={() => router.push('/(tabs)/scan')}>
                      <View style={styles.medCardTop}>
                        <View style={styles.pillBadge}>
                          <MaterialCommunityIcons name="pill" size={16} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.medName}>No Prescriptions Logged</Text>
                          <Text style={styles.medInstruction}>Scan a paper prescription to import</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                }

                return meds.map((med) => (
                  <View key={med.id} style={styles.medCard}>
                    <View style={styles.medCardTop}>
                      <View style={styles.pillBadge}>
                        <MaterialCommunityIcons name="pill" size={16} color={colors.primary} />
                        <Text style={styles.pillBadgeText}>Rx</Text>
                      </View>

                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.medName}>{med.title}</Text>
                        <Text style={styles.medInstruction} numberOfLines={2}>
                          {med.description || 'Prescription logged in timeline'}
                        </Text>
                      </View>

                      <Feather name="more-vertical" size={18} color={colors.textMuted} />
                    </View>

                    <View style={styles.medCardFooter}>
                      <Text style={styles.dueText}>Ingested Record</Text>
                      <View style={styles.dueTimePill}>
                        <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                        <Text style={styles.dueTimeText}>Active</Text>
                      </View>
                    </View>
                  </View>
                ));
              })()}
            </ScrollView>

            {/* My Health 2x2 Grid */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My Health Metrics</Text>
              <Pressable onPress={() => router.push('/records/lab-results')}>
                <Text style={styles.viewAllText}>View all &gt;</Text>
              </Pressable>
            </View>

            {(() => {
              const bpRecord = timeline.find(
                (item) =>
                  item.title.toLowerCase().includes('blood pressure') ||
                  item.title.toLowerCase().includes('bp') ||
                  (item.description && item.description.toLowerCase().includes('mmhg'))
              );
              const hrRecord = timeline.find(
                (item) =>
                  item.title.toLowerCase().includes('heart rate') ||
                  item.title.toLowerCase().includes('pulse') ||
                  (item.description && item.description.toLowerCase().includes('bpm'))
              );
              const labRecord = timeline.find((item) => item.type === 'LAB_TEST');

              const bpVal = bpRecord
                ? bpRecord.description?.match(/\d{2,3}\/\d{2,3}/)?.[0] || bpRecord.title.match(/\d{2,3}\/\d{2,3}/)?.[0] || '120/80'
                : '120/80';

              const hrVal = hrRecord
                ? hrRecord.description?.match(/\d{2,3}/)?.[0] || hrRecord.title.match(/\d{2,3}/)?.[0] || '72'
                : '72';

              const labTitle = labRecord ? labRecord.title.replace(/^Lab Test:\s*/i, '') : 'Glucose';
              const labVal = labRecord
                ? labRecord.description?.match(/[\d\.]+\s*(?:mg\/dL|g\/dL|mmol\/L|u\/L|mEq\/L)/i)?.[0] || '95 mg/dL'
                : '95 mg/dL';

              return (
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

                    <Text style={styles.tileBigVal}>{bpVal} <Text style={styles.tileUnit}>mmHg</Text></Text>
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

                    <Text style={[styles.tileBigVal, { color: colors.white }]}>{hrVal} <Text style={[styles.tileUnit, { color: colors.secondary }]}>BPM</Text></Text>
                  </Pressable>

                  {/* Card 3: Lab Reading */}
                  <Pressable style={styles.healthTile} onPress={() => router.push('/records/lab-results')}>
                    <View style={styles.tileHeader}>
                      <View style={styles.tileIconCircle}>
                        <MaterialCommunityIcons name="flask-outline" size={16} color={colors.primary} />
                      </View>
                      <Text style={styles.tileTitle} numberOfLines={1}>{labTitle}</Text>
                    </View>

                    <View style={styles.sparklineBox}>
                      <Svg width="100%" height="28" viewBox="0 0 120 28">
                        <Path
                          d="M 0 20 L 30 15 L 60 22 L 90 8 L 120 14"
                          fill="none"
                          stroke={colors.primary}
                          strokeWidth="2.5"
                        />
                      </Svg>
                    </View>

                    <Text style={styles.tileBigVal}>{labVal}</Text>
                  </Pressable>

                  {/* Card 4: Clinical Summary */}
                  <View style={styles.healthTile}>
                    <View style={styles.tileHeader}>
                      <View style={styles.tileIconCircle}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                      </View>
                      <Text style={styles.tileTitle}>Health Status</Text>
                    </View>

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
                          strokeDashoffset="10"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </Svg>
                    </View>

                    <Text style={styles.tileBigVal}>{timeline.length} <Text style={styles.tileUnit}>Records</Text></Text>
                  </View>
                </View>
              );
            })()}

            {/* Universal Health Timeline Entries */}
            <View style={styles.timelineCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Universal Timeline</Text>
                <Pressable onPress={() => router.push('/records/timeline')}>
                  <Text style={styles.viewAllText}>See all &gt;</Text>
                </Pressable>
              </View>

              {timeline.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="medical-outline" size={38} color={colors.secondary} />
                  <Text style={styles.emptyTitle}>No Timeline Entries</Text>
                  <Text style={styles.emptySub}>Use Scan to ingest medical reports.</Text>
                </View>
              ) : (
                timeline.slice(0, 5).map((item, idx) => (
                  <View key={item.id}>
                    <Pressable style={styles.timelineRow} onPress={() => setSelectedRecordItem(item)}>
                      <View style={styles.itemIconBox}>
                        <MaterialCommunityIcons
                          name={
                            item.type === 'MEDICATION'
                              ? 'pill'
                              : item.type === 'LAB_TEST'
                              ? 'flask-outline'
                              : item.type === 'VITAL_SIGN'
                              ? 'heart-pulse'
                              : 'stethoscope'
                          }
                          size={20}
                          color={colors.primary}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemSub} numberOfLines={1}>
                          {item.facilityName ? `${item.facilityName} • ` : ''}{item.type.replace('_', ' ')}
                        </Text>
                      </View>

                      <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>
                          {item.verificationStatus === 'PATIENT_CONFIRMED' ? 'CONFIRMED' : item.verificationStatus || 'VERIFIED'}
                        </Text>
                      </View>
                    </Pressable>

                    {idx < Math.min(timeline.length, 5) - 1 && <View style={styles.divider} />}
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Record Detail Inspection Modal */}
      {selectedRecordItem && (
        <Modal visible={!!selectedRecordItem} animationType="fade" transparent={true}>
          <View style={styles.detailModalOverlay}>
            <View style={styles.detailModalCard}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalTitleBox}>
                  <MaterialCommunityIcons
                    name={
                      selectedRecordItem.type === 'MEDICATION'
                        ? 'pill'
                        : selectedRecordItem.type === 'LAB_TEST'
                        ? 'flask-outline'
                        : selectedRecordItem.type === 'VITAL_SIGN'
                        ? 'heart-pulse'
                        : 'stethoscope'
                    }
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.modalTitleText} numberOfLines={2}>
                    {selectedRecordItem.title}
                  </Text>
                </View>
                <Pressable onPress={() => setSelectedRecordItem(null)} hitSlop={10}>
                  <Ionicons name="close" size={24} color={colors.darkText} />
                </Pressable>
              </View>

              <View style={styles.modalTypePill}>
                <Text style={styles.modalTypePillText}>{selectedRecordItem.type.replace('_', ' ')}</Text>
                <View style={styles.verifiedTag}>
                  <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                  <Text style={styles.verifiedTagText}>
                    {selectedRecordItem.verificationStatus || 'PATIENT_CONFIRMED'}
                  </Text>
                </View>
              </View>

              {selectedRecordItem.description ? (
                <View style={styles.modalDescContainer}>
                  <Text style={styles.modalDescLabel}>Clinical Details / Findings:</Text>
                  <Text style={styles.modalDescVal}>{selectedRecordItem.description}</Text>
                </View>
              ) : null}

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Facility / Provider:</Text>
                <Text style={styles.modalDetailVal}>
                  {selectedRecordItem.facilityName || 'GNU Solidario Hospital'}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Event Date:</Text>
                <Text style={styles.modalDetailVal}>
                  {selectedRecordItem.eventDate
                    ? new Date(selectedRecordItem.eventDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </Text>
              </View>

              <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedRecordItem(null)}>
                <Text style={styles.modalCloseBtnText}>Close Record Details</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

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
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailModalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    gap: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
    flex: 1,
  },
  modalTypePill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.softBackground,
    borderRadius: 14,
  },
  modalTypePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.darkText,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  modalDescContainer: {
    backgroundColor: '#FAF8FC',
    borderRadius: 14,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  modalDescLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  modalDescVal: {
    fontSize: 13,
    color: colors.darkText,
    lineHeight: 18,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.softBackground,
  },
  modalDetailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  modalDetailVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.darkText,
  },
  modalCloseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
