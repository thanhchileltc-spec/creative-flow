/**
 * Attention items are DERIVED from records, never hand-typed.
 * Every item carries: reason, owner, affected record, consequence verb.
 */
import { EPISODES } from "./episodes";
import { SHOOT_DAYS } from "./shoot-days";
import { TALENT } from "./talent-bank";

export type AttentionItem = {
  id: string;
  reason: string;
  owner: string; // role code
  record: string;
  verb: string;
  to: string;
  params?: Record<string, string>;
};

export function deriveAttention(): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const ep of EPISODES) {
    const blocked = ep.stages.find((s) => s.status === "blocked");
    if (ep.status === "blocked" || blocked) {
      items.push({
        id: `ep-${ep.slug}`,
        reason: blocked?.blocker ?? "Blocked — the reason isn't on the record yet",
        owner: ep.roles[0] ?? "EP",
        record: `${ep.code} · ${ep.title}`,
        verb: "Resolve",
        to: "/episodes/$slug",
        params: { slug: ep.slug },
      });
    }
  }
  for (const d of SHOOT_DAYS) {
    for (const l of d.logistics.filter((x) => x.status === "risk")) {
      items.push({
        id: `sd-${d.id}-${l.label}`,
        reason: `${l.label}: ${l.value}`,
        owner: "PR",
        record: `${d.dayCode} · ${d.city}`,
        verb: "Confirm basis",
        to: "/shoot-days/$dayId",
        params: { dayId: d.id },
      });
    }
  }
  for (const t of TALENT.filter((t) => t.storyFit.risk && t.approval === "in-review")) {
    items.push({
      id: `t-${t.id}`,
      reason: t.storyFit.risk!,
      owner: "EP",
      record: t.name,
      verb: "Review lead",
      to: "/talent/$talentId",
      params: { talentId: t.id },
    });
  }
  return items;
}
