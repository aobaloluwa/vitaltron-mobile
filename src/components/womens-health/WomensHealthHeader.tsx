import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../theme';

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightActionIcon?: keyof typeof Ionicons.glyphMap;
  onRightAction?: () => void;
  modeBadge?: string;
}

export const WomensHealthHeader: React.FC<Props> = ({
  title,
  subtitle,
  showBack = true,
  rightActionIcon = 'options-outline',
  onRightAction,
  modeBadge,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable style={styles.iconBtn} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={colors.darkText} />
          </Pressable>
        ) : (
          <View style={styles.placeholderIcon} />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {onRightAction ? (
          <Pressable style={styles.iconBtn} onPress={onRightAction} hitSlop={10}>
            <Ionicons name={rightActionIcon} size={20} color={colors.primary} />
          </Pressable>
        ) : modeBadge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{modeBadge}</Text>
          </View>
        ) : (
          <View style={styles.placeholderIcon} />
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.background,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.white,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    placeholderIcon: {
      width: 40,
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.darkText,
    },
    subtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
    badge: {
      backgroundColor: colors.softBackground,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
  });
