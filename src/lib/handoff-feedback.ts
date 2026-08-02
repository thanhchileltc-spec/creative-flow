import { useCallback, useEffect, useState } from "react";
import type { Role } from "./roles";

/** State of a single piece of editor feedback on a handoff brief. */
export type FeedbackState = "open" | "fixed" | "blocked";

export const FEEDBACK_STATE_LABEL: Record<FeedbackState, string> = {
  open: "Open",
  fixed: "Fixed",
  blocked: "Blocked",
};

export const FEEDBACK_STATES: FeedbackState[] = ["open", "fixed", "blocked"];

export type FeedbackNote = {
  id: string;
  slug: string;
  /** Part of the brief the note is about, e.g. "DP notes" or a checklist label. */
  target: string;
  body: string;
  state: FeedbackState;
  /** Role that raised the note. */
  by: Role;
  createdAt: string;
  /** Role that last changed the state. */
  resolvedBy?: Role;
  resolvedAt?: string;
};

const STORAGE_KEY = "chi-les.handoff-feedback.v1";
const EVENT = "chi-les:handoff-feedback-change";

export const FEEDBACK_TARGETS = [
  "Whole brief",
  "Narrative spine",
  "Director treatment",
  "DP notes",
  "Tech specs",
  "Deliverables",
  "Outstanding items",
];

function load(): FeedbackNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as FeedbackNote[]) : [];
  } catch {
    return [];
  }
}

function persist(notes: FeedbackNote[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  window.dispatchEvent(new Event(EVENT));
}

function stamp() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

/** Notes for one handoff, newest last, plus mutators. */
export function useHandoffFeedback(slug: string) {
  const [all, setAll] = useState<FeedbackNote[]>([]);

  useEffect(() => {
    const sync = () => setAll(load());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback(
    (input: { target: string; body: string; by: Role }) => {
      const note: FeedbackNote = {
        id: `fb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        slug,
        target: input.target,
        body: input.body.trim().slice(0, 1000),
        state: "open",
        by: input.by,
        createdAt: stamp(),
      };
      const next = [...load(), note];
      setAll(next);
      persist(next);
    },
    [slug],
  );

  const setState = useCallback((id: string, state: FeedbackState, by: Role) => {
    const next = load().map((n) =>
      n.id === id
        ? {
            ...n,
            state,
            resolvedBy: state === "open" ? undefined : by,
            resolvedAt: state === "open" ? undefined : stamp(),
          }
        : n,
    );
    setAll(next);
    persist(next);
  }, []);

  const remove = useCallback((id: string) => {
    const next = load().filter((n) => n.id !== id);
    setAll(next);
    persist(next);
  }, []);

  const notes = all.filter((n) => n.slug === slug);
  const counts = {
    open: notes.filter((n) => n.state === "open").length,
    fixed: notes.filter((n) => n.state === "fixed").length,
    blocked: notes.filter((n) => n.state === "blocked").length,
    total: notes.length,
  };

  return { notes, counts, add, setState, remove };
}
