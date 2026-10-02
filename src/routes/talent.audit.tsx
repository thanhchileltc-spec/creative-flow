import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuditLog } from "@/lib/audit-log";
import { AuditTrail } from "@/components/audit-trail";

export const Route = createFileRoute("/talent/audit")({
  head: () => {
    const title = "Approval audit log | Chi Les";
    const description =
      "Full trail of approval step changes — who moved a gate, when, and the note they left.";
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
  component: AuditLogPage,
});

function AuditLogPage() {
  const entries = useAuditLog();

  return (
    <div className="min-h-screen bg-canvas text-ink">

      <main className="px-8 py-24 max-w-[1100px] mx-auto">
        <header className="animate-reveal mb-12">
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">
            Traceability
          </div>
          <h1 className="text-[38px] font-bold tracking-[-0.03em] leading-none">
            Approval audit log
          </h1>
          <p className="text-[13px] text-ink-secondary mt-3 max-w-[560px] leading-snug">
            Append-only record of every approval gate change — the step, the state it moved from and
            to, the acting role, a timestamp and any note left with the decision.
          </p>
          <div className="text-[11px] font-mono tabular-nums text-ink-muted mt-4">
            {entries.length} entr{entries.length === 1 ? "y" : "ies"}
          </div>
        </header>

        <section className="animate-reveal" style={{ animationDelay: "60ms" }}>
          <AuditTrail entries={entries} showTalent />
        </section>
      </main>
    </div>
  );
}
