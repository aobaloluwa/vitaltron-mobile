import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { PregnancyInsights } from '../../services/womensHealth';

interface PregnancyInsightsCardProps {
  insights?: PregnancyInsights;
}

export const PregnancyInsightsCard: React.FC<PregnancyInsightsCardProps> = ({ insights }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const trimesterName = insights?.trimesterName || 'Gestational Care Plan';
  const advice =
    insights?.keyCareAdvice ||
    'Track your gestational progress, schedule regular prenatal checkups, and stay well hydrated throughout your pregnancy.';
  const actions = insights?.recommendedActions || [];
  const safetyFlags = insights?.safetyFlags || [];

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="rose" size={18} color="#8B5CF6" />
          <Text style={styles.title}>TRIMESTER CARE PLAN & INSIGHTS</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{trimesterName}</Text>
        </View>
      </View>

      {/* Key Care Advice Box */}
      <View style={styles.adviceBox}>
        <Ionicons name="sparkles" size={16} color="#8B5CF6" style={styles.icon} />
        <Text style={styles.adviceText}>{advice}</Text>
      </View>

      {/* Recommended Trimester Actions List */}
      {actions.length > 0 ? (
        <View style={styles.actionsSection}>
          <Text style={styles.sectionHeading}>Recommended Trimester Milestones:</Text>
          {actions.map((act, index) => (
            <View key={index} style={styles.actionItem}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              <Text style={styles.actionText}>{act}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Clinical Safety Alert Flag */}
      {safetyFlags.length > 0 ? (
        <View style={styles.safetyBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#D97706" style={styles.icon} />
          <Text style={styles.safetyText}>{safetyFlags[0]}</Text>
        </View>
      ) : null}
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
      color: '#8B5CF6',
      letterSpacing: 0.5,
    },
    badge: {
      backgroundColor: '#F3E8FF',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#7C3AED',
    },
    adviceBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: '#FAF5FF',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: '#E9D5FF',
      marginBottom: 12,
    },
    icon: {
      marginTop: 2,
    },
    adviceText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.darkText,
      lineHeight: 18,
    },
    actionsSection: {
      marginBottom: 10,
    },
    sectionHeading: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
      marginBottom: 6,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.darkText,
    },
    safetyBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: '#FEF3C7',
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: '#FDE68A',
      marginTop: 4,
    },
    safetyText: {
      flex: 1,
      fontSize: 11,
      fontWeight: '700',
      color: '#B45309',
      lineHeight: 16,
    },
  });
