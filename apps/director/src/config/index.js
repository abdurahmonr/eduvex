import { PORTALS } from '@education-erp/shared-config';

export const DIRECTOR_CONFIG = {
  ...PORTALS.DIRECTOR,
  navLinks: [
    { label: 'Overview', path: '/' },
    { label: 'Admins', path: '/admins' },
    { label: 'Finances', path: '/finances' },
    { label: 'Reports', path: '/reports' }
  ]
};
