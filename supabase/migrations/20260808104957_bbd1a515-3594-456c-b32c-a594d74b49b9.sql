CREATE SCHEMA IF NOT EXISTS internal;

CREATE OR REPLACE FUNCTION internal.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION internal.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION internal.has_role(UUID, public.app_role) FROM authenticated;
REVOKE ALL ON FUNCTION internal.has_role(UUID, public.app_role) FROM anon;

ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;
CREATE POLICY "Only admins can manage user roles" ON public.user_roles FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role));
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.episodes DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and producers can manage episodes" ON public.episodes;
CREATE POLICY "Admins and producers can manage episodes" ON public.episodes FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role));
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.talents DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins, producers and sourcing producers can manage talents" ON public.talents;
CREATE POLICY "Admins, producers and sourcing producers can manage talents" ON public.talents FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'SP'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'SP'::public.app_role));
ALTER TABLE public.talents ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.talent_episodes DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins, producers and sourcing producers can manage talent episodes" ON public.talent_episodes;
CREATE POLICY "Admins, producers and sourcing producers can manage talent episodes" ON public.talent_episodes FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'SP'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'SP'::public.app_role));
ALTER TABLE public.talent_episodes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.talent_calls DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins, producers and sourcing producers can manage talent calls" ON public.talent_calls;
CREATE POLICY "Admins, producers and sourcing producers can manage talent calls" ON public.talent_calls FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'SP'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'SP'::public.app_role));
ALTER TABLE public.talent_calls ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.workflow_steps DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can manage workflow steps" ON public.workflow_steps;
CREATE POLICY "Only admins can manage workflow steps" ON public.workflow_steps FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role));
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.talent_step_records DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and step owners can update records" ON public.talent_step_records;
CREATE POLICY "Admins and step owners can update records" ON public.talent_step_records FOR ALL TO authenticated USING (
  internal.has_role(auth.uid(), 'EP'::public.app_role) OR EXISTS (
    SELECT 1 FROM public.workflow_steps WHERE workflow_steps.step_id = talent_step_records.step_id AND workflow_steps.owner = ANY(
      SELECT role FROM public.user_roles WHERE user_id = auth.uid()
    )
  )
) WITH CHECK (
  internal.has_role(auth.uid(), 'EP'::public.app_role) OR EXISTS (
    SELECT 1 FROM public.workflow_steps WHERE workflow_steps.step_id = talent_step_records.step_id AND workflow_steps.owner = ANY(
      SELECT role FROM public.user_roles WHERE user_id = auth.uid()
    )
  )
);
ALTER TABLE public.talent_step_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.handoffs DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins, producers and editors can manage handoffs" ON public.handoffs;
CREATE POLICY "Admins, producers and editors can manage handoffs" ON public.handoffs FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role));
ALTER TABLE public.handoffs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.handoff_treatment_sections DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins, producers and editors can manage treatment sections" ON public.handoff_treatment_sections;
CREATE POLICY "Admins, producers and editors can manage treatment sections" ON public.handoff_treatment_sections FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role));
ALTER TABLE public.handoff_treatment_sections ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.handoff_dp_notes DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins, producers and editors can manage DP notes" ON public.handoff_dp_notes;
CREATE POLICY "Admins, producers and editors can manage DP notes" ON public.handoff_dp_notes FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role));
ALTER TABLE public.handoff_dp_notes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.handoff_deliverables DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins, producers and editors can manage deliverables" ON public.handoff_deliverables;
CREATE POLICY "Admins, producers and editors can manage deliverables" ON public.handoff_deliverables FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role));
ALTER TABLE public.handoff_deliverables ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.handoff_checklist DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins, producers and editors can manage checklist" ON public.handoff_checklist;
CREATE POLICY "Admins, producers and editors can manage checklist" ON public.handoff_checklist FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role));
ALTER TABLE public.handoff_checklist ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.handoff_feedback DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authors and admins can update feedback" ON public.handoff_feedback;
CREATE POLICY "Authors and admins can update feedback" ON public.handoff_feedback FOR UPDATE TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR by_role = ANY(SELECT role FROM public.user_roles WHERE user_id = auth.uid())) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR by_role = ANY(SELECT role FROM public.user_roles WHERE user_id = auth.uid()));
ALTER TABLE public.handoff_feedback ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can mark their own notifications read" ON public.notifications;
CREATE POLICY "Users can read their own notifications" ON public.notifications FOR SELECT TO authenticated USING (internal.has_role(auth.uid(), to_role::public.app_role) OR internal.has_role(auth.uid(), 'EP'::public.app_role));
CREATE POLICY "Users can mark their own notifications read" ON public.notifications FOR UPDATE TO authenticated USING (internal.has_role(auth.uid(), to_role::public.app_role) OR internal.has_role(auth.uid(), 'EP'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), to_role::public.app_role) OR internal.has_role(auth.uid(), 'EP'::public.app_role));
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.shoot_days DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and producers can manage shoot days" ON public.shoot_days;
CREATE POLICY "Admins and producers can manage shoot days" ON public.shoot_days FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role));
ALTER TABLE public.shoot_days ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.shoot_day_schedule DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and producers can manage schedule blocks" ON public.shoot_day_schedule;
CREATE POLICY "Admins and producers can manage schedule blocks" ON public.shoot_day_schedule FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role));
ALTER TABLE public.shoot_day_schedule ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.shoot_day_crew DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and producers can manage crew calls" ON public.shoot_day_crew;
CREATE POLICY "Admins and producers can manage crew calls" ON public.shoot_day_crew FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role));
ALTER TABLE public.shoot_day_crew ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.shoot_day_logistics DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and producers can manage logistics" ON public.shoot_day_logistics;
CREATE POLICY "Admins and producers can manage logistics" ON public.shoot_day_logistics FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'PR'::public.app_role));
ALTER TABLE public.shoot_day_logistics ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.feedback_sync_log DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and editors can manage feedback sync log" ON public.feedback_sync_log;
CREATE POLICY "Admins and editors can manage feedback sync log" ON public.feedback_sync_log FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (internal.has_role(auth.uid(), 'EP'::public.app_role) OR internal.has_role(auth.uid(), 'ED'::public.app_role));
ALTER TABLE public.feedback_sync_log ENABLE ROW LEVEL SECURITY;

DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role);