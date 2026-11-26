import React, { useEffect, useState, useCallback } from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import {
  getWomensHealthDashboard,
  WomensHealthDashboardData,
} from '../../services/womensHealth';
import { WomensHealthHeader } from '../../components/womens-health/WomensHealthHeader';
import { CyclePhaseRing } from '../../components/womens-health/CyclePhaseRing';
import { SafetyDisclaimerBanner } from '../../components/womens-health/SafetyDisclaimerBanner';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { WomensHealthOnboardingModal } from '../../components/womens-health/WomensHealthOnboardingModal';
import { MaleAccessRestrictedView } from '../../components/womens-health/MaleAccessRestrictedView';
import { TodaySymptomsCard } from '../../components/womens-health/TodaySymptomsCard';
import { PersonalizedChartsCard } from '../../components/womens-health/PersonalizedChartsCard';

export default function WomensHealthTabScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<WomensHealthDashboardData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const loadDashboard = async () => {
    try {
      const data = await getWomensHealthDashboard();
      setDashboard(data);
      if (data && data.isOnboarded === false && !data.declaredSex) {
        setShowOnboarding(true);
      }
    } catch {
      // ignore network errors
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [])
  );

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    void loadDashboard();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Women's Health" showBack={false} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <SkeletonLoader width="100%" height={260} borderRadius={24} style={{ marginVertical: 12 }} />
          <SkeletonLoader width={140} height={20} borderRadius={10} style={{ marginVertical: 12 }} />
          <View style={styles.skeletonRow}>
            <SkeletonLoader width={100} height={90} borderRadius={18} />
            <SkeletonLoader width={100} height={90} borderRadius={18} />
            <SkeletonLoader width={100} height={90} borderRadius={18} />
          </View>
          <SkeletonLoader width={180} height={20} borderRadius={10} style={{ marginVertical: 12 }} />
          <View style={styles.skeletonGrid}>
            <SkeletonLoader width="31%" height={80} borderRadius={18} />
            <SkeletonLoader width="31%" height={80} borderRadius={18} />
            <SkeletonLoader width="31%" height={80} borderRadius={18} />
            <SkeletonLoader width="31%" height={80} borderRadius={18} />
            <SkeletonLoader width="31%" height={80} borderRadius={18} />
            <SkeletonLoader width="31%" height={80} borderRadius={18} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Male Access Restriction
  if (dashboard?.declaredSex === 'MALE' && !showOnboarding) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <WomensHealthHeader title="Women's Health" showBack={false} />
        <MaleAccessRestrictedView onChangeDeclaration={() => setShowOnboarding(true)} />

        <WomensHealthOnboardingModal
          visible={showOnboarding}
          onComplete={(sex) => {
            setShowOnboarding(false);
            void loadDashboard();
          }}
        />
      </SafeAreaView>
    );
  }

  const activeMode = dashboard?.activeMode || 'MENSTRUAL';
  const cycle = dashboard?.cycleMetrics;
  const preg = dashboard?.pregnancyMetrics;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader
        title="Women's Health"
        subtitle={`${getTimeGreeting()}, ${dashboard?.user?.name || ''}`}
        modeBadge={activeMode}
        showBack={false}
        rightActionIcon="settings-outline"
        onRightAction={() => router.push('/womens-health/settings' as any)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Main Life Stage Mode Hero Card */}
        {activeMode === 'PREGNANCY' && preg ? (
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.heroTag}>PREGNANCY PROGRESS</Text>
                <Text style={styles.heroTitle}>
                  Week {preg.gestationalAgeWeeks}, Day {preg.gestationalAgeDays}
                </Text>
              </View>
              <View style={styles.trimesterBadge}>
                <Text style={styles.trimesterText}>T{preg.currentTrimester}</Text>
              </View>
            </View>

            <Text style={styles.heroSub}>{preg.trimesterName}</Text>

            {/* Baby Size Visual Card */}
            <View style={styles.babyCard}>
              <Ionicons name="nutrition-outline" size={26} color={colors.primary} />
              <View style={styles.babyInfo}>
                <Text style={styles.babyFruitLabel}>Baby is size of a {preg.babySizeFruit}</Text>
                <Text style={styles.babyStatsText}>
                  ~{preg.babyLengthCm} cm • ~{preg.babyWeightGrams} g
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${preg.progressPercent}%` }]} />
              </View>
              <View style={styles.progressMeta}>
                <Text style={styles.progressText}>{preg.progressPercent}% Completed</Text>
                <Text style={styles.progressText}>{preg.daysRemaining} days left</Text>
              </View>
            </View>

            <Pressable
              style={styles.primaryActionBtn}
              onPress={() => router.push('/womens-health/pregnancy' as any)}
            >
              <Text style={styles.primaryActionBtnText}>View Pregnancy Hub</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <Text style={styles.heroTag}>MENSTRUAL & CYCLE</Text>
              <Pressable onPress={() => router.push('/womens-health/cycle/calendar' as any)}>
                <Text style={styles.linkText}>View Calendar ›</Text>
              </Pressable>
            </View>

            {cycle ? (
              <CyclePhaseRing
                cycleDay={cycle.currentCycleDay}
                totalDays={cycle.averageCycleLength}
                phaseName={cycle.phaseDisplayName}
                nextPeriodDays={
                  Math.max(
                    1,
                    Math.round(
                      (new Date(cycle.estimatedNextPeriod).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )
                }
              />
            ) : null}

            {cycle ? (
              <View style={styles.cycleGrid}>
                <View style={styles.gridBox}>
                  <Text style={styles.gridLabel}>Fertile Window</Text>
                  <Text style={styles.gridVal}>
                    {cycle.fertileWindowStart ? cycle.fertileWindowStart.slice(5) : 'N/A'} - {cycle.fertileWindowEnd ? cycle.fertileWindowEnd.slice(5) : ''}
                  </Text>
                </View>

                <View style={styles.gridDivider} />

                <View style={styles.gridBox}>
                  <Text style={styles.gridLabel}>Est. Ovulation</Text>
                  <Text style={styles.gridVal}>{cycle.estimatedOvulation ? cycle.estimatedOvulation.slice(5) : 'N/A'}</Text>
                </View>
              </View>
            ) : null}

            <Pressable
              style={styles.primaryActionBtn}
              onPress={() => router.push('/womens-health/cycle' as any)}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.white} />
              <Text style={styles.primaryActionBtnText}>Log Period / Flow</Text>
            </Pressable>
          </View>
        )}

        {/* Today's Symptoms & Mood Insights */}
        <TodaySymptomsCard
          insights={dashboard?.symptomInsights}
          onLogPress={() => router.push('/womens-health/symptoms' as any)}
        />

        {/* Quick Actions Bar */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
          <Pressable
            style={styles.quickActionCard}
            onPress={() => router.push('/womens-health/symptoms' as any)}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="pulse" size={20} color="#DB2777" />
            </View>
            <Text style={styles.actionText}>Log Symptoms</Text>
          </Pressable>

          <Pressable
            style={styles.quickActionCard}
            onPress={() => router.push('/womens-health/pregnancy/kick-counter' as any)}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#EDE7F6' }]}>
              <MaterialCommunityIcons name="foot-print" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Kick Counter</Text>
          </Pressable>

          <Pressable
            style={styles.quickActionCard}
            onPress={() => router.push('/womens-health/pregnancy/contraction-timer' as any)}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="stopwatch-outline" size={20} color="#D97706" />
            </View>
            <Text style={styles.actionText}>Contractions</Text>
          </Pressable>

          <Pressable
            style={styles.quickActionCard}
            onPress={() => router.push('/womens-health/assistant' as any)}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="sparkles" size={20} color="#0284C7" />
            </View>
            <Text style={styles.actionText}>AI Assistant</Text>
          </Pressable>
        </ScrollView>

        {/* Life Stage Modules Grid */}
        <Text style={styles.sectionHeader}>Health & Life Stage Modules</Text>
        <View style={styles.moduleGrid}>
          <Pressable style={styles.moduleCard} onPress={() => router.push('/womens-health/cycle' as any)}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            <Text style={styles.moduleTitle}>Cycle Tracker</Text>
          </Pressable>

          <Pressable style={styles.moduleCard} onPress={() => router.push('/womens-health/fertility' as any)}>
            <Ionicons name="heart-outline" size={24} color="#EC4899" />
            <Text style={styles.moduleTitle}>Fertility & BBT</Text>
          </Pressable>

          <Pressable style={styles.moduleCard} onPress={() => router.push('/womens-health/pregnancy' as any)}>
            <Ionicons name="rose-outline" size={24} color="#8B5CF6" />
            <Text style={styles.moduleTitle}>Pregnancy Hub</Text>
          </Pressable>

          <Pressable style={styles.moduleCard} onPress={() => router.push('/womens-health/postpartum' as any)}>
            <MaterialCommunityIcons name="baby-carriage" size={24} color="#10B981" />
            <Text style={styles.moduleTitle}>Postpartum Care</Text>
          </Pressable>

          <Pressable style={styles.moduleCard} onPress={() => router.push('/womens-health/menopause' as any)}>
            <Ionicons name="flame-outline" size={24} color="#F59E0B" />
            <Text style={styles.moduleTitle}>Menopause</Text>
          </Pressable>

          <Pressable style={styles.moduleCard} onPress={() => router.push('/womens-health/contraception' as any)}>
            <Ionicons name="medkit-outline" size={24} color="#06B6D4" />
            <Text style={styles.moduleTitle}>Birth Control</Text>
          </Pressable>

          <Pressable style={styles.moduleCard} onPress={() => router.push('/womens-health/sexual-health' as any)}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#3B82F6" />
            <Text style={styles.moduleTitle}>Sexual Health</Text>
          </Pressable>

          <Pressable style={styles.moduleCard} onPress={() => router.push('/womens-health/education' as any)}>
            <Ionicons name="book-outline" size={24} color="#6366F1" />
            <Text style={styles.moduleTitle}>Education</Text>
          </Pressable>

          <Pressable style={styles.moduleCard} onPress={() => router.push('/womens-health/reminders' as any)}>
            <Ionicons name="notifications-outline" size={24} color="#14B8A6" />
            <Text style={styles.moduleTitle}>Reminders</Text>
          </Pressable>
        </View>

        {/* Personalized Interactive Health Charts */}
        <PersonalizedChartsCard dashboard={dashboard} />

        {/* Safety Disclaimer */}
        <SafetyDisclaimerBanner />
      </ScrollView>

      {/* Onboarding Modal */}
      <WomensHealthOnboardingModal
        visible={showOnboarding}
        onComplete={(sex) => {
          setShowOnboarding(false);
          void loadDashboard();
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 115 : 32,
    },
    skeletonRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    skeletonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 16,
    },
    heroCard: {
      backgroundColor: colors.white,
      borderRadius: 24,
      padding: 20,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
      shadowColor: colors.darkText,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 3,
    },
    heroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    heroTag: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 4,
    },
    heroSub: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
    linkText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    trimesterBadge: {
      backgroundColor: colors.softBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
    },
    trimesterText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
    },
    babyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: 14,
      marginVertical: 14,
    },
    babyInfo: {
      marginLeft: 12,
    },
    babyFruitLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.darkText,
    },
    babyStatsText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },
    progressContainer: {
      marginBottom: 16,
    },
    progressBarBackground: {
      height: 10,
      backgroundColor: colors.softBackground,
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 5,
    },
    progressMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    progressText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    cycleGrid: {
      flexDirection: 'row',
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: 14,
      marginVertical: 12,
    },
    gridBox: {
      flex: 1,
      alignItems: 'center',
    },
    gridLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
    },
    gridVal: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 4,
    },
    gridDivider: {
      width: 1,
      backgroundColor: colors.softBackground,
    },
    primaryActionBtn: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    primaryActionBtnText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '800',
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 16,
      marginBottom: 10,
    },
    quickActionsScroll: {
      marginBottom: 12,
    },
    quickActionCard: {
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 18,
      padding: 14,
      marginRight: 12,
      width: 100,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    actionIconBg: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    actionText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.darkText,
      textAlign: 'center',
    },
    moduleGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 16,
    },
    moduleCard: {
      width: '31%',
      backgroundColor: colors.white,
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    moduleTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.darkText,
      marginTop: 8,
      textAlign: 'center',
    },
    analyticsCard: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    analyticsCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    analyticsIconBg: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    analyticsTextCol: {
      flex: 1,
    },
    analyticsTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.darkText,
    },
    analyticsSub: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
  });
