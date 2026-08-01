import { createFileRoute, Link } from "@tanstack/react-router";
import { handoffsInOrder, handoffEpisode, readiness, type Handoff } from "@/lib/handoff";

export const Route = createFileRoute("/handoff/")({
  head: () => {
    const title = "Editor Handoff — ready for edit briefs | Chi Les";
    const description =
      "Compile director treatment, DP notes, and tech specs into a single ready-for-edit brief for every episode entering post.";
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
  component: HandoffIndex,
});

export function verdictClass(v: string) {
  if (v === "not-ready") return "text-warning";
  if (v === "conditional") return "text-ink-secondary";
  return "text-ink";
}

function HandoffRow({ h, delay }: { h: Handoff; delay: number }) {
  const ep = handoffEpisode(h);
  const r = readiness(h);
  return (
    <Link
      to="/handoff/$slug"
      params={{ slug: h.slug }}
      className="group grid grid-cols-[240px_1fr_180px_120px] gap-8 border-t-hairline py-6 items-baseline transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-soft)] hover:bg-surface animate-reveal"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted block mb-2">
          {ep?.code ?? "—"} · {ep?.location ?? "—"}
        </span>
        <h3 className="text-[16px] font-bold text-ink">{ep?.title ?? h.slug}</h3>
      </div>

      <div>
        <p className="text-[12px] text-ink-secondary max-w-[54ch] leading-snug">
          {h.narrativeSpine ?? h.treatment[0]?.body}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex gap-[3px]">
            {h.checklist.map((c, i) => (
              <span
                key={i}
                title={`${c.label} · ${c.status}`}
                className={`block h-[3px] w-[14px] ${
                  c.status === "ready"
                    ? "bg-ink"
                    : c.status === "pending"
                      ? "bg-ink-muted/50"
                      : "bg-warning"
                }`}
              />
            ))}
          </span>
          <span className="font-mono text-[10px] tabular-nums text-ink-muted">
            {r.ready}/{r.total}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-ink-secondary">
        <div className="text-ink">{h.editor}</div>
        <div className="tabular-nums mt-1">{h.editWindow}</div>
      </div>

      <div
        className={`text-right text-[8px] font-bold uppercase tracking-[0.12em] ${verdictClass(
          r.verdict,
        )}`}
      >
        {r.verdict.replace("-", " ")}
      </div>
    </Link>
  );
}

function HandoffIndex() {
  const rows = handoffsInOrder();
  const blocked = rows.filter((h) => readiness(h).verdict === "not-ready").length;

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
            <Link to="/shoot-days" className="hover:text-ink transition-colors duration-[var(--dur-fast)]">
              Shoot Days
            </Link>
            <Link to="/talent" className="hover:text-ink transition-colors duration-[var(--dur-fast)]">
              Talent Bank
            </Link>
            <Link to="/handoff" className="text-ink">
              Editor Handoff
            </Link>
          </div>
        </div>
        <span className="text-[11px] text-ink-secondary tabular-nums">
          {blocked} not ready
        </span>
      </nav>

      <main className="px-8 py-16 max-w-[1120px] mx-auto">
        <header className="pb-12 border-b-hairline animate-reveal">
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-4">
            Post handoff
          </div>
          <h1 className="text-[40px] leading-[1.05] font-bold tracking-[-0.03em]">
            Editor Handoff
          </h1>
          <p className="text-[15px] text-ink-secondary mt-4 max-w-[58ch]">
            Director treatment, DP notes and tech specs compiled into one brief the
            editor can open on day one of the three-day edit.
          </p>
        </header>

        <section className="mt-12">
          {rows.map((h, i) => (
            <HandoffRow key={h.slug} h={h} delay={60 + i * 40} />
          ))}
          <div className="border-t-hairline" />
        </section>
      </main>
    </div>
  );
}
