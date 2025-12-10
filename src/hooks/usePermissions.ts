/**
 * usePermissions Hook
 * Convenient hook for checking permissions in components
 */

import { Permission } from '../types/permissions';
import { usePermissionsContext } from '../contexts/PermissionsContext';

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

/**
 * Hook for checking user permissions
 * 
 * @example
 * ```tsx
 * const { hasPermission } = usePermissions();
 * 
 * if (hasPermission(Permission.TIME_EDIT_ALL)) {
 *   // Show edit button
 * }
 * ```
 */
export const usePermissions = (): UsePermissionsReturn => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissionsContext();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
