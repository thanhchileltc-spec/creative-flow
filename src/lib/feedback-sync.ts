import { getEpisode } from "./episodes";
import { TALENT } from "./talent-bank";
import { recordAudit } from "./audit-log";
import {
  loadWorkflow,
  progressFor,
  setStepRecord,
  stepRecord,
  type StepRecord,
} from "./approval-workflow";
import type { FeedbackNote } from "./handoff-feedback";

/** What the sync did for one talent when a brief was fully cleared. */
export type SyncAction = {
  talentId: string;
  talentName: string;
  stepId: string;
  stepLabel: string;
  kind: "unblocked" | "advanced";
  at: string;
};

const KEY = "chi-les.feedback-sync.v1";
const EVENT = "chi-les:feedback-sync-change";

/** True when the brief has checklist feedback and every note is marked fixed. */
export function allChecklistFixed(notes: FeedbackNote[], checklistLabels: string[]): boolean {
  const relevant = notes.filter((n) => checklistLabels.includes(n.target));
  if (relevant.length === 0) return false;
  return relevant.every((n) => n.state === "fixed");
}

/** Stable signature of the resolved set, so a given resolution only fires once. */
export function feedbackSignature(notes: FeedbackNote[], checklistLabels: string[]): string {
  return notes
    .filter((n) => checklistLabels.includes(n.target))
    .map((n) => `${n.id}:${n.state}`)
    .sort()
    .join("|");
}

type SyncStore = Record<string, { signature: string; actions: SyncAction[] }>;

function load(): SyncStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as SyncStore) : {};
  } catch {
    return {};
  }
}

function persist(store: SyncStore) {
  window.localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(EVENT));
}

export function lastSync(slug: string) {
  return load()[slug];
}

export const FEEDBACK_SYNC_EVENT = EVENT;

function stamp() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/**
 * Applies resolved handoff feedback to the approval workflow of every talent
 * attached to the episode: a blocked gate is released back to in-progress, and
 * an already-unblocked track advances its next required gate to cleared.
 * Idempotent per resolution signature.
 */
export function applyFeedbackToApprovals(input: {
  slug: string;
  signature: string;
  by: string;
}): SyncAction[] {
  if (typeof window === "undefined") return [];
  const store = load();
  if (store[input.slug]?.signature === input.signature) {
    return store[input.slug].actions;
  }

  const episode = getEpisode(input.slug);
  const steps = loadWorkflow();
  const actions: SyncAction[] = [];

  for (const talent of TALENT.filter((t) => t.episodes.includes(input.slug))) {
    const progress = progressFor(talent.id, steps);
    const target = progress.blocked ?? progress.current;
    if (!target) continue;

    const kind: SyncAction["kind"] = progress.blocked ? "unblocked" : "advanced";
    const from = stepRecord(talent.id, target.id).state;
    const to = kind === "unblocked" ? "in-progress" : "cleared";
    const note =
      kind === "unblocked"
        ? `Released automatically — all editor feedback on ${episode?.code ?? input.slug} marked fixed.`
        : `Advanced automatically — all editor feedback on ${episode?.code ?? input.slug} marked fixed.`;

    const record: StepRecord = { state: to, by: input.by, date: stamp(), note };
    setStepRecord(talent.id, target.id, record);
    recordAudit({
      talentId: talent.id,
      talentName: talent.name,
      stepId: target.id,
      stepLabel: target.label,
      from,
      to,
      by: input.by,
      note,
    });

    actions.push({
      talentId: talent.id,
      talentName: talent.name,
      stepId: target.id,
      stepLabel: target.label,
      kind,
      at: stamp(),
    });
  }

  persist({ ...store, [input.slug]: { signature: input.signature, actions } });
  return actions;
}
