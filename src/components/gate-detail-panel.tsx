import { Link } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { STEP_STATE_LABEL, stepRecord, type WorkflowStep } from "@/lib/approval-workflow";
import { useAuditLog } from "@/lib/audit-log";
import { AuditTrail } from "@/components/audit-trail";
import { FEEDBACK_STATE_LABEL, useFeedbackForSlugs } from "@/lib/handoff-feedback";
import { getTalent, episodeCode } from "@/lib/talent-bank";
import { ROLE_LABEL, type Role } from "@/lib/roles";

export type GateSelection = { talentId: string; stepId: string } | null;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">
        {title}
      </div>
      {children}
    </section>
  );
}

/** Read-only detail for one approval gate on one talent. */
export function GateDetailPanel({
  selection,
  steps,
  onClose,
}: {
  selection: GateSelection;
  steps: WorkflowStep[];
  onClose: () => void;
}) {
  const talent = selection ? getTalent(selection.talentId) : undefined;
  const step: WorkflowStep | undefined = selection
    ? steps.find((s) => s.id === selection.stepId)
    : undefined;

  const log = useAuditLog(selection?.talentId);
  const notes = useFeedbackForSlugs(talent?.episodes ?? []);

  const record = selection ? stepRecord(selection.talentId, selection.stepId) : undefined;
  const entries = selection ? log.filter((e) => e.stepId === selection.stepId) : [];
  const sortedNotes = [...notes].sort((a, b) => {
    const rank = (s: string) => (s === "blocked" ? 0 : s === "open" ? 1 : 2);
    return rank(a.state) - rank(b.state);
  });

  return (
    <Sheet open={!!selection && !!talent && !!step} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[520px] bg-canvas text-ink overflow-y-auto p-8"
      >
        {talent && step && record && (
          <>
            <SheetHeader className="text-left space-y-0">
              <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">
                {talent.name}
              </div>
              <SheetTitle className="text-[20px] font-bold tracking-[-0.02em] leading-tight">
                {step.label}
              </SheetTitle>
              <SheetDescription className="text-[12px] text-ink-secondary mt-2 leading-snug">
                {step.description}
              </SheetDescription>
              <div className="flex flex-wrap gap-4 text-[10px] text-ink-muted mt-3">
                <span>Owner · {ROLE_LABEL[step.owner as Role] ?? step.owner}</span>
                <span>{step.required ? "Required gate" : "Optional gate"}</span>
                <span className={record.state === "blocked" ? "text-warning" : "text-ink"}>
                  {STEP_STATE_LABEL[record.state]}
                </span>
              </div>
            </SheetHeader>

            <Section title="Latest decision">
              {record.state === "pending" && !record.by ? (
                <p className="text-[13px] text-ink-muted border-t-hairline pt-4">
                  No decision recorded on this gate yet.
                </p>
              ) : (
                <div className="border-t-hairline pt-4">
                  <div className="text-[13px] leading-snug">
                    <span className={record.state === "blocked" ? "text-warning" : "text-ink"}>
                      {STEP_STATE_LABEL[record.state]}
                    </span>
                    <span className="text-ink-muted">
                      {" "}
                      · {record.by ?? step.owner}
                      {record.date ? ` · ${record.date}` : ""}
                    </span>
                  </div>
                  {record.note && (
                    <p className="text-[11px] text-ink-secondary mt-1 leading-snug">
                      {record.note}
                    </p>
                  )}
                </div>
              )}
            </Section>

            <Section title="Feedback notes">
              {sortedNotes.length === 0 ? (
                <p className="text-[13px] text-ink-muted border-t-hairline pt-4">
                  No editor feedback on this talent&apos;s episodes.
                </p>
              ) : (
                <div>
                  {sortedNotes.map((n) => (
                    <div key={n.id} className="border-t-hairline py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="text-[11px] font-medium">{n.target}</div>
                        <div
                          className={`text-[10px] ${
                            n.state === "blocked" ? "text-warning" : "text-ink-muted"
                          }`}
                        >
                          {FEEDBACK_STATE_LABEL[n.state]}
                        </div>
                      </div>
                      <p className="text-[12px] text-ink-secondary mt-1 leading-snug">{n.body}</p>
                      <div className="text-[9px] font-mono text-ink-muted mt-1">
                        {episodeCode(n.slug)} · {n.by} · {n.createdAt}
                      </div>
                    </div>
                  ))}
                  <div className="border-t-hairline" />
                </div>
              )}
            </Section>

            <Section title="Audit trail">
              <AuditTrail entries={entries} emptyLabel="No recorded changes for this gate." />
            </Section>

            <div className="flex gap-6 text-[11px] mt-8">
              <Link
                to="/talent/$talentId"
                params={{ talentId: talent.id }}
                className="text-ink-muted hover:text-ink transition-colors duration-[var(--dur-fast)]"
              >
                Open talent profile
              </Link>
              <Link
                to="/talent/audit"
                className="text-ink-muted hover:text-ink transition-colors duration-[var(--dur-fast)]"
              >
                Full audit log
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
