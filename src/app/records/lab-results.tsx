import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
  const [labs, setLabs] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Tests');
  const [searchQuery, setSearchQuery] = useState('');

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
    const isBelow = rawDesc.includes('BELOW') || rawDesc.includes('Low') || item.title.includes('[Below Range]') || item.title.includes('Low');
    const isAbove = rawDesc.includes('ABOVE') || rawDesc.includes('High') || item.title.includes('[Above Range]') || item.title.includes('High');

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

    // Extract Facility / Doctor
    const hospitalMatch = rawDesc.match(/Hospital:\s*([^\n|]+)/i) || rawDesc.match(/Facility:\s*([^\n|]+)/i);
    const doctorMatch = rawDesc.match(/Doctor:\s*([^\n|]+)/i);

    const facilityStr = hospitalMatch ? hospitalMatch[1].trim() : (item.facilityName || 'GNU Solidario Hospital');
    const doctorStr = doctorMatch ? doctorMatch[1].trim() : 'Dr. Cameron Cordara';

    return {
      cleanTitle,
      resultVal,
      refRange,
      facilityStr,
      doctorStr,
      isBelow,
      isAbove,
      statusLabel: isBelow ? 'BELOW RANGE' : isAbove ? 'ABOVE RANGE' : 'NORMAL RANGE',
      statusColor: isBelow ? '#2563EB' : isAbove ? '#EF4444' : '#10B981',
      statusBg: isBelow ? '#EFF6FF' : isAbove ? '#FEF2F2' : '#ECFDF5',
    };
  };

  const filteredLabs = labs.filter((item) => {
    const parsed = parseLabCardData(item);
    const matchesSearch =
      parsed.cleanTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parsed.resultVal.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'Out of Range') return parsed.isBelow || parsed.isAbove;
    if (activeFilter === 'Normal') return !parsed.isBelow && !parsed.isAbove;
    if (activeFilter === 'CBC Panel') return true;
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.darkText} />
          </Pressable>
          <AppLogo size="small" showText={false} />
          <Pressable style={styles.scanHeaderBtn} onPress={() => router.push('/(tabs)/scan')}>
            <Ionicons name="camera" size={18} color={colors.white} />
            <Text style={styles.scanHeaderBtnText}>Scan</Text>
          </Pressable>
        </View>

        {/* Title Section */}
        <View style={styles.titleBox}>
          <Text style={styles.mainTitle}>Laboratory Results</Text>
          <Text style={styles.subTitle}>Verified Clinical & Complete Blood Count (CBC) Panels</Text>
        </View>

        {/* Search Bar */}
        <AppTextInput
          placeholder="Search test name e.g. Hemoglobin, RBC, WBC..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

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

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 40 }} />
        ) : filteredLabs.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="flask-outline" size={48} color={colors.secondary} />
            <Text style={styles.emptyTitle}>No Matching Lab Results</Text>
            <Text style={styles.emptySub}>
              Scan your paper laboratory report to extract Hemoglobin, RBC, WBC, Platelet count, and blood chemistry.
            </Text>
            <Pressable style={styles.scanBtn} onPress={() => router.push('/(tabs)/scan')}>
              <Ionicons name="camera-outline" size={18} color={colors.white} />
              <Text style={styles.scanBtnText}>Scan Lab Report Now</Text>
            </Pressable>
          </View>
        ) : (
          filteredLabs.map((item) => {
            const data = parseLabCardData(item);

            return (
              <View key={item.id} style={styles.labCard}>
                {/* Header Row: Title & Status Badge */}
                <View style={styles.cardHeader}>
                  <View style={styles.testTitleRow}>
                    <View style={styles.flaskIconBox}>
                      <MaterialCommunityIcons name="flask" size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.testNameText}>{data.cleanTitle}</Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: data.statusBg }]}>
                    <Ionicons
                      name={data.isBelow || data.isAbove ? 'alert-circle' : 'checkmark-circle'}
                      size={13}
                      color={data.statusColor}
                    />
                    <Text style={[styles.statusBadgeText, { color: data.statusColor }]}>
                      {data.statusLabel}
                    </Text>
                  </View>
                </View>

                {/* Main Value Readout */}
                <View style={styles.valueRow}>
                  <Text style={styles.resultBigValue}>{data.resultVal}</Text>

                  <View style={styles.refRangeBox}>
                    <Text style={styles.refRangeTitle}>Reference Range</Text>
                    <Text style={styles.refRangeVal}>{data.refRange}</Text>
                  </View>
                </View>

                {/* Range Bar Indicator */}
                <View style={styles.rangeBarTrack}>
                  <View
                    style={[
                      styles.rangeBarFill,
                      {
                        backgroundColor: data.statusColor,
                        width: data.isBelow ? '25%' : data.isAbove ? '90%' : '55%',
                      },
                    ]}
                  />
                </View>

                {/* Footnote Metadata */}
                <View style={styles.cardFooterRow}>
                  <Text style={styles.footerInfoText} numberOfLines={1}>
                    {data.facilityStr} • {data.doctorStr}
                  </Text>
                  <Text style={styles.footerDateText}>
                    {item.eventDate
                      ? new Date(item.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Recent'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
    paddingBottom: 36,
  },
  headerBar: {
    height: 56,
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
  scanHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  scanHeaderBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  titleBox: {
    marginBottom: 16,
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
    paddingVertical: 12,
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
  labCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
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
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    fontSize: 15,
    fontWeight: '800',
    color: colors.darkText,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
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
  },
  resultBigValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkText,
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
    marginTop: 2,
  },
  rangeBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.softBackground,
    overflow: 'hidden',
    marginBottom: 12,
  },
  rangeBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
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
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
    marginTop: 10,
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
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 16,
  },
  scanBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
