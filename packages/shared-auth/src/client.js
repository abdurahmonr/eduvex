import { createClient } from '@supabase/supabase-js';
import { getEnvConfig } from '@education-erp/shared-config';

let supabaseClientInstance = null;

/**
 * Creates a browser cookie storage adapter for Supabase Auth in production
 * to enable cross-subdomain SSO scoped to .example.uz.
 */
function createCrossSubdomainCookieStorage(domain) {
  if (typeof document === 'undefined') return undefined;

  return {
    getItem: (key) => {
      const match = document.cookie.match(new RegExp('(^|;\\s*)(' + key + ')=([^;]*)'));
      return match ? decodeURIComponent(match[3]) : null;
    },
    setItem: (key, value) => {
      const maxAge = 60 * 60 * 24 * 365; // 1 year
      const cookieString = `${key}=${encodeURIComponent(value)}; Domain=.${domain}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
      document.cookie = cookieString;
    },
    removeItem: (key) => {
      document.cookie = `${key}=; Domain=.${domain}; Path=/; Max-Age=0; SameSite=Lax; Secure`;
    }
  };
}

/**
 * Creates or retrieves the singleton Supabase client.
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

  // Cross-subdomain cookie storage in production
  if (typeof window !== 'undefined' && env.isProduction && !window.location.hostname.includes('localhost')) {
    authOptions.storage = createCrossSubdomainCookieStorage(env.baseDomain);
  }

  supabaseClientInstance = createClient(url, anonKey, {
    auth: authOptions
  });

  return supabaseClientInstance;
}
