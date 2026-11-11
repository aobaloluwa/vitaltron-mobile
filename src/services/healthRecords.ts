import { apiRequest } from './api';

export type RecordType =
  | 'DIAGNOSIS'
  | 'MEDICATION'
  | 'ALLERGY'
  | 'LAB_TEST'
  | 'VITAL_SIGN'
  | 'PROCEDURE'
  | 'CLINICAL_NOTE';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'PATIENT_CONFIRMED'
  | 'PATIENT_ASSERTED'
  | 'CLINICIAN_VERIFIED'
  | 'DISPUTED';

export interface HealthRecord {
  id: string;
  patientId: string;
  type: RecordType;
  title: string;
  description?: string;
  eventDate?: string;
  severity?: string;
  status?: string;
  facilityName?: string;
  verificationStatus: VerificationStatus;
  fhirData?: Record<string, any>;
  documentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthRecordDto {
  type: RecordType;
  title: string;
  description?: string;
  eventDate?: string;
  severity?: string;
  status?: string;
  facilityName?: string;
  verificationStatus?: VerificationStatus;
}

export interface QueryTimelineParams {
  type?: RecordType;
  search?: string;
  startDate?: string;
  endDate?: string;
  verificationStatus?: VerificationStatus;
  page?: number;
  limit?: number;
}

export interface GlobalSearchResult {
  records: HealthRecord[];
  documents: any[];
  extractedEntities: any[];
  dependents: any[];
}

export async function getTimeline(params?: QueryTimelineParams): Promise<{
  records: HealthRecord[];
  total: number;
  page: number;
  limit: number;
}> {
  const query = new URLSearchParams();
  if (params?.type) query.append('type', params.type);
  if (params?.search) query.append('search', params.search);
  if (params?.verificationStatus) query.append('verificationStatus', params.verificationStatus);
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());

  const queryString = query.toString();
  const endpoint = `/health-records/timeline${queryString ? `?${queryString}` : ''}`;
  return apiRequest(endpoint, { method: 'GET' });
}

export async function globalSearch(query: string): Promise<GlobalSearchResult> {
  const encoded = encodeURIComponent(query.trim());
  return apiRequest(`/health-records/search?q=${encoded}`, { method: 'GET' });
}

export async function getHealthRecordById(id: string): Promise<HealthRecord> {
  return apiRequest(`/health-records/${id}`, { method: 'GET' });
}

export async function createHealthRecord(dto: CreateHealthRecordDto): Promise<HealthRecord> {
  return apiRequest('/health-records', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function updateHealthRecord(
  id: string,
  dto: Partial<CreateHealthRecordDto>
): Promise<HealthRecord> {
  return apiRequest(`/health-records/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export async function deleteHealthRecord(id: string): Promise<{ success: boolean }> {
  return apiRequest(`/health-records/${id}`, { method: 'DELETE' });
}

export async function verifyHealthRecord(id: string): Promise<HealthRecord> {
  return apiRequest(`/health-records/${id}/verify`, { method: 'POST' });
}
