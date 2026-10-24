import { notFound } from "next/navigation";
import { getTopic, CLUSTERS } from "@/content/clusters";
import { PhoneShell } from "@/components/Logo";
import { TopicView } from "@/components/TopicView";

export const dynamicParams = false;
export function generateStaticParams() {
  return CLUSTERS.flatMap((c) => c.topics.map((t) => ({ topicId: t.id })));
}

export default function TopicPage({
  params,
}: {
  params: { topicId: string };
}) {
  const found = getTopic(params.topicId);
  if (!found) notFound();
  return (
    <PhoneShell>
      <TopicView cluster={found.cluster} topic={found.topic} />
    </PhoneShell>
  );
}
