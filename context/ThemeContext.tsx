import React, { createContext, useContext, useState, useEffect } from 'react';
import { Colors } from '../theme/colors';
import { ThemeMode } from '../types/music';
import { StorageService } from '../services/storageService';

interface ThemeContextType {
  theme: ThemeMode;
  colors: typeof Colors;
  setTheme: (theme: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('obsidian');

  useEffect(() => {
    async function loadTheme() {
      const prefs = await StorageService.getPreferences();
      if (prefs.theme) {
        setThemeState(prefs.theme);
      }
    }
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    await StorageService.savePreferences({ theme: newTheme });
  };

  const getActiveColors = () => {
    if (theme === 'oled') {
      return {
        ...Colors,
        background: '#000000',
        surface: '#000000',
        surfaceDim: '#000000',
        surfaceContainerLowest: '#000000',
        surfaceContainerLow: '#080808',
        surfaceContainer: '#121214',
        surfaceContainerHigh: '#1a1a1e',
        surfaceContainerHighest: '#242429',
        glassBackground: 'rgba(18, 18, 20, 0.85)',
      };
    }
    if (theme === 'midnight') {
      return {
        ...Colors,
        background: '#070b19',
        surface: '#070b19',
        surfaceContainerLowest: '#030610',
        surfaceContainerLow: '#0b1124',
        surfaceContainer: '#0f172a',
        surfaceContainerHigh: '#1e293b',
        surfaceContainerHighest: '#334155',
        glassBackground: 'rgba(15, 23, 42, 0.85)',
      };
    }
    return Colors;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: getActiveColors(),
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
