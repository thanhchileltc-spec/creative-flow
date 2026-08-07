import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuditLog } from "@/lib/audit-log";
import { AuditTrail } from "@/components/audit-trail";
import { RoleSwitcher } from "@/components/role-switcher";
import { NotificationBell } from "@/components/notification-bell";

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
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 bg-canvas/85 backdrop-blur-md border-b-hairline">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-[13px] font-bold tracking-[-0.02em]">
            Chi Les
          </Link>
          <div className="hidden md:flex gap-8 text-[13px] text-ink-secondary">
            <Link to="/" className="hover:text-ink transition-colors duration-[var(--dur-fast)]">
              Episodes
            </Link>
            <Link
              to="/shoot-days"
              className="hover:text-ink transition-colors duration-[var(--dur-fast)]"
            >
              Shoot Days
            </Link>
            <Link to="/talent" className="text-ink">
              Talent Bank
            </Link>
            <Link
              to="/handoff"
              className="hover:text-ink transition-colors duration-[var(--dur-fast)]"
            >
              Editor Handoff
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <RoleSwitcher />
          <NotificationBell />
          <Link to="/talent" className="text-[11px] text-ink-secondary hover:text-ink">
            ← Talent Bank
          </Link>
        </div>
      </nav>

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
