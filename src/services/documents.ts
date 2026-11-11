import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { File, UploadType } from 'expo-file-system';
import { API_BASE_URL, apiRequest, getStoredAccessToken } from './api';
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
  uploadSource?: string;
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

export async function uploadDocument(
  fileUri: string,
  fileName: string,
  mimeType: string,
  uploadSource?: string
): Promise<DocumentItem> {
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const cleanType = mimeType || 'image/jpeg';
  const token = await getStoredAccessToken();

  // 1. Web Platform: Standard browser fetch + FormData
  if (Platform.OS === 'web') {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, cleanFileName);
      if (uploadSource) formData.append('uploadSource', uploadSource);

      return await apiRequest('/documents/upload', {
        method: 'POST',
        body: formData,
      });
    } catch {
      // Fallback below
    }
  }

  // 2. Mobile (iOS / Android): Expo SDK 58 Native File.upload method
  try {
    const file = new File(fileUri);
    const url = `${API_BASE_URL}/documents/upload`;

    const uploadResult = await file.upload(url, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: cleanType,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      parameters: {
        fileName: cleanFileName,
        fileType: cleanType,
        ...(uploadSource ? { uploadSource } : {}),
      },
    });

    if (uploadResult && uploadResult.status >= 200 && uploadResult.status < 300 && uploadResult.body) {
      return JSON.parse(uploadResult.body) as DocumentItem;
    }
  } catch (nativeUploadError) {
    console.warn('Native File.upload failed, attempting Base64 dataUri fallback:', nativeUploadError);
  }

  // 3. Fallback: Convert to Base64 Data URI and send as JSON body via apiRequest
  try {
    const file = new File(fileUri);
    const base64 = await file.base64().catch(async () => {
      return await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    });

    if (base64) {
      const dataUri = `data:${cleanType};base64,${base64}`;
      return await apiRequest('/documents/upload', {
        method: 'POST',
        body: JSON.stringify({
          dataUri,
          fileName: cleanFileName,
          fileType: cleanType,
          uploadSource,
        }),
      });
    }
  } catch (base64Error: any) {
    console.error('Base64 upload fallback failed:', base64Error);
    throw new Error(base64Error.message || 'Failed to process document for upload.');
  }

  throw new Error('Failed to upload document. Please check network connection and try again.');
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
