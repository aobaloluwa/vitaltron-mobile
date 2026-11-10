import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { AppLogo } from '../components/ui/AppLogo';
import { AppTextInput } from '../components/ui/AppTextInput';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { accessSharedRecords } from '../services/sharing';
import { colors } from '../theme';

export default function PublicShareAccessScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { width: windowWidth } = useWindowDimensions();

  const [clinicianEmail, setClinicianEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Access Granted Payload State
  const [grantedData, setGrantedData] = useState<{
    patientName: string;
    recipientName?: string;
    expiresAt: string;
    remainingAccesses: number;
    clinicalBrief?: any;
    timelineRecords: any[];
  } | null>(null);

  const isDesktopOrTablet = windowWidth >= 768;

  useEffect(() => {
    // If token is missing, show invalid link message
    if (!token) {
      setErrorMessage('Invalid share token or link. Please ask the patient to rescan or share a valid link.');
    }
  }, [token]);

  const handleVerifyAccess = async () => {
    if (!token) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await accessSharedRecords(token, {
        email: clinicianEmail.trim(),
        passcode: passcode.trim(),
      });
      setGrantedData(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Access Denied. You have not been granted access to view these records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktopOrTablet && styles.scrollContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainWrapper, { maxWidth: isDesktopOrTablet ? 720 : '100%' }]}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <AppLogo size="small" showText={true} />
            <View style={styles.secBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.white} />
              <Text style={styles.secBadgeText}>CONTROLLED POINT-OF-CARE ACCESS</Text>
            </View>
          </View>

          {/* Access Verification Form (If access not yet granted) */}
          {!grantedData ? (
            <View style={styles.cardSection}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed" size={32} color={colors.primary} />
              </View>

              <Text style={styles.titleText}>Patient Identity Verification</Text>
              <Text style={styles.subText}>
                Enter your clinician email and security PIN (if provided by the patient) to verify point-of-care access.
              </Text>

              {errorMessage && (
                <View style={styles.errorAlertBox}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.errorAlertTitle}>ACCESS DENIED</Text>
                    <Text style={styles.errorAlertSub}>{errorMessage}</Text>
                  </View>
                </View>
              )}

              <View style={styles.formGap}>
                <AppTextInput
                  label="Clinician / Hospital Email"
                  placeholder="e.g. doctor@hospital.org"
                  value={clinicianEmail}
                  onChangeText={setClinicianEmail}
                />

                <AppTextInput
                  label="Security PIN / Passcode (Optional)"
                  placeholder="e.g. 1234"
                  value={passcode}
                  onChangeText={setPasscode}
                  secureTextEntry={true}
                />

                <PrimaryButton
                  title="Verify & Access Patient Records"
                  onPress={handleVerifyAccess}
                  loading={loading}
                  variant="primary"
                />
              </View>
            </View>
          ) : (
            /* Granted Patient Health Records Dashboard */
            <View style={{ gap: 16 }}>
              {/* Access Granted Header Banner */}
              <View style={styles.grantedBanner}>
                <View style={styles.grantedBannerHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.grantedTitle}>Access Granted</Text>
                    <Text style={styles.grantedPatientName}>Patient: {grantedData.patientName}</Text>
                  </View>
                  <View style={styles.accessBadge}>
                    <Text style={styles.accessBadgeText}>
                      {grantedData.remainingAccesses} Accesses Left
                    </Text>
                  </View>
                </View>

                <View style={styles.grantedFooterRow}>
                  <Text style={styles.grantedExpiryText}>
                    Link Expiry: {new Date(grantedData.expiresAt).toLocaleString()}
                  </Text>
                  <Pressable onPress={() => setGrantedData(null)}>
                    <Text style={styles.logoutText}>Lock Session</Text>
                  </Pressable>
                </View>
              </View>

              {/* AI Clinical Brief Summary */}
              {grantedData.clinicalBrief && (
                <View style={styles.briefCard}>
                  <View style={styles.briefHeader}>
                    <MaterialIcons name="auto-awesome" size={20} color={colors.primary} />
                    <Text style={styles.briefTitle}>Point-of-Care Clinical Brief</Text>
                  </View>

                  <Text style={styles.briefSummaryText}>
                    {grantedData.clinicalBrief.summaryText || 'Clinical summary generated for healthcare provider consult.'}
                  </Text>
                </View>
              )}

              {/* Filtered Health Timeline Records */}
              <View style={styles.recordsSection}>
                <Text style={styles.recordsSectionTitle}>Authorized Health Records</Text>

                {grantedData.timelineRecords.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No authorized records in timeline for this grant.</Text>
                  </View>
                ) : (
                  grantedData.timelineRecords.map((record) => (
                    <View key={record.id} style={styles.recordCard}>
                      <View style={styles.recordHeader}>
                        <View style={styles.recordIconCircle}>
                          <MaterialCommunityIcons
                            name={
                              record.type === 'MEDICATION'
                                ? 'pill'
                                : record.type === 'LAB_TEST'
                                ? 'flask-outline'
                                : record.type === 'VITAL_SIGN'
                                ? 'heart-pulse'
                                : 'stethoscope'
                            }
                            size={20}
                            color={colors.primary}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.recordTitle}>{record.title}</Text>
                          <Text style={styles.recordMeta}>
                            {record.type.replace('_', ' ')} • {record.facilityName || 'Clinical Facility'}
                          </Text>
                        </View>
                        <View style={styles.verifiedTag}>
                          <Text style={styles.verifiedTagText}>VERIFIED</Text>
                        </View>
                      </View>

                      {record.description && (
                        <Text style={styles.recordDesc}>{record.description}</Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  scrollContentDesktop: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    paddingTop: 12,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  secBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  secBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  cardSection: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.softBackground,
    alignItems: 'center',
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkText,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
    maxWidth: 440,
  },
  errorAlertBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  errorAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  errorAlertSub: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 16,
  },
  formGap: {
    width: '100%',
    gap: 14,
  },
  grantedBanner: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  grantedBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  grantedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
  grantedPatientName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.darkText,
    marginTop: 2,
  },
  accessBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  accessBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  grantedFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.softBackground,
  },
  grantedExpiryText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  briefCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  briefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  briefTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkText,
  },
  briefSummaryText: {
    fontSize: 13,
    color: colors.darkText,
    lineHeight: 20,
  },
  recordsSection: {
    gap: 12,
  },
  recordsSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
  },
  recordCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.darkText,
  },
  recordMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  verifiedTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  recordDesc: {
    fontSize: 13,
    color: colors.darkText,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.softBackground,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
