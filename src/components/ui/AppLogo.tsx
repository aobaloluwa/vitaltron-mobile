import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  lightMode?: boolean;
}

export function AppLogo({ size = 'medium', showText = true, lightMode = false }: AppLogoProps) {
  const iconSizes = {
    small: 20,
    medium: 28,
    large: 40,
  };

  const containerSizes = {
    small: 32,
    medium: 44,
    large: 64,
  };

  const textSizes = {
    small: 18,
    medium: 24,
    large: 32,
  };

  const iconSize = iconSizes[size];
  const boxSize = containerSizes[size];
  const fontSize = textSizes[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBox,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: boxSize * 0.3,
            backgroundColor: lightMode ? colors.white : colors.primary,
          },
        ]}
      >
        <Ionicons
          name="pulse"
          size={iconSize}
          color={lightMode ? colors.primary : colors.white}
        />
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.brandText,
              {
                fontSize,
                color: lightMode ? colors.white : colors.darkText,
              },
            ]}
          >
            vitaltron
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  textContainer: {
    justifyContent: 'center',
  },
  brandText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
