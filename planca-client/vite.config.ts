import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true
  },
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7100',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})