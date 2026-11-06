import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function AIBriefIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.bgCircleLarge} />

      {/* Main Document Frame */}
      <View style={styles.docFrame}>
        <View style={styles.docHeader}>
          <View style={styles.scannerBadge}>
            <Ionicons name="document-text-outline" size={16} color={colors.primary} />
          </View>
          <View style={styles.sparkleBadge}>
            <MaterialIcons name="auto-awesome" size={14} color={colors.white} />
          </View>
        </View>

        {/* Extracted Entity Tags */}
        <View style={styles.entityContainer}>
          <View style={[styles.tag, { backgroundColor: colors.softBackground }]}>
            <View style={styles.tagDot} />
            <View style={styles.tagBarLong} />
          </View>
          <View style={[styles.tag, { backgroundColor: '#F3E8FF' }]}>
            <View style={[styles.tagDot, { backgroundColor: colors.secondary }]} />
            <View style={styles.tagBarMedium} />
          </View>
        </View>

        {/* Brief Summary Box */}
        <View style={styles.summaryBox}>
          <View style={styles.briefHeaderRow}>
            <Feather name="activity" size={16} color={colors.primary} />
            <View style={styles.titleLine} />
          </View>
          <View style={styles.textLine1} />
          <View style={styles.textLine2} />
        </View>
      </View>

      {/* AI Camera Scan Badge */}
      <View style={styles.scanBadge}>
        <Feather name="camera" size={20} color={colors.white} />
      </View>

      {/* Verified Check Badge */}
      <View style={styles.verifiedBadge}>
        <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
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
  docFrame: {
    width: 210,
    height: 210,
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
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scannerBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entityContainer: {
    gap: 8,
    marginVertical: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  tagBarLong: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
    width: '75%',
    opacity: 0.7,
  },
  tagBarMedium: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
    width: '55%',
    opacity: 0.7,
  },
  summaryBox: {
    backgroundColor: colors.softBackground,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  briefHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleLine: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
    width: '50%',
  },
  textLine1: {
    height: 5,
    backgroundColor: colors.secondary,
    borderRadius: 3,
    width: '90%',
  },
  textLine2: {
    height: 5,
    backgroundColor: colors.secondary,
    borderRadius: 3,
    width: '60%',
  },
  scanBadge: {
    position: 'absolute',
    top: 25,
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
  verifiedBadge: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    backgroundColor: colors.white,
    borderRadius: 18,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
