import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { MenopauseInsights } from '../../services/womensHealth';

interface MenopauseInsightsCardProps {
  insights?: MenopauseInsights;
}

export const MenopauseInsightsCard: React.FC<MenopauseInsightsCardProps> = ({ insights }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const title = insights?.statusTitle || 'Perimenopause Management';
  const tip =
    insights?.personalizedTip ||
    'Log your hot flash severity, night sweats, sleep quality, and brain fog ratings to receive real-time personalized insights.';

  const isHot = (insights?.todayHotFlash || 0) >= 5 || insights?.todayNightSweats;

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="flame" size={18} color="#F59E0B" />
          <Text style={styles.title}>HORMONAL TRANSITION INSIGHTS</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{title}</Text>
        </View>
      </View>

      {/* Today's Vitals Summary Row */}
      {insights?.todayLogged ? (
        <View style={styles.vitalsRow}>
          <View style={styles.vitalPill}>
            <Text style={styles.vitalText}>🔥 Hot Flashes: {insights.todayHotFlash}/10</Text>
          </View>

          <View style={styles.vitalPill}>
            <Text style={styles.vitalText}>
              🌙 Night Sweats: {insights.todayNightSweats ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.vitalPill}>
            <Text style={styles.vitalText}>😴 Sleep: {insights.todaySleepQuality}/10</Text>
          </View>

          <View style={styles.vitalPill}>
            <Text style={styles.vitalText}>🧠 Brain Fog: {insights.todayBrainFog}/10</Text>
          </View>
        </View>
      ) : null}

      {/* Personalized AI / Clinical Guidance Box */}
      <View style={[styles.tipBox, isHot ? styles.tipBoxHot : styles.tipBoxNormal]}>
        <Ionicons
          name="sparkles"
          size={16}
          color={isHot ? '#D97706' : colors.primary}
          style={styles.icon}
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
      color: '#F59E0B',
      letterSpacing: 0.5,
    },
    badge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
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
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
    },
    tipBoxHot: {
      backgroundColor: '#FFFBEB',
      borderColor: '#FDE68A',
    },
    tipBoxNormal: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.softBackground,
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
