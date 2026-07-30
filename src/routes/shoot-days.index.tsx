import { createFileRoute, Link } from "@tanstack/react-router";
import { SHOOT_DAYS, pairEpisodes, type ShootDay } from "@/lib/shoot-days";

export const Route = createFileRoute("/shoot-days/")({
  head: () => {
    const title = "Shoot Days — paired episode schedule | Chi Les";
    const description =
      "Every shoot day pairs exactly two episodes into one schedule, call sheet, and logistics view.";
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
  component: ShootDays,
});

function statusLabel(s: ShootDay["status"]) {
  return s.replace("-", " ");
}

function statusClass(s: ShootDay["status"]) {
  return s === "at-risk" ? "text-warning" : s === "wrapped" ? "text-ink-muted" : "text-ink";
}

function DayRow({ day, delay }: { day: ShootDay; delay: number }) {
  const [a, b] = pairEpisodes(day);
  return (
    <Link
      to="/shoot-days/$dayId"
      params={{ dayId: day.id }}
      className="group grid grid-cols-[220px_1fr_120px] gap-8 border-t-hairline py-6 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-soft)] hover:bg-surface animate-reveal"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted block mb-2">
          {day.dayCode} · {day.date}
        </span>
        <h3 className="text-[16px] font-bold text-ink">{day.city}</h3>
        <p className="text-[11px] text-ink-secondary mt-1.5 tabular-nums">
          Wrap {day.wrap}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border border-hairline">
        {[a, b].map((ep, i) => (
          <div key={i} className="bg-canvas px-4 py-3">
            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              Unit {i === 0 ? "A" : "B"}
            </span>
            <p className="text-[13px] font-bold mt-1.5">{ep?.title ?? "Unassigned"}</p>
            <p className="text-[11px] text-ink-secondary mt-0.5">
              {ep ? `${ep.code} · ${ep.location}` : "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="text-right">
        <span
          className={`text-[8px] font-bold uppercase tracking-[0.12em] ${statusClass(day.status)}`}
        >
          {statusLabel(day.status)}
        </span>
      </div>
    </Link>
  );
}

function ShootDays() {
  const atRisk = SHOOT_DAYS.filter((d) => d.status === "at-risk").length;

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
            <Link to="/shoot-days" className="text-ink">
              Shoot Days
            </Link>
            <Link to="/talent" className="hover:text-ink transition-colors duration-[var(--dur-fast)]">
              Talent Bank
            </Link>
          </div>
        </div>
        <div className="text-[11px] text-ink-secondary">
          <span className="text-warning font-bold tabular-nums">
            {String(atRisk).padStart(2, "0")}
          </span>{" "}
          at risk
        </div>
      </nav>

      <main className="px-8 py-24 max-w-[1440px] mx-auto">
        <header className="mb-8 animate-reveal">
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">
            Shoot Day Planner
          </div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] leading-tight">
            Paired shoot days
          </h1>
          <p className="text-[13px] text-ink-secondary mt-1">
            Two episodes per day — one call sheet, one crew, one logistics plan.
          </p>
        </header>

        <div>
          {SHOOT_DAYS.map((d, i) => (
            <DayRow key={d.id} day={d} delay={80 + i * 60} />
          ))}
          <div className="border-t-hairline" />
        </div>
      </main>
    </div>
  );
}
