import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  buildBrief,
  getHandoff,
  handoffEpisode,
  readiness,
  type ChecklistItem,
  type Handoff,
} from "@/lib/handoff";
import type { Episode } from "@/lib/episodes";

export const Route = createFileRoute("/handoff/$slug")({
  loader: ({ params }) => {
    const handoff = getHandoff(params.slug);
    if (!handoff) throw notFound();
    return { handoff };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Handoff not found — Chi Les" }, { name: "robots", content: "noindex" }] };
    }
    const { handoff } = loaderData;
    const ep = handoffEpisode(handoff);
    const title = `${ep?.title ?? handoff.slug} — editor handoff | Chi Les`;
    const description = `Ready-for-edit brief: director treatment, DP notes, tech specs and outstanding items for ${
      ep?.title ?? handoff.slug
    }.`;
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
  component: HandoffDetail,
});

function itemClass(s: ChecklistItem["status"]) {
  if (s === "missing") return "text-warning";
  if (s === "pending") return "text-ink-secondary";
  return "text-ink";
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
      {children}
    </div>
  );
}

function HandoffDetail() {
  const { handoff } = Route.useLoaderData() as { handoff: Handoff };
  const ep: Episode | undefined = handoffEpisode(handoff);
  const r = readiness(handoff);
  const brief = buildBrief(handoff);
  const [copied, setCopied] = useState(false);
  const [showBrief, setShowBrief] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowBrief(true);
    }
  };

  const download = () => {
    const blob = new Blob([brief], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${handoff.slug}-ready-for-edit.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
        <Link
          to="/handoff"
          className="text-[11px] uppercase tracking-[0.12em] text-ink-secondary hover:text-ink transition-colors"
        >
          ← All handoffs
        </Link>
      </nav>

      <main className="px-8 py-16 max-w-[1120px] mx-auto">
        {/* Header */}
        <section className="grid grid-cols-[1fr_320px] gap-12 pb-12 border-b-hairline animate-reveal">
          <div>
            <div
              className={`text-[8px] font-bold uppercase tracking-[0.12em] mb-4 ${
                r.verdict === "not-ready" ? "text-warning" : "text-ink-muted"
              }`}
            >
              {r.verdict === "ready"
                ? "Ready for edit"
                : r.verdict === "conditional"
                  ? "Conditionally ready"
                  : "Not ready for edit"}
            </div>
            <h1 className="text-[40px] leading-[1.05] font-bold tracking-[-0.03em]">
              {ep?.title ?? handoff.slug}
            </h1>
            {handoff.narrativeSpine ? (
              <p className="text-[15px] text-ink-secondary mt-4 max-w-[52ch]">
                {handoff.narrativeSpine}
              </p>
            ) : null}
            <div className="mt-6 flex gap-6">
              <button
                onClick={copy}
                className="text-[11px] uppercase tracking-[0.12em] font-bold border-b-hairline border-b-[color:var(--color-ink)] pb-1 hover:opacity-60 transition-opacity"
              >
                {copied ? "Copied" : "Copy brief"}
              </button>
              <button
                onClick={download}
                className="text-[11px] uppercase tracking-[0.12em] text-ink-secondary hover:text-ink transition-colors pb-1"
              >
                Download .txt
              </button>
              <button
                onClick={() => setShowBrief((v) => !v)}
                className="text-[11px] uppercase tracking-[0.12em] text-ink-secondary hover:text-ink transition-colors pb-1"
              >
                {showBrief ? "Hide compiled brief" : "Preview compiled brief"}
              </button>
            </div>
          </div>

          <dl className="text-[11px] space-y-3 pt-2">
            {[
              ["Episode", ep ? `${ep.code} · ${ep.location}` : "—"],
              ["Director", handoff.director],
              ["DP", handoff.dp],
              ["Editor", handoff.editor],
              ["Edit window", handoff.editWindow],
              ["Readiness", `${r.ready}/${r.total} cleared`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b-hairline pb-2">
                <dt className="text-ink-muted uppercase tracking-[0.12em] text-[8px] font-bold shrink-0">
                  {k}
                </dt>
                <dd className="text-ink tabular-nums text-right">{v}</dd>
              </div>
            ))}
            {ep ? (
              <Link
                to="/episodes/$slug"
                params={{ slug: ep.slug }}
                className="inline-block text-[11px] text-ink-secondary hover:text-ink transition-colors"
              >
                Open episode →
              </Link>
            ) : null}
          </dl>
        </section>

        {/* Compiled brief */}
        {showBrief ? (
          <section className="mt-12 animate-reveal">
            <Label>Compiled brief</Label>
            <pre className="mt-4 whitespace-pre-wrap font-mono text-[11px] leading-[1.7] text-ink bg-surface p-6 border-hairline">
              {brief}
            </pre>
          </section>
        ) : null}

        {/* Outstanding */}
        <section className="mt-16 animate-reveal" style={{ animationDelay: "60ms" }}>
          <div className="flex items-baseline justify-between mb-6">
            <Label>Outstanding before edit starts</Label>
            <span className="text-[11px] text-ink-secondary tabular-nums">
              {r.missing.length} missing · {r.pending.length} pending
            </span>
          </div>
          <ul>
            {handoff.checklist.map((c, i) => (
              <li
                key={i}
                className="grid grid-cols-[1fr_160px] gap-6 py-3 border-t-hairline items-baseline"
              >
                <div>
                  <div className={`text-[14px] ${c.status === "ready" ? "text-ink-secondary" : "text-ink"}`}>
                    {c.label}
                  </div>
                  {c.note ? (
                    <div className="text-[11px] text-ink-secondary mt-1">{c.note}</div>
                  ) : null}
                </div>
                <div
                  className={`text-right text-[10px] uppercase tracking-[0.12em] font-bold ${itemClass(
                    c.status,
                  )}`}
                >
                  {c.status}
                </div>
              </li>
            ))}
            <div className="border-t-hairline" />
          </ul>
        </section>

        {/* Director treatment */}
        <section className="mt-20 animate-reveal" style={{ animationDelay: "120ms" }}>
          <Label>Director treatment</Label>
          <div className="mt-6">
            {handoff.treatment.map((t, i) => (
              <div key={i} className="grid grid-cols-[180px_1fr] gap-8 py-6 border-t-hairline">
                <div className="text-[14px] font-bold">{t.heading}</div>
                <p className="text-[14px] text-ink-secondary leading-relaxed max-w-[62ch]">
                  {t.body}
                </p>
              </div>
            ))}
            {handoff.musicRef ? (
              <div className="grid grid-cols-[180px_1fr] gap-8 py-6 border-t-hairline">
                <div className="text-[14px] font-bold">Music reference</div>
                <p className="text-[14px] text-ink-secondary leading-relaxed max-w-[62ch]">
                  {handoff.musicRef}
                </p>
              </div>
            ) : null}
            <div className="border-t-hairline" />
          </div>
        </section>

        {/* DP notes */}
        <section className="mt-20 animate-reveal" style={{ animationDelay: "160ms" }}>
          <div className="flex items-baseline justify-between mb-6">
            <Label>DP notes</Label>
            <span className="text-[11px] text-ink-secondary tabular-nums">
              {handoff.dpNotes.length} setups
            </span>
          </div>
          <div>
            <div className="grid grid-cols-[1fr_100px_150px_1fr] gap-6 pb-2 text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              <span>Scene</span>
              <span>Lens</span>
              <span>Movement</span>
              <span>Light</span>
            </div>
            {handoff.dpNotes.map((d, i) => (
              <div key={i} className="border-t-hairline py-4">
                <div className="grid grid-cols-[1fr_100px_150px_1fr] gap-6 items-baseline">
                  <div className="text-[14px] font-bold">{d.scene}</div>
                  <div className="text-[12px] font-mono text-ink-secondary">{d.lens}</div>
                  <div className="text-[12px] text-ink-secondary">{d.movement}</div>
                  <div className="text-[12px] text-ink-secondary">{d.light}</div>
                </div>
                {d.note ? (
                  <div className="text-[11px] text-ink-secondary mt-2 pl-3 border-l-hairline border-l-[color:var(--color-border-strong)]">
                    {d.note}
                  </div>
                ) : null}
              </div>
            ))}
            <div className="border-t-hairline" />
          </div>
        </section>

        {/* Tech specs */}
        <section className="mt-20 animate-reveal" style={{ animationDelay: "200ms" }}>
          <Label>Tech specs</Label>
          <div className="mt-6 grid grid-cols-2 gap-x-12">
            {[
              ["Camera", handoff.tech.camera],
              ["Codec", handoff.tech.codec],
              ["Resolution", handoff.tech.resolution],
              ["Frame rate", handoff.tech.frameRate],
              ["Colour space", handoff.tech.colorSpace],
              ["LUT", handoff.tech.lut],
              ["Audio", handoff.tech.audio],
              ["Aspect", handoff.tech.aspect],
              ["Media", `${handoff.tech.cardCount} cards · ${handoff.tech.dataSize}`],
              ["Delivery to", handoff.tech.deliveryTo],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3 border-t-hairline items-baseline">
                <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted shrink-0">
                  {k}
                </span>
                <span className="text-[12px] font-mono text-ink text-right">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Deliverables */}
        <section className="mt-20 animate-reveal" style={{ animationDelay: "240ms" }}>
          <Label>Deliverables</Label>
          <div className="mt-6">
            {handoff.deliverables.map((d, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_140px] gap-6 py-4 border-t-hairline items-baseline"
              >
                <div className="text-[14px] font-bold">{d.label}</div>
                <div className="text-[12px] font-mono text-ink-secondary">{d.spec}</div>
                <div className="text-[11px] text-ink-secondary text-right tabular-nums">
                  {d.due}
                </div>
              </div>
            ))}
            <div className="border-t-hairline" />
          </div>
        </section>
      </main>
    </div>
  );
}
