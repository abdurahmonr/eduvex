import { ROLES } from './roles.js';

/**
 * Permissions Matrix
 * Defines backend & frontend capability tokens mapped to roles.
 */
export const PERMISSIONS = Object.freeze({
  // Institutional & Administration
  MANAGE_SETTINGS: 'manage:settings',
  MANAGE_BRANCHES: 'manage:branches',
  MANAGE_ADMINS: 'manage:admins',
  VIEW_AUDIT_LOGS: 'view:audit_logs',

  // Finance & Accounting (Director & Admin only)
  VIEW_FINANCIAL_REPORTS: 'view:financial_reports',
  RECORD_PAYMENT: 'record:payment',
  ISSUE_REFUND: 'issue:refund',
  SET_TARIFFS: 'set:tariffs',

  // Academics & CRM
  MANAGE_COURSES: 'manage:courses',
  MANAGE_GROUPS: 'manage:groups',
  MANAGE_STUDENTS: 'manage:students',
  MANAGE_LEADS: 'manage:leads',
  ASSIGN_TEACHERS: 'assign:teachers',

  // Teaching
  VIEW_ASSIGNED_GROUPS: 'view:assigned_groups',
  RECORD_ATTENDANCE: 'record:attendance',
  SUBMIT_GRADES: 'submit:grades',
  VIEW_SCHEDULE: 'view:schedule',

  // Learner / Parent
  VIEW_OWN_PROFILE: 'view:own_profile',
  VIEW_OWN_ATTENDANCE: 'view:own_attendance',
  VIEW_OWN_GRADES: 'view:own_grades',
  VIEW_OWN_PAYMENTS: 'view:own_payments',
  VIEW_CHILDREN: 'view:children'
});

const ROLE_PERMISSIONS = {
  [ROLES.DIRECTOR]: [
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_BRANCHES,
    PERMISSIONS.MANAGE_ADMINS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.SET_TARIFFS,
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.MANAGE_GROUPS,
    PERMISSIONS.VIEW_SCHEDULE
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.MANAGE_GROUPS,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.ASSIGN_TEACHERS,
    PERMISSIONS.RECORD_PAYMENT,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_SCHEDULE
  ],
  [ROLES.TEACHER]: [
    PERMISSIONS.VIEW_ASSIGNED_GROUPS,
    PERMISSIONS.RECORD_ATTENDANCE,
    PERMISSIONS.SUBMIT_GRADES,
    PERMISSIONS.VIEW_SCHEDULE
  ],
  [ROLES.STUDENT]: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.VIEW_OWN_ATTENDANCE,
    PERMISSIONS.VIEW_OWN_GRADES,
    PERMISSIONS.VIEW_OWN_PAYMENTS,
    PERMISSIONS.VIEW_SCHEDULE
  ],
  [ROLES.PARENT]: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.VIEW_CHILDREN,
    PERMISSIONS.VIEW_OWN_ATTENDANCE,
    PERMISSIONS.VIEW_OWN_GRADES,
    PERMISSIONS.VIEW_OWN_PAYMENTS
  ]
};

/**
 * Verifies whether a role holds a specific permission token.
 * @param {string} role
 * @param {string} permission
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
