import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeName, themes } from '@/styles/theme';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
}

const THEME_STORAGE_KEY = '@fitness_app_theme';
const DEFAULT_THEME_NAME: ThemeName = 'dracula';

const defaultThemeContext: ThemeContextType = {
  theme: themes[DEFAULT_THEME_NAME],
  themeName: DEFAULT_THEME_NAME,
  setTheme: () => {
    // no-op fallback when provider is not mounted
  },
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME_NAME);
  const [theme, setThemeState] = useState<Theme>(themes[DEFAULT_THEME_NAME]);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'dracula' || savedTheme === 'light')) {
        setThemeName(savedTheme);
        setThemeState(themes[savedTheme]);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newThemeName: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeName);
      setThemeName(newThemeName);
      setThemeState(themes[newThemeName]);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};
