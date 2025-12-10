import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Node 18 compatible __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Mint OS Admin Dashboard - Node 18 Compatible Vite Config
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3333,
    host: '0.0.0.0',
    allowedHosts: [
      'docker-host',
      '192.168.12.191',
      '100.92.156.118',
      'localhost',
      '.local'
    ],
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:11337',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3333,
    host: '0.0.0.0',
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    }
  }
});
