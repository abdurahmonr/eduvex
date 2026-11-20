import { useState } from 'react';
import { ROLES } from '@education-erp/shared-auth';
import { TEACHER_CONFIG } from '../config/index.js';

export function usePortalState() {
  const [role] = useState(ROLES.TEACHER);
  const [config] = useState(TEACHER_CONFIG);

  return {
    role,
    config,
    isFoundationReady: true
  };
}
