import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { getTimeline, HealthRecord } from '../../services/healthRecords';
import { colors } from '../../theme';

const SAMPLE_LABS: Partial<HealthRecord>[] = [
  {
    id: 'lab-1',
    title: 'eGFR - Low Range',
    eventDate: '2026-09-12',
    description: '4.2 mL/min',
    severity: 'In-Range',
    facilityName: 'City Hospital Lab',
  },
  {
    id: 'lab-2',
    title: 'Creatinine',
    eventDate: '2026-08-28',
    description: '0.64 mg/dL',
    severity: 'Below Range',
    facilityName: 'Metro Diagnostic',
  },
  {
    id: 'lab-3',
    title: 'eGFR - High Range',
    eventDate: '2026-07-15',
    description: '>60 mL/min',
    severity: 'Above Range',
    facilityName: 'Central Health Lab',
  },
  {
    id: 'lab-4',
    title: 'Potassium',
    eventDate: '2026-06-04',
    description: '4.4 mEq/L',
    severity: 'In-Range',
    facilityName: 'City Hospital Lab',
  },
];

export default function LabResultsScreen() {
  const [labs, setLabs] = useState<Partial<HealthRecord>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLabs() {
      try {
        const res = await getTimeline({ type: 'LAB_TEST' }).catch(() => ({ records: [] }));
        if (res.records && res.records.length > 0) {
          setLabs(res.records);
        } else {
          setLabs(SAMPLE_LABS);
        }
      } catch {
        setLabs(SAMPLE_LABS);
      } finally {
        setLoading(false);
      }
    }
    void loadLabs();
  }, []);

  const getRangePill = (severity?: string) => {
    const isBelow = severity === 'Below Range';
    const isAbove = severity === 'Above Range';

    return (
      <View style={styles.rangeTrackBox}>
        <Text style={styles.rangeLabelText}>{severity || 'In-Range'}</Text>
        <View style={styles.rangeTrack}>
          <View
            style={[
              styles.rangePill,
              isBelow && { backgroundColor: '#3B82F6', left: '15%' },
              isAbove && { backgroundColor: '#EF4444', left: '75%' },
              !isBelow && !isAbove && { backgroundColor: colors.primary, left: '48%' },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.darkText} />
          </Pressable>
          <AppLogo size="small" showText={false} />
        </View>

        {/* Title Section */}
        <View style={styles.titleBox}>
          <Text style={styles.mainTitle}>Lab Results</Text>
          <Text style={styles.subTitle}>Past 12 months</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 30 }} />
        ) : (
          labs.map((item) => (
            <Pressable
              key={item.id}
              style={styles.labCard}
              onPress={() =>
                router.push({
                  pathname: '/records/lab-detail',
                  params: {
                    title: item.title,
                    value: item.description || '4.4 mEq/L',
                  },
                })
              }
            >
              <View style={styles.cardTopRow}>
                <View style={styles.testTitleGroup}>
                  <MaterialCommunityIcons name="flask-outline" size={22} color={colors.primary} />
                  <Text style={styles.testTitle}>{item.title}</Text>
                </View>

                <Text style={styles.testDate}>
                  {item.eventDate ? new Date(item.eventDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'September 2026'}
                </Text>
              </View>

              <View style={styles.cardBottomRow}>
                <Text style={styles.valueText}>{item.description || '4.2 mL/min'}</Text>

                {getRangePill(item.severity)}
              </View>
            </Pressable>
          ))
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
    paddingBottom: 32,
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
  titleBox: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 4,
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
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkText,
  },
  testDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.darkText,
  },
  rangeTrackBox: {
    alignItems: 'flex-end',
    width: 110,
  },
  rangeLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
  },
  rangeTrack: {
    width: 100,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.softBackground,
    position: 'relative',
  },
  rangePill: {
    position: 'absolute',
    width: 14,
    height: 8,
    borderRadius: 4,
  },
});
