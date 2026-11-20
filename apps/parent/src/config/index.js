import { PORTALS } from '@education-erp/shared-config';

export const PARENT_CONFIG = {
  ...PORTALS.PARENT,
  navLinks: [
    { label: 'Family Dashboard', path: '/' },
    { label: 'My Children', path: '/children' },
    { label: 'Attendance', path: '/attendance' },
    { label: 'Academic Progress', path: '/progress' },
    { label: 'Payments', path: '/payments' }
  ]
};
