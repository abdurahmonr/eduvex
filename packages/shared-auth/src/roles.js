/**
 * Core User Roles & Role Hierarchy
 */

export const ROLES = Object.freeze({
  DIRECTOR: 'director',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent'
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.DIRECTOR]: 'Director',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.STUDENT]: 'Student',
  [ROLES.PARENT]: 'Parent'
});

export const ROLE_PORTAL_MAP = Object.freeze({
  [ROLES.DIRECTOR]: 'director',
  [ROLES.ADMIN]: 'admin',
  [ROLES.TEACHER]: 'teacher',
  [ROLES.STUDENT]: 'student',
  [ROLES.PARENT]: 'parent'
});

export const ALL_ROLES = Object.values(ROLES);

export function isValidRole(role) {
  return ALL_ROLES.includes(role);
}

export function getPortalForRole(role) {
  return ROLE_PORTAL_MAP[role] || null;
}

export function canAccessPortal(userRole, portalId) {
  if (!isValidRole(userRole)) return false;

  // Director has top oversight, but operations portals are segregated
  if (userRole === ROLES.DIRECTOR) {
    return portalId === 'director' || portalId === 'admin';
  }

  return getPortalForRole(userRole) === portalId;
}
