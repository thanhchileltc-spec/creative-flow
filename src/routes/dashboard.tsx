import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { deriveAttention } from "@/lib/attention";
import { EPISODES } from "@/lib/episodes";
import { SHOOT_DAYS } from "@/lib/shoot-days";
import { TALENT } from "@/lib/talent-bank";
import { useActingRole } from "@/lib/roles";
import { Metric, PageContainer, PageHeader, SectionHeader, Toggle, Status } from "@/components/ui/platform";
import { useAuditLog, formatStamp } from "@/lib/audit-log";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ALICE Production Platform" },
      { name: "description", content: "What needs you today: unresolved items, the next seven days and the latest decisions." },
      { property: "og:title", content: "Dashboard — ALICE Production Platform" },
      { property: "og:description", content: "What needs you today across Meals That Matter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [scope, setScope] = useState<"all" | "mine">("all");
  const role = useActingRole();
  const all = deriveAttention();
  const items = scope === "mine" ? all.filter((i) => i.owner === role) : all;
  const audit = useAuditLog().slice(0, 6);
  return (
    <PageContainer className="pb-24">
      <PageHeader eyebrow="Today" title="What needs you" lede="Only what is unresolved. Everything else is moving." />

      <div className="grid grid-cols-2 gap-y-6 border-b-hairline py-8 md:grid-cols-5">
        <Metric label="Episodes" value={EPISODES.length} to="/" />
        <Metric label="Shoot days" value={SHOOT_DAYS.length} to="/shoot-days" />
        <Metric label="Story leads" value={TALENT.length} to="/talent" />
        <Metric label="Unresolved" value={all.length} attention={all.length > 0} />
        <Metric label="Budget" value="Review" to="/budget" />
      </div>

      <SectionHeader
        label={`Needs attention · ${items.length}`}
        right={<Toggle value={scope} onChange={setScope} options={[{ value: "all", label: "All" }, { value: "mine", label: "Mine" }]} />}
      />
      {items.length === 0 && <p className="py-6 text-ink-secondary">Nothing unresolved{scope === "mine" ? ` for ${role}` : ""}.</p>}
      {items.map((i) => (
        <div key={i.id} className="group grid grid-cols-[1fr_180px_60px_160px] items-center gap-6 border-b-hairline py-4 hover:bg-surface">
          <span className="text-warning">{i.reason}</span>
          <span className="text-[13px] text-ink-secondary">{i.record}</span>
          <span className="text-value text-ink-secondary">{i.owner}</span>
          <Link to={i.to as never} params={i.params as never} className="action-text text-right text-warning hover:text-warning-strong">
            {i.verb} →
          </Link>
        </div>
      ))}

      <div className="grid gap-12 md:grid-cols-2">
        <section>
          <SectionHeader label="Next 7 days" />
          {SHOOT_DAYS.slice(0, 5).map((d) => (
            <Link key={d.id} to="/shoot-days/$dayId" params={{ dayId: d.id }} className="grid grid-cols-[110px_1fr_auto] gap-4 border-b-hairline py-3 hover:bg-surface">
              <span className="text-value text-ink-secondary">{d.date}</span>
              <span>{d.dayCode} · {d.city}</span>
              <Status tone={d.status === "at-risk" ? "attention" : "muted"}>{d.status}</Status>
            </Link>
          ))}
        </section>
        <section>
          <SectionHeader label="Latest updates" />
          {audit.length === 0 && <p className="py-4 text-[13px] text-ink-secondary">No decisions recorded yet.</p>}
          {audit.map((a) => (
            <div key={a.id} className="grid grid-cols-[110px_1fr] gap-4 border-b-hairline py-3">
              <span className="text-value text-ink-secondary">{formatStamp(a.at)}</span>
              <span className="text-[13px]">{a.role} moved {a.stepId} {a.from} → {a.to}</span>
            </div>
          ))}
        </section>
      </div>
    </PageContainer>
  );
}
