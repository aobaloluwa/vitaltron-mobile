import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { updateWomensHealthProfile } from '../../services/womensHealth';

interface Props {
  visible: boolean;
  onComplete: (sex: 'FEMALE' | 'MALE') => void;
}

export const WomensHealthOnboardingModal: React.FC<Props> = ({ visible, onComplete }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSex, setSelectedSex] = useState<'FEMALE' | 'MALE' | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    if (!selectedSex) return;
    setSaving(true);
    try {
      await updateWomensHealthProfile({
        isOnboarded: true,
        declaredSex: selectedSex,
        activeMode: selectedSex === 'FEMALE' ? 'MENSTRUAL' : 'MENSTRUAL',
      });
      onComplete(selectedSex);
    } catch {
      onComplete(selectedSex);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {step === 1 ? (
            <View style={styles.stepContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="rose-outline" size={36} color={colors.primary} />
              </View>

              <Text style={styles.title}>Welcome to Women's Health</Text>
              <Text style={styles.subTitle}>
                A private, comprehensive module designed for cycle tracking, fertility planning, pregnancy progress, postpartum recovery, and menopause management.
              </Text>

              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  <Text style={styles.featureText}>Personalized Cycle & Ovulation Predictions</Text>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  <Text style={styles.featureText}>Gestational Progress & Kick Counter</Text>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  <Text style={styles.featureText}>Confidential Symptom & STI Log</Text>
                </View>
              </View>

              <Pressable style={styles.nextBtn} onPress={() => setStep(2)}>
                <Text style={styles.nextBtnText}>Continue Setup</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.stepContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={32} color={colors.primary} />
              </View>

              <Text style={styles.title}>Sex & Profile Declaration</Text>
              <Text style={styles.subTitle}>
                To tailor your clinical tracking algorithms and ensure features match your anatomical life stage, please confirm your biological sex:
              </Text>

              <View style={styles.optionsContainer}>
                <Pressable
                  style={[styles.optionCard, selectedSex === 'FEMALE' && styles.optionCardActive]}
                  onPress={() => setSelectedSex('FEMALE')}
                >
                  <Ionicons
                    name={selectedSex === 'FEMALE' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedSex === 'FEMALE' ? colors.primary : colors.textMuted}
                  />
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, selectedSex === 'FEMALE' && styles.optionTitleActive]}>
                      Female / Tracking Female Health
                    </Text>
                    <Text style={styles.optionSub}>Access cycle, pregnancy, and menopause tools.</Text>
                  </View>
                </Pressable>

                <Pressable
                  style={[styles.optionCard, selectedSex === 'MALE' && styles.optionCardActive]}
                  onPress={() => setSelectedSex('MALE')}
                >
                  <Ionicons
                    name={selectedSex === 'MALE' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedSex === 'MALE' ? colors.primary : colors.textMuted}
                  />
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, selectedSex === 'MALE' && styles.optionTitleActive]}>
                      Male
                    </Text>
                    <Text style={styles.optionSub}>Restrict female anatomical tracking features.</Text>
                  </View>
                </Pressable>
              </View>

              <Pressable
                style={[styles.nextBtn, !selectedSex && styles.btnDisabled]}
                onPress={() => void handleFinish()}
                disabled={!selectedSex || saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.nextBtnText}>Complete Setup</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    card: {
      width: '100%',
      maxWidth: 440,
      backgroundColor: colors.white,
      borderRadius: 24,
      padding: 24,
    },
    stepContent: {
      alignItems: 'center',
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
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.darkText,
      textAlign: 'center',
    },
    subTitle: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
      marginTop: 6,
      marginBottom: 18,
    },
    featureList: {
      width: '100%',
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      marginBottom: 20,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    featureText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
    },
    optionsContainer: {
      width: '100%',
      gap: 10,
      marginBottom: 20,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.softBackground,
      gap: 10,
    },
    optionCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.softBackground,
    },
    optionTextCol: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.darkText,
    },
    optionTitleActive: {
      color: colors.primary,
    },
    optionSub: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    nextBtn: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      width: '100%',
      paddingVertical: 14,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    btnDisabled: {
      opacity: 0.5,
    },
    nextBtnText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '800',
    },
  });
