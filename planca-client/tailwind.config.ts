import type { Config } from 'tailwindcss';
import tailwindForms from '@tailwindcss/forms';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f1',
          100: '#ffe1e1', 
          200: '#ffc7c7',
          300: '#ff9e9e', 
          400: '#ff6b6b',
          500: '#ff3a3a',
          600: '#ff0000',
          700: '#cc0000',
          800: '#990000',
          900: '#7a0000',
          950: '#4b0000',
        },
        secondary: {
          50: '#f0f0f0',
          100: '#d6d6d6',
          200: '#bdbdbd',
          300: '#9e9e9e', 
          400: '#757575',
          500: '#595959',
          600: '#3d3d3d',
          700: '#282828',
          800: '#181818',
          900: '#0c0c0c',
          950: '#050505',
        },
        accent: {
          50: '#fff0e6',
          100: '#ffe1cc',
          200: '#ffc299',
          300: '#ffa366',
          400: '#ff8533',
          500: '#ff6600',
          600: '#cc5200',
          700: '#993d00',
          800: '#662900',
          900: '#331400',
        },
      },
      backgroundImage: {
        'hero-pattern': "url('/hero-pattern.jpg')",
        'subtle-pattern': "url('/subtle-pattern.png')",
        'gradient-primary': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(to right, #121212, #282828)',
      },
      boxShadow: {
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        'red': '0 4px 14px rgba(255, 0, 0, 0.25)',
        'red-lg': '0 8px 20px rgba(255, 0, 0, 0.3)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [
    tailwindForms
  ],
} satisfies Config;