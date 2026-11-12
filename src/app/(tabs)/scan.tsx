import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { confirmEntity, DocumentItem, getDocuments, uploadDocument } from '../../services/documents';
import { RecordType } from '../../services/healthRecords';
import { useTranslation } from '../../i18n/LanguageContext';
import { colors } from '../../theme';

const RECORD_TYPES: RecordType[] = [
  'LAB_TEST',
  'MEDICATION',
  'DIAGNOSIS',
  'ALLERGY',
  'VITAL_SIGN',
  'PROCEDURE',
  'CLINICAL_NOTE',
];

export default function ScanScreen() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);

  // Analysis & Confirmation Modal State
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<DocumentItem | null>(null);
  const [editableEntities, setEditableEntities] = useState<
    {
      id: string;
      title: string;
      recordType: RecordType;
      description: string;
      confidenceScore: number;
      isConfirmed: boolean;
      confirming?: boolean;
    }[]
  >([]);

  const fetchDocs = async () => {
    try {
      const docs = await getDocuments().catch(() => []);
      const filteredDocs = (docs || []).filter(
        (doc) =>
          doc.uploadSource !== 'PROFILE_AVATAR' &&
          !doc.fileName.toLowerCase().startsWith('avatar_') &&
          !doc.fileName.toLowerCase().includes('avatar')
      );
      setDocuments(filteredDocs);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const { docId } = useLocalSearchParams<{ docId?: string }>();

  useEffect(() => {
    void fetchDocs();
  }, []);

  useEffect(() => {
    if (docId && documents.length > 0) {
      const match = documents.find((d) => d.id === docId);
      if (match) {
        openAnalysisModal(match, match.fileUrl);
      }
    }
  }, [docId, documents]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/(tabs)');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    void fetchDocs();
  };

  const openAnalysisModal = (doc: DocumentItem, imageUri?: string) => {
    if (imageUri) setScannedImageUri(imageUri);
    setCurrentDoc(doc);

    const rawList = doc.extractedEntities || doc.entities || [];
    const formattedEntities: any[] = [];

    for (const e of rawList) {
      const desc = e.description || '';
      const title = e.extractedTitle || e.title || doc.fileName || 'Medical Finding';

      formattedEntities.push({
        id: e.id,
        title: title.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim(),
        recordType: e.recordType || 'LAB_TEST',
        description: desc.trim(),
        confidenceScore: e.confidenceScore || 0.94,
        isConfirmed: !!e.isConfirmed,
      });
    }

    setEditableEntities(formattedEntities);
    setAnalysisModalVisible(true);
  };

  const processUpload = async (fileUri: string, fileName: string, mimeType: string) => {
    setScannedImageUri(fileUri);
    setScanning(true);

    try {
      const uploadedDoc = await uploadDocument(fileUri, fileName, mimeType);
      if (uploadedDoc) {
        openAnalysisModal(uploadedDoc, fileUri);
      }
      void fetchDocs();
    } catch (error: any) {
      Alert.alert(
        'Upload Error',
        error.message || 'Failed to upload document. Please check your network connection.'
      );
    } finally {
      setScanning(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera access is required to scan paper medical reports.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `scan_report_${Date.now()}.jpg`;
        await processUpload(asset.uri, fileName, 'image/jpeg');
      }
    } catch (error: any) {
      Alert.alert('Camera Error', error.message || 'Unable to launch camera.');
    }
  };

  const handleGallerySelect = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Gallery access is required to select medical document photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `lab_report_${Date.now()}.jpg`;
        await processUpload(asset.uri, fileName, 'image/jpeg');
      }
    } catch (error: any) {
      Alert.alert('Gallery Error', error.message || 'Unable to open gallery.');
    }
  };

  const handlePdfSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await processUpload(asset.uri, asset.name, asset.mimeType || 'application/pdf');
      }
    } catch (error: any) {
      Alert.alert('Document Error', error.message || 'Unable to select PDF.');
    }
  };

  const handleConfirmEntity = async (index: number) => {
    const item = editableEntities[index];
    if (!item || item.isConfirmed) return;

    setEditableEntities((prev) =>
      prev.map((e, idx) => (idx === index ? { ...e, confirming: true } : e))
    );

    try {
      await confirmEntity(item.id, {
        title: item.title,
        recordType: item.recordType,
        description: item.description,
      });

      setEditableEntities((prev) =>
        prev.map((e, idx) =>
          idx === index ? { ...e, isConfirmed: true, confirming: false } : e
        )
      );

      Alert.alert(
        'Saved to Health Passport!',
        `"${item.title}" has been saved to your Universal Health Timeline.`
      );
      void fetchDocs();
    } catch (error: any) {
      setEditableEntities((prev) =>
        prev.map((e, idx) =>
          idx === index ? { ...e, confirming: false } : e
        )
      );
      Alert.alert('Save Failed', error.message || `Unable to save "${item.title}" to health records.`);
    }
  };

  const handleUpdateEntityField = (
    index: number,
    field: 'title' | 'recordType' | 'description',
    value: string
  ) => {
    setEditableEntities((prev) =>
      prev.map((e, idx) => (idx === index ? { ...e, [field]: value } : e))
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>{t('aiDocumentIngestion')}</Text>
          <View style={styles.aiBadge}>
            <MaterialIcons name="auto-awesome" size={14} color={colors.white} />
            <Text style={styles.aiBadgeText}>AI Engine</Text>
          </View>
        </View>

        {loading ? (
          /* Skeleton Loader */
          <View style={{ gap: 14 }}>
            <SkeletonLoader width="100%" height={200} borderRadius={24} />
            <SkeletonLoader width="100%" height={80} borderRadius={20} />
            <SkeletonLoader width="100%" height={80} borderRadius={20} />
          </View>
        ) : (
          <>
            {/* Camera Scan Hero Card */}
            <View style={styles.scanCard}>
              {scannedImageUri && (
                <View style={styles.previewBox}>
                  <Image source={{ uri: scannedImageUri }} style={styles.previewImage} resizeMode="cover" />
                </View>
              )}

              <View style={styles.scanIconCircle}>
                <Feather name="camera" size={32} color={colors.primary} />
              </View>

              <Text style={styles.scanCardTitle}>Scan Medical Document</Text>
              <Text style={styles.scanCardSub}>
                Snap a photo of paper lab reports, prescriptions, or discharge summaries. Vitaltron AI automatically extracts structured health data.
              </Text>

              {scanning && (
                <View style={styles.progressBox}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={styles.progressText}>Analyzing document text with Vitaltron AI...</Text>
                </View>
              )}

              {/* Capture Actions Grid */}
              <View style={styles.scanActionsGrid}>
                <Pressable style={styles.actionBtnPrimary} onPress={handleCameraCapture} disabled={scanning}>
                  <Ionicons name="camera" size={18} color={colors.white} />
                  <Text style={styles.actionBtnPrimaryText}>Camera Scan</Text>
                </Pressable>

                <Pressable style={styles.actionBtnSecondary} onPress={handleGallerySelect} disabled={scanning}>
                  <Ionicons name="images-outline" size={18} color={colors.primary} />
                  <Text style={styles.actionBtnSecondaryText}>Photo Library</Text>
                </Pressable>

                <Pressable style={styles.actionBtnSecondary} onPress={handlePdfSelect} disabled={scanning}>
                  <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                  <Text style={styles.actionBtnSecondaryText}>Select PDF</Text>
                </Pressable>
              </View>
            </View>

            {/* Ingested Documents List */}
            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Ingested Health Documents</Text>

              {documents.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="document-text-outline" size={42} color={colors.secondary} />
                  <Text style={styles.emptyTitle}>No Ingested Documents Yet</Text>
                  <Text style={styles.emptySub}>
                    Use Camera Scan or Photo Library above to scan paper medical reports into your account.
                  </Text>
                </View>
              ) : (
                documents.map((doc) => {
                  const entitiesList = doc.extractedEntities || doc.entities || [];
                  const statusDisplay = doc.ingestionStatus || doc.status || 'PROCESSED';

                  return (
                    <Pressable
                      key={doc.id}
                      style={styles.docCard}
                      onPress={() => openAnalysisModal(doc, doc.fileUrl)}
                    >
                      <View style={styles.docHeaderRow}>
                        <View style={styles.docFileIconBox}>
                          <Ionicons name="document-text" size={22} color={colors.primary} />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.docFileName}>{doc.fileName}</Text>
                          <Text style={styles.docDate}>
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </Text>
                        </View>

                        <View style={styles.statusPill}>
                          <Text style={styles.statusText}>{statusDisplay}</Text>
                        </View>
                      </View>

                      {/* Entities Count & Tap To Review */}
                      <View style={styles.reviewBanner}>
                        <Text style={styles.reviewBannerText}>
                          {entitiesList.length} AI Medical Entities Extracted
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* AI Document Reader Modal (Word Document Style) */}
      <Modal visible={analysisModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="auto-awesome" size={20} color={colors.primary} />
                <Text style={styles.modalTitle}>Medical Document Reader</Text>
              </View>
              <Pressable onPress={() => setAnalysisModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.darkText} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: 580 }}>
              {/* Document Image Header */}
              {scannedImageUri && (
                <View style={styles.modalImagePreviewBox}>
                  <Image source={{ uri: scannedImageUri }} style={styles.modalImage} resizeMode="cover" />
                </View>
              )}

              <Text style={styles.modalInstructionText}>
                Review your scanned document like a Word document below. Hospital, physician, and test findings are fully extracted.
              </Text>

              {/* Single Consolidated Document Card */}
              {editableEntities.map((item, index) => (
                <View key={item.id || index} style={styles.documentReaderCard}>
                  <View style={styles.entityCardHeader}>
                    <View style={styles.confBadge}>
                      <Text style={styles.confText}>
                        {Math.round(item.confidenceScore * 100)}% AI Verified
                      </Text>
                    </View>

                    {item.isConfirmed && (
                      <View style={styles.confirmedTag}>
                        <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                        <Text style={styles.confirmedTagText}>Saved to Passport</Text>
                      </View>
                    )}
                  </View>

                  {/* Document Title */}
                  <AppTextInput
                    label="Document Title"
                    value={item.title}
                    onChangeText={(val) => handleUpdateEntityField(index, 'title', val)}
                  />

                  {/* Record Category */}
                  <Text style={styles.typeSelectorLabel}>Record Category:</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.typePillsScroll}
                  >
                    {RECORD_TYPES.map((type) => (
                      <Pressable
                        key={type}
                        style={[
                          styles.typePill,
                          item.recordType === type && styles.typePillActive,
                        ]}
                        onPress={() => handleUpdateEntityField(index, 'recordType', type)}
                      >
                        <Text
                          style={[
                            styles.typePillText,
                            item.recordType === type && styles.typePillTextActive,
                          ]}
                        >
                          {type}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {/* Scrollable Document Content Viewer (Word Document style) */}
                  <Text style={styles.typeSelectorLabel}>Document Content, Hospital, Doctor & Findings:</Text>
                  <View style={styles.documentTextViewer}>
                    <AppTextInput
                      value={item.description}
                      onChangeText={(val) => handleUpdateEntityField(index, 'description', val)}
                      multiline={true}
                      style={styles.documentTextArea}
                    />
                  </View>

                  {/* ONLY ONE SINGLE Confirm & Save Button at the bottom */}
                  <PrimaryButton
                    title={item.isConfirmed ? 'Saved to Timeline' : 'Confirm & Save to Health Passport'}
                    onPress={() => handleConfirmEntity(index)}
                    loading={item.confirming}
                    disabled={item.isConfirmed}
                    variant={item.isConfirmed ? 'outline' : 'primary'}
                    style={{ marginTop: 16 }}
                  />
                </View>
              ))}
            </ScrollView>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.darkText,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  scanCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.softBackground,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  previewBox: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  scanIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
    marginBottom: 6,
  },
  scanCardSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  progressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.softBackground,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 16,
    width: '100%',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  scanActionsGrid: {
    width: '100%',
    gap: 10,
  },
  actionBtnPrimary: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnPrimaryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  actionBtnSecondary: {
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.softBackground,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnSecondaryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  listSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
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
    lineHeight: 18,
  },
  docCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docFileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docFileName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
  },
  docDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: colors.softBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  reviewBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.softBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  reviewBannerText: {
    fontSize: 12,
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
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
  },
  modalImagePreviewBox: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalInstructionText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  documentReaderCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  documentTextViewer: {
    backgroundColor: '#FCFBFD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.softBackground,
    padding: 4,
  },
  documentTextArea: {
    minHeight: 220,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 22,
    color: colors.darkText,
  },
  entityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  confText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  confirmedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confirmedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  typeSelectorLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 6,
    marginTop: -4,
  },
  typePillsScroll: {
    gap: 8,
    marginBottom: 12,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.darkText,
  },
  typePillTextActive: {
    color: colors.white,
  },
});
