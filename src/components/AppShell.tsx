"use client";
import { usePathname } from "next/navigation";
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return <main className={`mx-auto w-full flex-1 px-4 py-6 pb-24 sm:pb-8 ${path === "/" || path === "/room" ? "max-w-5xl" : "max-w-3xl"}`}>{children}</main>;
}
