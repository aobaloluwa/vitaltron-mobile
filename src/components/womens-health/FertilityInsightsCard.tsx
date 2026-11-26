import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { FertilityInsights } from '../../services/womensHealth';

interface FertilityInsightsCardProps {
  insights?: FertilityInsights;
}

export const FertilityInsightsCard: React.FC<FertilityInsightsCardProps> = ({ insights }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const statusName = insights?.statusDisplayName || 'Fertility Analysis';
  const tip =
    insights?.personalizedTip ||
    'Log your morning Basal Body Temperature (°C) and cervical mucus to unlock your personalized real-time fertility analysis.';

  const isPeak = insights?.fertilityStatus === 'PEAK' || insights?.fertilityStatus === 'HIGH';

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="sparkles" size={18} color={isPeak ? '#EC4899' : colors.primary} />
          <Text style={[styles.title, { color: isPeak ? '#EC4899' : colors.primary }]}>
            FERTILITY & BBT INSIGHTS
          </Text>
        </View>
        <View style={[styles.statusBadge, isPeak ? styles.statusBadgePeak : styles.statusBadgeNormal]}>
          <Text style={[styles.statusBadgeText, isPeak ? styles.statusTextPeak : styles.statusTextNormal]}>
            {statusName}
          </Text>
        </View>
      </View>

      {/* Vitals Summary Row */}
      {insights?.todayLogged ? (
        <View style={styles.vitalsRow}>
          {insights.todayBbt ? (
            <View style={styles.vitalPill}>
              <Text style={styles.vitalText}>🌡️ BBT: {insights.todayBbt}°C</Text>
            </View>
          ) : null}

          {insights.todayMucus ? (
            <View style={styles.vitalPill}>
              <Text style={styles.vitalText}>💧 Mucus: {insights.todayMucus}</Text>
            </View>
          ) : null}

          {insights.todayLhTest ? (
            <View style={styles.vitalPill}>
              <Text style={styles.vitalText}>🧪 LH: {insights.todayLhTest}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Personalized Tip Box */}
      <View style={[styles.tipBox, isPeak ? styles.tipBoxPeak : styles.tipBoxNormal]}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={isPeak ? '#DB2777' : colors.primary}
          style={styles.tipIcon}
        />
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
      letterSpacing: 0.5,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusBadgePeak: {
      backgroundColor: '#FCE7F3',
    },
    statusBadgeNormal: {
      backgroundColor: colors.inputBackground,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    statusTextPeak: {
      color: '#DB2777',
    },
    statusTextNormal: {
      color: colors.primary,
    },
    vitalsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
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
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
    },
    tipBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
    },
    tipBoxPeak: {
      backgroundColor: '#FFF5F8',
      borderColor: '#FBCFE8',
    },
    tipBoxNormal: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.softBackground,
    },
    tipIcon: {
      marginTop: 1,
    },
    tipText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.darkText,
      lineHeight: 18,
    },
  });
