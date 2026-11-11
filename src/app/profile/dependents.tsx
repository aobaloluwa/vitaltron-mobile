import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { addDependent, Dependent, getDependents } from '../../services/users';
import { colors } from '../../theme';

export default function DependentsScreen() {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchDeps = async () => {
    try {
      const list = await getDependents().catch(() => []);
      setDependents(list || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDeps();
  }, []);

  const handleAdd = async () => {
    if (!fullName.trim()) return;
    setAdding(true);
    try {
      await addDependent({
        fullName: fullName.trim(),
        relationship: relationship.trim() || 'Family Member',
      });

      setFullName('');
      setRelationship('');
      setModalVisible(false);
      Alert.alert('Dependent Linked', 'Family member added to your identity portfolio.');
      void fetchDeps();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add dependent.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.darkText} />
          </Pressable>
          <Text style={styles.headerTitle}>Family Dependents</Text>
          <AppLogo size="small" showText={false} />
        </View>

        {/* Section Header */}
        <View style={styles.topSectionRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Family Health Portfolio</Text>
            <Text style={styles.sectionSub}>Manage portable records for children or elderly relatives.</Text>
          </View>

          <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 30 }} />
        ) : dependents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={42} color={colors.secondary} />
            <Text style={styles.emptyTitle}>No Family Dependents Linked</Text>
            <Text style={styles.emptySub}>
              Link children or family members to manage their health passports under your account.
            </Text>
            <PrimaryButton
              title="Add Family Member"
              onPress={() => setModalVisible(true)}
              variant="primary"
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          dependents.map((dep) => (
            <Pressable
              key={dep.id}
              style={styles.dependentCard}
              onPress={() => {
                Alert.alert(
                  `Manage ${dep.fullName}`,
                  `Select an action for ${dep.fullName} (${dep.relationship}):`,
                  [
                    {
                      text: 'View Health Timeline',
                      onPress: () => router.push('/records/timeline'),
                    },
                    {
                      text: 'Generate Doctor Access QR Code',
                      onPress: () => router.push('/profile/sharing-preferences'),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.depName}>{dep.fullName}</Text>
                <Text style={styles.depRel}>Relationship: {dep.relationship}</Text>
              </View>

              <View style={styles.badgePill}>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                <Text style={styles.badgeText}>Manage</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.darkText} />
              </Pressable>
            </View>

            <AppTextInput
              label="Full Name"
              placeholder="Child / Parent / Spouse"
              value={fullName}
              onChangeText={setFullName}
            />

            <AppTextInput
              label="Relationship"
              placeholder="e.g. Son, Daughter, Mother"
              value={relationship}
              onChangeText={setRelationship}
            />

            <PrimaryButton
              title="Add Dependent"
              onPress={handleAdd}
              loading={adding}
              variant="primary"
            />
          </View>
        </KeyboardAvoidingView>
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
  topSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkText,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  dependentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.softBackground,
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  depName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkText,
  },
  depRel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: colors.softBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
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
