import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

// Переход по ссылке из письма: обмениваем code на сессию и ведём дальше.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Forwarded host is accepted only for the two owned public portal hosts.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const publicOrigin = forwardedHost === "vivalearn.space" || forwardedHost === "www.vivalearn.space"
    ? `https://${forwardedHost}` : origin;
  const requestedNext = searchParams.get("next") ?? "/flops";
  const next = requestedNext === "/flops" || requestedNext.startsWith("/flops/") || requestedNext.startsWith("/flops?")
    ? requestedNext : "/flops";

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, publicOrigin));
    }
  }
  return NextResponse.redirect(`${publicOrigin}/flops/login?error=1`);
}
