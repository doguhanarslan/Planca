/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // Add more environment variables as needed
}

// Global window interface for runtime environment config
declare global {
  interface Window {
    ENV?: {
      VITE_API_URL?: string;
      REACT_APP_API_URL?: string;
    };
  }
}

// Module declaration to avoid type errors
declare module '*.json' {
  const value: any;
  export default value;
}
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }