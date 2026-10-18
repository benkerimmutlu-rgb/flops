// Supabase включается только когда заданы переменные окружения. Пока их нет,
// приложение работает в «локальном» режиме (прогресс в localStorage) — это
// позволяет собирать и запускать его без облака и без секретов.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
