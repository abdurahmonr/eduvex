/**
 * Core User Roles & Role Hierarchy
 *
 * Allowed Roles:
 * - DIRECTOR (Full institutional & financial oversight)
 * - ADMIN (Operations, CRM, groups, billing/cashier)
 * - TEACHER (Assigned classes, grades, lesson attendance)
 * - STUDENT (Personal curriculum, attendance, payments)
 * - PARENT (Linked children academic and payment records)
 *
 * Strict Architecture Rules:
 * - NO separate Accountant role (financial operations belong to Director & Admin).
 * - NO HR role or module.
 * - NO Automation role or module.
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

export const ALL_ROLES = Object.values(ROLES);

/**
 * Validates if a role string is an official recognized system role.
 * @param {string} role
 * @returns {boolean}
 */
export function isValidRole(role) {
  return ALL_ROLES.includes(role);
}

/**
 * Returns the default portal identifier associated with a role.
 * @param {string} role
 * @returns {string|null}
 */
export function getPortalForRole(role) {
  if (role === ROLES.DIRECTOR) return 'director';
  if (role === ROLES.ADMIN) return 'admin';
  if (role === ROLES.TEACHER) return 'teacher';
  if (role === ROLES.STUDENT) return 'student';
  if (role === ROLES.PARENT) return 'parent';
  return null;
}

/**
 * Checks whether a user with userRole is authorized to access a given portal.
 * @param {string} userRole
 * @param {string} portalId
 * @returns {boolean}
 */
export function canAccessPortal(userRole, portalId) {
  if (!isValidRole(userRole)) return false;

  // Director has top oversight, but operations portals are segregated
  if (userRole === ROLES.DIRECTOR) {
    return portalId === 'director' || portalId === 'admin';
  }

  return getPortalForRole(userRole) === portalId;
}
