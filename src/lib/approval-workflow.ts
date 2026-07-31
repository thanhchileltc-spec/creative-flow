import { useCallback, useEffect, useState } from "react";
import { TALENT, type ApprovalStatus } from "./talent-bank";

/** A single configurable gate in the talent approval workflow. */
export type WorkflowStep = {
  id: string;
  label: string;
  /** role code that owns the decision, e.g. "EP" */
  owner: string;
  description: string;
  /** if false the step is informational and never blocks approval */
  required: boolean;
};

export type StepState = "pending" | "in-progress" | "cleared" | "blocked" | "skipped";

export type StepRecord = {
  state: StepState;
  by?: string;
  date?: string;
  note?: string;
};

export const STEP_STATE_LABEL: Record<StepState, string> = {
  pending: "Not started",
  "in-progress": "In progress",
  cleared: "Cleared",
  blocked: "Blocked",
  skipped: "Skipped",
};

export const STEP_STATE_ORDER: StepState[] = [
  "pending",
  "in-progress",
  "cleared",
  "blocked",
  "skipped",
];

export const DEFAULT_WORKFLOW: WorkflowStep[] = [
  {
    id: "sourcing-check",
    label: "Sourcing check",
    owner: "SP",
    description: "Provenance, contact route and any fixer or agent dependency recorded.",
    required: true,
  },
  {
    id: "discovery-call",
    label: "Discovery call",
    owner: "PR",
    description: "At least one logged call with a written outcome.",
    required: true,
  },
  {
    id: "initial-review",
    label: "Initial review",
    owner: "PR",
    description: "Story fit scored and risks written down.",
    required: true,
  },
  {
    id: "producer-approval",
    label: "Producer approval",
    owner: "PR",
    description: "Producer signs off that the talent can carry a strand.",
    required: true,
  },
  {
    id: "clearance",
    label: "Rights & clearance",
    owner: "SP",
    description: "Release form, location permission and any agent notice window.",
    required: false,
  },
  {
    id: "final-approval",
    label: "Final approval",
    owner: "EP",
    description: "Executive Producer locks the talent to the episode.",
    required: true,
  },
];

/* ---------------------------------------------------------------- config */

const STORAGE_KEY = "chi-les.approval-workflow.v1";
const EVENT = "chi-les:workflow-change";

function isStep(v: unknown): v is WorkflowStep {
  const s = v as WorkflowStep;
  return (
    !!s &&
    typeof s.id === "string" &&
    typeof s.label === "string" &&
    typeof s.owner === "string" &&
    typeof s.description === "string" &&
    typeof s.required === "boolean"
  );
}

export function loadWorkflow(): WorkflowStep[] {
  if (typeof window === "undefined") return DEFAULT_WORKFLOW;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WORKFLOW;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isStep) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    /* fall through to defaults */
  }
  return DEFAULT_WORKFLOW;
}

