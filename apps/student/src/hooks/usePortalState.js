import { useState } from 'react';
import { ROLES } from '@education-erp/shared-auth';
import { STUDENT_CONFIG } from '../config/index.js';

export function usePortalState() {
  const [role] = useState(ROLES.STUDENT);
  const [config] = useState(STUDENT_CONFIG);

  return {
    role,
    config,
    isFoundationReady: true
  };
}
