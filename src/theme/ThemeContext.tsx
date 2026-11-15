import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, Colors } from './colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: Colors;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export const useTheme = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = '@vitaltron/theme-mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme !== null) {
          setIsDarkMode(storedTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      } finally {
        setIsReady(true);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  if (!isReady) {
    return null; // Or a loading spinner if preferred
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
