import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { SymptomInsights } from '../../services/womensHealth';

interface TodaySymptomsCardProps {
  insights?: SymptomInsights;
  onLogPress: () => void;
}

export const TodaySymptomsCard: React.FC<TodaySymptomsCardProps> = ({
  insights,
  onLogPress,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const todayLogged = insights?.todayLogged || false;
  const mood = insights?.todayMood;
  const symptoms = insights?.todaySymptoms || [];
  const topRecent = insights?.topRecentSymptoms || [];
  const tip = insights?.personalizedTip || 'Log daily symptoms and mood to power your cycle insights.';

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="pulse" size={18} color="#DB2777" />
          <Text style={styles.title}>TODAY'S WELLNESS & SYMPTOMS</Text>
        </View>
        <Pressable onPress={onLogPress}>
          <Text style={styles.linkText}>{todayLogged ? 'Edit Log ›' : '+ Log ›'}</Text>
        </Pressable>
      </View>

      {/* Logged Badges / Status */}
      {todayLogged ? (
        <View style={styles.badgesContainer}>
          {mood ? (
            <View style={[styles.badgePill, styles.moodBadge]}>
              <Text style={styles.moodBadgeText}>Mood: {mood}</Text>
            </View>
          ) : null}

          {symptoms.map((sym) => (
            <View key={sym} style={[styles.badgePill, styles.symBadge]}>
              <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
              <Text style={styles.symBadgeText}>{sym}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyStatusText}>No symptoms or mood logged for today yet.</Text>
      )}

      {/* Personalized AI / Clinical Tip */}
      <View style={styles.tipBox}>
        <Ionicons name="sparkles" size={16} color="#DB2777" style={styles.sparkleIcon} />
        <Text style={styles.tipText}>{tip}</Text>
      </View>

      {/* Recent Frequent Symptoms Summary */}
      {topRecent.length > 0 ? (
        <View style={styles.recentRow}>
          <Text style={styles.recentLabel}>Frequent this cycle:</Text>
          <Text style={styles.recentList}>
            {topRecent.map((item) => `${item.name} (${item.count}x)`).join(' • ')}
          </Text>
        </View>
      ) : null}

      {/* Primary Log Action Button */}
      <Pressable style={styles.actionBtn} onPress={onLogPress}>
        <Ionicons
          name={todayLogged ? 'options-outline' : 'add-circle-outline'}
          size={16}
          color={colors.white}
        />
        <Text style={styles.actionBtnText}>
          {todayLogged ? "Update Today's Symptoms & Mood" : "Log Today's Symptoms & Mood"}
        </Text>
      </Pressable>
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
    },
    titleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    title: {
      fontSize: 11,
      fontWeight: '800',
      color: '#DB2777',
      letterSpacing: 0.5,
    },
    linkText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    badgesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    badgePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    moodBadge: {
      backgroundColor: '#FCE7F3',
    },
    moodBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#DB2777',
    },
    symBadge: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    symBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
    },
    emptyStatusText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 10,
    },
    tipBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: '#FFF5F8',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: '#FBCFE8',
      marginBottom: 12,
    },
    sparkleIcon: {
      marginTop: 2,
    },
    tipText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.darkText,
      lineHeight: 18,
    },
    recentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 14,
    },
    recentLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    recentList: {
      flex: 1,
      fontSize: 11,
      fontWeight: '600',
      color: colors.darkText,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 12,
    },
    actionBtnText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: '800',
    },
  });
