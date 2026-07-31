import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  TALENT,
  APPROVAL_ORDER,
  APPROVAL_LABEL,
  episodeCode,
  type ApprovalStatus,
  type TalentProfile,
} from "@/lib/talent-bank";
import { useWorkflow, progressFor, type WorkflowStep } from "@/lib/approval-workflow";
import { ApprovalTrack } from "@/components/approval-track";

type Filter = ApprovalStatus | "all";


export const Route = createFileRoute("/talent/")({
  validateSearch: (search: Record<string, unknown>): { status?: Filter } => {
    const s = String(search.status ?? "all");
    return {
      status: (APPROVAL_ORDER as string[]).includes(s) ? (s as ApprovalStatus) : "all",
    };
  },
  head: () => {
    const title = "Talent Bank — sourcing, discovery calls, approvals | Chi Les";
    const description =
      "Every sourced talent in one place: where they came from, what the discovery call revealed, story fit, and approval status across episodes.";
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
  component: TalentBank,
});

function approvalClass(a: ApprovalStatus) {
  if (a === "approved") return "text-ink";
  if (a === "passed") return "text-ink-muted line-through";
  if (a === "in-review" || a === "call-scheduled") return "text-warning";
  return "text-ink-secondary";
}

function FitBar({ score }: { score: number }) {
  return (
    <span className="inline-flex gap-[3px] items-center" aria-label={`Story fit ${score} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`block h-[2px] w-[10px] ${n <= score ? "bg-ink" : "bg-ink-muted/25"}`}
        />
      ))}
    </span>
  );
}

function TalentRow({ t, delay, steps }: { t: TalentProfile; delay: number; steps: WorkflowStep[] }) {
  const lastCall = t.calls[t.calls.length - 1];
  const p = progressFor(t.id, steps);
  return (
    <Link
      to="/talent/$talentId"
      params={{ talentId: t.id }}
      className="group grid grid-cols-[1fr] md:grid-cols-[260px_1fr_150px_170px] gap-4 md:gap-8 border-t-hairline py-6 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-soft)] hover:bg-surface animate-reveal"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <div className="text-[15px] font-bold tracking-[-0.02em] leading-tight">{t.name}</div>
        <div className="text-[11px] text-ink-secondary mt-1">
          {t.craft} · {t.location}
        </div>
        <div className="text-[10px] text-ink-muted mt-1 font-mono">
          Sourced {t.sourcedOn} · {t.sourcedVia}
        </div>
      </div>

      <div className="max-w-[560px]">
        <div className="flex items-center gap-3 mb-1">
          <FitBar score={t.storyFit.score} />
          <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Story fit
          </span>
        </div>
        <p className="text-[13px] text-ink-secondary leading-snug">{t.storyFit.note}</p>
        {t.storyFit.risk && (
          <p className="text-[11px] text-warning mt-1 leading-snug">{t.storyFit.risk}</p>
        )}
      </div>

      <div className="text-[11px] text-ink-secondary">
        <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-1">
          Discovery
        </div>
        {lastCall ? (
          <>
            <div className="font-mono tabular-nums">{lastCall.date}</div>
            <div className="text-ink-muted">
              {t.calls.length} call{t.calls.length > 1 ? "s" : ""} · {lastCall.interviewer}
            </div>
          </>
        ) : (
          <div className="text-ink-muted">Not scheduled</div>
        )}
      </div>

      <div>
        <div className={`text-[13px] font-medium ${approvalClass(t.approval)}`}>
          {APPROVAL_LABEL[t.approval]}
        </div>
        <div className="mt-2">
          <ApprovalTrack talentId={t.id} steps={steps} />
        </div>
        <div className="text-[10px] mt-1 leading-snug">
          {p.blocked ? (
            <span className="text-warning">Blocked · {p.blocked.label}</span>
          ) : p.current ? (
            <span className="text-ink-muted">
              Next · {p.current.label} ({p.current.owner})
            </span>
          ) : (
            <span className="text-ink-muted">All steps cleared</span>
          )}
        </div>
        <div className="text-[10px] text-ink-muted mt-1 font-mono">
          {t.episodes.map((s) => episodeCode(s)).join(", ")}
        </div>
      </div>
    </Link>
  );
}


function TalentBank() {
  const { status = "all" } = Route.useSearch();
  const navigate = useNavigate();
  const [steps] = useWorkflow();
  const rows = status === "all" ? TALENT : TALENT.filter((t) => t.approval === status);

  const needsAction = TALENT.filter(
    (t) => t.approval === "sourced" || t.approval === "call-scheduled" || t.approval === "in-review",
  ).length;

  const filters: Filter[] = ["all", ...APPROVAL_ORDER];

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
          </div>
        </div>
        <div className="text-[11px] text-ink-secondary">
          <span className="text-warning font-bold tabular-nums">
            {String(needsAction).padStart(2, "0")}
          </span>{" "}
          awaiting decision
        </div>
      </nav>

      <main className="px-8 py-24 max-w-[1440px] mx-auto">
        <header className="mb-8 animate-reveal">
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">
            Talent Bank
          </div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] leading-tight">
            Sourced talent across episodes
          </h1>
          <p className="text-[13px] text-ink-secondary mt-1">
            Where they came from, what the discovery call revealed, and whether they are approved.
          </p>
        </header>

        <div
          className="flex flex-wrap gap-6 pb-5 text-[11px] animate-reveal"
          style={{ animationDelay: "40ms" }}
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() =>
                navigate({ to: "/talent", search: { status: f } })
              }
              className={`transition-colors duration-[var(--dur-fast)] ${
                status === f ? "text-ink font-medium" : "text-ink-muted hover:text-ink-secondary"
              }`}
            >
              {f === "all" ? "All" : APPROVAL_LABEL[f]}
              <span className="ml-2 tabular-nums text-ink-muted">
                {f === "all" ? TALENT.length : TALENT.filter((t) => t.approval === f).length}
              </span>
            </button>
          ))}
        </div>

        <div>
          {rows.map((t, i) => (
            <TalentRow key={t.id} t={t} delay={80 + i * 50} steps={steps} />
          ))}
          <div className="border-t-hairline" />
          {rows.length === 0 && (
            <p className="text-[13px] text-ink-muted py-10">No talent in this state.</p>
          )}
        </div>
      </main>
    </div>
  );
}
