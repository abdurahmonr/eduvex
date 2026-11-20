import { PORTALS } from '@education-erp/shared-config';

export const ADMIN_CONFIG = {
  ...PORTALS.ADMIN,
  navLinks: [
    { label: 'Dashboard', path: '/' },
    { label: 'CRM / Leads', path: '/crm' },
    { label: 'Students', path: '/students' },
    { label: 'Groups', path: '/groups' },
    { label: 'Courses', path: '/courses' },
    { label: 'Finances', path: '/finances' }
  ]
};
