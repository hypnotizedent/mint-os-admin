/**
 * Permissions Context
 * Provides permission checking functionality throughout the app
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { Permission, RolePermissions, User } from '../types/permissions';

interface PermissionsContextType {
  user: User | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
  user: User | null;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children, user }) => {
  const hasPermission = (permission: Permission): boolean => {
    if (!user?.role) return false;
    const rolePermissions = RolePermissions[user.role] || [];
    return rolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  const value: PermissionsContextType = {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissionsContext = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissionsContext must be used within a PermissionsProvider');
  }
  return context;
};
