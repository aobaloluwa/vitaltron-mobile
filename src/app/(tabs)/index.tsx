import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { logoutUser } from '../../services/auth';
import { createHealthRecord, getTimeline, globalSearch, GlobalSearchResult, HealthRecord, RecordType } from '../../services/healthRecords';
import { getUserProfile } from '../../services/users';
import { colors } from '../../theme';

export default function HomeScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const [userName, setUserName] = useState('');
  const [timeline, setTimeline] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecordItem, setSelectedRecordItem] = useState<HealthRecord | null>(null);

  // Global Search State
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'ALL' | 'RECORDS' | 'DOCS' | 'FAMILY'>('ALL');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GlobalSearchResult | null>(null);

  const isDesktopOrTablet = windowWidth >= 768;

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

      const onBackPress = () => {
        Alert.alert(
          'Log Out Account?',
          'Are you sure you want to log out of your Vitaltron health identity session?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => {} },
            {
              text: 'Log Out',
              style: 'destructive',
              onPress: async () => {
                await logoutUser();
                router.replace('/welcome');
              },
            },
          ]
        );
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await globalSearch(searchQuery);
        setSearchResults(res);
      } catch {
        setSearchResults(null);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
            {/* Top Header Bar: Profile Icon, Health Overview, Search & Notifications on the SAME line */}
            <View style={styles.topHeaderBar}>
              <View style={styles.headerProfileRow}>
                <Pressable onPress={() => router.push('/profile/health-vitals')}>
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={22} color={colors.white} />
                  </View>
                </Pressable>
                <Text style={styles.overviewTitleHeader}>Health Overview</Text>
              </View>

              <View style={styles.topRightActions}>
                <Pressable style={styles.iconBtn} onPress={() => setSearchModalVisible(true)}>
                  <Ionicons name="search-outline" size={20} color={colors.darkText} />
                </Pressable>
                <Pressable style={styles.iconBtn}>
                  <Ionicons name="notifications-outline" size={20} color={colors.darkText} />
                  <View style={styles.notifDot} />
                </Pressable>
              </View>
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

              const labTitle = labRecord
                ? labRecord.title
                    .replace(/^Lab Test:\s*/i, '')
                    .replace(/\[Below Range\]/gi, '')
                    .replace(/\[Above Range\]/gi, '')
                    .trim()
                : 'Glucose';

              const labVal = labRecord
                ? labRecord.description?.match(/[\d\.]+\s*(?:mg\/dL|g\/dL|mmol\/L|u\/L|mEq\/L|10\^6\/uL|10\^3\/uL|%|fl|pg|mm\/hr)/i)?.[0] || '95 mg/dL'
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
                  {selectedRecordItem.facilityName ||
                    selectedRecordItem.description?.match(/(?:Hospital|Facility):\s*([^\n|]+)/i)?.[1]?.trim() ||
                    'Not Specified'}
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

      {/* Global App Search Modal */}
      <Modal visible={searchModalVisible} animationType="fade" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.searchModalOverlay}
        >
          <View style={[styles.searchModalCard, { maxWidth: isDesktopOrTablet ? 640 : '100%' }]}>
            {/* Integrated Header Search Input */}
            <View style={styles.searchHeaderRow}>
              <View style={styles.searchBarBox}>
                <Ionicons name="search" size={20} color={colors.primary} />
                <TextInput
                  placeholder="Search records, docs, family members..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInputField}
                  autoFocus={true}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>

              <Pressable
                onPress={() => {
                  setSearchModalVisible(false);
                  setSearchQuery('');
                  setSearchResults(null);
                }}
                style={styles.closeSearchBtn}
              >
                <Ionicons name="close" size={22} color={colors.darkText} />
              </Pressable>
            </View>

            {/* Category Filter Pills */}
            {searchResults && (
              <View style={styles.searchFilterRow}>
                <Pressable
                  style={[styles.searchFilterPill, searchFilter === 'ALL' && styles.searchFilterPillActive]}
                  onPress={() => setSearchFilter('ALL')}
                >
                  <Text style={[styles.searchFilterText, searchFilter === 'ALL' && styles.searchFilterTextActive]}>
                    All Results
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.searchFilterPill, searchFilter === 'RECORDS' && styles.searchFilterPillActive]}
                  onPress={() => setSearchFilter('RECORDS')}
                >
                  <Text style={[styles.searchFilterText, searchFilter === 'RECORDS' && styles.searchFilterTextActive]}>
                    Records ({searchResults.records.length})
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.searchFilterPill, searchFilter === 'DOCS' && styles.searchFilterPillActive]}
                  onPress={() => setSearchFilter('DOCS')}
                >
                  <Text style={[styles.searchFilterText, searchFilter === 'DOCS' && styles.searchFilterTextActive]}>
                    Docs ({searchResults.documents.length})
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.searchFilterPill, searchFilter === 'FAMILY' && styles.searchFilterPillActive]}
                  onPress={() => setSearchFilter('FAMILY')}
                >
                  <Text style={[styles.searchFilterText, searchFilter === 'FAMILY' && styles.searchFilterTextActive]}>
                    Family ({searchResults.dependents.length})
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Results Content */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: isDesktopOrTablet ? 500 : 420 }}>
              {searching ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 36 }} />
              ) : !searchResults ? (
                <View style={styles.searchNoticeBox}>
                  <Ionicons name="search-outline" size={38} color={colors.primary} />
                  <Text style={styles.searchNoticeTitle}>Global App Search</Text>
                  <Text style={styles.searchNoticeSub}>
                    Type any keyword e.g. "Blood", "Glucose", "Amoxicillin", or "Hospital" to query across your database.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {/* Health Records Category */}
                  {(searchFilter === 'ALL' || searchFilter === 'RECORDS') && searchResults.records.length > 0 && (
                    <View style={styles.searchCatSection}>
                      <Text style={styles.searchCatTitle}>
                        Health Records ({searchResults.records.length})
                      </Text>
                      {searchResults.records.map((r) => (
                        <Pressable
                          key={r.id}
                          style={styles.searchResultRow}
                          onPress={() => {
                            setSearchModalVisible(false);
                            setSelectedRecordItem(r);
                          }}
                        >
                          <View style={styles.searchIconCircle}>
                            <MaterialCommunityIcons name="stethoscope" size={18} color={colors.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.resultRowTitle}>{r.title}</Text>
                            <Text style={styles.resultRowSub} numberOfLines={1}>
                              {r.facilityName ? `${r.facilityName} • ` : ''}{r.type.replace('_', ' ')}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {/* Scanned Documents Category */}
                  {(searchFilter === 'ALL' || searchFilter === 'DOCS') && searchResults.documents.length > 0 && (
                    <View style={styles.searchCatSection}>
                      <Text style={styles.searchCatTitle}>
                        Scanned Documents ({searchResults.documents.length})
                      </Text>
                      {searchResults.documents.map((d) => (
                        <Pressable
                          key={d.id}
                          style={styles.searchResultRow}
                          onPress={() => {
                            setSearchModalVisible(false);
                            router.push('/(tabs)/scan');
                          }}
                        >
                          <View style={styles.searchIconCircle}>
                            <Ionicons name="document-text" size={18} color={colors.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.resultRowTitle}>{d.fileName}</Text>
                            <Text style={styles.resultRowSub} numberOfLines={1}>
                              {d.ingestionStatus} • {new Date(d.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {/* Family Dependents Category */}
                  {(searchFilter === 'ALL' || searchFilter === 'FAMILY') && searchResults.dependents.length > 0 && (
                    <View style={styles.searchCatSection}>
                      <Text style={styles.searchCatTitle}>
                        Family Members ({searchResults.dependents.length})
                      </Text>
                      {searchResults.dependents.map((dep) => (
                        <Pressable
                          key={dep.id}
                          style={styles.searchResultRow}
                          onPress={() => {
                            setSearchModalVisible(false);
                            router.push('/profile/dependents');
                          }}
                        >
                          <View style={styles.searchIconCircle}>
                            <Ionicons name="people" size={18} color={colors.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.resultRowTitle}>{dep.displayName || 'Family Member'}</Text>
                            <Text style={styles.resultRowSub}>Linked Family Portfolio</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {searchResults.records.length === 0 &&
                    searchResults.documents.length === 0 &&
                    searchResults.dependents.length === 0 && (
                      <View style={styles.searchNoticeBox}>
                        <Ionicons name="alert-circle-outline" size={36} color={colors.textMuted} />
                        <Text style={styles.searchNoticeTitle}>No Search Results Found</Text>
                        <Text style={styles.searchNoticeSub}>
                          No health records, scanned documents, or family members matched "{searchQuery}".
                        </Text>
                      </View>
                    )}
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Health Record Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
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
        </KeyboardAvoidingView>
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
    marginBottom: 20,
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewTitleHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.5,
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
    gap: 16,
    paddingRight: 16,
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
    width: '100%',
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
    flex: 1,
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
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  searchModalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
  searchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBarBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.softBackground,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkText,
  },
  closeSearchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  searchFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.softBackground,
  },
  searchFilterPillActive: {
    backgroundColor: colors.primary,
  },
  searchFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.darkText,
  },
  searchFilterTextActive: {
    color: colors.white,
  },
  searchNoticeBox: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchNoticeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkText,
  },
  searchNoticeSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  searchCatSection: {
    gap: 8,
  },
  searchCatTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.softBackground,
    borderRadius: 16,
    padding: 12,
  },
  searchIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.darkText,
  },
  resultRowSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
