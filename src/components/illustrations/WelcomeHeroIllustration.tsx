import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function WelcomeHeroIllustration() {
  return (
    <View style={styles.container}>
      {/* Background Soft Glow */}
      <View style={styles.bgGlow} />

      {/* Doctor & Patient Vector Graphic Composition */}
      <View style={styles.illustrationFrame}>
        {/* Left Character: Patient holding digital health passport */}
        <View style={styles.characterLeft}>
          <View style={styles.avatarHead} />
          <View style={styles.avatarBodyLeft}>
            <Ionicons name="person" size={42} color={colors.primary} />
          </View>
        </View>

        {/* Center Screen Interface (Interactive Brief) */}
        <View style={styles.centralBoard}>
          <View style={styles.boardHeader}>
            <Ionicons name="pulse" size={16} color={colors.white} />
            <View style={styles.headerLine} />
          </View>
          <View style={styles.boardContent}>
            <View style={styles.cardRow}>
              <View style={styles.cardIconBox}>
                <FontAwesome5 name="heartbeat" size={12} color={colors.primary} />
              </View>
              <View style={styles.cardTextGroup}>
                <View style={styles.cardLine1} />
                <View style={styles.cardLine2} />
              </View>
            </View>
            <View style={styles.cardRowSubtle}>
              <View style={styles.cardIconBoxSubtle}>
                <MaterialCommunityIcons name="shield-check" size={12} color={colors.primary} />
              </View>
              <View style={styles.cardTextGroup}>
                <View style={styles.cardLine1} />
              </View>
            </View>
          </View>
        </View>

        {/* Right Character: Clinician with tablet */}
        <View style={styles.characterRight}>
          <View style={styles.avatarHeadDoc} />
          <View style={styles.avatarBodyRight}>
            <FontAwesome5 name="user-md" size={38} color={colors.primary} />
          </View>
        </View>
      </View>

      {/* Floating Sparkle Accents */}
      <View style={styles.floatingSparkleTop}>
        <Ionicons name="sparkles" size={20} color={colors.secondary} />
      </View>
      <View style={styles.floatingShieldBottom}>
        <Ionicons name="shield-checkmark" size={18} color={colors.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bgGlow: {
    position: 'absolute',
    width: 260,
    height: 220,
    borderRadius: 130,
    backgroundColor: colors.softBackground,
    opacity: 0.9,
  },
  illustrationFrame: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterLeft: {
    alignItems: 'center',
    marginRight: -16,
    zIndex: 2,
  },
  avatarHead: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    marginBottom: 4,
  },
  avatarBodyLeft: {
    width: 64,
    height: 80,
    backgroundColor: colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  centralBoard: {
    width: 150,
    height: 160,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 12,
    justifyContent: 'space-between',
    zIndex: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  boardHeader: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLine: {
    flex: 1,
    height: 4,
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  boardContent: {
    gap: 8,
    marginTop: 6,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.softBackground,
    padding: 8,
    borderRadius: 10,
  },
  cardRowSubtle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF7FD',
    padding: 8,
    borderRadius: 10,
  },
  cardIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconBoxSubtle: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextGroup: {
    flex: 1,
    gap: 4,
  },
  cardLine1: {
    height: 5,
    backgroundColor: colors.primary,
    borderRadius: 2,
    width: '80%',
  },
  cardLine2: {
    height: 4,
    backgroundColor: colors.secondary,
    borderRadius: 2,
    width: '50%',
  },
  characterRight: {
    alignItems: 'center',
    marginLeft: -16,
    zIndex: 2,
  },
  avatarHeadDoc: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    marginBottom: 4,
  },
  avatarBodyRight: {
    width: 64,
    height: 80,
    backgroundColor: colors.softBackground,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  floatingSparkleTop: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  floatingShieldBottom: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
