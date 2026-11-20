import { describe, it, expect } from 'vitest';
import { ROLES, isValidRole, getPortalForRole, canAccessPortal } from '../src/roles.js';
import { PERMISSIONS, hasPermission } from '../src/permissions.js';

describe('@education-erp/shared-auth', () => {
  describe('role boundaries', () => {
    it('defines exactly the 5 allowed roles and prohibits Accountant / HR', () => {
      const definedRoles = Object.values(ROLES);
      expect(definedRoles).toEqual(['director', 'admin', 'teacher', 'student', 'parent']);
      expect(isValidRole('accountant')).toBe(false);
      expect(isValidRole('hr')).toBe(false);
      expect(isValidRole('director')).toBe(true);
    });

    it('maps each role to its designated subdomain portal', () => {
      expect(getPortalForRole(ROLES.DIRECTOR)).toBe('director');
      expect(getPortalForRole(ROLES.ADMIN)).toBe('admin');
      expect(getPortalForRole(ROLES.TEACHER)).toBe('teacher');
      expect(getPortalForRole(ROLES.STUDENT)).toBe('student');
      expect(getPortalForRole(ROLES.PARENT)).toBe('parent');
    });

    it('validates portal access boundaries', () => {
      expect(canAccessPortal(ROLES.DIRECTOR, 'director')).toBe(true);
      expect(canAccessPortal(ROLES.ADMIN, 'admin')).toBe(true);
      expect(canAccessPortal(ROLES.STUDENT, 'admin')).toBe(false);
      expect(canAccessPortal(ROLES.PARENT, 'teacher')).toBe(false);
    });
  });

  describe('permissions enforcement', () => {
    it('grants financial reports access to Director and Admin, but not Teacher or Student', () => {
      expect(hasPermission(ROLES.DIRECTOR, PERMISSIONS.VIEW_FINANCIAL_REPORTS)).toBe(true);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.VIEW_FINANCIAL_REPORTS)).toBe(true);
      expect(hasPermission(ROLES.TEACHER, PERMISSIONS.VIEW_FINANCIAL_REPORTS)).toBe(false);
      expect(hasPermission(ROLES.STUDENT, PERMISSIONS.VIEW_FINANCIAL_REPORTS)).toBe(false);
    });

    it('grants attendance recording to Teacher, but not Student or Parent', () => {
      expect(hasPermission(ROLES.TEACHER, PERMISSIONS.RECORD_ATTENDANCE)).toBe(true);
      expect(hasPermission(ROLES.STUDENT, PERMISSIONS.RECORD_ATTENDANCE)).toBe(false);
      expect(hasPermission(ROLES.PARENT, PERMISSIONS.RECORD_ATTENDANCE)).toBe(false);
    });
  });
});
