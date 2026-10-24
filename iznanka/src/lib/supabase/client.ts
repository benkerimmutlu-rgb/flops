import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Единый клиент Supabase для статического SPA (вход и синхронизация на клиенте).
// Если ключи не заданы — возвращаем null, приложение работает локально (localStorage).
let cached: SupabaseClient | null | undefined;

export function createClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    cached = null;
    return cached;
  }
  cached = createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // вход по коду: сессию выдаёт verifyOtp, не ссылка
      flowType: "pkce",
    },
  });
  return cached;
}

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
