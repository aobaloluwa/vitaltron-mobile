import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { apiRequest } from './api';
import { RecordType } from './healthRecords';

export interface DocumentEntity {
  id: string;
  documentId: string;
  recordType: RecordType;
  extractedTitle?: string;
  title?: string;
  description?: string;
  confidenceScore: number;
  extractedData?: Record<string, any>;
  isConfirmed?: boolean;
  confirmedAt?: string | null;
}

export interface DocumentItem {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileType?: string;
  fileSize?: number;
  status?: string;
  ingestionStatus?: string;
  entities?: DocumentEntity[];
  extractedEntities?: DocumentEntity[];
  createdAt: string;
}

export interface ConfirmEntityDto {
  recordType?: RecordType;
  title?: string;
  description?: string;
}

export async function uploadDocument(fileUri: string, fileName: string, mimeType: string): Promise<DocumentItem> {
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const cleanType = mimeType || 'image/jpeg';

  // 1. Convert captured photo/PDF file to Base64 Data URI to bypass React Native's native FormDataPart bridge bugs
  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (base64) {
      const dataUri = `data:${cleanType};base64,${base64}`;
      return await apiRequest('/documents/upload', {
        method: 'POST',
        body: JSON.stringify({
          dataUri,
          fileName: cleanFileName,
          fileType: cleanType,
        }),
      });
    }
  } catch {
    // If base64 conversion is unavailable, fallback to FormData
  }

  // 2. Fallback FormData method with normalized file URI
  const formData = new FormData();
  const normalizedUri = Platform.OS === 'android' ? fileUri : fileUri.replace('file://', '');

  formData.append('file', {
    uri: normalizedUri,
    name: cleanFileName,
    type: cleanType,
  } as any);

  return apiRequest('/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function getDocuments(): Promise<DocumentItem[]> {
  return apiRequest('/documents', { method: 'GET' });
}

export async function getDocumentById(id: string): Promise<DocumentItem> {
  return apiRequest(`/documents/${id}`, { method: 'GET' });
}

export async function confirmEntity(entityId: string, dto?: ConfirmEntityDto): Promise<{ success: boolean }> {
  return apiRequest(`/documents/entities/${entityId}/confirm`, {
    method: 'POST',
    body: JSON.stringify(dto || {}),
  });
}
