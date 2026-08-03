import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  allChecklistFixed,
  applyFeedbackToApprovals,
  feedbackSignature,
  lastSync,
  type SyncAction,
} from "@/lib/feedback-sync";
import {
  FEEDBACK_STATES,
  FEEDBACK_STATE_LABEL,
  FEEDBACK_TARGETS,
  useHandoffFeedback,
  type FeedbackNote,
  type FeedbackState,
} from "@/lib/handoff-feedback";
import { isAdmin, useRole, ROLE_LABEL } from "@/lib/roles";

function stateClass(s: FeedbackState) {
  if (s === "blocked") return "text-warning";
  if (s === "fixed") return "text-ink-muted";
  return "text-ink";
}

function canResolve(role: string, note: FeedbackNote) {
  return isAdmin(role as never) || note.by === role;
}

/** Editor feedback thread on a compiled handoff brief. */
export function HandoffFeedback({
  slug,
  extraTargets = [],
}: {
  slug: string;
  extraTargets?: string[];
}) {
  const [role] = useRole();
  const { notes, counts, add, setState, remove } = useHandoffFeedback(slug);
  const targets = [...FEEDBACK_TARGETS, ...extraTargets];
  const [target, setTarget] = useState(targets[0]);
  const [body, setBody] = useState("");
  const [filter, setFilter] = useState<"all" | FeedbackState>("all");

  const visible = filter === "all" ? notes : notes.filter((n) => n.state === filter);

  /* Resolved checklist feedback releases / advances the approval workflow. */
  const cleared = allChecklistFixed(notes, extraTargets);
  const signature = feedbackSignature(notes, extraTargets);
  const [actions, setActions] = useState<SyncAction[]>([]);

  useEffect(() => {
    if (!cleared) {
      setActions(lastSync(slug)?.signature === signature ? (lastSync(slug)?.actions ?? []) : []);
      return;
    }
    setActions(applyFeedbackToApprovals({ slug, signature, by: role }));
  }, [cleared, signature, slug, role]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    add({ target, body, by: role });
    setBody("");
  };

  return (
    <section className="mt-20 animate-reveal" style={{ animationDelay: "280ms" }}>
      <div className="flex items-baseline justify-between mb-6">
        <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Editor feedback
        </div>
        <span className="text-[11px] text-ink-secondary tabular-nums">
          {counts.open} open · {counts.blocked} blocked · {counts.fixed} fixed
        </span>
      </div>

      {/* Workflow sync */}
      {cleared ? (
        <div className="border-t-hairline border-b-hairline py-5 mb-8">
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-2">
            Approval workflow updated
          </div>
          {actions.length === 0 ? (
            <p className="text-[13px] text-ink-secondary max-w-[62ch]">
              All checklist feedback is marked fixed — no approval gate on this episode needed
              releasing.
            </p>
          ) : (
            <ul className="space-y-2">
              {actions.map((a) => (
                <li key={`${a.talentId}-${a.stepId}`} className="text-[13px] text-ink">
                  <Link
                    to="/talent/$talentId"
                    params={{ talentId: a.talentId }}
                    className="border-b-hairline border-b-[color:var(--color-ink)] hover:opacity-60 transition-opacity"
                  >
                    {a.talentName}
                  </Link>{" "}
                  <span className="text-ink-secondary">
                    — {a.stepLabel} {a.kind === "unblocked" ? "released from blocked" : "advanced to cleared"} · {a.at}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}


      {/* Compose */}
      <form onSubmit={submit} className="border-t-hairline pt-6">
        <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
          <label className="block">
            <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-2">
              Section
            </span>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-transparent text-[13px] text-ink border-b-hairline border-[color:var(--color-border)] focus:border-[color:var(--color-ink)] outline-none pb-2"
            >
              {targets.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-2">
              Note — commenting as {ROLE_LABEL[role]}
            </span>
            <textarea
              value={body}
              maxLength={1000}
              rows={2}
              placeholder="What needs to change before the cut starts?"
              onChange={(e) => setBody(e.target.value)}
              className="w-full resize-none bg-transparent text-[14px] text-ink placeholder:text-ink-muted border-b-hairline border-[color:var(--color-border)] focus:border-[color:var(--color-ink)] outline-none pb-2"
            />
          </label>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-[11px] text-ink-muted tabular-nums">
            {body.trim().length}/1000
          </span>
          <button
            type="submit"
            disabled={!body.trim()}
            className="text-[11px] uppercase tracking-[0.12em] font-bold border-b-hairline border-b-[color:var(--color-ink)] pb-1 hover:opacity-60 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Post note
          </button>
        </div>
      </form>

      {/* Filter */}
      {notes.length > 0 ? (
        <div className="flex gap-6 mt-10">
          {(["all", ...FEEDBACK_STATES] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] uppercase tracking-[0.12em] font-bold transition-colors ${
                filter === f ? "text-ink" : "text-ink-muted hover:text-ink-secondary"
              }`}
            >
              {f === "all" ? "All" : FEEDBACK_STATE_LABEL[f]}
            </button>
          ))}
        </div>
      ) : null}

      {/* Thread */}
      <div className="mt-6">
        {visible.length === 0 ? (
          <p className="text-[13px] text-ink-secondary border-t-hairline pt-6">
            {notes.length === 0
              ? "No feedback on this brief yet."
              : "No notes in this state."}
          </p>
        ) : null}

        {visible.map((n) => {
          const allowed = canResolve(role, n);
          return (
            <div key={n.id} className="border-t-hairline py-5">
              <div className="grid grid-cols-[1fr_200px] gap-6 items-start">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                      {n.target}
                    </span>
                    <span className="text-[11px] font-mono text-ink-muted">
                      {n.by} · {n.createdAt}
                    </span>
                  </div>
                  <p
                    className={`text-[14px] mt-2 max-w-[62ch] ${
                      n.state === "fixed" ? "text-ink-secondary line-through" : "text-ink"
                    }`}
                  >
                    {n.body}
                  </p>
                  {n.resolvedBy ? (
                    <div className="text-[11px] text-ink-secondary mt-2">
                      Marked {FEEDBACK_STATE_LABEL[n.state].toLowerCase()} by {n.resolvedBy} ·{" "}
                      {n.resolvedAt}
                    </div>
                  ) : null}
                </div>

                <div className="text-right">
                  <div
                    className={`text-[10px] uppercase tracking-[0.12em] font-bold ${stateClass(
                      n.state,
                    )}`}
                  >
                    {FEEDBACK_STATE_LABEL[n.state]}
                  </div>
                  {allowed ? (
                    <div className="flex justify-end gap-4 mt-3">
                      {FEEDBACK_STATES.filter((s) => s !== n.state).map((s) => (
                        <button
                          key={s}
                          onClick={() => setState(n.id, s, role)}
                          className="text-[10px] uppercase tracking-[0.12em] text-ink-secondary hover:text-ink transition-colors"
                        >
                          {s === "open" ? "Reopen" : `Mark ${FEEDBACK_STATE_LABEL[s].toLowerCase()}`}
                        </button>
                      ))}
                      <button
                        onClick={() => remove(n.id)}
                        className="text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:text-warning transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-ink-muted mt-3">
                      {ROLE_LABEL[role]} cannot change this note — raised by {n.by}.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {visible.length > 0 ? <div className="border-t-hairline" /> : null}
      </div>
    </section>
  );
}
