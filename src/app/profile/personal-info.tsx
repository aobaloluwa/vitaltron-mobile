import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather, Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { uploadDocument } from '../../services/documents';
import { getUserProfile, updateUserInfo } from '../../services/users';
import { colors } from '../../theme';

export default function PersonalInfoScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDesktopOrTablet = windowWidth >= 768;

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile().catch(() => null);
      if (data) {
        setDisplayName(data.displayName || '');
        setEmail(data.email || '');
        setAvatarUrl(data.avatarUrl || null);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfile();
  }, []);

  const handlePickAndUploadPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera roll permissions are required to select a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]?.uri) return;

      const asset = result.assets[0];
      setUploadingPhoto(true);

      const fileName = `avatar_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';

      const uploadRes = await uploadDocument(asset.uri, fileName, mimeType, 'PROFILE_AVATAR');
      const newPhotoUrl = uploadRes.fileUrl;

      setAvatarUrl(newPhotoUrl);

      // Save directly to user profile in backend database
      await updateUserInfo({ avatarUrl: newPhotoUrl });
      Alert.alert('Photo Updated', 'Your profile picture has been saved to your account and Cloudinary.');
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Required', 'Please enter a display name.');
      return;
    }

    setSaving(true);
    try {
      await updateUserInfo({
        displayName: displayName.trim(),
        avatarUrl: avatarUrl || undefined,
      });

      Alert.alert('Profile Saved', 'Your personal identity details have been saved across your devices.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isDesktopOrTablet && styles.scrollContentDesktop,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mainWrapper, { maxWidth: isDesktopOrTablet ? 600 : '100%' }]}>
            {/* Header Bar */}
            <View style={styles.headerBar}>
              <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
                <Ionicons name="arrow-back" size={22} color={colors.darkText} />
              </Pressable>
              <Text style={styles.headerTitle}>Personal Profile</Text>
              <AppLogo size="small" showText={false} />
            </View>

            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 40 }} />
            ) : (
              <View style={styles.cardSection}>
                {/* Avatar Photo Section */}
                <View style={styles.avatarSection}>
                  <View style={styles.avatarCircle}>
                    {avatarUrl ? (
                      <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                    ) : (
                      <Ionicons name="person" size={44} color={colors.white} />
                    )}

                    {uploadingPhoto && (
                      <View style={styles.avatarLoadingOverlay}>
                        <ActivityIndicator color={colors.white} />
                      </View>
                    )}
                  </View>

                  <Pressable
                    style={styles.changePhotoBtn}
                    onPress={handlePickAndUploadPhoto}
                    disabled={uploadingPhoto}
                  >
                    <Feather name="camera" size={16} color={colors.primary} />
                    <Text style={styles.changePhotoText}>
                      {uploadingPhoto ? 'Uploading to Cloudinary...' : 'Change Profile Picture'}
                    </Text>
                  </Pressable>
                </View>

                {/* Form Fields */}
                <View style={styles.formGap}>
                  <AppTextInput
                    label="Display / Full Name"
                    placeholder="e.g. Dr. John Doe"
                    value={displayName}
                    onChangeText={setDisplayName}
                    iconName="person-outline"
                  />

                  <AppTextInput
                    label="Account Email Address (Verified)"
                    placeholder="email@example.com"
                    value={email}
                    editable={false}
                    iconName="mail-outline"
                  />

                  <PrimaryButton
                    title="Save Profile Changes"
                    onPress={handleSaveProfile}
                    loading={saving}
                    variant="primary"
                    style={{ marginTop: 10 }}
                  />
                </View>
              </View>
            )}
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
    paddingBottom: 36,
  },
  scrollContentDesktop: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.softBackground,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  formGap: {
    gap: 16,
  },
});
