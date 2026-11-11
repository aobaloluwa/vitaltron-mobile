import AsyncStorage from '@react-native-async-storage/async-storage';

export type LanguageCode = 'en' | 'fr' | 'es';

export interface Translations {
  home: string;
  analytics: string;
  scan: string;
  sharing: string;
  profile: string;
  healthOverview: string;
  activeMedications: string;
  myHealthMetrics: string;
  viewAll: string;
  controlledSharing: string;
  pointOfCareSecurity: string;
  generateQrCode: string;
  copyLinkAddress: string;
  linkCopied: string;
  revokeAccess: string;
  language: string;
  selectLanguage: string;
  confirmLanguageChange: string;
  switchLanguage: string;
  cancel: string;
  logOutAccount: string;
  logOutConfirmTitle: string;
  logOutConfirmSub: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    home: 'Home',
    analytics: 'Analytics',
    scan: 'Scan',
    sharing: 'Sharing',
    profile: 'Profile',
    healthOverview: 'Health Overview',
    activeMedications: 'Active Medications',
    myHealthMetrics: 'My Health Metrics',
    viewAll: 'View all >',
    controlledSharing: 'Controlled Sharing',
    pointOfCareSecurity: 'Point-of-Care Security',
    generateQrCode: 'Generate Point-of-Care QR Code',
    copyLinkAddress: 'Copy Link Address',
    linkCopied: 'Link Copied!',
    revokeAccess: 'Revoke Access',
    language: 'Language',
    selectLanguage: 'Select App Language',
    confirmLanguageChange: 'Change App Language?',
    switchLanguage: 'Switch Language',
    cancel: 'Cancel',
    logOutAccount: 'Log Out Account',
    logOutConfirmTitle: 'Log Out Account?',
    logOutConfirmSub: 'Are you sure you want to log out of your Vitaltron health identity session?',
  },
  fr: {
    home: 'Accueil',
    analytics: 'Analytique',
    scan: 'Numériser',
    sharing: 'Partage',
    profile: 'Profil',
    healthOverview: 'Aperçu de la Santé',
    activeMedications: 'Médicaments Actifs',
    myHealthMetrics: 'Mes Mesures de Santé',
    viewAll: 'Voir tout >',
    controlledSharing: 'Partage Contrôlé',
    pointOfCareSecurity: 'Sécurité aux Points de Soins',
    generateQrCode: 'Générer le Code QR',
    copyLinkAddress: 'Copier l\'adresse du lien',
    linkCopied: 'Lien Copié!',
    revokeAccess: 'Révoquer l\'Accès',
    language: 'Langue',
    selectLanguage: 'Sélectionner la Langue de l\'Application',
    confirmLanguageChange: 'Changer la Langue?',
    switchLanguage: 'Changer de Langue',
    cancel: 'Annuler',
    logOutAccount: 'Se Déconnecter',
    logOutConfirmTitle: 'Se Déconnecter du Compte?',
    logOutConfirmSub: 'Êtes-vous sûr de vouloir vous déconnecter de votre session Vitaltron?',
  },
  es: {
    home: 'Inicio',
    analytics: 'Analítica',
    scan: 'Escanear',
    sharing: 'Compartir',
    profile: 'Perfil',
    healthOverview: 'Resumen de Salud',
    activeMedications: 'Medicamentos Activos',
    myHealthMetrics: 'Mis Métricas de Salud',
    viewAll: 'Ver todo >',
    controlledSharing: 'Uso Compartido Controlado',
    pointOfCareSecurity: 'Seguridad en Punto de Atención',
    generateQrCode: 'Generar Código QR',
    copyLinkAddress: 'Copiar Dirección del Enlace',
    linkCopied: '¡Enlace Copiado!',
    revokeAccess: 'Revocar Acceso',
    language: 'Idioma',
    selectLanguage: 'Seleccionar Idioma de la Aplicación',
    confirmLanguageChange: '¿Cambiar Idioma de la Aplicación?',
    switchLanguage: 'Cambiar Idioma',
    cancel: 'Cancelar',
    logOutAccount: 'Cerrar Sesión',
    logOutConfirmTitle: '¿Cerrar Sesión de la Cuenta?',
    logOutConfirmSub: '¿Está seguro de que desea cerrar sesión en Vitaltron?',
  },
};

const LANG_STORAGE_KEY = '@vitaltron/app-language';

export async function getStoredLanguage(): Promise<LanguageCode> {
  try {
    const saved = await AsyncStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'fr' || saved === 'es' || saved === 'en') {
      return saved;
    }
  } catch {
    // Fallback
  }
  return 'en';
}

export async function setStoredLanguage(lang: LanguageCode): Promise<void> {
  await AsyncStorage.setItem(LANG_STORAGE_KEY, lang);
}
