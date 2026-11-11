import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { logoutUser, User } from '../../services/auth';
import { Dependent, getDependents, getUserProfile, updateUserInfo } from '../../services/users';
import { getStoredLanguage, LanguageCode, setStoredLanguage } from '../../i18n/translations';
import { colors } from '../../theme';

export default function ProfileScreen() {
  const [user, setUser] = useState<(User & { avatarUrl?: string }) | null>(null);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  // Language State
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');

  useEffect(() => {
    void getStoredLanguage().then((l) => setCurrentLang(l));
  }, []);

  const handleSelectLanguage = (newLang: LanguageCode, langLabel: string) => {
    if (newLang === currentLang) {
      setLangModalVisible(false);
      return;
    }

    Alert.alert(
      'Change App Language?',
      `Are you sure you want to switch the app language to ${langLabel}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch Language',
          onPress: async () => {
            try {
              setCurrentLang(newLang);
              await setStoredLanguage(newLang);
              await updateUserInfo({ preferredLanguage: newLang });
              setLangModalVisible(false);
              Alert.alert('Language Updated', `App language changed to ${langLabel}.`);
            } catch {
              setLangModalVisible(false);
            }
          },
        },
      ]
    );
  };

  const fetchProfileData = async () => {
    try {
      const fullUser = await getUserProfile().catch(() => null);
      if (fullUser) {
        setUser({
          id: fullUser.id,
          email: fullUser.email,
          displayName: fullUser.displayName,
          avatarUrl: fullUser.avatarUrl,
        });
      }

      const depList = await getDependents().catch(() => []);
      setDependents(depList || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchProfileData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchProfileData();

      const onBackPress = () => {
        router.replace('/(tabs)');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    void fetchProfileData();
  };

  const handleLogout = async () => {
    Alert.alert('Log Out Account', 'Are you sure you want to log out of your health identity session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logoutUser();
          } catch {
            // Ignore error
          } finally {
            setLoggingOut(false);
            router.replace('/welcome');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.iconCircleBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.darkText} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          /* Skeleton Loader */
          <View style={{ gap: 14 }}>
            <SkeletonLoader width="100%" height={90} borderRadius={20} />
            <SkeletonLoader width="100%" height={100} borderRadius={22} />
            <SkeletonLoader width="100%" height={180} borderRadius={22} />
            <SkeletonLoader width="100%" height={140} borderRadius={22} />
          </View>
        ) : (
          <>
            {/* User Identity Profile Summary Card */}
            <Pressable
              style={styles.userProfileCard}
              onPress={() => router.push('/profile/personal-info')}
            >
              <View style={styles.avatarBox}>
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={{ width: 52, height: 52, borderRadius: 26 }} />
                ) : (
                  <Ionicons name="person" size={26} color={colors.white} />
                )}
              </View>

              <View style={styles.userTextGroup}>
                <Text style={styles.userName}>{user?.displayName || 'Logged-In Patient'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'Loading account email...'}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>

            {/* Hero Upgrade / Health Passport Pro Banner */}
            <View style={styles.proHeroCard}>
              <View style={styles.proHeroLeft}>
                <View style={styles.proTitleRow}>
                  <Ionicons name="sparkles" size={20} color={colors.secondary} />
                  <Text style={styles.proTitle}>Vitaltron Health Pro</Text>
                </View>
                <Text style={styles.proSubtitle}>
                  Unlock instant AI clinical briefs, universal FHIR sync, and unlimited doctor access grants.
                </Text>
              </View>

              <Pressable
                style={styles.proButton}
                onPress={() => router.push('/profile/health-passport')}
              >
                <Text style={styles.proBtnText}>View Pro &gt;</Text>
              </Pressable>
            </View>

            {/* Grouped Section 1: Health Portfolio & Identity */}
            <View style={styles.menuGroupCard}>
              <Pressable
                style={styles.menuItemRow}
                onPress={() => router.push('/profile/health-vitals')}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="settings-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Health Profile & Vitals</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                style={styles.menuItemRow}
                onPress={() => router.push('/profile/health-passport')}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Verified Health Passport & Badges</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                style={styles.menuItemRow}
                onPress={() => router.push('/profile/dependents')}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="people-outline" size={20} color={colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemText}>Dependents & Family Portfolio</Text>
                  {dependents.length > 0 && (
                    <Text style={styles.menuSubText}>{dependents.length} Linked Members</Text>
                  )}
                </View>

                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>

              <View style={styles.divider} />

              <View style={styles.menuItemRow}>
                <View style={styles.menuIconBox}>
                  <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { flex: 1 }]}>Enable Fingerprint / Face ID</Text>
                <Switch
                  value={biometricsEnabled}
                  onValueChange={setBiometricsEnabled}
                  trackColor={{ false: colors.softBackground, true: colors.secondary }}
                  thumbColor={biometricsEnabled ? colors.primary : '#F3F4F6'}
                />
              </View>
            </View>

            {/* Grouped Section 2: Preferences & Privacy Controls */}
            <View style={styles.menuGroupCard}>
              <Pressable
                style={styles.menuItemRow}
                onPress={() => router.push('/profile/sharing-preferences')}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="options-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Sharing Preferences</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                style={styles.menuItemRow}
                onPress={() => router.push('/profile/privacy-security')}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Privacy & Data Security Policy</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                style={styles.menuItemRow}
                onPress={() => router.push('/profile/support')}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* Grouped Section 3: App Feedback & Language */}
            <View style={styles.menuGroupCard}>
              <Pressable
                style={styles.menuItemRow}
                onPress={() => router.push('/profile/feedback')}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="chatbox-ellipses-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Feedback</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                style={styles.menuItemRow}
                onPress={() => setLangModalVisible(true)}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="language-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { flex: 1 }]}>Language</Text>
                <Text style={styles.langValue}>
                  {currentLang === 'fr' ? 'Français' : currentLang === 'es' ? 'Español' : 'English'} &gt;
                </Text>
              </Pressable>
            </View>

            {/* Logout Action Button with Active Loading Spinner */}
            <Pressable style={styles.logoutRow} onPress={handleLogout} disabled={loggingOut}>
              {loggingOut ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
              )}
              <Text style={styles.logoutText}>
                {loggingOut ? 'Logging Out...' : 'Log Out Account'}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal visible={langModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select App Language</Text>
              <Pressable onPress={() => setLangModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.darkText} />
              </Pressable>
            </View>

            {[
              { code: 'en', label: 'English 🇺🇸', native: 'English' },
              { code: 'fr', label: 'French 🇫🇷', native: 'Français' },
              { code: 'es', label: 'Spanish 🇪🇸', native: 'Español' },
            ].map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  style={[styles.langOptionRow, isSelected && styles.langOptionRowActive]}
                  onPress={() => handleSelectLanguage(lang.code as LanguageCode, lang.native)}
                >
                  <Text style={[styles.langOptionText, isSelected && styles.langOptionTextActive]}>
                    {lang.label} ({lang.native})
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
  },
  userProfileCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextGroup: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.darkText,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  proHeroCard: {
    backgroundColor: colors.darkText,
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  proHeroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  proTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  proTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  proSubtitle: {
    fontSize: 12,
    color: '#D1D5DB',
    lineHeight: 17,
  },
  proButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  proBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  menuGroupCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    flex: 1,
  },
  menuSubText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  langValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.softBackground,
  },
  logoutRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.darkText,
  },
  langOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.softBackground,
  },
  langOptionRowActive: {
    backgroundColor: '#EDE7F6',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  langOptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
  },
  langOptionTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
});
