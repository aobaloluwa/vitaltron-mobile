import { apiRequest } from './api';

export type TrackingMode = 'MENSTRUAL' | 'CONCEPTION' | 'PREGNANCY' | 'POSTPARTUM' | 'MENOPAUSE';
export type FlowIntensity = 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'VERY_HEAVY' | 'SPOTTING';
export type CervicalMucusType = 'DRY' | 'STICKY' | 'CREAMY' | 'EGG_WHITE' | 'WATERY';

export interface WomensHealthProfile {
  id: string;
  userId: string;
  activeMode: TrackingMode;
  isOnboarded?: boolean;
  declaredSex?: string;
  averageCycleLength: number;
  averagePeriodDuration: number;
  lastPeriodStart?: string;
  estimatedDueDate?: string;
  isHighPrivacy: boolean;
}

export interface CycleMetrics {
  currentCycleDay: number;
  currentPhase: 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATORY' | 'LUTAL';
  phaseDisplayName: string;
  phaseDescription: string;
  estimatedNextPeriod: string;
  estimatedOvulation: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  averageCycleLength: number;
  averagePeriodDuration: number;
  cycleVariabilityDays: number;
  isDataSufficient: boolean;
  disclaimer: string;
}

export interface PregnancyMetrics {
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  currentTrimester: number;
  trimesterName: string;
  dueDate: string;
  daysRemaining: number;
  weeksRemaining: number;
  progressPercent: number;
  babySizeFruit: string;
  babyLengthCm: number;
  babyWeightGrams: number;
  weeklyMilestoneTitle: string;
  weeklySummary: string;
  disclaimer: string;
}

export interface PregnancyInsights {
  gestationalWeek: number;
  currentTrimester: number;
  trimesterName: string;
  keyCareAdvice: string;
  recommendedActions: string[];
  safetyFlags: string[];
}

export interface SymptomInsights {
  todayLogged: boolean;
  todayMood?: string;
  todaySymptoms: string[];
  todayNotes?: string;
  topRecentSymptoms: { name: string; count: number }[];
  personalizedTip: string;
}

export interface FertilityInsights {
  todayLogged: boolean;
  todayBbt?: number;
  todayMucus?: string;
  todayLhTest?: string;
  fertilityStatus: 'PEAK' | 'HIGH' | 'MODERATE' | 'LOW' | 'POST_OVULATION';
  statusDisplayName: string;
  personalizedTip: string;
}

export interface WomensHealthDashboardData {
  user: { name: string };
  activeMode: TrackingMode;
  isOnboarded?: boolean;
  declaredSex?: string;
  cycleMetrics: CycleMetrics;
  pregnancyMetrics?: PregnancyMetrics;
  menopauseSummary?: any;
  todayLog?: any;
  symptomInsights?: SymptomInsights;
  fertilityInsights?: FertilityInsights;
  recentLogs: any[];
  upcomingReminders: any[];
}

export async function getWomensHealthProfile(): Promise<WomensHealthProfile> {
  return apiRequest('/womens-health/profile', { method: 'GET' });
}

