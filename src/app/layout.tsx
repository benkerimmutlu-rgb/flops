import type { Metadata, Viewport } from "next";
import { Nunito_Sans, Rubik } from "next/font/google";
import "./globals.css";
import "./clay.css";
import { AppShell } from "@/components/AppShell";
import { AuthProvider } from "@/lib/auth";
import { UserStateProvider } from "@/lib/store";
import { NavBar } from "@/components/NavBar";
import { GiftBanner } from "@/components/GiftBanner";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700", "800"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FLOPS — учи флаги играючи",
  description:
    "Викторина и энциклопедия эмпатии: флаги, столицы, языки, еда и люди разных стран.",
  applicationName: "FLOPS",
  manifest: "/flops/manifest.webmanifest",
  // Устанавливается на домашний экран как приложение (PWA).
  appleWebApp: {
    capable: true,
    title: "FLOPS",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/flops-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/flops-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/flops-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/flops-apple-180.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#d4ddc8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${nunitoSans.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <UserStateProvider>
            <NavBar />
            <AppShell>{children}</AppShell>
            <GiftBanner />
          </UserStateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
