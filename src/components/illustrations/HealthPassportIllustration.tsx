import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function HealthPassportIllustration() {
  return (
    <View style={styles.container}>
      {/* Outer Background Circle */}
      <View style={styles.bgCircleLarge} />
      <View style={styles.bgCircleSmall} />

      {/* Passport Card Frame */}
      <View style={styles.cardFrame}>
        {/* Top Header Strip */}
        <View style={styles.cardHeader}>
          <View style={styles.badgePill}>
            <Ionicons name="shield-checkmark" size={14} color={colors.white} />
          </View>
          <View style={styles.pulseDot} />
        </View>

        {/* Passport Icon & Pulse Line */}
        <View style={styles.cardBody}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="passport" size={38} color={colors.primary} />
          </View>

          <View style={styles.detailsGroup}>
            <View style={styles.lineLong} />
            <View style={styles.lineMedium} />
            <View style={styles.lineShort} />
          </View>
        </View>

        {/* Pulse waveform at bottom */}
        <View style={styles.waveformContainer}>
          <MaterialCommunityIcons name="heart-pulse" size={26} color={colors.primary} />
          <View style={styles.waveBarActive} />
          <View style={styles.waveBarSubtle} />
          <View style={styles.waveBarActive} />
        </View>
      </View>

      {/* Floating Accent Badges */}
      <View style={styles.floatingBadgeLeft}>
        <Ionicons name="medical" size={18} color={colors.white} />
      </View>

      <View style={styles.floatingBadgeRight}>
        <Ionicons name="globe-outline" size={18} color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bgCircleLarge: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.softBackground,
    opacity: 0.9,
  },
  bgCircleSmall: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.secondary,
    opacity: 0.35,
  },
  cardFrame: {
    width: 220,
    height: 200,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePill: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsGroup: {
    flex: 1,
    gap: 8,
  },
  lineLong: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
    width: '90%',
  },
  lineMedium: {
    height: 8,
    backgroundColor: colors.secondary,
    borderRadius: 4,
    width: '65%',
  },
  lineShort: {
    height: 8,
    backgroundColor: colors.softBackground,
    borderRadius: 4,
    width: '40%',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.softBackground,
  },
  waveBarActive: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  waveBarSubtle: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.softBackground,
  },
  floatingBadgeLeft: {
    position: 'absolute',
    top: 25,
    left: 15,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingBadgeRight: {
    position: 'absolute',
    bottom: 25,
    right: 15,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
