import { PORTALS } from '@education-erp/shared-config';

export const STUDENT_CONFIG = {
  ...PORTALS.STUDENT,
  navLinks: [
    { label: 'Overview', path: '/' },
    { label: 'My Schedule', path: '/schedule' },
    { label: 'Attendance', path: '/attendance' },
    { label: 'Courses', path: '/courses' },
    { label: 'Payments', path: '/payments' }
  ]
};
