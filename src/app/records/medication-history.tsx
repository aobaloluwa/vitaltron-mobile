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
import { getTimeline, HealthRecord } from '../../services/healthRecords';
import { colors } from '../../theme';

export default function MedicationHistoryScreen() {
  const [medications, setMedications] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMeds = async () => {
    try {
      const res = await getTimeline({ type: 'MEDICATION' }).catch(() => ({ records: [] }));
      setMedications(res.records || []);
    } catch {
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMeds();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadMeds();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={colors.darkText} />
          </Pressable>
          <AppLogo size="small" showText={false} />
        </View>

        {/* Title */}
        <View style={styles.titleBox}>
          <Text style={styles.mainTitle}>Medication History</Text>
          <Text style={styles.subTitle}>Prescriptions & Ingested Medicines</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 30 }} />
        ) : medications.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="pill" size={48} color={colors.secondary} />
            <Text style={styles.emptyTitle}>No Prescriptions Recorded</Text>
            <Text style={styles.emptySub}>
              Scan a paper prescription or doctor's note to extract your medications into your Health Passport.
            </Text>
            <Pressable style={styles.scanBtn} onPress={() => router.push('/(tabs)/scan')}>
              <Ionicons name="camera-outline" size={18} color={colors.white} />
              <Text style={styles.scanBtnText}>Scan Paper Prescription</Text>
            </Pressable>
          </View>
        ) : (
          medications.map((item) => (
            <View key={item.id} style={styles.medCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.pillIconBox}>
                  <MaterialCommunityIcons name="pill" size={22} color={colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.medTitle}>{item.title}</Text>
                  <Text style={styles.medSub}>
                    {item.facilityName ? `${item.facilityName} • ` : ''}
                    {item.eventDate ? new Date(item.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Logged'}
                  </Text>
                </View>

                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>ACTIVE</Text>
                </View>
              </View>

              {item.description ? (
                <View style={styles.descBox}>
                  <Text style={styles.descText}>{item.description}</Text>
                </View>
              ) : null}
            </View>
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
    marginBottom: 16,
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
  medCard: {
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pillIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkText,
  },
  medSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  activeTag: {
    backgroundColor: colors.softBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  descBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.softBackground,
  },
  descText: {
    fontSize: 13,
    color: colors.darkText,
    lineHeight: 18,
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
