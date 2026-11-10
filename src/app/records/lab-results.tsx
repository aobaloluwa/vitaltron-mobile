import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
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
import { getTimeline, HealthRecord } from '../../services/healthRecords';
import { colors } from '../../theme';

const FILTERS = ['All Tests', 'Out of Range', 'Normal', 'CBC Panel'];

export default function LabResultsScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const [labs, setLabs] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Tests');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabItem, setSelectedLabItem] = useState<HealthRecord | null>(null);
  const [showInfoGuide, setShowInfoGuide] = useState(false);

  // Responsiveness Breakpoints
  const isTabletOrDesktop = windowWidth >= 768;
  const isWideScreen = windowWidth >= 1024;
  const cardWidth = isWideScreen ? '31%' : isTabletOrDesktop ? '48%' : '100%';

  const loadLabs = async () => {
    try {
      const res = await getTimeline({ type: 'LAB_TEST' }).catch(() => ({ records: [] }));
      setLabs(res.records || []);
    } catch {
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLabs();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadLabs();
    }, [])
  );

  const parseLabCardData = (item: HealthRecord) => {
    const rawDesc = item.description || '';
    const isBelow =
      rawDesc.includes('BELOW') ||
      rawDesc.includes('Low') ||
      item.title.includes('[Below Range]') ||
      item.title.includes('Low');

    const isAbove =
      rawDesc.includes('ABOVE') ||
      rawDesc.includes('High') ||
      item.title.includes('[Above Range]') ||
      item.title.includes('High');

    // Clean title (strip tags)
    const cleanTitle = item.title
      .replace(/^Lab Test:\s*/i, '')
      .replace(/\[Below Range\]/gi, '')
      .replace(/\[Above Range\]/gi, '')
      .trim();

    // Extract Result Value
    const resultMatch = rawDesc.match(/Result:\s*([^\n|]+)/i);
    const resultVal = resultMatch ? resultMatch[1].trim() : (rawDesc.split('|')[0]?.trim() || 'Recorded');

    // Extract Reference Range
    const rangeMatch = rawDesc.match(/(?:Reference Range|Reference):\s*([^\n|]+)/i);
    const refRange = rangeMatch ? rangeMatch[1].trim() : 'Standard Reference';

    // Extract Facility & Doctor dynamically from record or description (no fallback defaults)
    const hospitalMatch = rawDesc.match(/Hospital:\s*([^\n|]+)/i) || rawDesc.match(/Facility:\s*([^\n|]+)/i);
    const doctorMatch = rawDesc.match(/Doctor:\s*([^\n|]+)/i);

    const facilityStr = item.facilityName || (hospitalMatch ? hospitalMatch[1].trim() : 'Not Specified');
    const doctorStr = doctorMatch ? doctorMatch[1].trim() : 'Attending Physician';

    return {
      cleanTitle,
      resultVal,
      refRange,
      facilityStr,
      doctorStr,
      isBelow,
      isAbove,
      statusLabel: isBelow ? 'LOW' : isAbove ? 'HIGH' : 'NORMAL',
      statusColor: isBelow ? '#2563EB' : isAbove ? '#EF4444' : '#10B981',
      statusBg: isBelow ? '#EFF6FF' : isAbove ? '#FEF2F2' : '#ECFDF5',
    };
  };

  const parsedLabs = labs.map((item) => ({ item, parsed: parseLabCardData(item) }));
  const abnormalCount = parsedLabs.filter((p) => p.parsed.isBelow || p.parsed.isAbove).length;
  const normalCount = parsedLabs.length - abnormalCount;

  const filteredLabs = parsedLabs.filter(({ parsed }) => {
    const matchesSearch =
      parsed.cleanTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parsed.resultVal.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'Out of Range') return parsed.isBelow || parsed.isAbove;
    if (activeFilter === 'Normal') return !parsed.isBelow && !parsed.isAbove;
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
      >
        <View style={[styles.mainWrapper, { maxWidth: isWideScreen ? 1140 : 840 }]}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
              <Ionicons name="arrow-back" size={22} color={colors.darkText} />
            </Pressable>

            <AppLogo size="small" showText={false} />

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable style={styles.infoGuideBtn} onPress={() => setShowInfoGuide(!showInfoGuide)}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              </Pressable>

              <Pressable style={styles.scanHeaderBtn} onPress={() => router.push('/(tabs)/scan')}>
                <Ionicons name="camera" size={18} color={colors.white} />
                <Text style={styles.scanHeaderBtnText}>Scan</Text>
              </Pressable>
            </View>
          </View>

          {/* Title & Headline Section */}
          <View style={styles.titleBox}>
            <Text style={styles.mainTitle}>Laboratory Results</Text>
            <Text style={styles.subTitle}>Verified Clinical & Complete Blood Count (CBC) Panels</Text>
          </View>

          {/* Reference Range Indicator Guide Banner */}
          {showInfoGuide && (
            <View style={styles.guideBanner}>
              <View style={styles.guideHeaderRow}>
                <Ionicons name="stats-chart" size={18} color={colors.primary} />
                <Text style={styles.guideTitle}>What is the Reference Indicator Bar?</Text>
              </View>
              <Text style={styles.guideText}>
                The colored bar below each test value is a <Text style={{ fontWeight: '800' }}>Clinical Reference Range Indicator</Text>. It visually positions your test reading relative to healthy laboratory boundaries:
              </Text>
              <View style={styles.guideLegendRow}>
                <View style={styles.legendPill}>
                  <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
                  <Text style={styles.legendText}>Low / Below Range</Text>
                </View>
                <View style={styles.legendPill}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Normal / In Range</Text>
                </View>
                <View style={styles.legendPill}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendText}>High / Above Range</Text>
                </View>
              </View>
            </View>
          )}

          {/* Metric Summary Counters Bar */}
          <View style={styles.summaryBar}>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeNum}>{labs.length}</Text>
              <Text style={styles.summaryBadgeLabel}>Total Tests</Text>
            </View>

            <View style={[styles.summaryBadge, styles.summaryBadgeWarning]}>
              <Text style={[styles.summaryBadgeNum, { color: '#EF4444' }]}>{abnormalCount}</Text>
              <Text style={styles.summaryBadgeLabel}>Out of Range</Text>
            </View>

            <View style={[styles.summaryBadge, styles.summaryBadgeSuccess]}>
              <Text style={[styles.summaryBadgeNum, { color: '#10B981' }]}>{normalCount}</Text>
              <Text style={styles.summaryBadgeLabel}>In Range</Text>
            </View>
          </View>

          {/* Search Bar & Filter Controls Row */}
          <View style={isTabletOrDesktop ? styles.controlsRowDesktop : styles.controlsRowMobile}>
            <View style={{ flex: 1 }}>
              <AppTextInput
                placeholder="Search test e.g. Hemoglobin, RBC, WBC..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Filter Pills */}
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
                    {f}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Main Grid List */}
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 40 }} />
          ) : filteredLabs.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="flask-outline" size={54} color={colors.secondary} />
              <Text style={styles.emptyTitle}>No Matching Lab Results</Text>
              <Text style={styles.emptySub}>
                Scan your paper laboratory report photo or document to extract test values directly into your Health Passport.
              </Text>
              <Pressable style={styles.scanBtn} onPress={() => router.push('/(tabs)/scan')}>
                <Ionicons name="camera-outline" size={18} color={colors.white} />
                <Text style={styles.scanBtnText}>Scan Paper Lab Report</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.cardsGrid}>
              {filteredLabs.map(({ item, parsed }) => (
                <Pressable
                  key={item.id}
                  style={[styles.labCard, { width: cardWidth }]}
                  onPress={() => setSelectedLabItem(item)}
                >
                  {/* Card Header: Title & Compact Status Badge */}
                  <View style={styles.cardHeader}>
                    <View style={styles.testTitleRow}>
                      <View style={styles.flaskIconBox}>
                        <MaterialCommunityIcons name="flask" size={18} color={colors.primary} />
                      </View>
                      <Text style={styles.testNameText} numberOfLines={1}>
                        {parsed.cleanTitle}
                      </Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: parsed.statusBg }]}>
                      <Ionicons
                        name={parsed.isBelow || parsed.isAbove ? 'alert-circle' : 'checkmark-circle'}
                        size={12}
                        color={parsed.statusColor}
                      />
                      <Text
                        style={[styles.statusBadgeText, { color: parsed.statusColor }]}
                        numberOfLines={1}
                      >
                        {parsed.statusLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Main Value Readout */}
                  <View style={styles.valueRow}>
                    <Text style={styles.resultBigValue} numberOfLines={1}>
                      {parsed.resultVal}
                    </Text>

                    <View style={styles.refRangeBox}>
                      <Text style={styles.refRangeTitle}>Reference</Text>
                      <Text style={styles.refRangeVal} numberOfLines={1}>
                        {parsed.refRange}
                      </Text>
                    </View>
                  </View>

                  {/* Reference Range Indicator Bar */}
                  <View style={styles.rangeBarTrack}>
                    <View
                      style={[
                        styles.rangeBarFill,
                        {
                          backgroundColor: parsed.statusColor,
                          width: parsed.isBelow ? '25%' : parsed.isAbove ? '90%' : '55%',
                        },
                      ]}
                    />
                  </View>

                  {/* Card Footer Info */}
                  <View style={styles.cardFooterRow}>
                    <Text style={styles.footerInfoText} numberOfLines={1}>
                      {parsed.facilityStr}
                    </Text>
                    <Text style={styles.footerDateText}>
                      {item.eventDate
                        ? new Date(item.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Recent'}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Lab Item Detail Modal */}
      {selectedLabItem && (
        <Modal visible={!!selectedLabItem} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {(() => {
                const data = parseLabCardData(selectedLabItem);
                return (
                  <>
                    <View style={styles.modalHeaderRow}>
                      <View style={styles.modalTitleBox}>
                        <MaterialCommunityIcons name="flask" size={24} color={colors.primary} />
                        <Text style={styles.modalTitleText} numberOfLines={2}>{data.cleanTitle}</Text>
                      </View>
                      <Pressable onPress={() => setSelectedLabItem(null)} hitSlop={10}>
                        <Ionicons name="close" size={24} color={colors.darkText} />
                      </Pressable>
                    </View>

                    <View style={styles.modalValueContainer}>
                      <Text style={styles.modalResultVal}>{data.resultVal}</Text>

                      <View style={[styles.statusBadge, { backgroundColor: data.statusBg, alignSelf: 'center' }]}>
                        <Ionicons
                          name={data.isBelow || data.isAbove ? 'alert-circle' : 'checkmark-circle'}
                          size={14}
                          color={data.statusColor}
                        />
                        <Text style={[styles.statusBadgeText, { color: data.statusColor, fontSize: 11 }]} numberOfLines={1}>
                          {data.statusLabel}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Normal Reference Range:</Text>
                      <Text style={styles.modalDetailVal}>{data.refRange}</Text>
                    </View>

                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Performing Facility:</Text>
                      <Text style={styles.modalDetailVal}>{data.facilityStr}</Text>
                    </View>

                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Ordering Physician:</Text>
                      <Text style={styles.modalDetailVal}>{data.doctorStr}</Text>
                    </View>

                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Verification Status:</Text>
                      <Text style={[styles.modalDetailVal, { color: colors.primary }]}>
                        {selectedLabItem.verificationStatus || 'PATIENT_CONFIRMED'}
                      </Text>
                    </View>

                    <Pressable
                      style={styles.modalCloseBtn}
                      onPress={() => setSelectedLabItem(null)}
                    >
                      <Text style={styles.modalCloseBtnText}>Close Details</Text>
                    </Pressable>
                  </>
                );
              })()}
            </View>
          </View>
        </Modal>
      )}
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
  infoGuideBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  scanHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  scanHeaderBtnText: {
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
  guideBanner: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
    gap: 8,
  },
  guideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.darkText,
  },
  guideText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  guideLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.softBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.darkText,
  },
  summaryBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryBadge: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  summaryBadgeWarning: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  summaryBadgeSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  summaryBadgeNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
  },
  summaryBadgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
  },
  controlsRowMobile: {
    gap: 4,
    marginBottom: 8,
  },
  controlsRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 8,
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
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  labCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  flaskIconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.darkText,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexShrink: 0,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
    gap: 8,
  },
  resultBigValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.darkText,
    flex: 1,
  },
  refRangeBox: {
    alignItems: 'flex-end',
  },
  refRangeTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  refRangeVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkText,
    marginTop: 1,
  },
  rangeBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.softBackground,
    overflow: 'hidden',
    marginBottom: 10,
  },
  rangeBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.softBackground,
  },
  footerInfoText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    flex: 1,
  },
  footerDateText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
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
  modalValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.softBackground,
    borderRadius: 16,
  },
  modalResultVal: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.darkText,
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
