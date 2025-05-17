import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css'; // Import the custom App CSS
import '@/styles/designSystem'; // Import color and theme variables
import '@/utils/constants'; // Import application constants
import App from './App';
import ThemeProvider from './context/ThemeContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Set up light mode meta
const metaColorScheme = document.createElement('meta');
metaColorScheme.name = 'color-scheme';
metaColorScheme.content = 'light';
document.head.appendChild(metaColorScheme);

ReactDOM.createRoot(rootElement as HTMLElement).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);