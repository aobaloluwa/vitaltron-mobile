import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const isDark = variant === 'dark';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return colors.softBackground;
    if (isOutline) return pressed ? colors.softBackground : 'transparent';
    if (isSecondary) return pressed ? colors.softBackground : colors.secondary;
    if (isDark) return pressed ? '#2C2C2C' : colors.darkText;
    return pressed ? colors.primaryDark : colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (isOutline) return colors.primary;
    if (isSecondary) return colors.primary;
    return colors.white;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: isOutline ? colors.primary : 'transparent',
          borderWidth: isOutline ? 1.5 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
