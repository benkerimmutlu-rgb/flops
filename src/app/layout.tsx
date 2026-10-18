import type { Metadata } from "next";
import { Nunito_Sans, Rubik } from "next/font/google";
import "./globals.css";
import { UserStateProvider } from "@/lib/store";
import { NavBar } from "@/components/NavBar";

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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${nunitoSans.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <UserStateProvider>
          <NavBar />
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
            {children}
          </main>
        </UserStateProvider>
      </body>
    </html>
  );
}
