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
  searchPlaceholder: string;
  noPrescriptionsLogged: string;
  scanPaperPrescription: string;
  ingestedRecord: string;
  activeStatus: string;
  recentTimeline: string;
  seeAllTimeline: string;
  noTimelineRecords: string;

  // Analytics
  healthAnalytics: string;
  vitalsAndBiomarkers: string;
  bloodPressureTrend: string;
  weeklySummary: string;
  labPanelHistory: string;
  normalRange: string;
  optimalHealthScore: string;

  // Scan & Ingestion
  aiDocumentIngestion: string;
  scanDocumentOrPhoto: string;
  takePhoto: string;
  chooseFile: string;
  extractedMedicalEntities: string;
  confirmAndSaveToPassport: string;

  // Sharing
  controlledSharing: string;
  pointOfCareSecurity: string;
  liveQrPassport: string;
  scanReadyForClinicians: string;
  universalDoctorAccess: string;
  customizeSharedInfo: string;
  doctorOrHospitalName: string;
  securityPin: string;
  sharedInfoTypes: string;
  allInformationTypes: string;
  accessDuration: string;
  generateQrCode: string;
  testAndOpenShareLink: string;
  copyLinkAddress: string;
  linkCopied: string;
  activeGrants: string;
  revokeAccess: string;
  generateClinicalBrief: string;

  // Profile & Settings
  healthProfileAndVitals: string;
  verifiedHealthPassport: string;
  dependentsAndFamily: string;
  enableBiometrics: string;
  sharingPreferences: string;
  privacyPolicy: string;
  helpAndSupport: string;
  feedback: string;
  language: string;
  selectLanguage: string;
  confirmLanguageChange: string;
  switchLanguage: string;
  cancel: string;
  logOutAccount: string;
  logOutConfirmTitle: string;
  logOutConfirmSub: string;

  // Personal Info & Vitals
  personalProfile: string;
  changeProfilePicture: string;
  displayName: string;
  accountEmail: string;
  saveProfileChanges: string;
  bloodType: string;
  knownAllergies: string;
  chronicConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  dateOfBirth: string;
  gender: string;
  saveHealthProfile: string;
  exportFhirRecord: string;
  verifiedIdentity: string;

  // Dependents & Feedback
  familyHealthPortfolio: string;
  addFamilyMember: string;
  fullName: string;
  relationship: string;
  linked: string;
  manage: string;
  helpUsImprove: string;
  selectCategory: string;
  yourFeedback: string;
  submitFeedback: string;
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
    searchPlaceholder: 'Search health records, scanned docs, dependents...',
    noPrescriptionsLogged: 'No Prescriptions Logged',
    scanPaperPrescription: 'Scan a paper prescription to import',
    ingestedRecord: 'Ingested Record',
    activeStatus: 'Active',
    recentTimeline: 'Recent Medical History',
    seeAllTimeline: 'See all >',
    noTimelineRecords: 'No timeline records logged yet.',

    healthAnalytics: 'Health Analytics',
    vitalsAndBiomarkers: 'Vitals & Biomarkers',
    bloodPressureTrend: 'Blood Pressure Trend',
    weeklySummary: 'Weekly Clinical Summary',
    labPanelHistory: 'Lab Panel History',
    normalRange: 'Normal Range',
    optimalHealthScore: 'Optimal Health Score',

    aiDocumentIngestion: 'AI Document Ingestion',
    scanDocumentOrPhoto: 'Scan Prescription or Lab Report',
    takePhoto: 'Take Camera Photo',
    chooseFile: 'Choose PDF / Image File',
    extractedMedicalEntities: 'Extracted Medical Entities',
    confirmAndSaveToPassport: 'Confirm & Save to Health Passport',

    controlledSharing: 'Controlled Sharing',
    pointOfCareSecurity: 'Point-of-Care Security',
    liveQrPassport: '⚡ VITALTRON POINT-OF-CARE QR PASSPORT',
    scanReadyForClinicians: 'SCANNER READY FOR CLINICIANS',
    universalDoctorAccess: 'Universal Doctor & Hospital Access',
    customizeSharedInfo: 'Customize Shared Information',
    doctorOrHospitalName: 'Doctor / Hospital Name or Email',
    securityPin: 'Security Passcode / PIN (Optional)',
    sharedInfoTypes: 'Shared Information Types:',
    allInformationTypes: 'All Information Types',
    accessDuration: 'Access Duration:',
    generateQrCode: 'Generate Point-of-Care QR Code',
    testAndOpenShareLink: 'Test & Open Share Portal',
    copyLinkAddress: 'Copy Link Address',
    linkCopied: 'Link Copied!',
    activeGrants: 'Active Point-of-Care Access Grants',
    revokeAccess: 'Revoke Access',
    generateClinicalBrief: 'Generate Clinical Brief',

    healthProfileAndVitals: 'Health Profile & Vitals',
    verifiedHealthPassport: 'Verified Health Passport & Badges',
    dependentsAndFamily: 'Dependents & Family Portfolio',
    enableBiometrics: 'Enable Fingerprint / Face ID',
    sharingPreferences: 'Sharing Preferences',
    privacyPolicy: 'Privacy & Data Security Policy',
    helpAndSupport: 'Help & Support',
    feedback: 'Feedback',
    language: 'Language',
    selectLanguage: 'Select App Language',
    confirmLanguageChange: 'Change App Language?',
    switchLanguage: 'Switch Language',
    cancel: 'Cancel',
    logOutAccount: 'Log Out Account',
    logOutConfirmTitle: 'Log Out Account?',
    logOutConfirmSub: 'Are you sure you want to log out of your Vitaltron health identity session?',

    personalProfile: 'Personal Profile',
    changeProfilePicture: 'Change Profile Picture',
    displayName: 'Display / Full Name',
    accountEmail: 'Account Email Address (Verified)',
    saveProfileChanges: 'Save Profile Changes',
    bloodType: 'Blood Type',
    knownAllergies: 'Known Allergies',
    chronicConditions: 'Chronic Conditions',
    emergencyContactName: 'Emergency Contact Name',
    emergencyContactPhone: 'Emergency Contact Phone',
    dateOfBirth: 'Date of Birth (YYYY-MM-DD)',
    gender: 'Gender',
    saveHealthProfile: 'Save Health Profile',
    exportFhirRecord: 'Export FHIR Clinical Record',
    verifiedIdentity: 'VERIFIED IDENTITY',

    familyHealthPortfolio: 'Family Health Portfolio',
    addFamilyMember: 'Add Family Member',
    fullName: 'Full Name',
    relationship: 'Relationship',
    linked: 'Linked',
    manage: 'Manage',
    helpUsImprove: 'Help Us Improve Vitaltron',
    selectCategory: 'Select Category:',
    yourFeedback: 'Your Feedback / Comments',
    submitFeedback: 'Submit Feedback',
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
    searchPlaceholder: 'Rechercher des dossiers médicaux, documents, dépendants...',
    noPrescriptionsLogged: 'Aucune ordonnance enregistrée',
    scanPaperPrescription: 'Numériser une ordonnance pour l\'importer',
    ingestedRecord: 'Dossier Ingesté',
    activeStatus: 'Actif',
    recentTimeline: 'Historique Médical Récent',
    seeAllTimeline: 'Voir tout >',
    noTimelineRecords: 'Aucun dossier dans l\'historique.',

    healthAnalytics: 'Analytique de Santé',
    vitalsAndBiomarkers: 'Constantes et Biomarqueurs',
    bloodPressureTrend: 'Tendance de la Pression Artérielle',
    weeklySummary: 'Résumé Clinique Hebdomadaire',
    labPanelHistory: 'Historique des Analyses de Laboratoire',
    normalRange: 'Plage Normale',
    optimalHealthScore: 'Score de Santé Optimal',

    aiDocumentIngestion: 'Ingestion de Documents IA',
    scanDocumentOrPhoto: 'Numériser une Ordonnance ou Rapport',
    takePhoto: 'Prendre une Photo',
    chooseFile: 'Choisir un Fichier PDF / Image',
    extractedMedicalEntities: 'Entités Médicales Extraites',
    confirmAndSaveToPassport: 'Confirmer et Enregistrer au Passeport',

    controlledSharing: 'Partage Contrôlé',
    pointOfCareSecurity: 'Sécurité aux Points de Soins',
    liveQrPassport: '⚡ PASSEPORT QR VITALTRON POINT DE SOINS',
    scanReadyForClinicians: 'SCANNER PRÊT POUR LES CLINICIENS',
    universalDoctorAccess: 'Accès Médical Universel',
    customizeSharedInfo: 'Personnaliser les Informations Partagées',
    doctorOrHospitalName: 'Nom du Médecin ou de l\'Hôpital',
    securityPin: 'Code PIN de Sécurité (Optionnel)',
    sharedInfoTypes: 'Types d\'Informations Partagées:',
    allInformationTypes: 'Tous les Types d\'Informations',
    accessDuration: 'Durée d\'Accès:',
    generateQrCode: 'Générer le Code QR',
    testAndOpenShareLink: 'Tester et Ouvrir le Portail',
    copyLinkAddress: 'Copier l\'adresse du lien',
    linkCopied: 'Lien Copié!',
    activeGrants: 'Autorisations d\'Accès Actives',
    revokeAccess: 'Révoquer l\'Accès',
    generateClinicalBrief: 'Générer le Résumé Clinique',

    healthProfileAndVitals: 'Profil de Santé et Constantes',
    verifiedHealthPassport: 'Passeport de Santé Vérifié',
    dependentsAndFamily: 'Famille et Portefeuille Dépendants',
    enableBiometrics: 'Activer Empreinte / Face ID',
    sharingPreferences: 'Préférences de Partage',
    privacyPolicy: 'Politique de Confidentialité et Sécurité',
    helpAndSupport: 'Aide et Support',
    feedback: 'Commentaires',
    language: 'Langue',
    selectLanguage: 'Sélectionner la Langue de l\'Application',
    confirmLanguageChange: 'Changer la Langue?',
    switchLanguage: 'Changer de Langue',
    cancel: 'Annuler',
    logOutAccount: 'Se Déconnecter',
    logOutConfirmTitle: 'Se Déconnecter du Compte?',
    logOutConfirmSub: 'Êtes-vous sûr de vouloir vous déconnecter de votre session Vitaltron?',

    personalProfile: 'Profil Personnel',
    changeProfilePicture: 'Changer la Photo de Profil',
    displayName: 'Nom d\'affichage / Nom Complet',
    accountEmail: 'Adresse Email du Compte (Vérifiée)',
    saveProfileChanges: 'Enregistrer les Modifications',
    bloodType: 'Groupe Sanguin',
    knownAllergies: 'Allergies Connues',
    chronicConditions: 'Conditions Chroniques',
    emergencyContactName: 'Nom du Contact d\'Urgence',
    emergencyContactPhone: 'Téléphone du Contact d\'Urgence',
    dateOfBirth: 'Date de Naissance (AAAA-MM-JJ)',
    gender: 'Genre',
    saveHealthProfile: 'Enregistrer le Profil de Santé',
    exportFhirRecord: 'Exporter le Dossier FHIR',
    verifiedIdentity: 'IDENTITÉ VÉRIFIÉE',

    familyHealthPortfolio: 'Portefeuille de Santé Familial',
    addFamilyMember: 'Ajouter un Membre de la Famille',
    fullName: 'Nom Complet',
    relationship: 'Relation',
    linked: 'Lié',
    manage: 'Gérer',
    helpUsImprove: 'Aidez-nous à Améliorer Vitaltron',
    selectCategory: 'Sélectionner une Catégorie:',
    yourFeedback: 'Vos Commentaires',
    submitFeedback: 'Envoyer les Commentaires',
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
    searchPlaceholder: 'Buscar registros médicos, documentos, dependientes...',
    noPrescriptionsLogged: 'Sin Recetas Registradas',
    scanPaperPrescription: 'Escanear una receta para importar',
    ingestedRecord: 'Registro Ingerido',
    activeStatus: 'Activo',
    recentTimeline: 'Historial Médico Reciente',
    seeAllTimeline: 'Ver todo >',
    noTimelineRecords: 'Aún no hay registros en el historial.',

    healthAnalytics: 'Analítica de Salud',
    vitalsAndBiomarkers: 'Signos Vitales y Biomarcadores',
    bloodPressureTrend: 'Tendencia de Presión Arterial',
    weeklySummary: 'Resumen Clínico Semanal',
    labPanelHistory: 'Historial de Laboratorio',
    normalRange: 'Rango Normal',
    optimalHealthScore: 'Puntuación de Salud Óptima',

    aiDocumentIngestion: 'Ingesta de Documentos con IA',
    scanDocumentOrPhoto: 'Escanear Receta o Informe de Lab',
    takePhoto: 'Tomar Foto con Cámara',
    chooseFile: 'Elegir Archivo PDF / Imagen',
    extractedMedicalEntities: 'Entidades Médicas Extraídas',
    confirmAndSaveToPassport: 'Confirmar y Guardar en Pasaporte',

    controlledSharing: 'Uso Compartido Controlado',
    pointOfCareSecurity: 'Seguridad en Punto de Atención',
    liveQrPassport: '⚡ PASAPORTE QR VITALTRON EN PUNTO DE ATENCIÓN',
    scanReadyForClinicians: 'ESCÁNER LISTO PARA MÉDICOS',
    universalDoctorAccess: 'Acceso Médico Universal',
    customizeSharedInfo: 'Personalizar Información Compartida',
    doctorOrHospitalName: 'Nombre del Médico u Hospital',
    securityPin: 'Código PIN de Seguridad (Opcional)',
    sharedInfoTypes: 'Tipos de Información Compartida:',
    allInformationTypes: 'Todos los Tipos de Información',
    accessDuration: 'Duración del Acceso:',
    generateQrCode: 'Generar Código QR',
    testAndOpenShareLink: 'Probar y Abrir Portal',
    copyLinkAddress: 'Copiar Dirección del Enlace',
    linkCopied: '¡Enlace Copiado!',
    activeGrants: 'Permisos de Acceso Activos',
    revokeAccess: 'Revocar Acceso',
    generateClinicalBrief: 'Generar Resumen Clínico',

    healthProfileAndVitals: 'Perfil de Salud y Signos Vitales',
    verifiedHealthPassport: 'Pasaporte de Salud Verificado',
    dependentsAndFamily: 'Portafolio Familiar y Dependientes',
    enableBiometrics: 'Habilitar Huella / Face ID',
    sharingPreferences: 'Preferencias para Compartir',
    privacyPolicy: 'Política de Privacidad y Seguridad',
    helpAndSupport: 'Ayuda y Soporte',
    feedback: 'Comentarios',
    language: 'Idioma',
    selectLanguage: 'Seleccionar Idioma de la Aplicación',
    confirmLanguageChange: '¿Cambiar Idioma de la Aplicación?',
    switchLanguage: 'Cambiar Idioma',
    cancel: 'Cancelar',
    logOutAccount: 'Cerrar Sesión',
    logOutConfirmTitle: '¿Cerrar Sesión de la Cuenta?',
    logOutConfirmSub: '¿Está seguro de que desea cerrar sesión en Vitaltron?',

    personalProfile: 'Perfil Personal',
    changeProfilePicture: 'Cambiar Foto de Perfil',
    displayName: 'Nombre Completo / Mostrar',
    accountEmail: 'Correo Electrónico (Verificado)',
    saveProfileChanges: 'Guardar Cambios de Perfil',
    bloodType: 'Tipo de Sangre',
    knownAllergies: 'Alergias Conocidas',
    chronicConditions: 'Enfermedades Crónicas',
    emergencyContactName: 'Nombre de Contacto de Emergencia',
    emergencyContactPhone: 'Teléfono de Contacto de Emergencia',
    dateOfBirth: 'Fecha de Nacimiento (AAAA-MM-DD)',
    gender: 'Género',
    saveHealthProfile: 'Guardar Perfil de Salud',
    exportFhirRecord: 'Exportar Registro FHIR',
    verifiedIdentity: 'IDENTIDAD VERIFICADA',

    familyHealthPortfolio: 'Portafolio de Salud Familiar',
    addFamilyMember: 'Agregar Miembro Familiar',
    fullName: 'Nombre Completo',
    relationship: 'Parentesco',
    linked: 'Viculado',
    manage: 'Gestionar',
    helpUsImprove: 'Ayúdenos a Mejorar Vitaltron',
    selectCategory: 'Seleccionar Categoría:',
    yourFeedback: 'Sus Comentarios',
    submitFeedback: 'Enviar Comentarios',
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
