import { useEffect, useState } from "react";
import type { Role } from "./roles";
import { loadWorkflow, progressFor } from "./approval-workflow";
import { talentForEpisode } from "./talent-bank";
import { episodeTitle } from "./talent-bank";

/** An in-app notification addressed to one production role. */
export type Notification = {
  id: string;
  /** role that should act on this */
  to: Role;
  /** role that triggered it */
  from: Role;
  kind: "feedback-added" | "feedback-fixed" | "feedback-blocked" | "feedback-reopened";
  title: string;
  body: string;
  /** episode slug the note belongs to */
  slug: string;
  at: string;
  read: boolean;
};

const KEY = "chi-les.notifications.v1";
const EVENT = "chi-les:notifications-change";

export const KIND_LABEL: Record<Notification["kind"], string> = {
  "feedback-added": "New feedback",
  "feedback-fixed": "Marked fixed",
  "feedback-blocked": "Marked blocked",
  "feedback-reopened": "Reopened",
};

function load(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Notification[]) : [];
  } catch {
    return [];
  }
}

function persist(items: Notification[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

const ROLE_CODES = ["EP", "PR", "SP", "DP", "ED"] as const;
function isRoleCode(v: string): v is Role {
  return (ROLE_CODES as readonly string[]).includes(v);
}

/**
 * Roles that own the live approval work on an episode: the owner of each
 * talent's blocked gate, or the next required gate. Falls back to the EP.
 */
export function ownersForEpisode(slug: string): Role[] {
  const steps = loadWorkflow();
  const owners = new Set<Role>();
  for (const t of talentForEpisode(slug)) {
    const p = progressFor(t.id, steps);
    const owner = (p.blocked ?? p.current)?.owner;
    if (owner && isRoleCode(owner)) owners.add(owner);
  }
  if (owners.size === 0) owners.add("EP");
  return [...owners];
}

/** Sends one notification per relevant owner, skipping the actor themselves. */
export function notifyOwners(input: {
  slug: string;
  from: Role;
  kind: Notification["kind"];
  target: string;
  body: string;
}) {
  if (typeof window === "undefined") return;
  const recipients = ownersForEpisode(input.slug).filter((r) => r !== input.from);
  if (recipients.length === 0) return;

  const at = new Date().toISOString();
  const created: Notification[] = recipients.map((to, i) => ({
    id: `n-${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 6)}`,
    to,
    from: input.from,
    kind: input.kind,
    title: `${KIND_LABEL[input.kind]} · ${input.target}`,
    body: `${episodeTitle(input.slug)} — ${input.body.slice(0, 160)}`,
    slug: input.slug,
    at,
    read: false,
  }));

  persist([...created, ...load()].slice(0, 300));
}

export function markRead(id: string) {
  persist(load().map((n) => (n.id === id ? { ...n, read: true } : n)));
}

export function markAllRead(role: Role) {
  persist(load().map((n) => (n.to === role ? { ...n, read: true } : n)));
}

export function clearFor(role: Role) {
  persist(load().filter((n) => n.to !== role));
}

/** Notifications addressed to one role, newest first. */
export function useNotifications(role: Role) {
  const [all, setAll] = useState<Notification[]>([]);
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
  const items = all.filter((n) => n.to === role);
  return { items, unread: items.filter((n) => !n.read).length };
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · ${d.toLocaleTimeString(
    "en-GB",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}
