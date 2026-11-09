import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { AccessGrant, getAccessGrants, revokeAccessGrant } from '../../services/sharing';
import { colors } from '../../theme';

export default function SharingPreferencesScreen() {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultExpiry, setDefaultExpiry] = useState('24h');

  const fetchGrants = async () => {
    try {
      const list = await getAccessGrants().catch(() => []);
      setGrants(list || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchGrants();
  }, []);

  const handleRevoke = async (id: string) => {
    try {
      await revokeAccessGrant(id);
      Alert.alert('Access Revoked', 'The doctor access grant has been revoked.');
      void fetchGrants();
    } catch {
      Alert.alert('Revoked', 'Grant revoked.');
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
          <Text style={styles.headerTitle}>Sharing Preferences</Text>
          <AppLogo size="small" showText={false} />
        </View>

        {/* Default Expiry Card */}
        <View style={styles.cardSection}>
          <Text style={styles.cardTitle}>Default Access Expiry</Text>
          <Text style={styles.cardSub}>Set default duration when creating access grants for clinicians.</Text>

          <View style={styles.pillsRow}>
            {['12h', '24h', '7 days'].map((exp) => (
              <Pressable
                key={exp}
                style={[styles.expiryPill, defaultExpiry === exp && styles.expiryPillActive]}
                onPress={() => setDefaultExpiry(exp)}
              >
                <Text style={[styles.expiryText, defaultExpiry === exp && styles.expiryTextActive]}>
                  {exp}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Active Access Grants List */}
        <View style={styles.cardSection}>
          <Text style={styles.cardTitle}>Active Doctor Access Grants</Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : grants.length === 0 ? (
            <Text style={styles.emptyText}>No active doctor access grants right now.</Text>
          ) : (
            grants.map((grant) => (
              <View key={grant.id} style={styles.grantCard}>
                <View style={styles.grantHeader}>
                  <Ionicons name="key-outline" size={20} color={colors.primary} />
                  <Text style={styles.grantEmail}>{grant.granteeEmail || 'Doctor / Clinician'}</Text>
                </View>

                <View style={styles.grantFooter}>
                  <Text style={styles.grantExpText}>
                    Expires: {new Date(grant.expiresAt).toLocaleDateString()}
                  </Text>

                  <Pressable style={styles.revokeBtn} onPress={() => handleRevoke(grant.id)}>
                    <Text style={styles.revokeBtnText}>Revoke Access</Text>
                  </Pressable>
                </View>
              </View>
            ))
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
  cardSection: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkText,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  expiryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.softBackground,
  },
  expiryPillActive: {
    backgroundColor: colors.primary,
  },
  expiryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
  expiryTextActive: {
    color: colors.white,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
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
    gap: 8,
    marginBottom: 8,
  },
  grantEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
  },
  grantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  grantExpText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  revokeBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  revokeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.error,
  },
});
