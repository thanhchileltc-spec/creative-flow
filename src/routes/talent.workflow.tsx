import { createFileRoute, Link } from "@tanstack/react-router";
import { useWorkflow, newStep, type WorkflowStep } from "@/lib/approval-workflow";
import { RoleSwitcher } from "@/components/role-switcher";
import { ADMIN_ROLES, canConfigureWorkflow, ROLE_LABEL, useRole } from "@/lib/roles";


export const Route = createFileRoute("/talent/workflow")({
  head: () => {
    const title = "Approval workflow — configure review steps | Chi Les";
    const description =
      "Configure the approval gates every sourced talent passes through: initial review, producer approval, clearance and final sign-off.";
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
  component: WorkflowSettings,
});

function WorkflowSettings() {
  const [steps, setSteps, reset] = useWorkflow();

  const patch = (i: number, next: Partial<WorkflowStep>) =>
    setSteps(steps.map((s, idx) => (idx === i ? { ...s, ...next } : s)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    setSteps(next);
  };

  const remove = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));

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
            <Link to="/handoff" className="hover:text-ink transition-colors duration-[var(--dur-fast)]">
              Editor Handoff
            </Link>
          </div>
        </div>
        <Link to="/talent" className="text-[11px] text-ink-secondary hover:text-ink">
          ← All talent
        </Link>
      </nav>

      <main className="px-8 py-24 max-w-[1100px] mx-auto">
        <header className="animate-reveal">
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">
            Talent Bank · Settings
          </div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] leading-tight">
            Approval workflow
          </h1>
          <p className="text-[13px] text-ink-secondary mt-1 max-w-[560px]">
            Every sourced talent moves through these gates in order. Rename, reorder, or add a step
            and the Talent Bank re-reads it everywhere.
          </p>
        </header>

        <section className="mt-12 animate-reveal" style={{ animationDelay: "60ms" }}>
          <div className="grid grid-cols-[24px_1fr_60px_90px_120px] gap-4 pb-3 text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted border-b-hairline">
            <div>#</div>
            <div>Step</div>
            <div>Owner</div>
            <div>Required</div>
            <div className="text-right">Order</div>
          </div>

          {steps.map((s, i) => (
            <div
              key={s.id}
              className="grid grid-cols-[24px_1fr_60px_90px_120px] gap-4 items-start border-t-hairline py-5"
            >
              <div className="text-[11px] font-mono tabular-nums text-ink-muted pt-1">
                {String(i + 1).padStart(2, "0")}
              </div>

              <div>
                <input
                  value={s.label}
                  aria-label={`Step ${i + 1} name`}
                  onChange={(e) => patch(i, { label: e.target.value })}
                  className="w-full bg-transparent text-[15px] font-bold tracking-[-0.02em] border-b-hairline border-[color:var(--color-border)] focus:border-[color:var(--color-ink)] outline-none pb-1"
                />
                <input
                  value={s.description}
                  aria-label={`Step ${i + 1} description`}
                  placeholder="What has to be true to clear this gate"
                  onChange={(e) => patch(i, { description: e.target.value })}
                  className="w-full bg-transparent text-[13px] text-ink-secondary placeholder:text-ink-muted outline-none mt-2"
                />
              </div>

              <input
                value={s.owner}
                aria-label={`Step ${i + 1} owner role`}
                onChange={(e) => patch(i, { owner: e.target.value.toUpperCase().slice(0, 3) })}
                className="w-full bg-transparent text-[11px] font-mono uppercase border-b-hairline border-[color:var(--color-border)] focus:border-[color:var(--color-ink)] outline-none pb-1"
              />

              <button
                onClick={() => patch(i, { required: !s.required })}
                className={`text-[11px] text-left transition-colors duration-[var(--dur-fast)] ${
                  s.required ? "text-ink" : "text-ink-muted"
                }`}
              >
                {s.required ? "Required" : "Optional"}
              </button>

              <div className="flex justify-end gap-4 text-[11px] text-ink-muted">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${s.label} up`}
                  className="hover:text-ink disabled:opacity-30 disabled:hover:text-ink-muted"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === steps.length - 1}
                  aria-label={`Move ${s.label} down`}
                  className="hover:text-ink disabled:opacity-30 disabled:hover:text-ink-muted"
                >
                  ↓
                </button>
                <button
                  onClick={() => remove(i)}
                  disabled={steps.length === 1}
                  aria-label={`Remove ${s.label}`}
                  className="hover:text-warning disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="border-t-hairline" />

          <div className="flex items-center gap-6 mt-8">
            <button
              onClick={() => setSteps([...steps, newStep()])}
              className="px-5 py-2 bg-ink text-canvas text-[13px] font-medium hover:bg-ink-secondary transition-colors duration-[var(--dur-fast)]"
            >
              Add step
            </button>
            <button
              onClick={reset}
              className="text-[13px] text-ink-muted hover:text-ink transition-colors duration-[var(--dur-fast)]"
            >
              Reset to default
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
