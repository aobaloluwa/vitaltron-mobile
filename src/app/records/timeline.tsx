import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { createHealthRecord, getTimeline, HealthRecord, RecordType } from '../../services/healthRecords';
import { colors } from '../../theme';

const FILTERS = ['All Records', 'LAB_TEST', 'MEDICATION', 'VITAL_SIGN', 'DIAGNOSIS', 'PROCEDURE'];

export default function FullTimelineScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Records');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  // Manual Add Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [recordType, setRecordType] = useState<RecordType>('DIAGNOSIS');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isTabletOrDesktop = windowWidth >= 768;

  const fetchRecords = async () => {
    try {
      const res = await getTimeline({ limit: 100 }).catch(() => ({ records: [] }));
      setRecords(res.records || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchRecords();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchRecords();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    void fetchRecords();
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
      setAddModalVisible(false);
      Alert.alert('Record Saved', 'New record added to your Universal Timeline.');
      void fetchRecords();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create record.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.facilityName && r.facilityName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeFilter !== 'All Records' && r.type !== activeFilter) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isTabletOrDesktop && styles.scrollContentDesktop,
        ]}
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
        <View style={[styles.mainWrapper, { maxWidth: isTabletOrDesktop ? 840 : '100%' }]}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
              <Ionicons name="arrow-back" size={22} color={colors.darkText} />
            </Pressable>

            <AppLogo size="small" showText={false} />

            <Pressable style={styles.addHeaderBtn} onPress={() => setAddModalVisible(true)}>
              <Ionicons name="add" size={18} color={colors.white} />
              <Text style={styles.addHeaderBtnText}>Add Record</Text>
            </Pressable>
          </View>

          {/* Title & Subtitle */}
          <View style={styles.titleBox}>
            <Text style={styles.mainTitle}>Universal Health Timeline</Text>
            <Text style={styles.subTitle}>
              Complete portable medical history & AI-extracted health identity
            </Text>
          </View>

          {/* Search Bar */}
          <AppTextInput
            placeholder="Search records, diagnoses, labs, medications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Category Filter Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTERS.map((f) => (
              <Pressable
                key={f}
                style={[
                  styles.filterPill,
                  activeFilter === f && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter(f)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === f && styles.filterPillTextActive,
                  ]}
                >
                  {f === 'All Records' ? 'All Records' : f.replace('_', ' ')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Timeline Entries Card List */}
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 40 }} />
          ) : filteredRecords.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="medical-outline" size={48} color={colors.secondary} />
              <Text style={styles.emptyTitle}>No Health Records Found</Text>
              <Text style={styles.emptySub}>
                Use the Scan tool to ingest medical documents or tap '+ Add Record' above to add manual entries.
              </Text>
              <Pressable style={styles.scanBtn} onPress={() => router.push('/(tabs)/scan')}>
                <Ionicons name="camera-outline" size={18} color={colors.white} />
                <Text style={styles.scanBtnText}>Scan Health Document</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.timelineListCard}>
              {filteredRecords.map((item, idx) => (
                <View key={item.id}>
                  <Pressable style={styles.timelineRow} onPress={() => setSelectedRecord(item)}>
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
                        {item.facilityName ? `${item.facilityName} • ` : ''}
                        {item.type.replace('_', ' ')}
                      </Text>
                    </View>

                    <View style={styles.rightGroup}>
                      <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>
                          {item.verificationStatus === 'PATIENT_CONFIRMED'
                            ? 'CONFIRMED'
                            : item.verificationStatus || 'VERIFIED'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </View>
                  </Pressable>

                  {idx < filteredRecords.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Record Detail Inspection Modal */}
      {selectedRecord && (
        <Modal visible={!!selectedRecord} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalTitleBox}>
                  <MaterialCommunityIcons
                    name={
                      selectedRecord.type === 'MEDICATION'
                        ? 'pill'
                        : selectedRecord.type === 'LAB_TEST'
                        ? 'flask-outline'
                        : selectedRecord.type === 'VITAL_SIGN'
                        ? 'heart-pulse'
                        : 'stethoscope'
                    }
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.modalTitleText} numberOfLines={2}>
                    {selectedRecord.title}
                  </Text>
                </View>
                <Pressable onPress={() => setSelectedRecord(null)} hitSlop={10}>
                  <Ionicons name="close" size={24} color={colors.darkText} />
                </Pressable>
              </View>

              <View style={styles.modalTypePill}>
                <Text style={styles.modalTypePillText}>{selectedRecord.type.replace('_', ' ')}</Text>
                <View style={styles.verifiedTag}>
                  <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                  <Text style={styles.verifiedTagText}>
                    {selectedRecord.verificationStatus || 'PATIENT_CONFIRMED'}
                  </Text>
                </View>
              </View>

              {selectedRecord.description ? (
                <View style={styles.modalDescContainer}>
                  <Text style={styles.modalDescLabel}>Clinical Details / Findings:</Text>
                  <Text style={styles.modalDescVal}>{selectedRecord.description}</Text>
                </View>
              ) : null}

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Facility / Provider:</Text>
                <Text style={styles.modalDetailVal}>
                  {selectedRecord.facilityName || 'GNU Solidario Hospital'}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Event Date:</Text>
                <Text style={styles.modalDetailVal}>
                  {selectedRecord.eventDate
                    ? new Date(selectedRecord.eventDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </Text>
              </View>

              <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedRecord(null)}>
                <Text style={styles.modalCloseBtnText}>Close Record Details</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Manual Add Health Record Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlayBottom}>
          <View style={styles.modalContentBottom}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>New Health Record Entry</Text>
              <Pressable onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.darkText} />
              </Pressable>
            </View>

            <AppTextInput
              label="Record Title"
              placeholder="e.g. Blood Glucose Check"
              value={title}
              onChangeText={setTitle}
            />

            <AppTextInput
              label="Facility / Hospital Name"
              placeholder="e.g. General Clinic"
              value={facilityName}
              onChangeText={setFacilityName}
            />

            <AppTextInput
              label="Clinical Description / Findings"
              placeholder="e.g. Result: 95 mg/dL"
              value={description}
              onChangeText={setDescription}
            />

            <PrimaryButton
              title="Save to Universal Timeline"
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
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  scrollContentDesktop: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
  },
  headerBar: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  addHeaderBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  titleBox: {
    marginBottom: 14,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 10,
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
  filterPillTextActive: {
    color: colors.white,
  },
  timelineListCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  itemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
  },
  itemSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgePill: {
    backgroundColor: colors.softBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
    marginTop: 10,
    width: '100%',
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
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 400,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 18,
  },
  scanBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    gap: 12,
  },
  modalHeaderRow: {
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
  modalOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContentBottom: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 12,
  },
});
