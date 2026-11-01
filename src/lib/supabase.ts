import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://pugaodnefgvptjftizhx.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1Z2FvZG5lZmd2cHRqZnRpemh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0OTY3MzIsImV4cCI6MjEwOTA3MjczMn0.JwmwbALbSmU356-bKeVQdl5Wq_ZvuOX1w6jSOOhgv1k';

// Read from env, localStorage override, or default project credentials
export const getSupabaseConfig = () => {
  const customConfig = localStorage.getItem('glim_supabase_custom_keys');
  if (customConfig) {
    try {
      const parsed = JSON.parse(customConfig);
      if (parsed.url && parsed.anonKey && parsed.anonKey.length > 20) {
        return { url: parsed.url, anonKey: parsed.anonKey, isCustom: true };
      }
    } catch {
      // ignore
    }
  }

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_URL;
  const envAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

  return {
    url: envUrl,
    anonKey: envAnonKey,
    isCustom: false,
  };
};

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabase = (): SupabaseClient | null => {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || url === 'YOUR_SUPABASE_URL') {
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 20);
};
