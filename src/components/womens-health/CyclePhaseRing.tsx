import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme';

interface Props {
  cycleDay: number;
  totalDays: number;
  phaseName: string;
  nextPeriodDays: number;
}

export const CyclePhaseRing: React.FC<Props> = ({
  cycleDay = 14,
  totalDays = 28,
  phaseName = 'Follicular Phase',
  nextPeriodDays = 14,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, cycleDay / totalDays));
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Track Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.softBackground}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated Active Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.centerContent}>
        <Text style={styles.dayNumber}>Day {cycleDay}</Text>
        <Text style={styles.phaseLabel}>{phaseName}</Text>
        <Text style={styles.subText}>Period in {nextPeriodDays}d</Text>
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginVertical: 16,
    },
    centerContent: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayNumber: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.darkText,
    },
    phaseLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
      marginTop: 2,
    },
    subText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 4,
    },
  });
