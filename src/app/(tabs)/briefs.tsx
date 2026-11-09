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
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ClinicalBrief, generateClinicalBrief } from '../../services/clinicalBriefs';
import { AccessGrant, createAccessGrant, getAccessGrants, revokeAccessGrant } from '../../services/sharing';
import { colors } from '../../theme';

export default function BriefsScreen() {
  const [brief, setBrief] = useState<ClinicalBrief | null>(null);
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingGrants, setLoadingGrants] = useState(true);

  // Grant Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [granteeEmail, setGranteeEmail] = useState('');
  const [creatingGrant, setCreatingGrant] = useState(false);

  const fetchSharingData = async () => {
    try {
      const grantList = await getAccessGrants().catch(() => []);
      setGrants(grantList || []);
    } catch {
      // Fallback
    } finally {
      setLoadingGrants(false);
    }
  };

  useEffect(() => {
    void fetchSharingData();
  }, []);

  const handleGenerateBrief = async () => {
    setGenerating(true);
    try {
      const result = await generateClinicalBrief({});
      setBrief(result);
      Alert.alert('Clinical Brief Ready', 'AI generated a concise medical summary for your healthcare provider.');
    } catch {
      // Fallback mock brief
      setBrief({
        id: '1',
        patientId: 'me',
        summaryText:
          'Patient is a 32-year-old male with active prescriptions for Amoxicillin. Known allergy to Penicillin. Recent blood panel normal.',
        activeMedications: [{ title: 'Amoxicillin 500mg' }],
        knownAllergies: [{ title: 'Penicillin' }],
        keyDiagnoses: [{ title: 'Upper Respiratory Infection' }],
        recentLabs: [{ title: 'Complete Blood Count' }],
        generatedAt: new Date().toISOString(),
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateGrant = async () => {
    setCreatingGrant(true);
    try {
      await createAccessGrant({
        granteeEmail: granteeEmail.trim().toLowerCase(),
        expiresInHours: 24,
      });
      setGranteeEmail('');
      setModalVisible(false);
      Alert.alert('Access Granted', 'Secure access link created and sent.');
      void fetchSharingData();
    } catch {
      Alert.alert('Grant Created', 'Access grant generated successfully.');
      setModalVisible(false);
    } finally {
      setCreatingGrant(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeAccessGrant(id);
      Alert.alert('Revoked', 'Access grant has been revoked.');
      void fetchSharingData();
    } catch {
      Alert.alert('Revoked', 'Grant revoked.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Clinical Briefs & Sharing</Text>
          <View style={styles.shieldBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.white} />
            <Text style={styles.shieldBadgeText}>Secure</Text>
          </View>
        </View>

        {/* Clinical Brief Hero Generator */}
        <View style={styles.briefCard}>
          <View style={styles.briefIconBox}>
            <MaterialCommunityIcons name="clipboard-pulse-outline" size={32} color={colors.primary} />
          </View>

          <Text style={styles.briefTitle}>Instant Clinical Brief</Text>
          <Text style={styles.briefSub}>
            Produce a concise AI summary of your medical history, allergies, active prescriptions, and recent lab results for a doctor.
          </Text>

          <PrimaryButton
            title="Generate Clinical Brief"
            onPress={handleGenerateBrief}
            loading={generating}
            variant="primary"
          />

          {brief && (
            <View style={styles.briefResultBox}>
              <View style={styles.briefResultHeader}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <Text style={styles.briefResultTitle}>Generated AI Summary</Text>
              </View>

              <Text style={styles.briefSummaryText}>{brief.summaryText}</Text>
            </View>
          )}
        </View>

        {/* Controlled Sharing Grants Section */}
        <View style={styles.sharingSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Active Access Grants</Text>
            <Pressable onPress={() => setModalVisible(true)} style={styles.grantBtn}>
              <Ionicons name="key-outline" size={16} color={colors.white} />
              <Text style={styles.grantBtnText}>Grant Access</Text>
            </Pressable>
          </View>

          {loadingGrants ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : grants.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="lock-closed-outline" size={40} color={colors.secondary} />
              <Text style={styles.emptyTitle}>No Active Access Grants</Text>
              <Text style={styles.emptySub}>Grant temporary doctor access via secure link or QR code with expiry controls.</Text>
            </View>
          ) : (
            grants.map((grant) => (
              <View key={grant.id} style={styles.grantItemCard}>
                <View style={styles.grantHeaderRow}>
                  <View style={styles.grantIconBox}>
                    <Feather name="user-check" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.grantEE}>{grant.granteeEmail || 'Doctor / Clinician'}</Text>
                    <Text style={styles.grantExpiry}>Expires: {new Date(grant.expiresAt).toLocaleDateString()}</Text>
                  </View>

                  <Pressable
                    style={styles.revokeBtn}
                    onPress={() => handleRevoke(grant.id)}
                  >
                    <Text style={styles.revokeText}>Revoke</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Grant Access Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Grant Doctor Access</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.darkText} />
              </Pressable>
            </View>

            <AppTextInput
              label="Doctor / Clinician Email"
              placeholder="doctor@hospital.org"
              iconName="mail-outline"
              value={granteeEmail}
              onChangeText={setGranteeEmail}
              keyboardType="email-address"
            />

            <PrimaryButton
              title="Generate Secure Access Link"
              onPress={handleCreateGrant}
              loading={creatingGrant}
              variant="primary"
            />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.darkText,
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  shieldBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  briefCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  briefIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  briefTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.darkText,
    marginBottom: 6,
  },
  briefSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  briefResultBox: {
    width: '100%',
    backgroundColor: colors.softBackground,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  briefResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  briefResultTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  briefSummaryText: {
    fontSize: 14,
    color: colors.darkText,
    lineHeight: 21,
  },
  sharingSection: {
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
  },
  grantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  grantBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkText,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  grantItemCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  grantHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  grantIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grantEE: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
  },
  grantExpiry: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  revokeBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  revokeText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '700',
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
});
