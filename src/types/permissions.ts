/**
 * Permission types for frontend
 * Mirrors backend role definitions
 */

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  OPERATOR = 'operator',
  READ_ONLY = 'read_only'
}

export enum Permission {
  // Time Clock
  TIME_CLOCK_IN = 'time:clock-in',
  TIME_CLOCK_OUT = 'time:clock-out',
  TIME_EDIT_OWN = 'time:edit-own',
  TIME_EDIT_ALL = 'time:edit-all',
  TIME_APPROVE = 'time:approve',
  TIME_VIEW_OWN = 'time:view-own',
  TIME_VIEW_TEAM = 'time:view-team',
  TIME_VIEW_ALL = 'time:view-all',
  
  // Checklists
  CHECKLIST_COMPLETE = 'checklist:complete',
  CHECKLIST_APPROVE = 'checklist:approve',
  CHECKLIST_CREATE = 'checklist:create-template',
  CHECKLIST_EDIT = 'checklist:edit-template',
  
  // SOPs
  SOP_VIEW = 'sop:view',
  SOP_CREATE = 'sop:create',
  SOP_EDIT = 'sop:edit',
  SOP_DELETE = 'sop:delete',
  SOP_PUBLISH = 'sop:publish',
  
  // Metrics
  METRICS_VIEW_OWN = 'metrics:view-own',
  METRICS_VIEW_TEAM = 'metrics:view-team',
  METRICS_VIEW_ALL = 'metrics:view-all',
  METRICS_VIEW_COSTS = 'metrics:view-costs',
  METRICS_EXPORT = 'metrics:export',
  
  // Jobs
  JOB_VIEW = 'job:view',
  JOB_UPDATE_STATUS = 'job:update-status',
  JOB_ASSIGN = 'job:assign',
  
  // System
  SYSTEM_MANAGE_USERS = 'system:manage-users',
  SYSTEM_MANAGE_ROLES = 'system:manage-roles',
  SYSTEM_VIEW_AUDIT = 'system:view-audit',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId?: string;
}

/**
 * Permission matrix - must match backend
 */
export const RolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  
  [Role.MANAGER]: [
    Permission.TIME_CLOCK_IN,
    Permission.TIME_CLOCK_OUT,
    Permission.TIME_EDIT_OWN,
    Permission.TIME_EDIT_ALL,
    Permission.TIME_APPROVE,
    Permission.TIME_VIEW_ALL,
    Permission.CHECKLIST_COMPLETE,
    Permission.CHECKLIST_APPROVE,
    Permission.CHECKLIST_CREATE,
    Permission.CHECKLIST_EDIT,
    Permission.SOP_VIEW,
    Permission.SOP_CREATE,
    Permission.SOP_EDIT,
    Permission.SOP_PUBLISH,
    Permission.METRICS_VIEW_ALL,
    Permission.METRICS_VIEW_COSTS,
    Permission.METRICS_EXPORT,
    Permission.JOB_VIEW,
    Permission.JOB_UPDATE_STATUS,
    Permission.JOB_ASSIGN,
  ],
  
  [Role.SUPERVISOR]: [
    Permission.TIME_CLOCK_IN,
    Permission.TIME_CLOCK_OUT,
    Permission.TIME_EDIT_OWN,
    Permission.TIME_APPROVE,
    Permission.TIME_VIEW_TEAM,
    Permission.CHECKLIST_COMPLETE,
    Permission.CHECKLIST_APPROVE,
    Permission.SOP_VIEW,
    Permission.SOP_CREATE,
    Permission.SOP_EDIT,
    Permission.METRICS_VIEW_OWN,
    Permission.METRICS_VIEW_TEAM,
    Permission.JOB_VIEW,
    Permission.JOB_UPDATE_STATUS,
  ],
  
  [Role.OPERATOR]: [
    Permission.TIME_CLOCK_IN,
    Permission.TIME_CLOCK_OUT,
    Permission.TIME_EDIT_OWN,
    Permission.TIME_VIEW_OWN,
    Permission.CHECKLIST_COMPLETE,
    Permission.SOP_VIEW,
    Permission.METRICS_VIEW_OWN,
    Permission.JOB_VIEW,
  ],
  
  [Role.READ_ONLY]: [
    Permission.SOP_VIEW,
    Permission.JOB_VIEW,
  ]
};
