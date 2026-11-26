import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { PostpartumInsights } from '../../services/womensHealth';

interface PostpartumInsightsCardProps {
  insights?: PostpartumInsights;
}

export const PostpartumInsightsCard: React.FC<PostpartumInsightsCardProps> = ({ insights }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const title = insights?.milestoneTitle || '4th Trimester Recovery Plan';
  const advice =
    insights?.keyCareAdvice ||
    'Prioritize physical rest, adequate hydration for lactation, and pelvic floor recovery during your 4th trimester.';
  const actions = insights?.recommendedActions || [];
  const safetyFlags = insights?.safetyFlags || [];

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <MaterialCommunityIcons name="baby-carriage" size={18} color="#10B981" />
          <Text style={styles.title}>4TH TRIMESTER CARE PLAN</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{title}</Text>
        </View>
      </View>

      {/* Key Advice Box */}
      <View style={styles.adviceBox}>
        <Ionicons name="sparkles" size={16} color="#10B981" style={styles.icon} />
        <Text style={styles.adviceText}>{advice}</Text>
      </View>

      {/* Recommended Actions List */}
      {actions.length > 0 ? (
        <View style={styles.actionsSection}>
          <Text style={styles.sectionHeading}>Recovery & Care Milestones:</Text>
          {actions.map((act, idx) => (
            <View key={idx} style={styles.actionItem}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.actionText}>{act}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Safety Alert Flag */}
      {safetyFlags.length > 0 ? (
        <View style={styles.safetyBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#B91C1C" style={styles.icon} />
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
      color: '#10B981',
      letterSpacing: 0.5,
    },
    badge: {
      backgroundColor: '#D1FAE5',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#065F46',
    },
    adviceBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: '#ECFDF5',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: '#A7F3D0',
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
      backgroundColor: '#FEF2F2',
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: '#FCA5A5',
      marginTop: 4,
    },
    safetyText: {
      flex: 1,
      fontSize: 11,
      fontWeight: '700',
      color: '#991B1B',
      lineHeight: 16,
    },
  });
