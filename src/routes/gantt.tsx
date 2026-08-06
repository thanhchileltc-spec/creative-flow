import { createFileRoute, Link } from "@tanstack/react-router";
import { EPISODES, STAGES, type Episode } from "@/lib/episodes";
import { SHOOT_DAYS } from "@/lib/shoot-days";

export const Route = createFileRoute("/gantt")({
  head: () => {
    const title = "Gantt — everything currently running | Chi Les";
    const description =
      "Stage-by-stage Gantt of every live episode: progress bars, current stage, blockers and shoot days in one grid.";
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
  component: GanttView,
});

const COLS = STAGES.length;

function barClass(ep: Episode) {
  if (ep.status === "blocked") return "bg-warning";
  if (ep.status === "idle") return "bg-border";
  return "bg-ink";
}

function EpisodeRow({ ep, delay }: { ep: Episode; delay: number }) {
  const done = Math.max(0, Math.min(ep.stageIndex, COLS));
  const blockedStage = ep.stages.find((s) => s.status === "blocked" || (s.status === "current" && s.blocker));
  const day = SHOOT_DAYS.find((d) => d.pair.includes(ep.slug));

  return (
    <Link
      to="/episodes/$slug"
      params={{ slug: ep.slug }}
      className="group grid grid-cols-[240px_1fr] gap-6 border-t-hairline py-5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-soft)] hover:bg-surface animate-reveal"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="min-w-0">
        <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted block mb-2">
          {ep.code} · {ep.location}
        </span>
        <h3 className="text-[15px] font-bold text-ink truncate">{ep.title}</h3>
        <p className="text-[11px] text-ink-secondary mt-1">
          {ep.stageLabel}
          {day ? ` · ${day.dayCode}` : ""}
        </p>
      </div>

      <div className="min-w-0">
        <div
          className="relative grid h-8 items-center"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {STAGES.map((_, i) => (
            <div key={i} className="h-full border-l-hairline first:border-l-0" />
          ))}

          {/* progress bar */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 h-[6px] ${barClass(ep)}`}
            style={{ left: 0, width: `${(done / COLS) * 100}%` }}
          />
          {/* remaining */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-px bg-border"
            style={{ left: `${(done / COLS) * 100}%`, right: 0 }}
          />
          {/* current stage marker */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-hairline ${
              ep.status === "blocked" ? "bg-warning" : "bg-canvas"
            }`}
            style={{
              left: `calc(${(done / COLS) * 100}% - 6px)`,
              borderColor: "currentColor",
            }}
          />
        </div>
        <p className="text-[11px] mt-2 text-ink-secondary">
          {blockedStage?.blocker ? (
            <span className="text-warning">{blockedStage.blocker}</span>
          ) : (
            <span className="tabular-nums">
              {done}/{COLS} stages complete
              {ep.shootWindow ? ` · ${ep.shootWindow}` : ""}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

function GanttView() {
  const running = EPISODES.filter((e) => e.stageIndex < COLS + 1);
  const blocked = running.filter((e) => e.status === "blocked").length;

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
            <Link to="/gantt" className="text-ink">
              Gantt
            </Link>
            <Link to="/shoot-days" className="hover:text-ink transition-colors duration-[var(--dur-fast)]">
              Shoot Days
            </Link>
            <Link to="/talent" className="hover:text-ink transition-colors duration-[var(--dur-fast)]">
              Talent Bank
            </Link>
            <Link to="/handoff" className="hover:text-ink transition-colors duration-[var(--dur-fast)]">
              Editor Handoff
            </Link>
          </div>
        </div>
        <div className="text-[11px] text-ink-secondary">
          <span className="text-warning font-bold tabular-nums">
            {String(blocked).padStart(2, "0")}
          </span>{" "}
          blocked
        </div>
      </nav>

      <main className="px-8 py-24 max-w-[1440px] mx-auto">
        <header className="mb-10 animate-reveal">
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">
            Production Gantt
          </div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] leading-tight">
            Everything currently running
          </h1>
          <p className="text-[13px] text-ink-secondary mt-1">
            {running.length} episodes across eight stages — bar length is progress, the dot is where the work sits today.
          </p>
        </header>

        {/* stage header */}
        <div className="grid grid-cols-[240px_1fr] gap-6 pb-3">
          <div />
          <div
            className="grid text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {STAGES.map((s) => (
              <div key={s} className="pl-2 border-l-hairline first:border-l-0 first:pl-0 truncate">
                {s}
              </div>
            ))}
          </div>
        </div>

        <div>
          {running.map((ep, i) => (
            <EpisodeRow key={ep.slug} ep={ep} delay={80 + i * 50} />
          ))}
          <div className="border-t-hairline" />
        </div>

        {/* shoot day band */}
        <section className="mt-16 animate-reveal" style={{ animationDelay: "320ms" }}>
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-4">
            Shoot days on the board
          </div>
          <div className="grid md:grid-cols-4 gap-px bg-border border-hairline">
            {SHOOT_DAYS.map((d) => (
              <Link
                key={d.id}
                to="/shoot-days/$dayId"
                params={{ dayId: d.id }}
                className="bg-canvas px-4 py-4 hover:bg-surface transition-colors duration-[var(--dur-fast)]"
              >
                <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                  {d.dayCode} · {d.date}
                </span>
                <p className="text-[13px] font-bold mt-1.5">{d.city}</p>
                <p
                  className={`text-[11px] mt-1 ${
                    d.status === "at-risk" ? "text-warning" : "text-ink-secondary"
                  }`}
                >
                  {d.status.replace("-", " ")} · wrap {d.wrap}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
