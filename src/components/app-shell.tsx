import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { RoleSwitcher } from "@/components/role-switcher";
import { NotificationBell } from "@/components/notification-bell";
import { deriveAttention } from "@/lib/attention";
import { cn } from "@/lib/utils";

const NAV: { label: string; to: string; match: (p: string) => boolean }[] = [
  { label: "Story Leads", to: "/talent", match: (p) => p.startsWith("/talent") },
  { label: "Episodes", to: "/", match: (p) => p === "/" || p.startsWith("/episodes") || p.startsWith("/gantt") },
  { label: "Production", to: "/shoot-days", match: (p) => p.startsWith("/shoot-days") },
  { label: "Post Production", to: "/handoff", match: (p) => p.startsWith("/handoff") },
  { label: "Publish", to: "/publish", match: (p) => p.startsWith("/publish") },
  { label: "Budget", to: "/budget", match: (p) => p.startsWith("/budget") },
];

function More({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-more]")) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div className="relative" data-more>
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls="more-menu"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { setOpen(true); setTimeout(() => first.current?.focus()); }
          if (e.key === "Escape") setOpen(false);
        }}
        className={cn("text-[13px] hover:text-ink", pathname.startsWith("/crew") ? "text-ink font-medium" : "text-ink-secondary")}
      >
        More
      </button>
      {open && (
        <div
          id="more-menu"
          onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } }}
          className="absolute left-0 top-8 z-50 min-w-[180px] border-hairline bg-canvas py-2"
        >
          <Link ref={first} to="/crew" onClick={() => setOpen(false)} className="block px-4 py-2 text-[13px] hover:bg-surface">Crew Directory</Link>
          <Link to="/gantt" onClick={() => setOpen(false)} className="block px-4 py-2 text-[13px] hover:bg-surface">Gantt</Link>
          <Link to="/talent/audit" onClick={() => setOpen(false)} className="block px-4 py-2 text-[13px] hover:bg-surface">Audit log</Link>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [count, setCount] = useState(0);
  useEffect(() => setCount(deriveAttention().length), []);
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-canvas focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b-hairline bg-canvas">
        <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between gap-8 px-5 md:px-12">
          <div className="flex items-center gap-10">
            <Link to="/dashboard" className="flex items-baseline gap-2.5">
              <span className="font-mono text-[14px] font-semibold tracking-[1.5px]">ALICE</span>
              <span className="hidden text-[13px] text-ink-secondary lg:inline">Production Platform</span>
            </Link>
            <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
              {NAV.map((n) => {
                const active = n.match(pathname);
                return (
                  <Link
                    key={n.to}
                    to={n.to as never}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "py-[19px] text-[13px] transition-colors",
                      active ? "font-medium text-ink shadow-[inset_0_-1.5px_0_var(--ink)]" : "text-ink-secondary hover:text-ink",
                    )}
                  >
                    {n.label}
                  </Link>
                );
              })}
              <More pathname={pathname} />
            </nav>
          </div>
          <div className="flex items-center gap-6">
            {count > 0 && (
              <Link to="/dashboard" className="font-mono text-[12px] uppercase tracking-[0.5px] text-warning hover:text-warning-strong">
                {count} for you
              </Link>
            )}
            <NotificationBell />
            <RoleSwitcher />
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
    </>
  );
}
