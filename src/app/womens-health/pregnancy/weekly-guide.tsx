import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';

const WEEKS_DATA = [
  { week: 4, fruit: 'Poppy Seed', trimester: 1, title: 'Implantation & Cell Growth', summary: 'Blastocyst implants into the uterine wall.' },
  { week: 8, fruit: 'Raspberry', trimester: 1, title: 'Webbed Fingers & Heartbeat', summary: 'Tiny heartbeat is audible on ultrasound.' },
  { week: 12, fruit: 'Plum', trimester: 1, title: 'First Trimester Milestone', summary: 'Organs are formed; baby starts moving arms.' },
  { week: 16, fruit: 'Avocado', trimester: 2, title: 'Hearing & Facial Expressions', summary: 'Baby can hear mother’s voice vibrations.' },
  { week: 20, fruit: 'Banana', trimester: 2, title: 'Halfway Mark & Quickening', summary: 'First flutters and kicks are felt.' },
  { week: 24, fruit: 'Cantaloupe', trimester: 2, title: 'Viability & Ear Formation', summary: 'Inner ear structures complete.' },
  { week: 28, fruit: 'Eggplant', trimester: 3, title: 'Third Trimester Begins', summary: 'Eyelids open; brain wave activity develops.' },
  { week: 32, fruit: 'Squash', trimester: 3, title: 'Bone Hardening', summary: 'Practicing breathing movements.' },
  { week: 36, fruit: 'Honeydew Melon', trimester: 3, title: 'Full Term Approaches', summary: 'Lungs mature in pelvic cavity.' },
  { week: 40, fruit: 'Watermelon', trimester: 3, title: 'Ready for Delivery', summary: 'Full term pregnancy!' },
];

export default function WeeklyPregnancyGuideScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [selectedTrimester, setSelectedTrimester] = useState(1);

  const filteredWeeks = WEEKS_DATA.filter((w) => w.trimester === selectedTrimester);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Week-by-Week Guide" subtitle="Developmental Milestones (Weeks 1-42)" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Trimester Tabs */}
        <View style={styles.tabContainer}>
          {[1, 2, 3].map((t) => (
            <Pressable
              key={t}
              style={[styles.tab, selectedTrimester === t && styles.tabActive]}
              onPress={() => setSelectedTrimester(t)}
            >
              <Text style={[styles.tabText, selectedTrimester === t && styles.tabTextActive]}>
                Trimester {t}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Weekly Cards List */}
        {filteredWeeks.map((item) => (
          <View key={item.week} style={styles.weekCard}>
            <View style={styles.weekHeader}>
              <View style={styles.weekBadge}>
                <Text style={styles.weekBadgeText}>Week {item.week}</Text>
              </View>
              <Text style={styles.fruitText}>Size: {item.fruit}</Text>
            </View>

            <Text style={styles.weekTitle}>{item.title}</Text>
            <Text style={styles.weekSummary}>{item.summary}</Text>

            <View style={styles.questionsBox}>
              <Ionicons name="chatbubbles-outline" size={16} color={colors.primary} />
              <Text style={styles.questionsText}>Doctor Question: Ask about blood pressure screening & prenatal vitamins.</Text>
            </View>
          </View>
        ))}
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
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 4,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
    },
    tabTextActive: {
      color: colors.white,
    },
    weekCard: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    weekHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    weekBadge: {
      backgroundColor: colors.softBackground,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    weekBadgeText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
    },
    fruitText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    weekTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.darkText,
    },
    weekSummary: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 4,
    },
    questionsBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 10,
      marginTop: 10,
      gap: 8,
    },
    questionsText: {
      flex: 1,
      fontSize: 11,
      fontWeight: '600',
      color: colors.darkText,
    },
  });
