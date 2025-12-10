/**
 * Authentication API Client
 * Communicates with services/api/src/auth endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export interface CustomerSignupData {
  email: string;
  password: string;
  name: string;
  company?: string;
  phone?: string;
}

export interface CustomerLoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  customer?: {
    id: string;
    documentId: string;
    email: string;
    name: string;
    company?: string;
    phone?: string;
  };
  error?: string;
}

export interface EmployeePINValidation {
  pin: string;
  employeeId?: string;
}

export interface EmployeeAuthResponse {
  success: boolean;
  token?: string;
  employee?: {
    id: string;
    documentId: string;
    name: string;
    pin: string;
    role: string;
  };
  error?: string;
}

/**
 * Customer signup - creates new account with bcrypt password hashing
 */
export async function signupCustomer(data: CustomerSignupData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/customer/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // Include cookies for httpOnly token storage
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Signup failed' };
    }

    const result: AuthResponse = await response.json();
    
    // Store token in localStorage as backup (httpOnly cookie is primary)
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_type', 'customer');
      localStorage.setItem('customer_data', JSON.stringify(result.customer));
    }

    return result;
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error during signup',
    };
  }
}

/**
 * Customer login - validates credentials and returns JWT
 */
export async function loginCustomer(data: CustomerLoginData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Login failed' };
    }

    const result: AuthResponse = await response.json();
    
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_type', 'customer');
      localStorage.setItem('customer_data', JSON.stringify(result.customer));
    }

    return result;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error during login',
    };
  }
}

/**
 * Employee PIN validation - for production dashboard
 */
export async function validateEmployeePIN(data: EmployeePINValidation): Promise<EmployeeAuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/employee/validate-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'PIN validation failed' };
    }

    const result: EmployeeAuthResponse = await response.json();
    
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_type', 'employee');
      localStorage.setItem('employee_data', JSON.stringify(result.employee));
    }

    return result;
  } catch (error) {
    console.error('PIN validation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error during PIN validation',
    };
  }
}

/**
 * Logout - clear tokens and local storage
 */
export function logout(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_type');
  localStorage.removeItem('customer_data');
  localStorage.removeItem('employee_data');
  
  // Call backend to clear httpOnly cookie
  fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(console.error);
}

/**
 * Get current authentication token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Get current user type
 */
export function getUserType(): 'customer' | 'employee' | null {
  const type = localStorage.getItem('user_type');
  return type === 'customer' || type === 'employee' ? type : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Get current customer data
 */
export function getCustomerData(): AuthResponse['customer'] | null {
  const data = localStorage.getItem('customer_data');
  return data ? JSON.parse(data) : null;
}

/**
 * Get current employee data
 */
export function getEmployeeData(): EmployeeAuthResponse['employee'] | null {
  const data = localStorage.getItem('employee_data');
  return data ? JSON.parse(data) : null;
}

/**
 * Verify token validity (calls backend)
 */
export async function verifyToken(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      // Token invalid, clear local storage
      logout();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}
