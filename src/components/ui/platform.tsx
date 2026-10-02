/**
 * Production Platform primitives.
 * Rules (docs/design/design-philosophy.md):
 *  - Hairlines, not cards. No shadows, no fills.
 *  - Orange (warning) means UNRESOLVED only. Never hover, focus, or CTA.
 *  - Actions are text-led mono uppercase words.
 *  - Status is mono text, never a pill.
 */
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-5 md:px-12", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  lede,
  facts,
  actions,
}: {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  facts?: { label: string; value: ReactNode }[];
  actions?: ReactNode;
}) {
  return (
    <header className="grid gap-8 border-b-hairline pb-10 pt-14 md:grid-cols-[1fr_auto]">
      <div className="max-w-[720px]">
        {eyebrow && <div className="eyebrow-label mb-4">{eyebrow}</div>}
        <h1 className="text-display text-ink">{title}</h1>
        {lede && <p className="mt-3 text-ink-secondary">{lede}</p>}
        {actions && <div className="mt-6 flex flex-wrap gap-6">{actions}</div>}
      </div>
      {facts && facts.length > 0 && (
        <dl className="grid min-w-[220px] content-end gap-2">
          {facts.map((f) => (
            <div key={f.label} className="grid grid-cols-[110px_1fr] gap-4">
              <dt className="eyebrow-label">{f.label}</dt>
              <dd className="text-value text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}

export function SectionHeader({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <div className="mt-14 flex items-end justify-between border-b-hairline pb-3">
      <h2 className="eyebrow-label">{label}</h2>
      {right}
    </div>
  );
}

/** Context band: only the path for the task, never the whole tree. */
export function ContextBand({ path, facts }: { path: ReactNode[]; facts?: string[] }) {
  return (
    <div className="border-b-hairline bg-surface">
      <PageContainer className="flex h-[38px] items-center justify-between text-value text-ink-secondary">
        <div className="flex items-center gap-2">
          {path.map((p, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>→</span>}
              <span className={i === path.length - 1 ? "text-ink" : ""}>{p}</span>
            </span>
          ))}
        </div>
        {facts && <div className="hidden gap-6 md:flex">{facts.map((f) => <span key={f}>{f}</span>)}</div>}
      </PageContainer>
    </div>
  );
}

/** Attention line — only when something is wrong. Reason, owner, consequence. */
export function AttentionLine({
  fact,
  owner,
  action,
}: {
  fact: string;
  owner: string;
  action?: { label: string; to?: string; params?: Record<string, string>; onClick?: () => void };
}) {
  return (
    <div role="status" className="grid gap-1 border-y-[1px] border-border py-4 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="text-warning">{fact}</p>
        <p className="text-[13px] leading-[19px] text-ink-secondary">Owner · {owner}</p>
      </div>
      {action &&
        (action.to ? (
          <Link to={action.to as never} params={action.params as never} className="action-text text-warning hover:text-warning-strong">
            {action.label} →
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className="action-text text-left text-warning hover:text-warning-strong">
            {action.label} →
          </button>
        ))}
    </div>
  );
}

/** Text-led action. Real button underneath. */
export function TextAction({
  children,
  tone = "default",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "default" | "quiet" | "destructive" }) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "action-text transition-colors duration-[var(--dur-instant)] disabled:opacity-40",
        tone === "default" && "text-ink hover:text-ink-secondary",
        tone === "quiet" && "text-ink-secondary hover:text-ink",
        tone === "destructive" && "text-danger",
        className,
      )}
    >
      {children}
    </button>
  );
}

export type StatusTone = "neutral" | "done" | "attention" | "blocked" | "muted";
export function Status({ children, tone = "neutral" }: { children: ReactNode; tone?: StatusTone }) {
  return (
    <span
      className={cn(
        "text-value uppercase",
        tone === "neutral" && "text-ink",
        tone === "done" && "text-ink",
        tone === "attention" && "text-warning",
        tone === "blocked" && "text-blocked",
        tone === "muted" && "text-ink-secondary",
      )}
    >
      {children}
    </span>
  );
}

/** Row grid with hairline + #FAFAFA wash; actions hidden until hover/focus (space reserved). */
export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("group grid items-center border-b-hairline py-4 transition-colors hover:bg-surface", className)}>{children}</div>;
}
export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{children}</div>;
}

/** Removed · Undo — in-place, no confirm dialog. */
export function RemovedUndoRow({ label, onUndo, onExpire }: { label: string; onUndo: () => void; onExpire?: () => void }) {
  useEffect(() => {
    if (!onExpire) return;
    const t = setTimeout(onExpire, 8000);
    return () => clearTimeout(t);
  }, [onExpire]);
  return (
    <div className="flex items-center justify-between border-b-hairline py-4 text-ink-secondary">
      <span className="text-[13px]">{label} · Removed</span>
      <TextAction onClick={onUndo}>Undo</TextAction>
    </div>
  );
}

/** Click, type, it saves itself. Enter/blur commits, Escape cancels, Undo in place. */
export function InlineField({
  value,
  onCommit,
  placeholder = "Not supplied",
  className,
  mono,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  className?: string;
  mono?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [prev, setPrev] = useState<string | null>(null);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    setEditing(false);
    if (draft !== value) {
      setPrev(value);
      onCommit(draft);
      setTimeout(() => setPrev(null), 6000);
    }
  };
  if (editing)
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={cn("w-full bg-transparent outline-none shadow-[inset_0_-2px_0_var(--ink)]", mono && "text-value", className)}
      />
    );
  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn("text-left hover:bg-surface", !value && "text-ink-secondary", mono && "text-value", className)}
      >
        {value || placeholder}
      </button>
      {prev !== null && (
        <TextAction tone="quiet" onClick={() => { onCommit(prev); setPrev(null); }}>
          Undo
        </TextAction>
      )}
    </span>
  );
}

export function Metric({ label, value, attention, to }: { label: string; value: ReactNode; attention?: boolean; to?: string }) {
  const body = (
    <>
      <div className="eyebrow-label">{label}</div>
      <div className={cn("mt-2 text-[28px] font-light leading-[34px] tabular-nums", attention ? "text-warning" : "text-ink")}>{value}</div>
    </>
  );
  return to ? (
    <Link to={to as never} className="block border-l-hairline px-6 py-2 first:border-l-0 first:pl-0 hover:bg-surface">{body}</Link>
  ) : (
    <div className="border-l-hairline px-6 py-2 first:border-l-0 first:pl-0">{body}</div>
  );
}

export function Toggle<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="flex gap-5">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          type="button"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("action-text pb-1", value === o.value ? "text-ink shadow-[inset_0_-1.5px_0_var(--ink)]" : "text-ink-secondary hover:text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
