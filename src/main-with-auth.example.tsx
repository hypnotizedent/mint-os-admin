/**
 * Example showing how to integrate authentication into the main app
 */

import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('Service Worker registered:', registration);
      },
      (error) => {
        console.error('Service Worker registration failed:', error);
      }
    );
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <AuthProvider>
      <App />
    </AuthProvider>
   </ErrorBoundary>
)
