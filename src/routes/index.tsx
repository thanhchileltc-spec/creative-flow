import { createFileRoute, Link } from "@tanstack/react-router";
import { EPISODES, STAGES, type Episode, type EpisodeStatus, type Role } from "@/lib/episodes";

export const Route = createFileRoute("/")({
  component: Pipeline,
});


function Avatar({ role }: { role: Role }) {
  return (
    <div
      className="size-6 rounded-full border-hairline border-[color:var(--color-border)] bg-surface flex items-center justify-center text-[8px] font-bold text-ink-secondary tracking-tight"
      title={role}
    >
      {role}
    </div>
  );
}

function StageMarker({ status, label }: { status: EpisodeStatus; label: string }) {
  const dot =
    status === "blocked"
      ? "size-2.5 rotate-45 bg-warning"
      : status === "active"
        ? "size-2.5 rounded-full bg-ink"
        : status === "idle"
          ? "size-2 rounded-full border-hairline border-[color:var(--color-border-strong)] bg-canvas"
          : "size-2.5 rounded-full bg-ink";

  const labelColor =
    status === "blocked" ? "text-warning" : "text-ink-secondary";

  return (
    <div className="flex flex-col items-center relative">
      <div className={dot} />
      {label ? (
        <span
          className={`absolute top-[calc(100%+6px)] whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.08em] ${labelColor}`}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

function EpisodeRow({ ep }: { ep: Episode }) {
  const isBlocked = ep.status === "blocked";

  return (
    <Link
      to="/episodes/$slug"
      params={{ slug: ep.slug }}
      className="group grid grid-cols-[320px_1fr] border-t-hairline transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-soft)] hover:bg-surface animate-reveal"
      style={{ animationDelay: `${ep.delay}ms` }}
    >
      <div className="py-6 pr-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className={`text-[8px] font-bold mb-2 block uppercase tracking-[0.12em] ${
                isBlocked ? "text-warning" : "text-ink-muted"
              }`}
            >
              {isBlocked ? ep.code : `${ep.code} · ${ep.location}`}
            </span>
            <h3 className="text-[16px] font-bold text-ink group-hover:text-ink transition-colors">
              {ep.title}
            </h3>
            <p className="text-[11px] text-ink-secondary mt-1.5">{ep.meta}</p>
          </div>
          <div className="flex -space-x-1 shrink-0">
            {ep.roles.map((r, i) => (
              <Avatar key={i} role={r} />
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-8 items-center px-4 relative h-full">
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-px bg-border" />
        <div className="z-10 flex justify-center" style={{ gridColumnStart: ep.stageIndex }}>
          <StageMarker status={ep.status} label={ep.stageLabel} />
        </div>
      </div>
    </Link>
  );
}

function Pipeline() {
  const stalled = EPISODES.filter((e) => e.status === "blocked").length;

  return (
    <div className="min-h-screen bg-canvas text-ink">

      <main className="px-8 py-24 max-w-[1440px] mx-auto">
        {/* Section header */}
        <div className="grid grid-cols-[320px_1fr] mb-8 items-end">
          <div className="pb-4">
            <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">
              Production Pipeline
            </div>
            <h1 className="text-[22px] font-bold tracking-[-0.02em] leading-tight">
              Episode overview
            </h1>
            <p className="text-[13px] text-ink-secondary mt-1">
              Active cycle — Autumn Series 04
            </p>
          </div>
          <div className="grid grid-cols-8 text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted border-b-hairline pb-4 px-4">
            {STAGES.map((s, i) => (
              <div key={s} className="px-2 text-center" style={{ gridColumnStart: i + 1 }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        <div>
          {EPISODES.map((ep, i) => (
            <EpisodeRow key={i} ep={ep} />
          ))}
          <div className="border-t-hairline" />
        </div>

        {/* Footer meta */}
        <footer
          className="mt-24 pt-8 border-t-hairline flex justify-between items-center text-[11px] text-ink-secondary animate-reveal"
          style={{ animationDelay: "400ms" }}
        >
          <div className="flex gap-12">
            <div>
              <span className="text-ink-muted uppercase tracking-[0.12em] text-[8px] font-bold mr-3">Load</span>
              <span className="text-ink">82%</span>
            </div>
            <div>
              <span className="text-ink-muted uppercase tracking-[0.12em] text-[8px] font-bold mr-3">Post queue</span>
              <span className="text-ink">04 episodes</span>
            </div>
          </div>
          <div className="text-right">
            11:42 · Shoot active in Bologna
          </div>
        </footer>
      </main>
    </div>
  );
}
