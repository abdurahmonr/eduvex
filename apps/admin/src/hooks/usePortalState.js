import { useState } from 'react';
import { ROLES } from '@education-erp/shared-auth';
import { ADMIN_CONFIG } from '../config/index.js';

export function usePortalState() {
  const [role] = useState(ROLES.ADMIN);
  const [config] = useState(ADMIN_CONFIG);

  return {
    role,
    config,
    isFoundationReady: true
  };
}
