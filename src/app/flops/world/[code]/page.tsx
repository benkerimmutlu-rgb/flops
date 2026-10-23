import { notFound } from "next/navigation";
import { liteByCode } from "@/lib/data";
import { CountryDetail } from "@/components/CountryDetail";

export default async function WorldCountryPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { code } = await params;
  // Any country the app knows (full facts or lite) gets a page.
  if (!liteByCode(code)) notFound();
  return <CountryDetail code={code} returnToLanguages={(await searchParams).from === "languages"} />;
}
