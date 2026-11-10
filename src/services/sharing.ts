import { apiRequest } from './api';
import { RecordType } from './healthRecords';

export interface AccessGrant {
  id: string;
  patientId: string;
  recipientName?: string;
  granteeEmail?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  allowedRecordTypes?: RecordType[];
  expiresAt: string;
  maxAccessCount: number;
  accessCount: number;
  revokedAt?: string | null;
  createdAt: string;
  requiresPasscode?: boolean;
  shareableUrl?: string;
  qrCodeImageUrl?: string;
}

export interface CreateAccessGrantDto {
  recipientName?: string;
  granteeEmail?: string;
  passcode?: string;
  allowedRecordTypes?: RecordType[];
  expiresInHours?: number;
  maxAccessCount?: number;
}

export interface CreateAccessGrantResult {
  grantId: string;
  shareableToken: string;
  shareableUrl: string;
  qrCodeImageUrl?: string;
  qrCodePayload: string;
  expiresAt: string;
  maxAccessCount: number;
  requiresPasscode: boolean;
  recipientName?: string;
  allowedRecordTypes?: RecordType[];
}

export async function createAccessGrant(dto: CreateAccessGrantDto): Promise<CreateAccessGrantResult> {
  const payload = {
    recipientName: dto.recipientName || dto.granteeEmail,
    passcode: dto.passcode,
    expiresInHours: dto.expiresInHours || 24,
    maxAccessCount: dto.maxAccessCount || 5,
    allowedRecordTypes: dto.allowedRecordTypes && dto.allowedRecordTypes.length > 0 ? dto.allowedRecordTypes : undefined,
  };

  return apiRequest('/sharing/grants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAccessGrants(): Promise<AccessGrant[]> {
  return apiRequest('/sharing/grants', { method: 'GET' });
}

export async function revokeAccessGrant(id: string): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/sharing/grants/${id}/revoke`, { method: 'POST' });
}

export async function accessSharedRecords(
  token: string,
  credentials?: { email?: string; passcode?: string }
): Promise<{
  patientName: string;
  accessGrantId: string;
  recipientName?: string;
  expiresAt: string;
  remainingAccesses: number;
  clinicalBrief?: any;
  timelineRecords: any[];
}> {
  return apiRequest(`/sharing/access/${token}`, {
    method: 'POST',
    body: JSON.stringify(credentials || {}),
  });
}
