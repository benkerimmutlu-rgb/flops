import { notFound } from "next/navigation";
import { getTopic, CLUSTERS } from "@/content/clusters";
import { PhoneShell } from "@/components/Logo";
import { SimView } from "@/components/SimView";

export const dynamicParams = false;
export function generateStaticParams() {
  return CLUSTERS.flatMap((c) =>
    c.topics.filter((t) => t.simulation).map((t) => ({ topicId: t.id })),
  );
}

export default function SimPage({
  params,
}: {
  params: { topicId: string };
}) {
  const found = getTopic(params.topicId);
  if (!found || !found.topic.simulation) notFound();
  return (
    <PhoneShell>
      <SimView cluster={found.cluster} topic={found.topic} />
    </PhoneShell>
  );
}
