import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function SecureSharingIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.bgCircleLarge} />

      {/* Sharing Card Frame */}
      <View style={styles.shareFrame}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={16} color={colors.white} />
          </View>
          <View style={styles.expiryBadge}>
            <Feather name="clock" size={12} color={colors.primary} />
          </View>
        </View>

        {/* QR Code Graphic Center */}
        <View style={styles.qrContainer}>
          <MaterialCommunityIcons name="qrcode-scan" size={64} color={colors.primary} />
        </View>

        {/* Grant Link Bar */}
        <View style={styles.grantBar}>
          <Ionicons name="key-outline" size={14} color={colors.primary} />
          <View style={styles.grantLine} />
          <View style={styles.statusDot} />
        </View>
      </View>

      {/* Doctor Access Floating Badge */}
      <View style={styles.doctorBadge}>
        <MaterialCommunityIcons name="doctor" size={22} color={colors.white} />
      </View>

      {/* Revoke Control Badge */}
      <View style={styles.revokeBadge}>
        <Ionicons name="shield-outline" size={18} color={colors.primary} />
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
    opacity: 0.85,
  },
  shareFrame: {
    width: 210,
    height: 210,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expiryBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContainer: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  grantBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.softBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  grantLine: {
    flex: 1,
    height: 5,
    backgroundColor: colors.primary,
    borderRadius: 3,
    opacity: 0.6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  doctorBadge: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  revokeBadge: {
    position: 'absolute',
    top: 25,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.secondary,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
