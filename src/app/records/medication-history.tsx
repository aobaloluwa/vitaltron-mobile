import React, { useState } from 'react';
import {
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
import { colors } from '../../theme';

const CATEGORIES = ['All', 'Antibiotics', 'Antacids', 'Inhalers', 'Antidiabetics'];

const MEDICATIONS = [
  { name: 'Amoxicillin', color: colors.primary },
  { name: 'Vitamin C', color: colors.secondary },
  { name: 'Aspirin', color: '#F59E0B' },
  { name: 'Metformin', color: '#EF4444' },
];

const MONTHLY_GRID = [
  { month: 'Jan', taken: [false, true, true, false] },
  { month: 'Feb', taken: [false, true, true, false] },
  { month: 'Mar', taken: [true, false, true, true] },
  { month: 'Apr', taken: [true, true, false, true] },
  { month: 'May', taken: [true, false, true, false] },
  { month: 'Jun', taken: [true, true, true, true] },
  { month: 'July', taken: [true, true, true, true] },
  { month: 'Aug', taken: [true, true, true, true] },
];

export default function MedicationHistoryScreen() {
  const [activeCategory, setActiveCategory] = useState('All');

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
        </View>

        {/* Category Horizontal Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.catPill,
                activeCategory === cat && styles.catPillActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.catText,
                  activeCategory === cat && styles.catTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Legend Bar */}
        <View style={styles.legendCard}>
          <View style={styles.filterIconBox}>
            <Ionicons name="options-outline" size={18} color={colors.darkText} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendScroll}>
            {MEDICATIONS.map((med, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.colorSquare, { backgroundColor: med.color }]} />
                <Text style={styles.legendName}>{med.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Monthly Compliance Matrix Grid Table */}
        <View style={styles.gridTableCard}>
          {MONTHLY_GRID.map((row, idx) => (
            <View key={idx} style={styles.gridRow}>
              <Text style={styles.monthName}>{row.month}</Text>

              <View style={styles.colsRow}>
                {row.taken.map((isTaken, cIdx) => (
                  <View
                    key={cIdx}
                    style={[
                      styles.cellBox,
                      { borderColor: MEDICATIONS[cIdx].color },
                      isTaken && { backgroundColor: MEDICATIONS[cIdx].color },
                    ]}
                  >
                    <Ionicons
                      name={isTaken ? 'checkmark' : 'close'}
                      size={16}
                      color={isTaken ? colors.white : '#94A3B8'}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
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
  categoryScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  catPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
  catTextActive: {
    color: colors.white,
  },
  legendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
    gap: 12,
  },
  filterIconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendScroll: {
    gap: 14,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorSquare: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkText,
  },
  gridTableCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.softBackground,
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  monthName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
    width: 44,
  },
  colsRow: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
    justifyContent: 'space-around',
  },
  cellBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
