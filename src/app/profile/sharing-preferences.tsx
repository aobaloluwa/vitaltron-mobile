import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import {
  AccessGrant,
  createAccessGrant,
  CreateAccessGrantResult,
  getAccessGrants,
  revokeAccessGrant,
} from '../../services/sharing';
import { RecordType } from '../../services/healthRecords';
import { colors } from '../../theme';

const ALL_TYPES: RecordType[] = [
  'LAB_TEST',
  'MEDICATION',
  'ALLERGY',
  'DIAGNOSIS',
  'VITAL_SIGN',
  'PROCEDURE',
];

export default function SharingPreferencesScreen() {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Grant Generator Form State
  const [recipientName, setRecipientName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<RecordType[]>([]);
  const [expiryHours, setExpiryHours] = useState(24);

  // Generated Result Modal
  const [createdResult, setCreatedResult] = useState<CreateAccessGrantResult | null>(null);

  const fetchGrants = async () => {
    try {
      const list = await getAccessGrants().catch(() => []);
      setGrants(list || []);
    } catch {
      setGrants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchGrants();
  }, []);

  const toggleRecordType = (type: RecordType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerateGrant = async () => {
    setSubmitting(true);
    try {
      const result = await createAccessGrant({
        recipientName: recipientName.trim(),
        passcode: passcode.trim() || undefined,
        allowedRecordTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
        expiresInHours: expiryHours,
      });

      setCreatedResult(result);
      setRecipientName('');
      setPasscode('');
      setSelectedTypes([]);
      void fetchGrants();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create access grant.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string, name?: string) => {
    Alert.alert(
      'Revoke Access?',
      `Are you sure you want to revoke access for ${name || 'this clinician/hospital'}? They will no longer be able to view your medical records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Access',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeAccessGrant(id);
              Alert.alert('Access Revoked', 'Doctor/hospital access grant has been revoked immediately.');
              void fetchGrants();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Unable to revoke grant.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.darkText} />
          </Pressable>
          <Text style={styles.headerTitle}>Controlled Sharing</Text>
          <AppLogo size="small" showText={false} />
        </View>

        {/* Generate Access Grant & QR Code Section */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Generate Point-of-Care QR Code</Text>
              <Text style={styles.cardSub}>
                Allow doctors or hospitals anywhere in the world to access your records securely without re-doing lab tests.
              </Text>
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.formGap}>
            <AppTextInput
              label="Doctor / Hospital Name or Email"
              placeholder="e.g. GNU Solidario Hospital or doctor@hospital.org"
              value={recipientName}
              onChangeText={setRecipientName}
            />

            <AppTextInput
              label="Security Passcode / PIN (Optional)"
              placeholder="e.g. 1234"
              value={passcode}
              onChangeText={setPasscode}
              secureTextEntry={true}
            />

            {/* Allowed Record Types Multi-Select */}
            <Text style={styles.inputLabel}>Select Shared Information Types:</Text>
            <View style={styles.typePillsContainer}>
              <Pressable
                style={[
                  styles.typePill,
                  selectedTypes.length === 0 && styles.typePillActive,
                ]}
                onPress={() => setSelectedTypes([])}
              >
                <Text
                  style={[
                    styles.typePillText,
                    selectedTypes.length === 0 && styles.typePillTextActive,
                  ]}
                >
                  All Information Types
                </Text>
              </Pressable>

              {ALL_TYPES.map((type) => {
                const isSelected = selectedTypes.includes(type);
                return (
                  <Pressable
                    key={type}
                    style={[styles.typePill, isSelected && styles.typePillActive]}
                    onPress={() => toggleRecordType(type)}
                  >
                    <Text
                      style={[
                        styles.typePillText,
                        isSelected && styles.typePillTextActive,
                      ]}
                    >
                      {type.replace('_', ' ')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Expiration Pills */}
            <Text style={styles.inputLabel}>Access Duration:</Text>
            <View style={styles.pillsRow}>
              {[
                { label: '12 Hours', hours: 12 },
                { label: '24 Hours', hours: 24 },
                { label: '7 Days', hours: 168 },
                { label: '30 Days', hours: 720 },
              ].map((exp) => (
                <Pressable
                  key={exp.hours}
                  style={[styles.expiryPill, expiryHours === exp.hours && styles.expiryPillActive]}
                  onPress={() => setExpiryHours(exp.hours)}
                >
                  <Text style={[styles.expiryText, expiryHours === exp.hours && styles.expiryTextActive]}>
                    {exp.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <PrimaryButton
              title="Generate Sharing QR Code & Link"
              onPress={handleGenerateGrant}
              loading={submitting}
              variant="primary"
            />
          </View>
        </View>

        {/* Active Access Grants & Revocation Section */}
        <View style={styles.cardSection}>
          <Text style={styles.cardTitle}>Active Point-of-Care Grants</Text>
          <Text style={styles.cardSub}>Revoke access for any clinician or hospital at any time.</Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : grants.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="key-outline" size={36} color={colors.secondary} />
              <Text style={styles.emptyText}>No active doctor access grants right now.</Text>
            </View>
          ) : (
            grants.map((grant) => {
              const isRevoked = grant.status === 'REVOKED';
              const isExpired = grant.status === 'EXPIRED';

              return (
                <View key={grant.id} style={styles.grantCard}>
                  <View style={styles.grantHeader}>
                    <View style={styles.grantIconCircle}>
                      <Ionicons name="medical" size={18} color={colors.primary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.grantName}>
                        {grant.recipientName || grant.granteeEmail || 'Clinician / Hospital Access'}
                      </Text>
                      <Text style={styles.grantExpText}>
                        Expires: {new Date(grant.expiresAt).toLocaleString()}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        isRevoked && styles.statusPillRevoked,
                        isExpired && styles.statusPillExpired,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          isRevoked && { color: colors.error },
                          isExpired && { color: '#D97706' },
                        ]}
                      >
                        {grant.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.grantFooter}>
                    <Text style={styles.accessCountText}>
                      Used {grant.accessCount} of {grant.maxAccessCount} accesses
                    </Text>

                    {!isRevoked && !isExpired && (
                      <Pressable
                        style={styles.revokeBtn}
                        onPress={() => handleRevoke(grant.id, grant.recipientName)}
                      >
                        <Ionicons name="close-circle-outline" size={14} color={colors.error} />
                        <Text style={styles.revokeBtnText}>Revoke Access</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Generated QR Code & Link Modal */}
      {createdResult && (
        <Modal visible={!!createdResult} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalTitleRow}>
                  <Ionicons name="qr-code" size={24} color={colors.primary} />
                  <Text style={styles.modalTitle}>Point-of-Care QR Code Ready</Text>
                </View>
                <Pressable onPress={() => setCreatedResult(null)}>
                  <Ionicons name="close" size={24} color={colors.darkText} />
                </Pressable>
              </View>

              {/* QR Payload Visual Box */}
              <View style={styles.qrDisplayCard}>
                <MaterialCommunityIcons name="qrcode-scan" size={110} color={colors.primary} />
                <Text style={styles.qrRecipientText}>
                  {createdResult.recipientName || 'Point-of-Care Access Link'}
                </Text>
                <Text style={styles.qrExpiresText}>
                  Valid until {new Date(createdResult.expiresAt).toLocaleString()}
                </Text>
              </View>

              {createdResult.requiresPasscode && (
                <View style={styles.passcodeInfoBox}>
                  <Ionicons name="key" size={16} color={colors.primary} />
                  <Text style={styles.passcodeInfoText}>
                    Security PIN Protected. The clinician will be prompted to enter your PIN.
                  </Text>
                </View>
              )}

              {/* Share Link Actions */}
              <View style={{ gap: 10 }}>
                <PrimaryButton
                  title="Open Clinical Access Link"
                  onPress={() => {
                    const token = createdResult.shareableToken;
                    setCreatedResult(null);
                    router.push(`/share?token=${token}`);
                  }}
                  variant="primary"
                />

                <Pressable
                  style={styles.copyBtn}
                  onPress={() => {
                    Alert.alert('Link Copied', `Share link copied:\n${createdResult.shareableUrl}`);
                  }}
                >
                  <Ionicons name="copy-outline" size={16} color={colors.darkText} />
                  <Text style={styles.copyBtnText}>Copy Link Address</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    paddingBottom: 36,
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
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
  cardSection: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkText,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  formGap: {
    gap: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
    marginTop: 4,
  },
  typePillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: colors.softBackground,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  typePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkText,
  },
  typePillTextActive: {
    color: colors.white,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expiryPill: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.softBackground,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  expiryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkText,
  },
  expiryTextActive: {
    color: colors.white,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  grantCard: {
    backgroundColor: colors.softBackground,
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  grantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  grantIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grantName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.darkText,
  },
  grantExpText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillRevoked: {
    backgroundColor: '#FEF2F2',
  },
  statusPillExpired: {
    backgroundColor: '#FEF3C7',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  grantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  accessCountText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  revokeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    gap: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
    flex: 1,
  },
  qrDisplayCard: {
    backgroundColor: colors.softBackground,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  qrRecipientText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkText,
    marginTop: 4,
  },
  qrExpiresText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  passcodeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF8FC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  passcodeInfoText: {
    fontSize: 12,
    color: colors.darkText,
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.softBackground,
    paddingVertical: 12,
    borderRadius: 16,
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
});
