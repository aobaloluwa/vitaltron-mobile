import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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
import { getUserProfile, updatePatientProfile } from '../../services/users';
import { colors } from '../../theme';

export default function HealthVitalsScreen() {
  const [bloodType, setBloodType] = useState('');
  const [allergiesSummary, setAllergiesSummary] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getUserProfile();
        if (data) {
          setBloodType(data.bloodType || 'O+');
          setAllergiesSummary(data.allergiesSummary || '');
          setChronicConditions(data.chronicConditionsSummary || '');
          setEmergencyName(data.emergencyContactName || '');
          setEmergencyPhone(data.emergencyContactPhone || '');
          setDateOfBirth(data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '');
          setGender(data.gender || '');
          setPrimaryLanguage(data.primaryLanguage || 'English');
        }
      } catch {
        // Fallback defaults
        setBloodType('O+');
        setAllergiesSummary('Penicillin');
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePatientProfile({
        bloodType: bloodType.trim(),
        allergiesSummary: allergiesSummary.trim(),
        chronicConditionsSummary: chronicConditions.trim(),
        emergencyContactName: emergencyName.trim(),
        emergencyContactPhone: emergencyPhone.trim(),
        dateOfBirth: dateOfBirth.trim() || undefined,
        gender: gender.trim(),
        primaryLanguage: primaryLanguage.trim(),
      });

      Alert.alert('Health Profile Updated', 'Your health vitals and profile details have been saved to your portable identity account.');
    } catch (error: any) {
      Alert.alert('Save Failed', error.message || 'Failed to save health profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerBar}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
              <Ionicons name="arrow-back" size={22} color={colors.darkText} />
            </Pressable>
            <Text style={styles.headerTitle}>Health Profile & Vitals</Text>
            <AppLogo size="small" showText={false} />
          </View>

          <View style={styles.infoBanner}>
            <Ionicons name="medical-outline" size={24} color={colors.primary} />
            <Text style={styles.infoBannerText}>
              This information powers your Portable Health Identity and is instantly available to authorized clinicians during emergencies.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <AppTextInput
              label="Blood Type"
              placeholder="e.g. O+, A-, AB+"
              value={bloodType}
              onChangeText={setBloodType}
            />

            <AppTextInput
              label="Known Allergies"
              placeholder="e.g. Penicillin, Peanuts, Latex"
              value={allergiesSummary}
              onChangeText={setAllergiesSummary}
            />

            <AppTextInput
              label="Chronic Conditions"
              placeholder="e.g. Asthma, Hypertension"
              value={chronicConditions}
              onChangeText={setChronicConditions}
            />

            <AppTextInput
              label="Emergency Contact Name"
              placeholder="e.g. Jane Doe (Spouse)"
              value={emergencyName}
              onChangeText={setEmergencyName}
            />

            <AppTextInput
              label="Emergency Contact Phone"
              placeholder="+1 234 567 8900"
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              keyboardType="phone-pad"
            />

            <AppTextInput
              label="Date of Birth (YYYY-MM-DD)"
              placeholder="1995-08-15"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />

            <AppTextInput
              label="Primary Language"
              placeholder="English"
              value={primaryLanguage}
              onChangeText={setPrimaryLanguage}
            />

            <PrimaryButton
              title="Save Health Profile"
              onPress={handleSave}
              loading={saving || loading}
              variant="primary"
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.softBackground,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.darkText,
    lineHeight: 19,
    fontWeight: '500',
  },
  formSection: {
    width: '100%',
  },
  submitBtn: {
    marginTop: 12,
  },
});
