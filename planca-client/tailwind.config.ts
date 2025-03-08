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
        // Standardized semantic colors for consistent usage
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      backgroundImage: {
        'hero-pattern': "url('/hero-pattern.jpg')",
        'subtle-pattern': "url('/subtle-pattern.png')",
        'red-pattern': "url('/red-pattern.png')",
        'gradient-primary': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))',
        'gradient-cta': 'linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))',
        'gradient-shine': 'linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.1) 50%, transparent 75%)',
        'noise': "url('/noise.png')"
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        'red': '0 4px 14px rgba(255, 0, 0, 0.25)',
        'red-lg': '0 8px 20px rgba(255, 0, 0, 0.3)',
        'primary': '0 4px 14px rgba(255, 0, 0, 0.25)',
        'primary-lg': '0 8px 20px rgba(255, 0, 0, 0.3)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-lg': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.12)',
        'glow': '0 0 15px 2px rgba(255, 0, 0, 0.3)',
        'glow-lg': '0 0 30px 5px rgba(255, 0, 0, 0.4)',
        'none': 'none',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in-up': 'slideInUp 0.5s ease-in-out',
        'slide-in-down': 'slideInDown 0.5s ease-in-out',
        'slide-in-left': 'slideInLeft 0.5s ease-in-out',
        'slide-in-right': 'slideInRight 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.4s ease-in-out',
        'shine': 'shine 2.5s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
      // Standardized spacing
      spacing: {
        '0': '0',
        px: '1px',
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },
      blur: {
        xs: '2px',
      },
      backdropBlur: {
        xs: '2px',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'var(--tw-prose-body)',
            a: {
              color: 'var(--tw-prose-links)',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            h1: {
              fontWeight: '700',
              fontSize: '2.25rem',
              marginTop: '2em',
              marginBottom: '1em',
              lineHeight: '1.2',
            },
            h2: {
              fontWeight: '600',
              fontSize: '1.5rem',
              marginTop: '1.75em',
              marginBottom: '0.75em',
              lineHeight: '1.3',
            },
            h3: {
              fontWeight: '600',
              fontSize: '1.25rem',
              marginTop: '1.5em',
              marginBottom: '0.5em',
              lineHeight: '1.3',
            },
          },
        },
      },
    },
  },
  darkMode: 'class', // Enable class-based dark mode
  plugins: [
    tailwindForms({
      strategy: 'class',
    })
  ],
} satisfies Config;