import { getSupabaseClient } from '@education-erp/shared-auth';

/**
 * Director Portal API Service Layer Scaffolding
 * All backend operations are routed via shared Supabase client.
 */
export const api = {
  getClient: () => getSupabaseClient()
};