export async function updateWomensHealthProfile(dto: Partial<WomensHealthProfile>): Promise<WomensHealthProfile> {
  return apiRequest('/womens-health/profile', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export async function getWomensHealthDashboard(): Promise<WomensHealthDashboardData> {
  return apiRequest('/womens-health/dashboard', { method: 'GET' });
}

export async function createPeriodRecord(dto: {
  startDate: string;
  endDate?: string;
  flow?: FlowIntensity;
  isSpotting?: boolean;
  notes?: string;
}): Promise<any> {
  const payload: any = { ...dto };
  if (!payload.endDate || typeof payload.endDate !== 'string' || !payload.endDate.trim()) {
    delete payload.endDate;
  }
  return apiRequest('/womens-health/periods', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCycleCalendar(): Promise<any> {
  return apiRequest('/womens-health/calendar', { method: 'GET' });
}

export async function logDailyCycle(dto: {
  date: string;
  symptoms?: Record<string, number>;
  mood?: string;
  cervicalMucus?: CervicalMucusType;
  bbt?: number;
  sexualActivity?: boolean;
  ovulationTestResult?: string;
  pregnancyTestResult?: string;
  notes?: string;
}): Promise<any> {
  return apiRequest('/womens-health/daily-log', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function getDailyLogs(): Promise<any[]> {
  return apiRequest('/womens-health/daily-logs', { method: 'GET' });
}

export async function getPregnancyProfile(): Promise<any> {
  return apiRequest('/womens-health/pregnancy', { method: 'GET' });
}

export async function createPregnancyProfile(dto: {
  lmpDate?: string;
  confirmedDueDate?: string;
  conceptionDate?: string;
  pregnancyType?: string;
  babiesCount?: number;
  healthcareProvider?: string;
}): Promise<any> {
  return apiRequest('/womens-health/pregnancy', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function logKickSession(dto: {
  startTime: string;
  endTime?: string;
  kickCount: number;
  notes?: string;
}): Promise<any> {
  return apiRequest('/womens-health/pregnancy/kick-sessions', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function logContractionSession(dto: {
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  intervalMinutes?: number;
  severity?: number;
  notes?: string;
}): Promise<any> {
  return apiRequest('/womens-health/pregnancy/contraction-sessions', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function createPregnancyJournal(dto: {
  title: string;
  content: string;
  weekNumber?: number;
  mood?: string;
  photoUrl?: string;
  isMemory?: boolean;
}): Promise<any> {
  return apiRequest('/womens-health/pregnancy/journals', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function getPregnancyJournals(): Promise<any[]> {
  return apiRequest('/womens-health/pregnancy/journals', { method: 'GET' });
}

export async function getPostpartumProfile(): Promise<any> {
  return apiRequest('/womens-health/postpartum', { method: 'GET' });
}

export async function createPostpartumProfile(dto: {
  deliveryDate: string;
  deliveryType?: string;
  recoveryNotes?: string;
  moodRating?: number;
  lochiaStatus?: string;
}): Promise<any> {
  return apiRequest('/womens-health/postpartum', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function logBreastfeeding(dto: {
  startTime: string;
  breastSide?: string;
  durationMinutes?: number;
  expressedAmountMl?: number;
  notes?: string;
}): Promise<any> {
  return apiRequest('/womens-health/postpartum/breastfeeding', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function getMenopauseProfile(): Promise<any> {
  return apiRequest('/womens-health/menopause', { method: 'GET' });
}

export async function logMenopauseSymptom(dto: {
  date: string;
  hotFlashSeverity?: number;
  nightSweats?: boolean;
  sleepQuality?: number;
  brainFogRating?: number;
  moodChanges?: string;
  triggers?: string;
  notes?: string;
}): Promise<any> {
  return apiRequest('/womens-health/menopause/symptoms', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function getContraception(): Promise<any> {
  return apiRequest('/womens-health/contraception', { method: 'GET' });
}

export async function updateContraception(dto: {
  type: string;
  brandName?: string;
  startDate: string;
  replacementDate?: string;
  reminderTime?: string;
  notes?: string;
}): Promise<any> {
  return apiRequest('/womens-health/contraception', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function getSexualHealthRecords(): Promise<any> {
  return apiRequest('/womens-health/sexual-health', { method: 'GET' });
}

export async function logSexualHealth(dto: {
  date: string;
  activityType?: string;
  protectionUsed?: boolean;
  notes?: string;
}): Promise<any> {
  return apiRequest('/womens-health/sexual-health', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function logStiScreening(dto: {
  testDate: string;
  testType: string;
  result?: string;
  provider?: string;
  followUpDate?: string;
  notes?: string;
}): Promise<any> {
  return apiRequest('/womens-health/sexual-health/screenings', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function getWomensHealthArticles(category?: string, query?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (query) params.append('q', query);
  const qStr = params.toString();
  return apiRequest(`/womens-health/education${qStr ? `?${qStr}` : ''}`, { method: 'GET' });
}

export async function getWomensHealthReminders(): Promise<any[]> {
  return apiRequest('/womens-health/reminders', { method: 'GET' });
}

export async function createWomensHealthReminder(dto: {
  title: string;
  category: string;
  reminderTime: string;
  frequency?: string;
  isEnabled?: boolean;
  notes?: string;
}): Promise<any> {
  return apiRequest('/womens-health/reminders', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function deleteWomensHealthReminder(id: string): Promise<any> {
  return apiRequest(`/womens-health/reminders/${id}`, { method: 'DELETE' });
}

export async function askWomensHealthAi(question: string): Promise<{
  answer: string;
  suggestedQuestions: string[];
  safetyNotice: string;
  emergencyWarning?: string;
}> {
  return apiRequest('/womens-health/assistant/ask', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}
