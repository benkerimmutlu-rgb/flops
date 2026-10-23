import { redirect } from "next/navigation";

// Country pages moved to the "Мир" section — keep old links working.
export default async function LegacyCountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/flops/world/${code}`);
}
