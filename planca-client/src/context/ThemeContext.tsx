import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { ThemeMode, isPrefersDarkMode, applyThemeMode, getThemeMode, saveThemeMode } from '@/utils/themeUtil';

interface ThemeContextType {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  toggleDarkMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getThemeMode());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    themeMode === ThemeMode.DARK || (themeMode === ThemeMode.SYSTEM && isPrefersDarkMode())
  );

  useEffect(() => {
    // Apply theme based on current state
    applyThemeMode(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    // Update dark mode state when theme mode changes
    if (themeMode === ThemeMode.DARK) {
      setIsDarkMode(true);
    } else if (themeMode === ThemeMode.LIGHT) {
      setIsDarkMode(false);
    } else {
      // System preference
      setIsDarkMode(isPrefersDarkMode());
    }
  }, [themeMode]);

  useEffect(() => {
    // Listen for system theme changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (themeMode === ThemeMode.SYSTEM) {
        setIsDarkMode(e.matches);
      }
    };
    
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleChange);
    } else {
      // For older browsers
      darkModeMediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (darkModeMediaQuery.removeEventListener) {
        darkModeMediaQuery.removeEventListener('change', handleChange);
      } else {
        // For older browsers
        darkModeMediaQuery.removeListener(handleChange);
      }
    };
  }, [themeMode]);

  const toggleDarkMode = () => {
    if (themeMode === ThemeMode.SYSTEM) {
      // If using system, switch to explicit mode opposite of current
      const newMode = isDarkMode ? ThemeMode.LIGHT : ThemeMode.DARK;
      setThemeMode(newMode);
    } else {
      // Toggle between light/dark
      setThemeMode(themeMode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK);
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemeMode(mode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, themeMode, toggleDarkMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};