import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getShootDay, pairEpisodes, type ShootDay, type LogisticsItem } from "@/lib/shoot-days";
import type { Episode } from "@/lib/episodes";

export const Route = createFileRoute("/shoot-days/$dayId")({
  loader: ({ params }) => {
    const day = getShootDay(params.dayId);
    if (!day) throw notFound();
    const [a, b] = pairEpisodes(day);
    return { day, a, b };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Shoot day not found — Chi Les" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { day, a, b } = loaderData;
    const title = `${day.dayCode} · ${day.city} — Shoot Day | Chi Les`;
    const description = `Paired shoot day: ${a?.title ?? "Unit A"} + ${b?.title ?? "Unit B"} — schedule, call sheet and logistics in one view.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ShootDayDetail,
});

function unitTag(unit: "A" | "B" | "both") {
  return unit === "both" ? "A+B" : `Unit ${unit}`;
}

function logisticsClass(s: LogisticsItem["status"]) {
  if (s === "risk") return "text-warning";
  if (s === "pending") return "text-ink-secondary";
  return "text-ink";
}

function UnitCard({ ep, unit }: { ep: Episode | undefined; unit: "A" | "B" }) {
  if (!ep) {
    return (
      <div className="px-6 py-6 bg-canvas">
        <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Unit {unit}
        </span>
        <p className="text-[15px] font-bold mt-2 text-ink-secondary">Unassigned</p>
      </div>
    );
  }
  return (
    <Link
      to="/episodes/$slug"
      params={{ slug: ep.slug }}
      className="group px-6 py-6 bg-canvas hover:bg-surface transition-colors duration-[var(--dur-fast)]"
    >
      <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
        Unit {unit} · {ep.code}
      </span>
      <h2 className="text-[18px] font-bold mt-2 tracking-[-0.02em]">{ep.title}</h2>
      <p className="text-[11px] text-ink-secondary mt-1.5">{ep.location}</p>
      {ep.logline ? (
        <p className="text-[12px] text-ink-secondary mt-3 leading-relaxed">{ep.logline}</p>
      ) : null}
      <span className="mt-4 inline-block text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted group-hover:text-ink transition-colors">
        Open episode →
      </span>
    </Link>
  );
}

function ShootDayDetail() {
  const { day, a, b } = Route.useLoaderData() as {
    day: ShootDay;
    a?: Episode;
    b?: Episode;
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
            <Link to="/shoot-days" className="text-ink">
              Shoot Days
            </Link>
          </div>
        </div>
        <Link
          to="/shoot-days"
          className="text-[11px] uppercase tracking-[0.12em] text-ink-secondary hover:text-ink transition-colors"
        >
          ← All shoot days
        </Link>
      </nav>

      <main className="px-8 py-16 max-w-[1120px] mx-auto">
        {/* Header */}
        <section className="pb-10 border-b-hairline animate-reveal">
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">
            Shoot Day · {day.status.replace("-", " ")}
          </div>
          <h1 className="text-[26px] font-bold tracking-[-0.02em] leading-tight">
            {day.dayCode} — {day.city}
          </h1>
          <p className="text-[13px] text-ink-secondary mt-2 tabular-nums">
            {day.date} · Wrap {day.wrap}
          </p>
          {day.note ? (
            <p
              className={`text-[12px] mt-4 max-w-[560px] leading-relaxed ${
                day.status === "at-risk" ? "text-warning" : "text-ink-secondary"
              }`}
            >
              {day.note}
            </p>
          ) : null}
        </section>

        {/* The pairing — exactly two episodes */}
        <section className="mt-12 animate-reveal" style={{ animationDelay: "80ms" }}>
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-4">
            The pairing — two episodes, one day
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border-hairline">
            <UnitCard ep={a} unit="A" />
            <UnitCard ep={b} unit="B" />
          </div>
        </section>

        {/* Schedule + call sheet */}
        <section className="mt-16 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 animate-reveal" style={{ animationDelay: "160ms" }}>
          <div>
            <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-4">
              Schedule
            </div>
            <div className="border-t-hairline">
              {day.schedule.map((block, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[64px_1fr_60px] gap-4 py-3.5 border-b-hairline items-baseline"
                >
                  <span className="text-[12px] font-bold tabular-nums">{block.time}</span>
                  <div>
                    <p className="text-[13px]">{block.label}</p>
                    {block.note ? (
                      <p className="text-[11px] text-ink-secondary mt-0.5">{block.note}</p>
                    ) : null}
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted text-right">
                    {unitTag(block.unit)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-4">
              Call sheet
            </div>
            <div className="border-t-hairline">
              {day.crew.map((c, i) => (
                <div key={i} className="py-3.5 border-b-hairline flex items-baseline justify-between gap-4">
                  <div>
                    <p className="text-[13px]">{c.name}</p>
                    <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mt-1">
                      {c.role} · {unitTag(c.unit)}
                    </p>
                  </div>
                  <span className="text-[12px] font-bold tabular-nums shrink-0">{c.call}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Logistics */}
        <section className="mt-16 animate-reveal" style={{ animationDelay: "240ms" }}>
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-4">
            Logistics
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border-hairline">
            {day.logistics.map((item, i) => (
              <div key={i} className="bg-canvas px-5 py-5">
                <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted block">
                  {item.label}
                </span>
                <p className={`text-[13px] mt-2 leading-snug ${logisticsClass(item.status)}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
