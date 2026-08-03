import { useEffect, useState } from "react";
import type { StepState } from "./approval-workflow";

/** One immutable record of a change to an approval step. */
export type AuditEntry = {
  id: string;
  talentId: string;
  talentName: string;
  stepId: string;
  stepLabel: string;
  from: StepState;
  to: StepState;
  /** role code that made the change, e.g. "EP" */
  by: string;
  note?: string;
  /** ISO timestamp */
  at: string;
};

const KEY = "chi-les.audit-log.v1";
const EVENT = "chi-les:audit-change";

export function loadAuditLog(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

/** Appends an entry. The log is append-only — entries are never edited. */
export function recordAudit(entry: Omit<AuditEntry, "id" | "at">) {
  if (typeof window === "undefined") return;
  const next: AuditEntry[] = [
    {
      ...entry,
      id: `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
    },
    ...loadAuditLog(),
  ].slice(0, 500);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

/** Newest-first log, optionally scoped to one talent. */
export function useAuditLog(talentId?: string): AuditEntry[] {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  useEffect(() => {
    const sync = () => setEntries(loadAuditLog());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return talentId ? entries.filter((e) => e.talentId === talentId) : entries;
}

export function formatStamp(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · ${d.toLocaleTimeString(
    "en-GB",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}
