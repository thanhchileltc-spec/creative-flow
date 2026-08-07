import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TALENT, APPROVAL_LABEL } from "@/lib/talent-bank";
import {
  useWorkflow,
  useStepRecords,
  stepRecord,
  progressFor,
  derivedStatus,
  STEP_STATE_LABEL,
  type StepState,
  type WorkflowStep,
} from "@/lib/approval-workflow";
import { useAuditLog } from "@/lib/audit-log";
import { RoleSwitcher } from "@/components/role-switcher";
import { GateDetailPanel, type GateSelection } from "@/components/gate-detail-panel";

export const Route = createFileRoute("/talent/timeline")({
  head: () => {
    const title = "Approval timeline — every gate, every talent | Chi Les";
    const description =
      "One grid showing each approval step per talent: blocked, in progress, cleared, skipped or not started, with the last recorded decision.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ApprovalTimeline,
});

const CELL: Record<StepState, { dot: string; line: string; text: string }> = {
  cleared: { dot: "bg-ink", line: "bg-ink", text: "text-ink" },
  "in-progress": { dot: "bg-warning", line: "bg-warning/40", text: "text-warning" },
  blocked: { dot: "bg-warning ring-2 ring-warning/25", line: "bg-warning/25", text: "text-warning" },
  skipped: { dot: "bg-ink-muted/40", line: "bg-ink-muted/25", text: "text-ink-muted" },
  pending: { dot: "bg-ink-muted/25", line: "bg-ink-muted/15", text: "text-ink-muted" },
};

function Legend() {
  const order: StepState[] = ["cleared", "in-progress", "blocked", "skipped", "pending"];
  return (
    <div className="flex flex-wrap items-center gap-6 text-[10px] text-ink-muted">
      {order.map((s) => (
        <span key={s} className="inline-flex items-center gap-2">
          <span className={`block h-[7px] w-[7px] rounded-full ${CELL[s].dot}`} />
          {STEP_STATE_LABEL[s]}
        </span>
      ))}
    </div>
  );
}

function Row({
  talentId,
  name,
  meta,
  steps,
  delay,
  lastAt,
  onSelect,
}: {
  talentId: string;
  name: string;
  meta: string;
  steps: WorkflowStep[];
  delay: number;
  lastAt?: string;
  onSelect: (stepId: string) => void;
}) {
  const p = progressFor(talentId, steps);
  const status = derivedStatus(talentId, steps);

  return (
    <div
      className="border-t-hairline py-5 animate-reveal"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <div className="flex items-baseline gap-3">
          <Link
            to="/talent/$talentId"
            params={{ talentId }}
            className="text-[14px] font-bold tracking-[-0.02em] hover:text-ink-secondary transition-colors duration-[var(--dur-fast)]"
          >
            {name}
          </Link>
          <span className="text-[10px] text-ink-muted">{meta}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className={p.blocked ? "text-warning" : "text-ink-secondary"}>
            {p.blocked
              ? `Blocked · ${p.blocked.label}`
              : p.current
                ? `Next · ${p.current.label} (${p.current.owner})`
                : "All gates cleared"}
          </span>
          <span className="font-mono tabular-nums text-ink-muted">
            {p.cleared}/{p.total}
          </span>
          <span className="text-ink-muted">{APPROVAL_LABEL[status]}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid min-w-[720px] gap-x-3"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        >
          {steps.map((s, i) => {
            const r = stepRecord(talentId, s.id);
            const c = CELL[r.state];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                aria-label={`${s.label} — ${STEP_STATE_LABEL[r.state]} for ${name}. Open gate details.`}
                className="relative text-left cursor-pointer -mx-1 px-1 pb-1 rounded-[2px] hover:bg-ink/[0.03] focus:outline-none focus-visible:ring-1 focus-visible:ring-ink/30 transition-colors duration-[var(--dur-fast)]"
              >
                <div className="flex items-center">
                  <span className={`block h-[9px] w-[9px] rounded-full shrink-0 ${c.dot}`} />
                  {i < steps.length - 1 && <span className={`block h-[1.5px] flex-1 ${c.line}`} />}
                </div>
                <div className="mt-2 pr-3">
                  <div className="text-[10px] font-medium leading-tight">{s.label}</div>
                  <div className={`text-[10px] mt-[2px] ${c.text}`}>
                    {STEP_STATE_LABEL[r.state]}
                    {!s.required && <span className="text-ink-muted"> · optional</span>}
                  </div>
                  <div className="text-[9px] text-ink-muted font-mono mt-[2px]">
                    {r.by ?? s.owner}
                    {r.date ? ` · ${r.date}` : ""}
                  </div>
                  {r.note && (
                    <p className="text-[9px] text-ink-muted leading-snug mt-1 pr-1">{r.note}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {lastAt && (
        <div className="text-[9px] text-ink-muted font-mono mt-3">Last decision {lastAt}</div>
      )}
    </div>
  );
}

function ApprovalTimeline() {
  const [steps] = useWorkflow();
  useStepRecords();
  const log = useAuditLog();
  const [selection, setSelection] = useState<GateSelection>(null);

  const blockedCount = TALENT.filter((t) => progressFor(t.id, steps).blocked).length;
  const completeCount = TALENT.filter((t) => progressFor(t.id, steps).complete).length;

  const lastFor = (id: string) => {
    const e = log.find((x) => x.talentId === id);
    return e ? new Date(e.at).toLocaleString() : undefined;
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 bg-canvas/85 backdrop-blur-md border-b-hairline">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-[13px] font-bold tracking-[-0.02em]">
            Chi Les
          </Link>
          <div className="hidden md:flex gap-8 text-[13px] text-ink-secondary">
            <Link to="/" className="hover:text-ink transition-colors duration-[var(--dur-fast)]">
              Episodes
            </Link>
            <Link
              to="/shoot-days"
              className="hover:text-ink transition-colors duration-[var(--dur-fast)]"
            >
              Shoot Days
            </Link>
            <Link
              to="/talent"
              className="hover:text-ink transition-colors duration-[var(--dur-fast)]"
            >
              Talent Bank
            </Link>
            <Link
              to="/handoff"
              className="hover:text-ink transition-colors duration-[var(--dur-fast)]"
            >
              Editor Handoff
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <RoleSwitcher />
          <div className="text-[11px] text-ink-secondary">
            <span className="text-warning font-bold tabular-nums">
              {String(blockedCount).padStart(2, "0")}
            </span>{" "}
            blocked
          </div>
        </div>
      </nav>

      <main className="px-8 py-24 max-w-[1440px] mx-auto">
        <header className="mb-8 animate-reveal">
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">
            Approval timeline
          </div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] leading-tight">
            Every gate, every talent, at a glance
          </h1>
          <p className="text-[13px] text-ink-secondary mt-1">
            {completeCount} of {TALENT.length} fully cleared · {blockedCount} blocked on a gate.
          </p>
        </header>

        <div
          className="flex flex-wrap items-center justify-between gap-4 pb-5 animate-reveal"
          style={{ animationDelay: "40ms" }}
        >
          <Legend />
          <div className="flex gap-6 text-[11px]">
            <Link
              to="/talent"
              className="text-ink-muted hover:text-ink transition-colors duration-[var(--dur-fast)]"
            >
              Talent list
            </Link>
            <Link
              to="/talent/audit"
              className="text-ink-muted hover:text-ink transition-colors duration-[var(--dur-fast)]"
            >
              Audit log
            </Link>
            <Link
              to="/talent/workflow"
              className="text-ink-muted hover:text-ink transition-colors duration-[var(--dur-fast)]"
            >
              Configure workflow
            </Link>
          </div>
        </div>

        <div>
          {TALENT.map((t, i) => (
            <Row
              key={t.id}
              talentId={t.id}
              name={t.name}
              meta={`${t.craft} · ${t.location}`}
              steps={steps}
              delay={80 + i * 40}
              lastAt={lastFor(t.id)}
              onSelect={(stepId) => setSelection({ talentId: t.id, stepId })}
            />
          ))}
          <div className="border-t-hairline" />
        </div>
      </main>

      <GateDetailPanel selection={selection} steps={steps} onClose={() => setSelection(null)} />
    </div>
  );
}
