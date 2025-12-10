/**
 * Authentication Context
 * Provides authentication state and actions for customer, employee, and owner login.
 * Uses JWT token auth with Strapi backend.
 * Supports three-portal architecture: Customer Portal, Employee Portal, Admin Dashboard
 * 
 * TODO: Re-enable authentication before production
 * - Remove DEV_MODE bypass
 * - Set up employee PINs
 * - Configure owner 2FA
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

// ============================================
// DEV MODE - BYPASS AUTHENTICATION
// Set to false to require real login
// ============================================
const DEV_MODE = true;

// Types
export interface Customer {
  id: number;
  documentId: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
}

export interface Employee {
  id: number;
  documentId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  assignedJobIds?: string[];
}

export interface Owner {
  id: number;
  documentId: string;
  email: string;
  name: string;
}

// User role type now includes 'owner'
export type UserRole = 'owner' | 'employee' | 'customer';
export type UserType = UserRole | null;

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: UserType;
  userRole: UserRole | null;
  customer: Customer | null;
  employee: Employee | null;
  owner: Owner | null;
  token: string | null;
  // Login methods
  loginCustomer: (payload: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signupCustomer: (payload: { name: string; email: string; password: string; phone?: string; company?: string }) => Promise<{ success: boolean; error?: string }>;
  validateEmployeePIN: (payload: { pin: string }) => Promise<{ success: boolean; error?: string }>;
  loginAsOwner: (payload: { email: string; password: string; twoFactorCode?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  // Permission helpers
  canViewFinancials: () => boolean;
  canViewAllJobs: () => boolean;
  canEditSettings: () => boolean;
  getRedirectPath: () => string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';
const TOKEN_KEY = 'printshop_auth_token';

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Dev mode owner for bypassing auth
const DEV_OWNER: Owner = {
  id: 1,
  documentId: 'dev-owner',
  email: 'dev@mintprints.com',
  name: 'Dev Owner'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // In DEV_MODE, start authenticated as owner
  const [isAuthenticated, setIsAuthenticated] = useState(DEV_MODE);
  const [isLoading, setIsLoading] = useState(!DEV_MODE);
  const [userType, setUserType] = useState<UserType>(DEV_MODE ? 'owner' : null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [owner, setOwner] = useState<Owner | null>(DEV_MODE ? DEV_OWNER : null);
  const [token, setToken] = useState<string | null>(DEV_MODE ? 'dev-token' : getStoredToken());

  // Clear all user state
  const clearUserState = () => {
    setCustomer(null);
    setEmployee(null);
    setOwner(null);
  };

  const refreshAuth = async () => {
    // In DEV_MODE, always stay authenticated
    if (DEV_MODE) {
      setIsAuthenticated(true);
      setUserType('owner');
      setOwner(DEV_OWNER);
      setToken('dev-token');
      setIsLoading(false);
      return;
    }

    const storedToken = getStoredToken();
    if (!storedToken) {
      setIsAuthenticated(false);
      setUserType(null);
      clearUserState();
      setToken(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });
      if (!res.ok) throw new Error('Verification failed');
      const data = await res.json();
      
      setIsAuthenticated(true);
      setToken(storedToken);
      clearUserState();
      
      if (data.type === 'customer') {
        setUserType('customer');
        setCustomer(data.customer || data.user);
      } else if (data.type === 'employee') {
        setUserType('employee');
        setEmployee(data.employee);
      } else if (data.type === 'owner') {
        setUserType('owner');
        setOwner(data.owner);
      }
    } catch {
      clearStoredToken();
      setIsAuthenticated(false);
      setUserType(null);
      clearUserState();
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!DEV_MODE) {
      refreshAuth();
    }
  }, []);

  const loginCustomer: AuthContextValue['loginCustomer'] = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const errorMessage = data.error?.message 
          || data.message 
          || (typeof data.error === 'string' ? data.error : null)
          || 'Login failed. Please check your credentials.';
        return { success: false, error: errorMessage };
      }
      
      setStoredToken(data.token);
      setToken(data.token);
      setIsAuthenticated(true);
      setUserType('customer');
      clearUserState();
      setCustomer(data.user || data.customer);
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  };

  const signupCustomer: AuthContextValue['signupCustomer'] = async ({ name, email, password, phone, company }) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/customer/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, company }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const errorMessage = data.error?.message 
          || data.message 
          || (typeof data.error === 'string' ? data.error : null)
          || 'Signup failed. Please try again.';
        return { success: false, error: errorMessage };
      }
      
      setStoredToken(data.token);
      setToken(data.token);
      setIsAuthenticated(true);
      setUserType('customer');
      clearUserState();
      setCustomer(data.user || data.customer);
      
      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  };

  const validateEmployeePIN: AuthContextValue['validateEmployeePIN'] = async ({ pin }) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/employee/validate-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error?.message || 'Invalid PIN' };
      }
      
      setStoredToken(data.token);
      setToken(data.token);
      setIsAuthenticated(true);
      setUserType('employee');
      clearUserState();
      setEmployee(data.employee);
      
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const loginAsOwner: AuthContextValue['loginAsOwner'] = async ({ email, password, twoFactorCode }) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/owner/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, twoFactorCode }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const errorMessage = data.error?.message 
          || data.message 
          || (typeof data.error === 'string' ? data.error : null)
          || 'Login failed. Please check your credentials.';
        return { success: false, error: errorMessage };
      }
      
      setStoredToken(data.token);
      setToken(data.token);
      setIsAuthenticated(true);
      setUserType('owner');
      clearUserState();
      setOwner(data.owner || { id: 0, documentId: '', email, name: 'Owner' });
      
      return { success: true };
    } catch (err) {
      console.error('Owner login error:', err);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  };

  const logout = async () => {
    // In DEV_MODE, just reset to dev owner
    if (DEV_MODE) {
      setIsAuthenticated(true);
      setUserType('owner');
      setOwner(DEV_OWNER);
      return;
    }

    try {
      const storedToken = getStoredToken();
      if (storedToken) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${storedToken}` },
        });
      }
    } finally {
      clearStoredToken();
      setToken(null);
      setIsAuthenticated(false);
      setUserType(null);
      clearUserState();
    }
  };

  // Permission helpers - based on user role
  const canViewFinancials = (): boolean => {
    return userType === 'owner';
  };

  const canViewAllJobs = (): boolean => {
    return userType === 'owner' || userType === 'employee';
  };

  const canEditSettings = (): boolean => {
    return userType === 'owner';
  };

  // Get the appropriate redirect path based on user role
  const getRedirectPath = (): string => {
    switch (userType) {
      case 'owner':
        return '/admin';
      case 'employee':
        return '/production';
      case 'customer':
        return '/portal';
      default:
        return '/';
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      userType,
      userRole: userType,
      customer,
      employee,
      owner,
      token,
      loginCustomer,
      signupCustomer,
      validateEmployeePIN,
      loginAsOwner,
      logout,
      refreshAuth,
      canViewFinancials,
      canViewAllJobs,
      canEditSettings,
      getRedirectPath,
    }),
    [isAuthenticated, isLoading, userType, customer, employee, owner, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
