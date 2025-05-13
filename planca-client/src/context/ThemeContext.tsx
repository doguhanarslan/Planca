import React, { createContext, useContext, useEffect } from 'react';

type ThemeContextType = {
  applyTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  applyTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Apply the theme (light only now)
  const applyTheme = () => {
    // Remove dark class from document element
    document.documentElement.classList.remove('dark');
    
    // Force body styles
    document.body.style.backgroundColor = 'rgb(255, 255, 255)'; // white
    document.body.style.color = 'rgb(0, 0, 0)'; // black text
    
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
  };

  // Apply light mode on initial render
  useEffect(() => {
    applyTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;