import { useEffect, useRef, useState } from "react";
import {
  formatWhen,
  markAllRead,
  markRead,
  clearFor,
  useNotifications,
} from "@/lib/notifications";
import { useRole, ROLE_LABEL } from "@/lib/roles";

/** Bell showing in-app notifications addressed to the acting role. */
export function NotificationBell() {
  const [role] = useRole();
  const { items, unread } = useNotifications(role);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications for ${ROLE_LABEL[role]}${unread ? `, ${unread} unread` : ""}`}
        className="text-[10px] uppercase tracking-[0.12em] font-bold text-ink-secondary hover:text-ink transition-colors tabular-nums"
      >
        Inbox{unread > 0 ? ` (${unread})` : ""}
      </button>

      {open ? (
        <div className="absolute right-0 top-6 z-50 w-[360px] bg-canvas border-hairline p-5 max-h-[420px] overflow-y-auto">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              {ROLE_LABEL[role]} inbox
            </span>
            <div className="flex gap-4">
              <button
                onClick={() => markAllRead(role)}
                className="text-[10px] uppercase tracking-[0.12em] text-ink-secondary hover:text-ink transition-colors"
              >
                Mark all read
              </button>
              <button
                onClick={() => clearFor(role)}
                className="text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:text-warning transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="text-[13px] text-ink-secondary border-t-hairline pt-4">
              Nothing needs you right now.
            </p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className="block w-full text-left border-t-hairline py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className={`text-[8px] font-bold uppercase tracking-[0.12em] ${
                      n.read ? "text-ink-muted" : "text-ink"
                    }`}
                  >
                    {n.title}
                  </span>
                  <span className="text-[10px] font-mono text-ink-muted whitespace-nowrap">
                    {formatWhen(n.at)}
                  </span>
                </div>
                <p
                  className={`text-[13px] mt-1 ${n.read ? "text-ink-muted" : "text-ink-secondary"}`}
                >
                  {n.body}
                </p>
                <span className="text-[10px] font-mono text-ink-muted">from {n.from}</span>
              </button>
            ))
          )}
          {items.length > 0 ? <div className="border-t-hairline" /> : null}
        </div>
      ) : null}
    </div>
  );
}
