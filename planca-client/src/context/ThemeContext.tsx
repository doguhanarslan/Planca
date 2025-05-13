import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  forceApplyLightMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  forceApplyLightMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always default to light theme
  const [isDark, setIsDark] = useState(false);

  // Force apply light mode - can be called anytime to ensure light mode is active
  const forceApplyLightMode = () => {
    // Remove dark class from document element
    document.documentElement.classList.remove('dark');
    
    // Force body styles
    document.body.style.backgroundColor = 'rgb(255, 255, 255)'; // white
    document.body.style.color = 'rgb(31, 41, 55)'; // text-gray-800
    
    // Set light meta tag
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', 'light');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'color-scheme';
      newMeta.content = 'light';
      document.head.appendChild(newMeta);
    }
    
    // Make sure state is set to light
    setIsDark(false);
  };

  // Apply theme changes when the isDark state changes
  useEffect(() => {
    // Apply dark mode class to document and direct styles
    document.documentElement.classList.toggle('dark', isDark);
    
    if (isDark) {
      document.body.style.backgroundColor = 'rgb(17, 24, 39)'; // bg-secondary-900
      document.body.style.color = 'rgb(243, 244, 246)'; // text-secondary-100
    } else {
      document.body.style.backgroundColor = 'rgb(255, 255, 255)'; // white
      document.body.style.color = 'rgb(31, 41, 55)'; // text-gray-800
    }
    
    // Set the color scheme meta tag
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', isDark ? 'dark' : 'light');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'color-scheme';
      newMeta.content = isDark ? 'dark' : 'light';
      document.head.appendChild(newMeta);
    }
  }, [isDark]);
  
  // Force apply light mode on initial render
  useEffect(() => {
    forceApplyLightMode();
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, forceApplyLightMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;