import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { SexualHealthInsights } from '../../services/womensHealth';

interface SexualHealthInsightsCardProps {
  insights?: SexualHealthInsights;
}

export const SexualHealthInsightsCard: React.FC<SexualHealthInsightsCardProps> = ({
  insights,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const title = insights?.statusTitle || 'Screening Checkup';
  const tip =
    insights?.personalizedTip ||
    'Log your Pap smear, HPV, or STI lab screening dates below to monitor routine annual preventive care.';

  const isUpToDate = insights?.isUpToDate || false;

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="shield-checkmark" size={18} color="#3B82F6" />
          <Text style={styles.title}>SCREENING & PREVENTIVE CARE</Text>
        </View>
        <View style={[styles.badge, isUpToDate ? styles.badgeGood : styles.badgeWarn]}>
          <Text style={[styles.badgeText, isUpToDate ? styles.badgeTextGood : styles.badgeTextWarn]}>
            {title}
          </Text>
        </View>
      </View>

      {/* Most Recent Screening Vitals Pill */}
      {insights?.hasScreenings ? (
        <View style={styles.vitalsRow}>
          {insights.mostRecentType ? (
            <View style={styles.vitalPill}>
              <Text style={styles.vitalText}>🧪 Test: {insights.mostRecentType}</Text>
            </View>
          ) : null}

          {insights.mostRecentDate ? (
            <View style={styles.vitalPill}>
              <Text style={styles.vitalText}>📅 Date: {insights.mostRecentDate}</Text>
            </View>
          ) : null}

          {insights.mostRecentResult ? (
            <View style={styles.vitalPill}>
              <Text style={styles.vitalText}>✓ Result: {insights.mostRecentResult}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Personalized AI / Clinical Guidance Box */}
      <View style={styles.tipBox}>
        <Ionicons name="information-circle-outline" size={18} color="#1D4ED8" style={styles.icon} />
        <Text style={styles.tipText}>{tip}</Text>
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderRadius: 22,
      padding: 18,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: colors.softBackground,
      shadowColor: colors.darkText,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      flexWrap: 'wrap',
      gap: 8,
    },
    titleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    title: {
      fontSize: 11,
      fontWeight: '800',
      color: '#3B82F6',
      letterSpacing: 0.5,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeGood: {
      backgroundColor: '#DBEAFE',
    },
    badgeWarn: {
      backgroundColor: '#FEF3C7',
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    badgeTextGood: {
      color: '#1D4ED8',
    },
    badgeTextWarn: {
      color: '#B45309',
    },
    vitalsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    vitalPill: {
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    vitalText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.darkText,
    },
    tipBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: '#EFF6FF',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: '#BFDBFE',
    },
    icon: {
      marginTop: 2,
    },
    tipText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.darkText,
      lineHeight: 18,
    },
  });
