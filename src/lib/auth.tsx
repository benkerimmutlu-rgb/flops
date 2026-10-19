"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/config";

export interface ChildProfile {
  name: string;
  countryCode: string;
}

type Status =
  | "loading" // ещё выясняем сессию
  | "disabled" // облако не настроено → локальный режим
  | "anon" // не вошёл
  | "no_profile" // вошёл, но профиля ребёнка ещё нет (онбординг)
  | "ready"; // вошёл, профиль есть

interface AuthValue {
  status: Status;
  configured: boolean;
  user: User | null;
  profile: ChildProfile | null;
  /** Отправить на email код для входа (6 цифр). */
  sendMagicLink: (email: string) => Promise<{ error: string | null }>;
  /** Подтвердить вход кодом из письма (работает и в установленном PWA). */
  verifyCode: (
    email: string,
    token: string
  ) => Promise<{ error: string | null }>;
  /** Создать профиль ребёнка (имя + страна) после входа. */
  createProfile: (
    name: string,
    countryCode: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>(
    isSupabaseConfigured ? "loading" : "disabled"
  );
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ChildProfile | null>(null);

  const loadProfile = useCallback(async (u: User | null) => {
    const supabase = getBrowserSupabase();
    if (!supabase || !u) {
      setProfile(null);
      setStatus(u ? "no_profile" : "anon");
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("name, country_code")
      .eq("id", u.id)
      .maybeSingle();
    if (data) {
      setProfile({ name: data.name, countryCode: data.country_code });
      setStatus("ready");
    } else {
      setProfile(null);
      setStatus("no_profile");
    }
  }, []);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return; // локальный режим

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const u = data.session?.user ?? null;
      setUser(u);
      loadProfile(u);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      loadProfile(u);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      configured: isSupabaseConfigured,
      user,
      profile,
      async sendMagicLink(email: string) {
        const supabase = getBrowserSupabase();
        if (!supabase) return { error: "Облако не настроено" };
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            // Ссылку оставляем как запасной вариант, но основной путь — код.
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        return { error: error?.message ?? null };
      },
      async verifyCode(email: string, token: string) {
        const supabase = getBrowserSupabase();
        if (!supabase) return { error: "Облако не настроено" };
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: token.trim(),
          type: "email",
        });
        return { error: error?.message ?? null };
      },
      async createProfile(name: string, countryCode: string) {
        const supabase = getBrowserSupabase();
        if (!supabase || !user) return { error: "Нужно войти" };
        const { error } = await supabase
          .from("profiles")
          .insert({ id: user.id, name, country_code: countryCode });
        if (error) return { error: error.message };
        setProfile({ name, countryCode });
        setStatus("ready");
        return { error: null };
      },
      async signOut() {
        const supabase = getBrowserSupabase();
        if (supabase) await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setStatus("anon");
      },
    }),
    [status, user, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
