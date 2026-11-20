import { getSupabaseClient } from '@education-erp/shared-auth';

export const api = {
  getClient: () => getSupabaseClient()
};
