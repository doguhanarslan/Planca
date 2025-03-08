// Theme utility functions for handling dark/light mode

// Enum for theme modes
export enum ThemeMode {
    LIGHT = 'light',
    DARK = 'dark',
    SYSTEM = 'system',
  }
  
  /**
   * Check if the device prefers dark mode
   * @returns boolean indicating if dark mode is preferred
   */
  export const isPrefersDarkMode = (): boolean => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  
  /**
   * Get the current theme mode from local storage or use system preference as default
   * @returns ThemeMode value - light, dark, or system
   */
  export const getThemeMode = (): ThemeMode => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode && Object.values(ThemeMode).includes(savedMode as ThemeMode)) {
      return savedMode as ThemeMode;
    }
    return ThemeMode.SYSTEM;
  };
  
  /**
   * Save theme mode preference to local storage
   * @param mode ThemeMode value to save
   */
  export const saveThemeMode = (mode: ThemeMode): void => {
    localStorage.setItem('themeMode', mode);
  };
  
  /**
   * Determine if dark mode should be applied based on theme mode setting
   * @returns boolean indicating if dark mode should be active
   */
  export const shouldUseDarkMode = (): boolean => {
    const themeMode = getThemeMode();
    
    if (themeMode === ThemeMode.DARK) {
      return true;
    }
    
    if (themeMode === ThemeMode.LIGHT) {
      return false;
    }
    
    // If system preference, check device setting
    return isPrefersDarkMode();
  };
  
  /**
   * Apply dark mode class to document body
   * @param isDark boolean indicating if dark mode should be applied
   */
  export const applyThemeMode = (isDark: boolean): void => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };
  
  /**
   * Initialize theme based on saved preferences or system settings
   */
  export const initializeTheme = (): void => {
    // Listen for system preference changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (getThemeMode() === ThemeMode.SYSTEM) {
        applyThemeMode(isPrefersDarkMode());
      }
    };
    
    // Apply initial theme
    applyThemeMode(shouldUseDarkMode());
    
    // Set up listener for system preference changes
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleChange);
    } else {
      // For older browsers
      darkModeMediaQuery.addListener(handleChange);
    }
  };
  
  /**
   * Toggle between light and dark mode
   */
  export const toggleDarkMode = (): void => {
    const currentMode = getThemeMode();
    
    if (currentMode === ThemeMode.SYSTEM) {
      // If currently using system preference, switch to opposite of current state
      const newMode = isPrefersDarkMode() ? ThemeMode.LIGHT : ThemeMode.DARK;
      saveThemeMode(newMode);
      applyThemeMode(newMode === ThemeMode.DARK);
    } else {
      // Toggle between light and dark
      const newMode = currentMode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK;
      saveThemeMode(newMode);
      applyThemeMode(newMode === ThemeMode.DARK);
    }
  };