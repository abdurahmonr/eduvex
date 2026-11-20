import { createClient } from '@supabase/supabase-js';
import { getEnvConfig } from '@education-erp/shared-config';

let supabaseClientInstance = null;

/**
 * Creates or retrieves the singleton Supabase client.
 * Configured to support cross-subdomain cookie session storage in production
 * and standard localStorage in development.
 *
 * IMPORTANT SECURITY NOTE:
 * Only public VITE_SUPABASE_ANON_KEY is accepted. Never inject SERVICE_ROLE_KEY.
 *
 * @param {object} [customConfig]
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseClient(customConfig = {}) {
  if (supabaseClientInstance && !customConfig.forceNew) {
    return supabaseClientInstance;
  }

  const env = getEnvConfig();
  const url = customConfig.supabaseUrl || env.supabaseUrl;
  const anonKey = customConfig.supabaseAnonKey || env.supabaseAnonKey;

  const authOptions = {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  };

  // In browser production on custom domains, share auth session across subdomains via root domain cookie
  if (typeof window !== 'undefined' && env.isProduction && !window.location.hostname.includes('localhost')) {
    authOptions.cookieOptions = {
      domain: `.${env.baseDomain}`,
      path: '/',
      sameSite: 'lax',
      secure: true
    };
  }

  supabaseClientInstance = createClient(url, anonKey, {
    auth: authOptions
  });

  return supabaseClientInstance;
}
