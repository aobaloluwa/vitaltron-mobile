import { apiRequest } from './api';
import { RecordType } from './healthRecords';

export interface DocumentEntity {
  id: string;
  documentId: string;
  recordType: RecordType;
  extractedTitle: string;
  confidenceScore: number;
  extractedData: Record<string, any>;
  confirmedAt?: string | null;
}

export interface DocumentItem {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  entities?: DocumentEntity[];
  createdAt: string;
}

export interface ConfirmEntityDto {
  recordType?: RecordType;
  title?: string;
  description?: string;
}

export async function uploadDocument(fileUri: string, fileName: string, mimeType: string): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as any);

  return apiRequest('/documents/upload', {
    method: 'POST',
    body: formData,
    headers: {
      // Content-Type is handled automatically by fetch for FormData
    },
  });
}

export async function getDocuments(): Promise<DocumentItem[]> {
  return apiRequest('/documents', { method: 'GET' });
}

export async function getDocumentById(id: string): Promise<DocumentItem> {
  return apiRequest(`/documents/${id}`, { method: 'GET' });
}

export async function confirmEntity(entityId: string, dto: ConfirmEntityDto): Promise<{ success: boolean }> {
  return apiRequest(`/documents/entities/${entityId}/confirm`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}
