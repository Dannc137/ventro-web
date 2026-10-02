import type { MentionTarget } from "./types";

/** Mentions are stored as @[Display Name](uuid) — same as the backend. */
const MENTION = /@\[([^\]]{1,120})\]\(([0-9a-fA-F-]{36})\)/g;

export type Segment =
  | { type: "text"; value: string }
  | { type: "mention"; name: string; userId: string };

/** Splits a body into plain text and mentions, for rendering. */
export function parseBody(body: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(MENTION)) {
    const start = match.index ?? 0;

    if (start > lastIndex) {
      segments.push({ type: "text", value: body.slice(lastIndex, start) });
    }

    segments.push({ type: "mention", name: match[1], userId: match[2] });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < body.length) {
    segments.push({ type: "text", value: body.slice(lastIndex) });
  }

  return segments;
}

/** What the person typing sees — @Daniel rather than the markup. */
export function toDisplayText(body: string): string {
  return body.replace(MENTION, "@$1");
}

/**
 * Finds an in-progress @mention at the cursor, so we know whether to show
 * the picker and what they've typed so far.
 */
export function activeMention(
  text: string,
  cursor: number,
): { query: string; start: number } | null {
  const before = text.slice(0, cursor);
  const at = before.lastIndexOf("@");

  if (at === -1) return null;

  // An @ only starts a mention at the beginning or after whitespace.
  if (at > 0 && !/\s/.test(before[at - 1])) return null;

  const query = before.slice(at + 1);

  // A space ends it — mentions are a single name fragment.
  if (/\s/.test(query)) return null;

  return { query, start: at };
}

export function filterTargets(
  targets: MentionTarget[],
  query: string,
): MentionTarget[] {
  const term = query.trim().toLowerCase();
  if (!term) return targets.slice(0, 6);

  return targets
    .filter((t) => t.fullName.toLowerCase().includes(term))
    .slice(0, 6);
}