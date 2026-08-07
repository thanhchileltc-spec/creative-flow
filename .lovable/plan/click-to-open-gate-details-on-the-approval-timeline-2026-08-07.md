# Click-to-open gate details on the approval timeline

Make every gate cell on `/talent/timeline` clickable. Clicking opens a side panel showing everything known about that one gate for that one talent.

## What the panel shows

Header: talent name, gate label, owner role, required/optional, current state.

1. **Latest decision** — current state, who set it, date, and the note recorded with it. If the gate was never touched, say so plainly.
2. **Feedback notes** — editor handoff notes attached to the episodes this talent is on, with their target, state (open / fixed / blocked), author role and date. Blocked notes surface first since they are the likely reason a gate is stuck.
3. **Full audit trail** — every recorded change for this talent *and* this gate, newest first, using the existing audit trail presentation (timestamp, from → to, acting role, note).
4. **Footer links** — open the talent's full profile (where the gate can actually be changed) and the global audit log.

The panel is read-only. Changing a gate stays on the talent detail page, which already enforces role permissions.

## Interaction

- Each gate cell becomes a keyboard-accessible button; hover and focus give a subtle hairline highlight consistent with the rest of the design system.
- The panel slides in from the right, closes on Escape, backdrop click, or the close control.
- Talent name link in the row keeps its current behaviour (navigates to the profile).

## Technical notes

- New component `src/components/gate-detail-panel.tsx` built on the existing `@/components/ui/sheet`, styled with the Chi Les tokens (`border-hairline`, `text-ink-muted`, `bg-warning` for blocked).
- Data sources, all already present: `stepRecord()` from `approval-workflow`, `useAuditLog(talentId)` filtered by `stepId`, and handoff feedback read across the talent's `episodes` slugs.
- `handoff-feedback.ts` currently exposes notes per-slug via `useHandoffFeedback(slug)`. Add a small read helper that returns notes for a list of slugs so the panel can aggregate without calling a hook in a loop. No change to the storage format or existing behaviour.
- `src/routes/talent.timeline.tsx` tracks the selected `{ talentId, stepId }` in local state and renders one panel instance.
