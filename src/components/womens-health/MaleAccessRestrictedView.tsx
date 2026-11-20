import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../theme';

interface Props {
  onChangeDeclaration: () => void;
}

export const MaleAccessRestrictedView: React.FC<Props> = ({ onChangeDeclaration }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="lock-closed" size={40} color={colors.primary} />
      </View>

      <Text style={styles.title}>Access Restricted</Text>
      <Text style={styles.subtitle}>
        The Women's Health & Wellness module is designed specifically for female anatomical life stages, menstrual cycles, ovulation, pregnancy, postpartum recovery, and menopause.
      </Text>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Based on your profile declaration (Male), female health features are currently locked to prevent inaccurate calculations.
        </Text>
      </View>

      <Pressable style={styles.primaryBtn} onPress={onChangeDeclaration}>
        <Ionicons name="refresh-outline" size={18} color={colors.white} />
        <Text style={styles.primaryBtnText}>Update Profile Declaration</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.secondaryBtnText}>Return to Home Dashboard</Text>
      </Pressable>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      backgroundColor: colors.background,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.softBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.darkText,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.softBackground,
      borderRadius: 16,
      padding: 14,
      marginBottom: 24,
      gap: 10,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.darkText,
      lineHeight: 17,
    },
    primaryBtn: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      width: '100%',
      paddingVertical: 14,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    primaryBtnText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '800',
    },
    secondaryBtn: {
      paddingVertical: 12,
    },
    secondaryBtnText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '700',
    },
  });
