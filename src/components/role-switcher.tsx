import { ROLES, useRole, type Role } from "@/lib/roles";

/** Switches the acting role; permissions everywhere follow it. */
export function RoleSwitcher() {
  const [role, setRole] = useRole();
  return (
    <label className="flex items-center gap-2 text-[11px] text-ink-muted">
      <span className="uppercase tracking-[0.12em] font-bold text-[8px]">Acting as</span>
      <select
        value={role}
        aria-label="Acting role"
        onChange={(e) => setRole(e.target.value as Role)}
        className="bg-transparent text-[11px] font-mono text-ink border-b-hairline border-[color:var(--color-border)] focus:border-[color:var(--color-ink)] outline-none pb-[2px]"
      >
        {ROLES.map((r) => (
          <option key={r.code} value={r.code}>
            {r.code} — {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}
