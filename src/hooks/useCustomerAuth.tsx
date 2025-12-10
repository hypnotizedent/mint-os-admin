/**
 * Customer Portal Authentication Hook
 * 
 * Manages authentication state for the customer portal.
 * Uses email-based lookup with token storage in localStorage.
 */

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import {
  loginCustomer,
  verifySession,
  type PortalCustomer,
} from '../lib/portal-api';

const TOKEN_KEY = 'portal_session_token';

// Get token from localStorage
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Store token in localStorage
function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Remove token from localStorage
function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Check if user has a stored token
function hasStoredToken(): boolean {
  return !!getStoredToken();
}

interface UseCustomerAuthReturn {
  // Auth state
  customer: PortalCustomer | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  refreshCustomer: () => Promise<void>;
  clearError: () => void;
}

export function useCustomerAuth(): UseCustomerAuthReturn {
  const [customer, setCustomer] = useState<PortalCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          const result = await verifySession(token);
          if (result.success && result.customer) {
            setCustomer(result.customer);
          } else {
            // Token invalid or expired - clear it
            clearStoredToken();
          }
        } catch (err) {
          console.error('Failed to verify session:', err);
          clearStoredToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginCustomer(email);
      if (result.success && result.customer && result.token) {
        storeToken(result.token);
        setCustomer(result.customer);
        setIsLoading(false);
        return true;
      } else {
        setError(result.error || 'Login failed');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setCustomer(null);
    setError(null);
  }, []);

  const refreshCustomer = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setCustomer(null);
      return;
    }

    try {
      const result = await verifySession(token);
      if (result.success && result.customer) {
        setCustomer(result.customer);
      } else {
        clearStoredToken();
        setCustomer(null);
      }
    } catch (err) {
      console.error('Failed to refresh customer:', err);
      setError('Failed to refresh customer data');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    customer,
    isLoading,
    isLoggedIn: !!customer && hasStoredToken(),
    error,
    login,
    logout,
    refreshCustomer,
    clearError,
  };
}

/**
 * Context provider for customer auth (for global state)
 * 
 * Usage:
 * ```tsx
 * // In App.tsx or Portal.tsx
 * import { CustomerAuthProvider, useCustomerAuthContext } from '@/hooks/useCustomerAuth';
 * 
 * function App() {
 *   return (
 *     <CustomerAuthProvider>
 *       <Portal />
 *     </CustomerAuthProvider>
 *   );
 * }
 * 
 * // In any child component
 * function OrderHistory() {
 *   const { customer, isLoggedIn } = useCustomerAuthContext();
 *   // ...
 * }
 * ```
 */

const CustomerAuthContext = createContext<UseCustomerAuthReturn | null>(null);

interface CustomerAuthProviderProps {
  children: ReactNode;
}

export function CustomerAuthProvider({ children }: CustomerAuthProviderProps) {
  const auth = useCustomerAuth();

  return (
    <CustomerAuthContext.Provider value={auth}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuthContext(): UseCustomerAuthReturn {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuthContext must be used within CustomerAuthProvider');
  }
  return context;
}

export default useCustomerAuth;
