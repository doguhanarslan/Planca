import { FC, ReactNode } from 'react';
import { createContext, useContext, useEffect } from 'react';

type ThemeContextType = {
  applyTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  applyTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Apply the theme (light only now)
  const applyTheme = () => {
    // Remove dark class from document element
    document.documentElement.classList.remove('dark');
    
    // Force body styles
    
 
    
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