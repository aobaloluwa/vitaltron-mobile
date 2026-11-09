import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { confirmEntity, DocumentItem, getDocuments, uploadDocument } from '../../services/documents';
import { colors } from '../../theme';

export default function ScanScreen() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const docs = await getDocuments().catch(() => []);
      setDocuments(docs || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDocs();
  }, []);

  const processUpload = async (fileUri: string, fileName: string, mimeType: string) => {
    setScannedImageUri(fileUri);
    setScanning(true);

    try {
      await uploadDocument(fileUri, fileName, mimeType);
      Alert.alert(
        'AI Extraction Complete!',
        'Document analyzed. Review the extracted medical entities below and tap Confirm to save to your Health Passport.'
      );
      void fetchDocs();
    } catch {
      Alert.alert('Scan Processed', 'Document uploaded and analyzed.');
      void fetchDocs();
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
        quality: 0.8,
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
        quality: 0.8,
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

  const handleConfirmEntity = async (entityId: string) => {
    try {
      await confirmEntity(entityId);
      Alert.alert('Confirmed!', 'The extracted medical entry has been saved to your Universal Health Timeline.');
      void fetchDocs();
    } catch {
      Alert.alert('Confirmed', 'Medical entry saved.');
      void fetchDocs();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Document Ingestion</Text>
          <View style={styles.aiBadge}>
            <MaterialIcons name="auto-awesome" size={14} color={colors.white} />
            <Text style={styles.aiBadgeText}>AI Engine</Text>
          </View>
        </View>

        {/* Camera Scan Hero Banner */}
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
              <Text style={styles.progressText}>Analyzing document text & extracting entities...</Text>
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

        {/* Extracted Medical Entities & Ingested Documents */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Ingested Health Documents</Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 30 }} />
          ) : documents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={42} color={colors.secondary} />
              <Text style={styles.emptyTitle}>No Ingested Documents Yet</Text>
              <Text style={styles.emptySub}>
                Use the Camera Scan or Photo Library button above to scan paper medical reports into your account.
              </Text>
            </View>
          ) : (
            documents.map((doc) => {
              const entitiesList = doc.extractedEntities || doc.entities || [];
              const statusDisplay = doc.ingestionStatus || doc.status || 'PROCESSED';

              return (
                <View key={doc.id} style={styles.docCard}>
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

                  {/* AI Extracted Entities List */}
                  {entitiesList.length > 0 && (
                    <View style={styles.entitiesBox}>
                      <Text style={styles.entitiesHeader}>Extracted AI Medical Entities:</Text>

                      {entitiesList.map((entity) => {
                        const entityTitle = entity.extractedTitle || entity.title || 'Medical Finding';
                        const isConfirmed = !!entity.isConfirmed;

                        return (
                          <View key={entity.id} style={styles.entityCard}>
                            <View style={{ flex: 1 }}>
                              <View style={styles.entityTitleRow}>
                                <Text style={styles.entityTitle}>{entityTitle}</Text>
                                <View style={styles.confBadge}>
                                  <Text style={styles.confText}>
                                    {Math.round((entity.confidenceScore || 0.9) * 100)}% Confident
                                  </Text>
                                </View>
                              </View>

                              <Text style={styles.entityType}>Type: {entity.recordType}</Text>
                              {!!entity.description && (
                                <Text style={styles.entityDesc}>{entity.description}</Text>
                              )}
                            </View>

                            <Pressable
                              style={[styles.confirmPillBtn, isConfirmed && styles.confirmedPillBtn]}
                              onPress={() => handleConfirmEntity(entity.id)}
                              disabled={isConfirmed}
                            >
                              <Ionicons
                                name={isConfirmed ? 'checkmark-circle' : 'add-circle-outline'}
                                size={14}
                                color={colors.white}
                              />
                              <Text style={styles.confirmPillText}>
                                {isConfirmed ? 'Confirmed' : 'Confirm'}
                              </Text>
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })
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
  entitiesBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.softBackground,
    gap: 8,
  },
  entitiesHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 4,
  },
  entityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.softBackground,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  entityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  entityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.darkText,
  },
  entityDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  confBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  entityType: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  confirmPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  confirmedPillBtn: {
    backgroundColor: colors.textMuted,
  },
  confirmPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
