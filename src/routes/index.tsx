import { createFileRoute, Link } from "@tanstack/react-router";
import { EPISODES, STAGES, type Episode } from "@/lib/episodes";
import { PageContainer, PageHeader, SectionHeader, Status } from "@/components/ui/platform";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Episodes — ALICE Production Platform" },
      { name: "description", content: "Every Meals That Matter episode across the eight-stage lifecycle, from Sourcing to Publish." },
      { property: "og:title", content: "Episodes — ALICE Production Platform" },
      { property: "og:description", content: "Every episode across the eight-stage lifecycle, from Sourcing to Publish." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EpisodesOverview,
});

function Rail({ ep }: { ep: Episode }) {
  return (
    <div className="relative grid grid-cols-8 items-center">
      <div className="absolute left-[6.25%] right-[6.25%] top-1/2 h-px bg-border" />
      <div
        className="absolute left-[6.25%] top-1/2 h-px bg-ink"
        style={{ width: `${((ep.stageIndex - 1) / 8) * 100}%` }}
      />
      {STAGES.map((s, i) => {
        const idx = i + 1;
        const done = idx < ep.stageIndex;
        const current = idx === ep.stageIndex;
        const blocked = current && ep.status === "blocked";
        return (
          <div key={s} className="relative z-10 flex justify-center" title={s}>
            <span
              className={cn(
                "block rounded-full",
                blocked ? "size-2.5 bg-warning" : current ? "size-2.5 bg-ink" : done ? "size-1.5 bg-ink" : "size-1.5 border border-border-strong bg-canvas",
              )}
            />
          </div>
        );
      })}
    </div>
  );
}

function EpisodeRow({ ep }: { ep: Episode }) {
  const blocker = ep.stages.find((s) => s.status === "blocked")?.blocker;
  const blocked = ep.status === "blocked";
  return (
    <Link
      to="/episodes/$slug"
      params={{ slug: ep.slug }}
      className="group grid grid-cols-[96px_minmax(220px,1fr)_minmax(480px,2fr)_120px] items-center gap-6 border-b-hairline py-5 hover:bg-surface"
    >
      <span className="text-value text-ink-secondary">{ep.code}</span>
      <div>
        <div className="text-ink">{ep.title}</div>
        <div className="text-[13px] leading-[19px] text-ink-secondary">{ep.location}</div>
        {blocked && (
          <div className="mt-1 text-[13px] leading-[19px] text-warning">
            {blocker ?? "Blocked — reason not on the record yet"} <span className="action-text">Resolve →</span>
          </div>
        )}
      </div>
      <Rail ep={ep} />
      <div className="text-right">
        <Status tone={blocked ? "attention" : "neutral"}>{blocked ? "Blocked" : STAGES[ep.stageIndex - 1]}</Status>
      </div>
    </Link>
  );
}

function EpisodesOverview() {
  const blocked = EPISODES.filter((e) => e.status === "blocked").length;
  const inPost = EPISODES.filter((e) => e.stageIndex === 7).length;
  return (
    <PageContainer className="pb-24">
      <PageHeader
        eyebrow="Meals That Matter"
        title="Episodes"
        lede="Every episode on one rail, Sourcing to Publish."
        facts={[
          { label: "Episodes", value: String(EPISODES.length).padStart(2, "0") },
          { label: "In post", value: String(inPost).padStart(2, "0") },
          { label: "Blocked", value: <span className={blocked ? "text-warning" : ""}>{String(blocked).padStart(2, "0")}</span> },
        ]}
        actions={<Link to="/gantt" className="action-text text-ink-secondary hover:text-ink">Gantt view →</Link>}
      />

      <SectionHeader label="Lifecycle" />
      <div className="grid grid-cols-[96px_minmax(220px,1fr)_minmax(480px,2fr)_120px] gap-6 border-b-hairline py-3 overflow-x-auto">
        <span />
        <span />
        <div className="grid grid-cols-8">
          {STAGES.map((s) => (
            <span key={s} className="text-center font-mono text-[11px] uppercase tracking-[1px] text-ink-secondary">{s}</span>
          ))}
        </div>
        <span />
      </div>
      <div className="overflow-x-auto">
        {EPISODES.map((ep) => <EpisodeRow key={ep.slug} ep={ep} />)}
      </div>
    </PageContainer>
  );
}
