import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  getTalent,
  APPROVAL_LABEL,
  episodeCode,
  episodeTitle,
  type ApprovalStatus,
  type TalentProfile,
} from "@/lib/talent-bank";
import {
  useWorkflow,
  progressFor,
  stepRecord,
  setStepRecord,
  useStepRecords,
  STEP_STATE_LABEL,
  type StepState,
  type WorkflowStep,
} from "@/lib/approval-workflow";
import { stateClass } from "@/components/approval-track";
import { RoleSwitcher } from "@/components/role-switcher";
import { allowedStates, canActOnStep, denialReason, useRole, type Role } from "@/lib/roles";



export const Route = createFileRoute("/talent/$talentId")({
  loader: ({ params }): { talent: TalentProfile } => {
    const talent = getTalent(params.talentId);
    if (!talent) throw notFound();
    return { talent };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Talent not found | Chi Les" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = loaderData.talent;
    const title = `${t.name} — ${t.craft} | Talent Bank`;
    const description = `${t.name}, ${t.craft} in ${t.location}. ${APPROVAL_LABEL[t.approval]} · ${t.calls.length} discovery call${t.calls.length === 1 ? "" : "s"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-canvas text-ink px-8 py-24">
      <p role="alert" className="text-[13px] text-warning">
        {error.message}
      </p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-canvas text-ink px-8 py-24">
      <h1 className="text-[22px] font-bold tracking-[-0.02em]">Talent not found</h1>
      <Link to="/talent" className="text-[13px] text-ink-secondary hover:text-ink mt-3 inline-block">
        Back to Talent Bank
      </Link>
    </div>
  ),
  component: TalentDetail,
});

function approvalClass(a: ApprovalStatus) {
  if (a === "approved") return "text-ink";
  if (a === "passed") return "text-ink-muted";
  if (a === "in-review" || a === "call-scheduled") return "text-warning";
  return "text-ink-secondary";
}

function outcomeLabel(o: "advance" | "hold" | "pass") {
  return o === "advance" ? "Advance" : o === "hold" ? "Hold" : "Pass";
}

function today() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/** Right-hand column: state + the controls the acting role is allowed to use. */
function StepControls({
  talentId,
  talentName,
  step,
  role,
}: {
  talentId: string;
  talentName: string;
  step: WorkflowStep;
  role: Role;
}) {
  const r = stepRecord(talentId, step.id);
  const can = canActOnStep(role, step);
  const options = allowedStates(role, step);
  const [note, setNote] = useState("");

  const set = (state: StepState) => {
    const trimmed = note.trim();
    setStepRecord(talentId, step.id, {
      ...r,
      state,
      by: role,
      date: today(),
      note: trimmed || r.note,
    });
    recordAudit({
      talentId,
      talentName,
      stepId: step.id,
      stepLabel: step.label,
      from: r.state,
      to: state,
      by: role,
      note: trimmed || undefined,
    });
    setNote("");
  };

  return (
    <div className="text-right">
      <div
        className={`text-[13px] ${
          r.state === "blocked"
            ? "text-warning"
            : r.state === "cleared"
              ? "text-ink"
              : "text-ink-secondary"
        }`}
      >
        {STEP_STATE_LABEL[r.state]}
      </div>
      <div className="text-[10px] text-ink-muted font-mono mt-1">
        {r.by ? `${r.by}${r.date ? ` · ${r.date}` : ""}` : `Owner ${step.owner}`}
      </div>

      {can ? (
        <div className="mt-3 flex flex-col items-end gap-2">
          <label className="sr-only" htmlFor={`note-${step.id}`}>
            Note for {step.label}
          </label>
          <input
            id={`note-${step.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note for the log"
            className="w-[170px] bg-transparent text-[11px] text-ink text-right placeholder:text-ink-muted border-b-hairline border-[color:var(--color-border)] focus:border-[color:var(--color-ink)] outline-none pb-[2px]"
          />
          <label className="sr-only" htmlFor={`state-${step.id}`}>
            {step.label} state
          </label>
          <select
            id={`state-${step.id}`}
            value={r.state}
            onChange={(e) => set(e.target.value as StepState)}
            className="bg-transparent text-[11px] text-ink text-right border-b-hairline border-[color:var(--color-border)] focus:border-[color:var(--color-ink)] outline-none pb-[2px]"
          >
            {options.map((o) => (
              <option key={o} value={o}>
                {STEP_STATE_LABEL[o]}
              </option>
            ))}
          </select>
          {r.state !== "cleared" && (
            <button
              onClick={() => set("cleared")}
              className="px-3 py-1 bg-ink text-canvas text-[11px] font-medium hover:bg-ink-secondary transition-colors duration-[var(--dur-fast)]"
            >
              Advance
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3 text-[10px] text-ink-muted leading-snug max-w-[150px] ml-auto">
          {denialReason(role, step)}
        </div>
      )}
    </div>
  );
}


function TalentDetail() {
  const { talent: t } = Route.useLoaderData() as { talent: TalentProfile };
  const [steps] = useWorkflow();
  const [role] = useRole();
  useStepRecords();
  const progress = progressFor(t.id, steps);




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
            <Link to="/talent" className="text-ink">
              Talent Bank
            </Link>
            <Link to="/handoff" className="hover:text-ink transition-colors duration-[var(--dur-fast)]">
              Editor Handoff
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <RoleSwitcher />
          <Link to="/talent" className="text-[11px] text-ink-secondary hover:text-ink">
            ← All talent
          </Link>
        </div>

      </nav>

      <main className="px-8 py-24 max-w-[1100px] mx-auto">
        <header className="animate-reveal">
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">
            {t.craft} · {t.location}
          </div>
          <h1 className="text-[34px] font-bold tracking-[-0.03em] leading-tight">{t.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className={`text-[13px] font-medium ${approvalClass(t.approval)}`}>
              {APPROVAL_LABEL[t.approval]}
            </span>
            <span className="text-[11px] text-ink-muted font-mono tabular-nums">
              {progress.cleared}/{progress.total} steps cleared
            </span>
          </div>
        </header>

        {/* Approval workflow */}
        <section className="mt-12 animate-reveal" style={{ animationDelay: "40ms" }}>
          <div className="flex items-baseline justify-between mb-4">
            <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              Approval workflow
            </div>
            <Link
              to="/talent/workflow"
              className="text-[11px] text-ink-muted hover:text-ink transition-colors duration-[var(--dur-fast)]"
            >
              Configure steps
            </Link>
          </div>

          {steps.map((s, i) => {
            const r = stepRecord(t.id, s.id);
            return (
              <div
                key={s.id}
                className="grid grid-cols-[24px_1fr_150px] gap-6 items-start border-t-hairline py-5"
              >
                <div className="pt-1">
                  <span className={`block h-[3px] w-[16px] ${stateClass(r.state)}`} />
                  <span className="block text-[9px] font-mono text-ink-muted mt-2 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <div className="text-[15px] font-bold tracking-[-0.02em]">
                    {s.label}
                    {!s.required && (
                      <span className="ml-2 text-[10px] font-normal text-ink-muted uppercase tracking-[0.12em]">
                        Optional
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-[13px] text-ink-secondary mt-1 leading-snug max-w-[560px]">
                      {s.description}
                    </p>
                  )}
                  {r.note && (
                    <p
                      className={`text-[11px] mt-1 leading-snug ${
                        r.state === "blocked" ? "text-warning" : "text-ink-muted"
                      }`}
                    >
                      {r.note}
                    </p>
                  )}
                </div>
                <StepControls talentId={t.id} step={s} role={role} />

              </div>
            );
          })}
          <div className="border-t-hairline" />
        </section>

        {/* Sourcing record */}

        <section
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-6 border-t-hairline animate-reveal"
          style={{ animationDelay: "60ms" }}
        >
          {[
            ["Sourced by", t.sourcedBy],
            ["Sourced on", t.sourcedOn],
            ["Channel", t.sourcedVia],
            ["Contact", t.contact],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-2">
                {label}
              </div>
              <div className="text-[13px]">{value}</div>
            </div>
          ))}
        </section>

        {/* Story fit */}
        <section className="mt-14 animate-reveal" style={{ animationDelay: "100ms" }}>
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-4">
            Story fit
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex gap-[3px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`block h-[3px] w-[16px] ${n <= t.storyFit.score ? "bg-ink" : "bg-ink-muted/25"}`}
                />
              ))}
            </span>
            <span className="text-[11px] tabular-nums text-ink-secondary">
              {t.storyFit.score} / 5
            </span>
          </div>
          <p className="text-[15px] leading-relaxed max-w-[640px]">{t.storyFit.note}</p>
          {t.storyFit.risk && (
            <p className="text-[13px] text-warning mt-3 max-w-[640px] leading-snug">
              {t.storyFit.risk}
            </p>
          )}
        </section>

        {/* Discovery calls */}
        <section className="mt-14 animate-reveal" style={{ animationDelay: "140ms" }}>
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-4">
            Discovery calls
          </div>
          {t.calls.length === 0 ? (
            <p className="text-[13px] text-ink-muted border-t-hairline pt-5">
              No discovery call logged yet.
            </p>
          ) : (
            <div>
              {t.calls.map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[110px_1fr_90px] gap-6 border-t-hairline py-5"
                >
                  <div>
                    <div className="text-[13px] font-mono tabular-nums">{c.date}</div>
                    <div className="text-[10px] text-ink-muted mt-1">{c.duration}</div>
                  </div>
                  <div>
                    <p className="text-[13px] leading-snug">{c.summary}</p>
                    <div className="text-[10px] text-ink-muted mt-1">Led by {c.interviewer}</div>
                  </div>
                  <div
                    className={`text-[11px] text-right ${
                      c.outcome === "pass"
                        ? "text-ink-muted"
                        : c.outcome === "hold"
                          ? "text-warning"
                          : "text-ink"
                    }`}
                  >
                    {outcomeLabel(c.outcome)}
                  </div>
                </div>
              ))}
              <div className="border-t-hairline" />
            </div>
          )}
        </section>

        {/* Episodes */}
        <section className="mt-14 animate-reveal" style={{ animationDelay: "180ms" }}>
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-4">
            Attached to
          </div>
          {t.episodes.map((slug) => (
            <Link
              key={slug}
              to="/episodes/$slug"
              params={{ slug }}
              className="grid grid-cols-[110px_1fr] gap-6 border-t-hairline py-5 hover:bg-surface transition-colors duration-[var(--dur-fast)]"
            >
              <div className="text-[11px] text-ink-muted font-mono">{episodeCode(slug)}</div>
              <div className="text-[15px] font-bold tracking-[-0.02em]">{episodeTitle(slug)}</div>
            </Link>
          ))}
          <div className="border-t-hairline" />
        </section>
      </main>
    </div>
  );
}
