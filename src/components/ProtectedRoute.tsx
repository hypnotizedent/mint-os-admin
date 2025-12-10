/**
 * Protected Component
 * Conditionally renders children based on user permissions
 */

import React, { ReactNode } from 'react';
import { Permission } from '../types/permissions';
import { usePermissions } from '../hooks/usePermissions';

interface ProtectedProps {
  /**
   * Single permission required to view the content
   */
  permission?: Permission;
  
  /**
   * User must have at least one of these permissions
   */
  anyPermissions?: Permission[];
  
  /**
   * User must have all of these permissions
   */
  allPermissions?: Permission[];
  
  /**
   * Content to show when user doesn't have permission
   */
  fallback?: ReactNode;
  
  /**
   * Content to show when user has permission
   */
  children: ReactNode;
}

/**
 * Renders children only if user has required permissions
 * 
 * @example
 * ```tsx
 * // Single permission check
 * <Protected permission={Permission.TIME_EDIT_ALL}>
 *   <EditTimeButton />
 * </Protected>
 * 
 * // Any permission check
 * <Protected 
 *   anyPermissions={[Permission.METRICS_VIEW_TEAM, Permission.METRICS_VIEW_ALL]}
 *   fallback={<p>No access to team metrics</p>}
 * >
 *   <TeamMetrics />
 * </Protected>
 * 
 * // All permissions check
 * <Protected allPermissions={[Permission.SOP_EDIT, Permission.SOP_PUBLISH]}>
 *   <PublishButton />
 * </Protected>
 * ```
 */
export const Protected: React.FC<ProtectedProps> = ({
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
  children
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  let authorized = true;
  
  // Check single permission
  if (permission && !hasPermission(permission)) {
    authorized = false;
  }
  
  // Check any permissions
  if (anyPermissions && !hasAnyPermission(anyPermissions)) {
    authorized = false;
  }
  
  // Check all permissions
  if (allPermissions && !hasAllPermissions(allPermissions)) {
    authorized = false;
  }
  
  return <>{authorized ? children : fallback}</>;
};
