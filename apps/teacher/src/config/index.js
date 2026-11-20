import { PORTALS } from '@education-erp/shared-config';

export const TEACHER_CONFIG = {
  ...PORTALS.TEACHER,
  navLinks: [
    { label: 'My Schedule', path: '/' },
    { label: 'My Groups', path: '/groups' },
    { label: 'Attendance', path: '/attendance' },
    { label: 'Grades', path: '/grades' }
  ]
};
