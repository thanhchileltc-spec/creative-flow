import { STEP_STATE_LABEL } from "@/lib/approval-workflow";
import { formatStamp, type AuditEntry } from "@/lib/audit-log";

/** Append-only trail of approval decisions. */
export function AuditTrail({
  entries,
  showTalent = false,
  emptyLabel = "No approval changes recorded yet.",
}: {
  entries: AuditEntry[];
  showTalent?: boolean;
  emptyLabel?: string;
}) {
  if (entries.length === 0) {
    return <p className="text-[13px] text-ink-muted border-t-hairline pt-5">{emptyLabel}</p>;
  }

  return (
    <div>
      {entries.map((e) => (
        <div key={e.id} className="grid grid-cols-[130px_1fr_60px] gap-6 border-t-hairline py-4">
          <div className="text-[11px] font-mono tabular-nums text-ink-muted">
            {formatStamp(e.at)}
          </div>
          <div>
            <div className="text-[13px] leading-snug">
              {showTalent && <span className="font-bold tracking-[-0.02em]">{e.talentName} — </span>}
              {e.stepLabel}
              <span className="text-ink-muted"> · {STEP_STATE_LABEL[e.from]} → </span>
              <span className={e.to === "blocked" ? "text-warning" : "text-ink"}>
                {STEP_STATE_LABEL[e.to]}
              </span>
            </div>
            {e.note && <p className="text-[11px] text-ink-secondary mt-1 leading-snug">{e.note}</p>}
          </div>
          <div className="text-[10px] font-mono text-ink-muted text-right">{e.by}</div>
        </div>
      ))}
      <div className="border-t-hairline" />
    </div>
  );
}
