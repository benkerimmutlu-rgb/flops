"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { CLUSTERS } from "@/content/clusters";
import type {
  ProgressData,
  SrsCard,
  SrsGrade,
  TopicStatus,
} from "@/types/content";

const LS_KEY = "iznanka_progress_v1";

function emptyProgress(): ProgressData {
  const status: Record<string, TopicStatus> = {};
  for (const c of CLUSTERS) for (const t of c.topics) status[t.id] = "new";
  return { status, testPassed: {}, srs: {} };
}

const DAY = 86_400_000;

// Упрощённый SM-2: по оценке пересчитываем ease/interval/due.
function schedule(prev: SrsCard | undefined, grade: SrsGrade): SrsCard {
  const now = Date.now();
  let ease = prev?.ease ?? 2.5;
  let interval = prev?.interval ?? 0;
  if (grade === "again") {
    ease = Math.max(1.3, ease - 0.2);
    return { ease, interval: 0, due: now + 10 * 60 * 1000 };
  }
  if (grade === "hard") {
    ease = Math.max(1.3, ease - 0.15);
    interval = interval ? Math.max(1, interval * 1.2) : 1;
  } else if (grade === "good") {
    interval = interval ? interval * ease : 1;
  } else {
    ease = ease + 0.1;
    interval = interval ? interval * ease * 1.3 : 2;
  }
  return { ease, interval, due: now + interval * DAY };
}

function loadLocal(): ProgressData {
  const base = emptyProgress();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<ProgressData>;
    return {
      status: { ...base.status, ...(parsed.status ?? {}) },
      testPassed: { ...base.testPassed, ...(parsed.testPassed ?? {}) },
      srs: { ...(parsed.srs ?? {}) },
      name: parsed.name,
    };
  } catch {
    return base;
  }
}

function saveLocal(data: ProgressData) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    /* приватный режим / недоступно — не критично */
  }
}

type Ctx = {
  ready: boolean;
  user: User | null;
  name: string | null;
  status: Record<string, TopicStatus>;
  testPassed: Record<string, boolean>;
  srs: Record<string, SrsCard>;
  openTopic: (topicId: string) => void; // «new» → «progress»
  masterTopic: (topicId: string) => void; // → «done»
  passTest: (clusterId: string) => void;
  gradeCard: (key: string, grade: SrsGrade) => void;
  setName: (name: string) => void;
  reset: () => void;
  requestCode: (email: string) => Promise<{ error?: string }>;
  verifyCode: (
    email: string,
    token: string,
    name?: string,
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<ProgressData>(emptyProgress);
  const dataRef = useRef<ProgressData>(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Запись в Supabase (upsert одной строки) + всегда в localStorage.
  const persist = useCallback(
    (next: ProgressData, currentUser: User | null) => {
      saveLocal(next);
      if (supabase && currentUser) {
        supabase
          .from("user_progress")
          .upsert({ user_id: currentUser.id, data: next })
          .then(({ error }) => {
            if (error) console.warn("Supabase upsert error:", error.message);
          });
      }
    },
    [supabase],
  );

  // Загружает облачный прогресс пользователя и мерджит с локальным.
  const loadRemote = useCallback(
    async (u: User) => {
      if (!supabase) return;
      const { data: row } = await supabase
        .from("user_progress")
        .select("data")
        .eq("user_id", u.id)
        .maybeSingle();
      const remote = (row?.data as ProgressData | undefined) ?? null;
      const local = dataRef.current;
      const merged: ProgressData = remote
        ? {
            status: { ...local.status, ...remote.status },
            testPassed: { ...local.testPassed, ...remote.testPassed },
            srs: { ...(local.srs ?? {}), ...(remote.srs ?? {}) },
            name: remote.name ?? local.name,
          }
        : local;
      dataRef.current = merged;
      setData(merged);
      // Облако пустое — переносим локальный прогресс наверх.
      if (!remote) persist(merged, u);
    },
    [supabase, persist],
  );

  // Первичная загрузка: локальный прогресс сразу, затем облако при сессии.
  useEffect(() => {
    let active = true;
    (async () => {
      const local = loadLocal();
      dataRef.current = local;
      setData(local);
      if (!supabase) {
        if (active) setReady(true);
        return;
      }
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (u) {
        setUser(u);
        await loadRemote(u);
      } else {
        setUser(null);
      }
      if (active) setReady(true);
    })();

    const sub = supabase?.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (event === "SIGNED_IN" && u) loadRemote(u);
    });

    return () => {
      active = false;
      sub?.data.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const update = useCallback(
    (fn: (prev: ProgressData) => ProgressData) => {
      setData((prev) => {
        const next = fn(prev);
        persist(next, user);
        return next;
      });
    },
    [persist, user],
  );

  const openTopic = useCallback(
    (topicId: string) =>
      update((p) =>
        p.status[topicId] === "new"
          ? { ...p, status: { ...p.status, [topicId]: "progress" } }
          : p,
      ),
    [update],
  );

  const masterTopic = useCallback(
    (topicId: string) =>
      update((p) => ({ ...p, status: { ...p.status, [topicId]: "done" } })),
    [update],
  );

  const passTest = useCallback(
    (clusterId: string) =>
      update((p) => ({
        ...p,
        testPassed: { ...p.testPassed, [clusterId]: true },
      })),
    [update],
  );

  const gradeCard = useCallback(
    (key: string, grade: SrsGrade) =>
      update((p) => ({
        ...p,
        srs: { ...(p.srs ?? {}), [key]: schedule((p.srs ?? {})[key], grade) },
      })),
    [update],
  );

  const reset = useCallback(() => update(() => emptyProgress()), [update]);

  const setName = useCallback(
    (name: string) => update((p) => ({ ...p, name: name.trim() || undefined })),
    [update],
  );

  // Запросить код входа на e-mail (письмо должно содержать {{ .Token }}).
  const requestCode = useCallback(
    async (email: string) => {
      if (!supabase) return { error: "Supabase не настроен" };
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      return error ? { error: error.message } : {};
    },
    [supabase],
  );

  // Подтвердить код и, при необходимости, сохранить имя.
  const verifyCode = useCallback(
    async (email: string, token: string, name?: string) => {
      if (!supabase) return { error: "Supabase не настроен" };
      const { data: res, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (error) return { error: error.message };
      const u = res.user;
      if (u) {
        setUser(u);
        await loadRemote(u);
        const nm = name?.trim();
        if (nm) {
          const next = { ...dataRef.current, name: nm };
          dataRef.current = next;
          setData(next);
          persist(next, u);
        }
      }
      return {};
    },
    [supabase, loadRemote, persist],
  );

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    setUser(null);
  }, [supabase]);

  const value: Ctx = {
    ready,
    user,
    name: data.name ?? null,
    status: data.status,
    testPassed: data.testPassed,
    srs: data.srs ?? {},
    openTopic,
    masterTopic,
    passTest,
    gradeCard,
    setName,
    reset,
    requestCode,
    verifyCode,
    signOut,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
