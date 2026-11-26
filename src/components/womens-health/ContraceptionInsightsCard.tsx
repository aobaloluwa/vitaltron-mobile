import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { ContraceptionInsights } from '../../services/womensHealth';

interface ContraceptionInsightsCardProps {
  insights?: ContraceptionInsights;
}

export const ContraceptionInsightsCard: React.FC<ContraceptionInsightsCardProps> = ({
  insights,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const title = insights?.methodTitle || 'No Active Method';
  const tip =
    insights?.personalizedTip ||
    'Log your current birth control method (Pill, IUD, Implant, Patch, Ring, or Condom) below to receive schedule and safety guidance.';

  const hasCountdown =
    insights?.daysUntilReplacement !== undefined && insights?.daysUntilReplacement !== null;

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="medkit" size={18} color="#06B6D4" />
          <Text style={styles.title}>CONTRACEPTION SCHEDULE & INSIGHTS</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{title}</Text>
        </View>
      </View>

      {/* Countdown Badge if replacement date exists */}
      {hasCountdown ? (
        <View style={styles.countdownPill}>
          <Ionicons name="time-outline" size={14} color="#0284C7" />
          <Text style={styles.countdownText}>
            {insights!.daysUntilReplacement! > 0
              ? `Replacement / Next Dose due in ${insights!.daysUntilReplacement!} days`
              : 'Replacement / Renewal Due Today!'}
          </Text>
        </View>
      ) : null}

      {/* Personalized AI / Clinical Guidance Box */}
      <View style={styles.tipBox}>
        <Ionicons name="information-circle-outline" size={18} color="#0284C7" style={styles.icon} />
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
      color: '#06B6D4',
      letterSpacing: 0.5,
    },
    badge: {
      backgroundColor: '#E0F2FE',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#0284C7',
    },
    countdownPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#F0F9FF',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#BAE6FD',
    },
    countdownText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#0369A1',
    },
    tipBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: '#F0FDFA',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: '#99F6E4',
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
