import { apiRequest } from './api';

export async function getFhirPatient(): Promise<any> {
  return apiRequest('/interoperability/fhir/patient', { method: 'GET' });
}

export async function importFhirData(fhirResource: any): Promise<any> {
  return apiRequest('/interoperability/fhir/import', {
    method: 'POST',
    body: JSON.stringify(fhirResource),
  });
}
