import { progressFor, stepRecord, type WorkflowStep } from "@/lib/approval-workflow";

export function stateClass(state: string) {
  if (state === "cleared") return "bg-ink";
  if (state === "blocked") return "bg-warning";
  if (state === "in-progress") return "bg-warning/40";
  if (state === "skipped") return "bg-ink-muted/40";
  return "bg-ink-muted/20";
}

/** Compact segmented bar of every configured step. */
export function ApprovalTrack({
  talentId,
  steps,
  showCount = true,
}: {
  talentId: string;
  steps: WorkflowStep[];
  showCount?: boolean;
}) {
  const p = progressFor(talentId, steps);
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex gap-[3px]"
        aria-label={`${p.cleared} of ${p.total} required approval steps cleared`}
      >
        {steps.map((s) => {
          const r = stepRecord(talentId, s.id);
          return (
            <span
              key={s.id}
              title={`${s.label} · ${r.state}`}
              className={`block h-[3px] w-[14px] ${stateClass(r.state)}`}
            />
          );
        })}
      </span>
      {showCount && (
        <span className="text-[10px] tabular-nums text-ink-muted font-mono">
          {p.cleared}/{p.total}
        </span>
      )}
    </div>
  );
}
