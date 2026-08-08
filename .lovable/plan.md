# Backend Migration + GitHub Sync Plan

## Goal
Move the Chi Les production OS from localStorage to Lovable Cloud persistence, and connect the project to GitHub for code sync.

---

## 1. GitHub Sync (manual UI step)

I cannot push from this chat. You need to connect the project once in the Lovable editor:

1. Click the **Plus (+)** menu in the chat input → **GitHub** → **Connect project**.
2. Authorize the Lovable GitHub App.
3. Pick the account or organization.
4. Create the repository.

After that, every change in Lovable will push to GitHub automatically, and you can also pull/clone from the repo.

---

## 2. Lovable Cloud Schema

I will create the following tables in `public`:

### `profiles`
One row per authenticated user. Maps `auth.users(id)` to app fields like name and default role.

### `user_roles`
Roles for each user: `admin`, `producer`, `researcher`, `shooter`, `editor`, `viewer`. Stored separately from `profiles` per security policy.

### `episodes`
Episode spine data: code, title, location, logline, stage index, blocked flag, blockers, stage documents, director treatment, DP notes, tech specs, editor checklist.

### `talents`
Talent bank: name, origin, contact, role, story fit score, notes, approval status, linked episodes.

### `workflow_steps`
Configurable approval gates: label, owner role, description, required flag, sort order.

### `talent_step_records`
Per-talent, per-step decisions: state, by role, date, note.

### `audit_log`
Append-only record of every step change: talent, step, from/to state, role, note, timestamp.

### `handoff_feedback`
Editor feedback notes tied to an episode: target, body, state (open/fixed/blocked), author.

### `notifications`
In-app notifications: recipient role, kind, title, body, read state.

### `shoot_days`
Pairing of two episodes into one schedule with call sheet and logistics.

### `feedback_sync_log`
Tracks which handoff signatures have already auto-advanced workflows, so the same resolution does not fire twice.

---

## 3. Auth + Roles

- Enable email/password and Google sign-in via Lovable Cloud.
- Add a `has_role(user_id, role)` security definer function.
- Add RLS policies so users only read/write rows they own or are authorized for.
- EP/admin gets override access across all tables.
- The existing role switcher will be replaced by the signed-in user’s role. During testing, I can keep a role override in the UI that reads from a profile field.

---

## 4. Server Functions

I will replace localStorage modules with `createServerFn` calls:

- `getEpisodes`, `getEpisode`, `updateEpisodeStage`
- `getTalents`, `getTalent`, `updateTalent`, `updateTalentStep`
- `getWorkflowSteps`, `updateWorkflowSteps`
- `getAuditLog`, `recordAuditEntry`
- `getHandoffFeedback`, `addFeedback`, `updateFeedbackState`
- `getNotifications`, `markNotificationRead`
- `getShootDays`, `getShootDay`
- `applyFeedbackSync` (run after all feedback on an episode is fixed)

---

## 5. Frontend Updates

- Replace `localStorage` hooks with `useQuery`/`useMutation` calling the server functions.
- Keep the same UI and design system; only the data layer changes.
- Update `src/start.ts` to register `attachSupabaseAuth` so protected server functions receive the bearer token.
- Wrap protected routes under the existing `_authenticated` layout.

---

## 6. Demo Data Migration

I will seed the database with the current demo episodes, talents, workflow steps, sample audit log, and shoot-day pairings so the app looks the same after migration.

---

## 7. Verification

- Run the build and typecheck.
- Use the preview to confirm the pipeline, talent bank, handoff, timeline, and shoot-day views still load.
- Test a step change and confirm the audit log and notifications persist.

---

## Out of scope for this plan

- Real-time collaboration (can be added later with Lovable Cloud Realtime).
- File storage for release forms or cuts (storage bucket can be added later).
- Email notifications (in-app only for now).

---

## Estimated steps

1. GitHub connect (you do this in the UI).
2. Schema migration (I run this).
3. Auth configuration + roles (I run this).
4. Server functions for each data domain (I write these).
5. Replace localStorage in components (I update these).
6. Seed demo data (I run this).
7. Verify the preview.

Once you approve, I will start with the schema migration.