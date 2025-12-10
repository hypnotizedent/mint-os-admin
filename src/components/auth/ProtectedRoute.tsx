/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Supports role-based access control for three-portal architecture
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Allowed user types - if specified, only these types can access
   */
  allowedUserTypes?: UserRole[];
  /**
   * Fallback component to show when not authenticated
   */
  fallback?: ReactNode;
  /**
   * Custom redirect path when not authorized (overrides default role-based redirect)
   */
  redirectTo?: string;
}

/**
 * Wraps components that require authentication
 * Shows loading state while checking auth, redirects to login if not authenticated
 * Supports role-based access control with appropriate redirects
 * 
 * @example
 * ```tsx
 * // Protect customer portal
 * <ProtectedRoute allowedUserTypes={['customer']}>
 *   <CustomerDashboard />
 * </ProtectedRoute>
 * 
 * // Protect employee production dashboard
 * <ProtectedRoute allowedUserTypes={['employee', 'owner']}>
 *   <ProductionDashboard />
 * </ProtectedRoute>
 * 
 * // Protect admin-only route
 * <ProtectedRoute allowedUserTypes={['owner']}>
 *   <AdminSettings />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({ 
  children, 
  allowedUserTypes,
  fallback,
  redirectTo 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, userType, getRedirectPath } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to appropriate login page based on route
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Determine appropriate login page based on current path
    let loginPath = '/login/customer';
    if (location.pathname.startsWith('/admin')) {
      loginPath = '/login/admin';
    } else if (location.pathname.startsWith('/production')) {
      loginPath = '/login/employee';
    } else if (location.pathname.startsWith('/portal')) {
      loginPath = '/login/customer';
    }
    
    return <Navigate to={redirectTo || loginPath} state={{ from: location }} replace />;
  }

  // Check if user type is allowed
  if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
    // Owner can access all areas (for testing/troubleshooting)
    if (userType === 'owner') {
      return <>{children}</>;
    }
    
    // Redirect to user's appropriate portal
    const redirectPath = redirectTo || getRedirectPath();
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
}
