/**
 * Environment Configuration and Validation
 */

export function getEnvConfig() {
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

  return {
    supabaseUrl: metaEnv.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    supabaseAnonKey: metaEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    appEnv: metaEnv.VITE_APP_ENV || 'development',
    baseDomain: metaEnv.VITE_BASE_DOMAIN || 'example.uz',
    isProduction: metaEnv.PROD || metaEnv.VITE_APP_ENV === 'production',
    isDevelopment: metaEnv.DEV || metaEnv.VITE_APP_ENV === 'development'
  };
}

export function validateSupabaseConfig(config = getEnvConfig()) {
  const issues = [];
  if (!config.supabaseUrl || config.supabaseUrl.includes('placeholder')) {
    issues.push('VITE_SUPABASE_URL is missing or using placeholder');
  }
  if (!config.supabaseAnonKey || config.supabaseAnonKey.includes('placeholder')) {
    issues.push('VITE_SUPABASE_ANON_KEY is missing or using placeholder');
  }
  return {
    isValid: issues.length === 0,
    issues
  };
}
