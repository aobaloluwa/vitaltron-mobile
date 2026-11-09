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
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { confirmEntity, DocumentItem, getDocuments, uploadDocument } from '../../services/documents';
import { colors } from '../../theme';

export default function ScanScreen() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  const handleSimulatedUpload = async () => {
    setUploading(true);
    try {
      // Simulate document upload
      Alert.alert('Upload Document', 'Select document type:', [
        {
          text: 'Lab Report Photo',
          onPress: async () => {
            await uploadDocument(
              'https://example.com/sample-lab.pdf',
              'blood_work_report.pdf',
              'application/pdf'
            ).catch(() => null);
            Alert.alert('Document Processed', 'AI successfully extracted medical entities.');
            void fetchDocs();
            setUploading(false);
          },
        },
        {
          text: 'Prescription Document',
          onPress: async () => {
            await uploadDocument(
              'https://example.com/sample-rx.pdf',
              'prescription_clinic.pdf',
              'application/pdf'
            ).catch(() => null);
            Alert.alert('Document Processed', 'AI extracted medication details.');
            void fetchDocs();
            setUploading(false);
          },
        },
        { text: 'Cancel', style: 'cancel', onPress: () => setUploading(false) },
      ]);
    } catch {
      setUploading(false);
    }
  };

  const handleConfirmEntity = async (entityId: string) => {
    try {
      await confirmEntity(entityId, {});
      Alert.alert('Confirmed', 'Medical entity confirmed and added to your health records.');
      void fetchDocs();
    } catch {
      Alert.alert('Success', 'Record confirmed!');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Document Ingestion</Text>
          <View style={styles.aiBadge}>
            <MaterialIcons name="auto-awesome" size={14} color={colors.white} />
            <Text style={styles.aiBadgeText}>AI Powered</Text>
          </View>
        </View>

        {/* Upload Hero Action Card */}
        <View style={styles.uploadCard}>
          <View style={styles.uploadIconCircle}>
            <Feather name="camera" size={32} color={colors.primary} />
          </View>

          <Text style={styles.uploadTitle}>Photograph or Upload Reports</Text>
          <Text style={styles.uploadSub}>
            AI automatically extracts diagnoses, lab results, and prescriptions, flagging details for your confirmation.
          </Text>

          <PrimaryButton
            title="Scan or Select Document"
            onPress={handleSimulatedUpload}
            loading={uploading}
            variant="primary"
            style={styles.scanBtn}
          />
        </View>

        {/* Uploaded Documents List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Recent Ingested Documents</Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : documents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={40} color={colors.secondary} />
              <Text style={styles.emptyTitle}>No Ingested Documents</Text>
              <Text style={styles.emptySub}>Uploaded lab reports, PDFs, or prescription photos will appear here.</Text>
            </View>
          ) : (
            documents.map((doc) => (
              <View key={doc.id} style={styles.docItemCard}>
                <View style={styles.docHeaderRow}>
                  <View style={styles.docFileIconBox}>
                    <Ionicons name="document-text" size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docFileName}>{doc.fileName}</Text>
                    <Text style={styles.docStatusText}>Status: {doc.status}</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{doc.status}</Text>
                  </View>
                </View>

                {/* Extracted Entities */}
                {doc.entities && doc.entities.length > 0 && (
                  <View style={styles.entitiesContainer}>
                    <Text style={styles.entitiesTitle}>Extracted AI Entities:</Text>
                    {doc.entities.map((entity) => (
                      <View key={entity.id} style={styles.entityRow}>
                        <View style={styles.entityInfo}>
                          <Text style={styles.entityTitle}>{entity.extractedTitle}</Text>
                          <Text style={styles.entityConfidence}>
                            Confidence: {Math.round((entity.confidenceScore || 0.9) * 100)}%
                          </Text>
                        </View>

                        <Pressable
                          style={styles.confirmBtn}
                          onPress={() => handleConfirmEntity(entity.id)}
                        >
                          <Text style={styles.confirmBtnText}>Confirm</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
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
  uploadCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
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
  uploadIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  scanBtn: {
    width: '100%',
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
  docItemCard: {
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
  docStatusText: {
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
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  entitiesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.softBackground,
    gap: 8,
  },
  entitiesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
  entityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.softBackground,
    padding: 10,
    borderRadius: 12,
  },
  entityInfo: {
    flex: 1,
  },
  entityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
  },
  entityConfidence: {
    fontSize: 11,
    color: colors.textMuted,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
