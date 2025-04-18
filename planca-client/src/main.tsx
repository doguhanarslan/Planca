import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css'; // Import the custom App CSS
import '@/styles/designSystem'; // Renk ve tema değişkenlerini import edin
import '@/utils/constants'; // Uygulama sabitlerini import edin
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);