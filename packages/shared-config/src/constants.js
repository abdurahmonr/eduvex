/**
 * Global Constants & Subdomain Configuration
 * Education Center ERP + CRM
 */

export const PORTALS = {
  DIRECTOR: {
    id: 'director',
    name: 'Director Portal',
    subdomain: 'director',
    defaultPort: 3001,
    role: 'director',
    themeColor: '#4f46e5', // Indigo
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  ADMIN: {
    id: 'admin',
    name: 'Admin Portal',
    subdomain: 'admin',
    defaultPort: 3002,
    role: 'admin',
    themeColor: '#0284c7', // Sky
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200'
  },
  TEACHER: {
    id: 'teacher',
    name: 'Teacher Portal',
    subdomain: 'teacher',
    defaultPort: 3003,
    role: 'teacher',
    themeColor: '#059669', // Emerald
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  STUDENT: {
    id: 'student',
    name: 'Student Portal',
    subdomain: 'student',
    defaultPort: 3004,
    role: 'student',
    themeColor: '#d97706', // Amber
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  PARENT: {
    id: 'parent',
    name: 'Parent Portal',
    subdomain: 'parent',
    defaultPort: 3005,
    role: 'parent',
    themeColor: '#7c3aed', // Purple
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  }
};

export const BASE_DOMAIN = 'example.uz';

/**
 * Returns the resolved URL for a given portal based on environment.
 * @param {'director'|'admin'|'teacher'|'student'|'parent'} portalId
 * @param {boolean} isDev
 * @returns {string}
 */
export function getPortalUrl(portalId, isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  const portal = Object.values(PORTALS).find(p => p.id === portalId);
  if (!portal) throw new Error(`Unknown portal: ${portalId}`);

  if (isDev) {
    return `http://localhost:${portal.defaultPort}`;
  }
  return `https://${portal.subdomain}.${BASE_DOMAIN}`;
}
