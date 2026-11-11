import React, { createContext, useContext, useEffect, useState } from 'react';
import { getStoredLanguage, LanguageCode, setStoredLanguage, translations, Translations } from './translations';
import { updateUserInfo } from '../services/users';

interface LanguageContextType {
  currentLang: LanguageCode;
  t: (key: keyof Translations) => string;
  changeLanguage: (lang: LanguageCode) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLang: 'en',
  t: (key) => translations.en[key] || String(key),
  changeLanguage: async () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');

  useEffect(() => {
    void getStoredLanguage().then((saved) => setCurrentLang(saved));
  }, []);

  const changeLanguage = async (newLang: LanguageCode) => {
    setCurrentLang(newLang);
    await setStoredLanguage(newLang);
    await updateUserInfo({ preferredLanguage: newLang }).catch(() => {});
  };

  const t = (key: keyof Translations): string => {
    const langObj = translations[currentLang] || translations.en;
    return langObj[key] || translations.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ currentLang, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
