import { useState } from 'react';
import { ROLES } from '@education-erp/shared-auth';
import { DIRECTOR_CONFIG } from '../config/index.js';

export function usePortalState() {
  const [role] = useState(ROLES.DIRECTOR);
  const [config] = useState(DIRECTOR_CONFIG);

  return {
    role,
    config,
    isFoundationReady: true
  };
}
