import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import App from './App.tsx'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

const queryClient = new QueryClient()

// Re-enable transitions after styles are loaded
window.addEventListener('load', () => {
  document.body.classList.remove('loading');
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
)