export function saveWorkflow(steps: WorkflowStep[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
  window.dispatchEvent(new Event(EVENT));
}

export function resetWorkflow() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Reads the configured workflow. Starts from defaults so SSR and the first
 * client render agree, then syncs to the stored config after hydration.
 */
export function useWorkflow(): [WorkflowStep[], (steps: WorkflowStep[]) => void, () => void] {
  const [steps, setSteps] = useState<WorkflowStep[]>(DEFAULT_WORKFLOW);

  useEffect(() => {
    const sync = () => setSteps(loadWorkflow());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((next: WorkflowStep[]) => {
    setSteps(next);
    saveWorkflow(next);
  }, []);

  const reset = useCallback(() => {
    setSteps(DEFAULT_WORKFLOW);
    resetWorkflow();
  }, []);

  return [steps, update, reset];
}

/* -------------------------------------------------------------- progress */

/** Per-talent record for the default step ids. Custom steps start pending. */
export const TALENT_STEPS: Record<string, Record<string, StepRecord>> = {
  "ba-hanh-nguyen": {
    "sourcing-check": { state: "cleared", by: "PR", date: "14 Jun" },
    "discovery-call": { state: "cleared", by: "PR", date: "18 Jun" },
    "initial-review": { state: "cleared", by: "PR", date: "20 Jun" },
    "producer-approval": { state: "cleared", by: "PR", date: "24 Jun" },
    clearance: { state: "cleared", by: "SP", date: "28 Jun", note: "Release signed via fixer." },
    "final-approval": { state: "cleared", by: "EP", date: "02 Jul" },
  },
  "rosa-bianchi": {
    "sourcing-check": { state: "cleared", by: "SP", date: "02 May" },
    "discovery-call": { state: "cleared", by: "SP", date: "09 May" },
    "initial-review": { state: "cleared", by: "PR", date: "12 May" },
    "producer-approval": { state: "cleared", by: "PR", date: "15 May" },
    clearance: {
      state: "in-progress",
      by: "SP",
      note: "Agent requires 10-day notice clause in the release.",
    },
    "final-approval": { state: "cleared", by: "EP", date: "21 May" },
  },
  "amadou-diop": {
    "sourcing-check": { state: "cleared", by: "SP", date: "21 Apr" },
    "discovery-call": { state: "cleared", by: "EP", date: "28 Apr" },
    "initial-review": { state: "cleared", by: "PR", date: "30 Apr" },
    "producer-approval": { state: "cleared", by: "PR", date: "04 May" },
    clearance: { state: "blocked", by: "SP", note: "DP visa unresolved — Sunday table access unconfirmed." },
    "final-approval": { state: "cleared", by: "EP", date: "08 May" },
  },
  "dona-marcelina": {
    "sourcing-check": { state: "cleared", by: "SP", date: "11 Jul" },
    "discovery-call": { state: "cleared", by: "SP", date: "16 Jul" },
    "initial-review": { state: "in-progress", by: "PR", note: "Second visit proposed before scoring is final." },
    "producer-approval": { state: "pending" },
    clearance: { state: "pending" },
    "final-approval": { state: "pending" },
  },
  "rufina-lopez": {
    "sourcing-check": { state: "cleared", by: "SP", date: "19 Jul" },
    "discovery-call": { state: "in-progress", by: "SP", note: "Call booked 31 Jul — blocking the shortlist." },
    "initial-review": { state: "pending" },
    "producer-approval": { state: "pending" },
    clearance: { state: "pending" },
    "final-approval": { state: "pending" },
  },
  "maria-alves": {
    "sourcing-check": { state: "cleared", by: "PR", date: "03 Jun" },
    "discovery-call": { state: "cleared", by: "PR", date: "07 Jun" },
    "initial-review": { state: "cleared", by: "PR", date: "09 Jun" },
    "producer-approval": { state: "cleared", by: "PR", date: "12 Jun" },
    clearance: { state: "cleared", by: "SP", date: "18 Jun" },
    "final-approval": { state: "cleared", by: "EP", date: "20 Jun" },
  },
  "kenji-arai": {
    "sourcing-check": { state: "in-progress", by: "PR", note: "University intro pending; no Ainu speaker confirmed." },
    "discovery-call": { state: "pending" },
    "initial-review": { state: "pending" },
    "producer-approval": { state: "pending" },
    clearance: { state: "pending" },
    "final-approval": { state: "pending" },
  },
  "yassine-el-amrani": {
    "sourcing-check": { state: "cleared", by: "SP", date: "02 Feb" },
    "discovery-call": { state: "cleared", by: "PR", date: "09 Feb" },
    "initial-review": { state: "cleared", by: "PR", date: "11 Feb" },
    "producer-approval": { state: "cleared", by: "PR", date: "13 Feb" },
    clearance: { state: "cleared", by: "SP", date: "17 Feb" },
    "final-approval": { state: "cleared", by: "EP", date: "19 Feb" },
  },
  "gustavo-neri": {
    "sourcing-check": { state: "cleared", by: "SP", date: "06 Jul" },
    "discovery-call": { state: "cleared", by: "SP", date: "12 Jul" },
    "initial-review": { state: "blocked", by: "PR", note: "Passed — wrong register for the channel." },
    "producer-approval": { state: "skipped" },
    clearance: { state: "skipped" },
    "final-approval": { state: "skipped" },
  },
};

export function stepRecord(talentId: string, stepId: string): StepRecord {
  return TALENT_STEPS[talentId]?.[stepId] ?? { state: "pending" };
}

export type WorkflowProgress = {
  cleared: number;
  total: number;
  /** first required step that is not cleared or skipped */
  current?: WorkflowStep;
  blocked?: WorkflowStep;
  complete: boolean;
};

export function progressFor(talentId: string, steps: WorkflowStep[]): WorkflowProgress {
  const required = steps.filter((s) => s.required);
  let cleared = 0;
  let current: WorkflowStep | undefined;
  let blocked: WorkflowStep | undefined;

  for (const step of steps) {
    const { state } = stepRecord(talentId, step.id);
    if (step.required && (state === "cleared" || state === "skipped")) cleared += 1;
    if (!blocked && state === "blocked") blocked = step;
    if (!current && step.required && state !== "cleared" && state !== "skipped") current = step;
  }

  return {
    cleared,
    total: required.length,
    current,
    blocked,
    complete: required.length > 0 && cleared === required.length,
  };
}

/** Status derived from the configured steps, falling back to the stored flag. */
export function derivedStatus(talentId: string, steps: WorkflowStep[]): ApprovalStatus {
  const stored = TALENT.find((t) => t.id === talentId)?.approval ?? "sourced";
  if (stored === "passed") return "passed";
  const p = progressFor(talentId, steps);
  if (p.complete) return "approved";
  if (p.blocked) return "in-review";
  if (p.cleared === 0) return "sourced";
  return p.current?.id === "discovery-call" ? "call-scheduled" : "in-review";
}

export function newStep(): WorkflowStep {
  return {
    id: `step-${Math.random().toString(36).slice(2, 8)}`,
    label: "New step",
    owner: "EP",
    description: "",
    required: true,
  };
}
