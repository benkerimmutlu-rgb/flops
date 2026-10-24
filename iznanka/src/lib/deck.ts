import { CLUSTERS } from "@/content/clusters";
import type { SrsCard } from "@/types/content";

// Колода для интервального повторения: все термины глоссария из всех тем.
export type DeckCard = {
  key: string;
  term: string;
  definition: string;
  topicTitle: string;
};

export function buildDeck(): DeckCard[] {
  const seen = new Set<string>();
  const deck: DeckCard[] = [];
  for (const c of CLUSTERS)
    for (const t of c.topics)
      for (const g of t.glossary) {
        if (seen.has(g.term)) continue;
        seen.add(g.term);
        deck.push({
          key: g.term,
          term: g.term,
          definition: g.definition,
          topicTitle: t.title,
        });
      }
  return deck;
}

// Карточки «к повторению»: новые (без записи) или те, у кого срок наступил.
export function dueCards(
  deck: DeckCard[],
  srs: Record<string, SrsCard>,
  now = Date.now(),
): DeckCard[] {
  return deck.filter((c) => {
    const s = srs[c.key];
    return !s || s.due <= now;
  });
}
