import { notFound } from "next/navigation";
import { liteByCode } from "@/lib/data";
import { CountryDetail } from "@/components/CountryDetail";

export default async function WorldCountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  // Any country the app knows (full facts or lite) gets a page.
  if (!liteByCode(code)) notFound();
  return <CountryDetail code={code} />;
}
