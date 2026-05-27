export const PUSH_TOPICS = [
  { id: "futbol", label: "Fútbol", sportIds: ["futbol"] },
  { id: "ufc", label: "UFC", sportIds: ["ufc"] },
  { id: "series", label: "Series y cine", sportIds: ["series", "cine"] },
  { id: "motor", label: "Motor (F1 y MotoGP)", sportIds: ["formula1", "motos"] },
] as const;

export type PushTopicId = (typeof PUSH_TOPICS)[number]["id"];

export const DEFAULT_PUSH_TOPICS: PushTopicId[] = PUSH_TOPICS.map(
  (topic) => topic.id
);

const SPORT_TO_TOPIC = new Map<string, PushTopicId>(
  PUSH_TOPICS.flatMap((topic) =>
    topic.sportIds.map((sportId) => [sportId, topic.id] as const)
  )
);

export function sportToPushTopic(
  sport?: string | null
): PushTopicId | null {
  if (!sport) return null;
  return SPORT_TO_TOPIC.get(sport) ?? null;
}

export function normalizePushTopics(raw: unknown): PushTopicId[] {
  if (!Array.isArray(raw)) return [...DEFAULT_PUSH_TOPICS];

  const allowed = new Set<PushTopicId>(DEFAULT_PUSH_TOPICS);
  const picked = raw.filter(
    (value): value is PushTopicId =>
      typeof value === "string" && allowed.has(value as PushTopicId)
  );

  return picked.length > 0 ? picked : [...DEFAULT_PUSH_TOPICS];
}

export function subscriptionMatchesEvent(
  topics: PushTopicId[],
  sport?: string | null
): boolean {
  const topic = sportToPushTopic(sport);
  return topic ? topics.includes(topic) : false;
}
