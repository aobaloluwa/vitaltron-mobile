import { apiRequest } from './api';
import { RecordType } from './healthRecords';

export interface AccessGrant {
  id: string;
  patientId: string;
  granteeEmail?: string;
  token: string;
  allowedRecordTypes?: RecordType[];
  expiresAt: string;
  revokedAt?: string | null;
  createdAt: string;
}

export interface CreateAccessGrantDto {
  granteeEmail?: string;
  allowedRecordTypes?: RecordType[];
  expiresInHours?: number;
}

export async function createAccessGrant(dto: CreateAccessGrantDto): Promise<AccessGrant> {
  const payload = {
    recipientName: dto.granteeEmail,
    expiresInHours: dto.expiresInHours || 24,
    allowedRecordTypes: dto.allowedRecordTypes || [],
  };

  return apiRequest('/sharing/grants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAccessGrants(): Promise<AccessGrant[]> {
  return apiRequest('/sharing/grants', { method: 'GET' });
}

export async function revokeAccessGrant(id: string): Promise<{ success: boolean }> {
  return apiRequest(`/sharing/grants/${id}/revoke`, { method: 'POST' });
}

export async function accessSharedRecords(token: string): Promise<any> {
  return apiRequest(`/sharing/access/${token}`, { method: 'POST' });
}
