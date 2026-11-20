import { useState } from 'react';
import { ROLES } from '@education-erp/shared-auth';
import { PARENT_CONFIG } from '../config/index.js';

export function usePortalState() {
  const [role] = useState(ROLES.PARENT);
  const [config] = useState(PARENT_CONFIG);

  return {
    role,
    config,
    isFoundationReady: true
  };
}
