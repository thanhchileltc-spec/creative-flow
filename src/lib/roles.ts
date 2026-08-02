import { useCallback, useEffect, useState } from "react";
import type { WorkflowStep, StepState } from "./approval-workflow";

/** Production roles that can act inside the platform. */
export type Role = "EP" | "PR" | "SP" | "DP" | "ED";

export const ROLES: { code: Role; label: string }[] = [
  { code: "EP", label: "Executive Producer" },
  { code: "PR", label: "Producer" },
  { code: "SP", label: "Sourcing Producer" },
  { code: "DP", label: "Director of Photography" },
  { code: "ED", label: "Editor" },
];

export const ROLE_LABEL: Record<Role, string> = ROLES.reduce(
  (acc, r) => ({ ...acc, [r.code]: r.label }),
  {} as Record<Role, string>,
);

/** Roles that may act on any step and configure the workflow itself. */
export const ADMIN_ROLES: Role[] = ["EP"];

const STORAGE_KEY = "chi-les.active-role.v1";
const EVENT = "chi-les:role-change";
const DEFAULT_ROLE: Role = "PR";

function isRole(v: unknown): v is Role {
  return typeof v === "string" && ROLES.some((r) => r.code === v);
}

export function loadRole(): Role {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return isRole(raw) ? raw : DEFAULT_ROLE;
}

export function saveRole(role: Role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, role);
  window.dispatchEvent(new Event(EVENT));
}

/** Active role. Starts at the default so SSR and first client render agree. */
export function useRole(): [Role, (r: Role) => void] {
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);

  useEffect(() => {
    const sync = () => setRole(loadRole());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((r: Role) => {
    setRole(r);
    saveRole(r);
  }, []);

  return [role, update];
}

/* ---------------------------------------------------------- permissions */

export function isAdmin(role: Role) {
  return ADMIN_ROLES.includes(role);
}

/** Only the step owner — or an admin role — can move a step. */
export function canActOnStep(role: Role, step: WorkflowStep) {
  return isAdmin(role) || step.owner.toUpperCase() === role;
}

/** Only admin roles may add, rename, reorder or remove gates. */
export function canConfigureWorkflow(role: Role) {
  return isAdmin(role);
}

export function denialReason(role: Role, step: WorkflowStep) {
  return `${ROLE_LABEL[role]} cannot change this gate — owned by ${step.owner.toUpperCase()}.`;
}

/** States a role is allowed to set a step to. */
export function allowedStates(role: Role, step: WorkflowStep): StepState[] {
  if (!canActOnStep(role, step)) return [];
  const base: StepState[] = ["pending", "in-progress", "cleared", "blocked"];
  // Skipping a gate is an executive decision.
  return isAdmin(role) ? [...base, "skipped"] : base;
}
