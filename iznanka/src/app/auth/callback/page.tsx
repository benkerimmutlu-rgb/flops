"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Клиентский приём ссылки входа (magic-link, PKCE): обмениваем код на сессию.
export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      if (!supabase) {
        router.replace("/");
        return;
      }
      try {
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) await supabase.auth.exchangeCodeForSession(code);
      } catch {
        setError("Не удалось войти по ссылке. Попробуйте ещё раз.");
        return;
      }
      router.replace("/profile");
    };
    run();
  }, [router]);

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100dvh",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <p className="body soft">{error ?? "Входим…"}</p>
    </div>
  );
}
