import { apiRequest } from './api';

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergiesSummary?: string;
  chronicConditionsSummary?: string;
  primaryLanguage?: string;
}

export interface Dependent {
  id: string;
  primaryUserId?: string;
  dependentUserId?: string;
  relationshipType?: string;
  dependentUser?: {
    id: string;
    displayName: string;
    email?: string;
    patientProfile?: PatientProfile;
  };
  fullName?: string;
  relationship?: string;
  createdAt?: string;
}

export interface UpdatePatientProfileDto {
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergiesSummary?: string;
  chronicConditionsSummary?: string;
  primaryLanguage?: string;
}

export interface AddDependentParams {
  fullName: string;
  relationship: string;
  dateOfBirth?: string;
}

export async function getUserProfile(): Promise<any> {
  return apiRequest('/users/me', { method: 'GET' });
}

export async function updateUserInfo(data: {
  displayName?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
}): Promise<any> {
  return apiRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function updatePatientProfile(dto: UpdatePatientProfileDto): Promise<PatientProfile> {
  return apiRequest('/users/me/patient-profile', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export async function getDependents(): Promise<Dependent[]> {
  const data = await apiRequest('/users/me/dependents', { method: 'GET' });
  if (Array.isArray(data)) {
    return data.map((item: any) => ({
      id: item.id || item.dependentUserId,
      fullName: item.dependentUser?.displayName || item.fullName || 'Family Member',
      relationship: item.relationshipType || item.relationship || 'Dependent',
      createdAt: item.createdAt,
    }));
  }
  return [];
}

export async function addDependent(params: AddDependentParams): Promise<any> {
  const relUpper = (params.relationship || '').toUpperCase();
  let relationshipType: 'CHILD' | 'PARENT' | 'SPOUSE' | 'OTHER' = 'OTHER';
  if (relUpper.includes('CHILD') || relUpper.includes('SON') || relUpper.includes('DAUGHTER')) {
    relationshipType = 'CHILD';
  } else if (relUpper.includes('PARENT') || relUpper.includes('MOTHER') || relUpper.includes('FATHER')) {
    relationshipType = 'PARENT';
  } else if (relUpper.includes('SPOUSE') || relUpper.includes('WIFE') || relUpper.includes('HUSBAND')) {
    relationshipType = 'SPOUSE';
  }

  const payload = {
    displayName: params.fullName,
    relationshipType,
    dateOfBirth: params.dateOfBirth,
  };

  return apiRequest('/users/me/dependents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
