import { apiRequest } from './api';

export interface ClinicalBrief {
  id: string;
  patientId: string;
  summaryText: string;
  activeMedications: any[];
  knownAllergies: any[];
  keyDiagnoses: any[];
  recentLabs: any[];
  generatedAt: string;
}

export interface GenerateBriefDto {
  patientId?: string;
  notes?: string;
}

export async function generateClinicalBrief(dto?: GenerateBriefDto): Promise<ClinicalBrief> {
  return apiRequest('/clinical-briefs/generate', {
    method: 'POST',
    body: JSON.stringify(dto || {}),
  });
}

export async function getBriefById(id: string): Promise<ClinicalBrief> {
  return apiRequest(`/clinical-briefs/${id}`, { method: 'GET' });
}

export async function getPatientBriefs(patientId: string): Promise<ClinicalBrief[]> {
  return apiRequest(`/clinical-briefs/patient/${patientId}`, { method: 'GET' });
}
