import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { getContraception, updateContraception } from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';

export default function ContraceptionScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [methodType, setMethodType] = useState('PILL');
  const [brandName, setBrandName] = useState('Yasmin');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [replacementDate, setReplacementDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    try {
      const data = await getContraception();
      if (data) {
        setMethodType(data.type || 'PILL');
        setBrandName(data.brandName || '');
        if (data.startDate) setStartDate(data.startDate.split('T')[0]);
        if (data.replacementDate) setReplacementDate(data.replacementDate.split('T')[0]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await updateContraception({
        type: methodType,
        brandName,
        startDate,
        replacementDate: replacementDate || undefined,
      });
      setSuccess(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WomensHealthHeader title="Birth Control Tracker" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Birth Control Tracker" subtitle="Contraceptive Schedule & Method" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Method Setup Card */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>Contraceptive Method</Text>
          <View style={styles.pillRow}>
            {['PILL', 'IUD_HORMONAL', 'IMPLANT', 'PATCH', 'RING', 'CONDOM'].map((type) => (
              <Pressable
                key={type}
                style={[styles.pill, methodType === type && styles.pillActive]}
                onPress={() => setMethodType(type)}
              >
                <Text style={[styles.pillText, methodType === type && styles.pillTextActive]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Brand / Prescription Name</Text>
          <TextInput
            style={styles.input}
            value={brandName}
            onChangeText={setBrandName}
            placeholder="Yasmin / Mirena / Nexplanon"
          />

          <Text style={styles.label}>Start / Insertion Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Expected Replacement / Renewal Date</Text>
          <TextInput
            style={styles.input}
            value={replacementDate}
            onChangeText={setReplacementDate}
            placeholder="YYYY-MM-DD"
          />

          <Pressable style={styles.saveBtn} onPress={() => void handleSave()} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save Contraception Method</Text>
            )}
          </Pressable>

          {success ? <Text style={styles.successText}>✓ Contraception profile updated!</Text> : null}
        </View>

        {/* Missed Dose Guidance Card */}
        <View style={styles.guidanceCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <View style={styles.guidanceInfo}>
            <Text style={styles.guidanceTitle}>Missed Dose Safety Note</Text>
            <Text style={styles.guidanceText}>
              For pill or patch missed doses, follow the official product pack instructions or consult your pharmacist/doctor promptly.
            </Text>
          </View>
        </View>

        <SafetyDisclaimerBanner text="Birth control tracking assists schedule management but does not replace prescription instructions from your healthcare provider." />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    inputCard: {
      backgroundColor: colors.white,
      borderRadius: 22,
      padding: 18,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
      marginTop: 10,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      color: colors.darkText,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 10,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    pillActive: {
      backgroundColor: colors.primary,
    },
    pillText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.darkText,
    },
    pillTextActive: {
      color: colors.white,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 18,
    },
    saveBtnText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '800',
    },
    successText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.success,
      textAlign: 'center',
      marginTop: 10,
    },
    guidanceCard: {
      flexDirection: 'row',
      backgroundColor: colors.inputBackground,
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      gap: 10,
    },
    guidanceInfo: {
      flex: 1,
    },
    guidanceTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.darkText,
    },
    guidanceText: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 17,
      marginTop: 2,
    },
  });
