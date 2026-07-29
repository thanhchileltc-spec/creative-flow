import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getEpisode, STAGES, type Episode, type StageDetail, type StageDoc, type TalentRecord } from "@/lib/episodes";

export const Route = createFileRoute("/episodes/$slug")({
  loader: ({ params }) => {
    const episode = getEpisode(params.slug);
    if (!episode) throw notFound();
    return { episode };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Episode not found — Chi Les" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { episode } = loaderData;
    const title = `${episode.title} — Chi Les`;
    const description =
      episode.logline ??
      `${episode.title} · ${episode.location} · ${episode.stageLabel || STAGES[episode.stageIndex - 1]}`;
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
  component: EpisodeDetail,
});

function statusDot(status: StageDetail["status"]) {
  if (status === "blocked") return "size-2 rotate-45 bg-warning";
  if (status === "current") return "size-2 rounded-full bg-ink";
  if (status === "done") return "size-2 rounded-full bg-ink-muted";
  return "size-2 rounded-full border-hairline border-[color:var(--color-border-strong)] bg-canvas";
}

function docStatusLabel(s: StageDoc["status"]) {
  return s.replace("-", " ");
}

function docStatusClass(s: StageDoc["status"]) {
  if (s === "missing") return "text-warning";
  if (s === "locked") return "text-ink";
  return "text-ink-secondary";
}

function talentStatusClass(s: TalentRecord["status"]) {
  if (s === "declined") return "text-warning";
  if (s === "confirmed") return "text-ink";
  return "text-ink-secondary";
}

function EpisodeDetail() {
  const { episode } = Route.useLoaderData() as { episode: Episode };
  const isBlocked = episode.status === "blocked";
  const currentStage = episode.stages.find((s: StageDetail) => s.status === "current" || s.status === "blocked");

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
          </div>
        </div>
        <Link
          to="/"
          className="text-[11px] uppercase tracking-[0.12em] text-ink-secondary hover:text-ink transition-colors"
        >
          ← Back to pipeline
        </Link>
      </nav>

      <main className="px-8 py-16 max-w-[1120px] mx-auto">
        {/* Header */}
        <section className="grid grid-cols-[1fr_320px] gap-12 pb-12 border-b-hairline animate-reveal">
          <div>
            <div
              className={`text-[8px] font-bold uppercase tracking-[0.12em] mb-4 ${
                isBlocked ? "text-warning" : "text-ink-muted"
              }`}
            >
              {isBlocked ? "Blocked — Action Required" : `${episode.code} · ${episode.location}`}
            </div>
            <h1 className="text-[40px] leading-[1.05] font-bold tracking-[-0.03em]">
              {episode.title}
            </h1>
            {episode.logline ? (
              <p className="text-[15px] text-ink-secondary mt-4 max-w-[52ch]">
                {episode.logline}
              </p>
            ) : null}
          </div>
          <dl className="text-[11px] space-y-3 pt-2">
            <div className="flex justify-between border-b-hairline pb-2">
              <dt className="text-ink-muted uppercase tracking-[0.12em] text-[8px] font-bold">Stage</dt>
              <dd className="text-ink tabular-nums">
                {STAGES[episode.stageIndex - 1]}
                {episode.stageLabel ? ` · ${episode.stageLabel}` : ""}
              </dd>
            </div>
            {episode.shootWindow ? (
              <div className="flex justify-between border-b-hairline pb-2">
                <dt className="text-ink-muted uppercase tracking-[0.12em] text-[8px] font-bold">Shoot</dt>
                <dd className="text-ink">{episode.shootWindow}</dd>
              </div>
            ) : null}
            {episode.pairedWith ? (
              <div className="flex justify-between border-b-hairline pb-2">
                <dt className="text-ink-muted uppercase tracking-[0.12em] text-[8px] font-bold">Paired</dt>
                <dd className="text-ink">{episode.pairedWith}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-b-hairline pb-2">
              <dt className="text-ink-muted uppercase tracking-[0.12em] text-[8px] font-bold">Roles</dt>
              <dd className="text-ink font-mono tracking-[0.08em]">{episode.roles.join(" · ")}</dd>
            </div>
          </dl>
        </section>

        {/* Current blocker banner */}
        {currentStage?.blocker ? (
          <section
            className="mt-12 grid grid-cols-[180px_1fr] gap-8 py-6 border-b-hairline animate-reveal"
            style={{ animationDelay: "60ms" }}
          >
            <div
              className={`text-[8px] font-bold uppercase tracking-[0.12em] ${
                isBlocked ? "text-warning" : "text-ink-muted"
              }`}
            >
              {isBlocked ? "Blocker" : "Current blocker"}
            </div>
            <div>
              <p className="text-[16px] text-ink leading-snug max-w-[62ch]">
                {currentStage.blocker}
              </p>
              <p className="text-[11px] text-ink-secondary mt-2">
                Owner: {episode.roles[0] ?? "EP"} · Stage: {currentStage.name}
              </p>
            </div>
          </section>
        ) : null}

        {/* Stages with docs + per-stage blockers */}
        <section className="mt-16 animate-reveal" style={{ animationDelay: "120ms" }}>
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-6">
            Stage-by-stage
          </div>
          <div>
            {episode.stages.map((stage) => (
              <StageBlock key={stage.key} stage={stage} />
            ))}
            <div className="border-t-hairline" />
          </div>
        </section>

        {/* Talent */}
        <section className="mt-20 animate-reveal" style={{ animationDelay: "180ms" }}>
          <div className="flex items-baseline justify-between mb-6">
            <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              Talent & crew records
            </div>
            <div className="text-[11px] text-ink-secondary tabular-nums">
              {episode.talent.length} record{episode.talent.length === 1 ? "" : "s"}
            </div>
          </div>
          {episode.talent.length === 0 ? (
            <div className="py-8 text-[13px] text-ink-secondary border-t-hairline">
              No talent sourced yet.
            </div>
          ) : (
            <div>
              {episode.talent.map((t, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_1fr_120px] gap-6 py-4 border-t-hairline items-baseline"
                >
                  <div>
                    <div className="text-[14px] font-bold text-ink">{t.name}</div>
                    {t.note ? (
                      <div className="text-[11px] text-ink-secondary mt-1">{t.note}</div>
                    ) : null}
                  </div>
                  <div className="text-[12px] text-ink-secondary">{t.role}</div>
                  <div className="text-[12px] text-ink-secondary">
                    {t.location} · <span className="font-mono text-[11px]">{t.contact}</span>
                  </div>
                  <div
                    className={`text-[10px] uppercase tracking-[0.12em] font-bold text-right ${talentStatusClass(
                      t.status,
                    )}`}
                  >
                    {t.status}
                  </div>
                </div>
              ))}
              <div className="border-t-hairline" />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StageBlock({ stage }: { stage: StageDetail }) {
  const isCurrent = stage.status === "current" || stage.status === "blocked";
  return (
    <div className="grid grid-cols-[180px_1fr] gap-8 py-6 border-t-hairline">
      <div className="flex items-start gap-3">
        <div className="mt-1.5">
          <div className={statusDot(stage.status)} />
        </div>
        <div>
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Stage {String(stage.index).padStart(2, "0")}
          </div>
          <div
            className={`text-[14px] font-bold mt-1 ${
              stage.status === "blocked"
                ? "text-warning"
                : isCurrent
                  ? "text-ink"
                  : stage.status === "done"
                    ? "text-ink-secondary"
                    : "text-ink-muted"
            }`}
          >
            {stage.name}
          </div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-ink-secondary mt-1">
            {stage.status}
          </div>
        </div>
      </div>

      <div>
        {stage.blocker ? (
          <div
            className={`text-[12px] mb-4 pl-3 border-l-hairline ${
              stage.status === "blocked"
                ? "border-l-[color:var(--color-warning)] text-warning"
                : "border-l-[color:var(--color-border-strong)] text-ink-secondary"
            }`}
          >
            <span className="uppercase tracking-[0.12em] text-[8px] font-bold mr-2">
              Blocker
            </span>
            {stage.blocker}
          </div>
        ) : null}

        {stage.docs.length === 0 ? (
          <div className="text-[11px] text-ink-muted">No documents yet.</div>
        ) : (
          <ul className="divide-y-hairline">
            {stage.docs.map((d, i) => (
              <li
                key={i}
                className="grid grid-cols-[1fr_100px_120px] gap-4 py-2 items-baseline"
              >
                <div className="text-[13px] text-ink">{d.label}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-ink-muted font-mono">
                  {d.kind}
                </div>
                <div
                  className={`text-[10px] uppercase tracking-[0.12em] font-bold text-right ${docStatusClass(
                    d.status,
                  )}`}
                >
                  {docStatusLabel(d.status)}
                  <span className="ml-2 text-ink-muted font-normal normal-case tracking-normal">
                    {d.updated}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
