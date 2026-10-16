import { notFound } from "next/navigation";
import { countryByCode } from "@/lib/data";
import { CountryDetail } from "@/components/CountryDetail";

export default async function CountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const country = countryByCode(code);
  if (!country) notFound();
  return <CountryDetail country={country} />;
}
