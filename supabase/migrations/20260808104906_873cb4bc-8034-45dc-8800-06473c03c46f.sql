CREATE TYPE public.app_role AS ENUM ('EP', 'PR', 'SP', 'DP', 'ED');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  default_role public.app_role,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
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

CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can read user roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can manage user roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role));

CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  meta TEXT,
  stage_index INTEGER NOT NULL DEFAULT 1,
  stage_label TEXT,
  status TEXT NOT NULL DEFAULT 'idle',
  roles public.app_role[] NOT NULL DEFAULT '{}',
  delay INTEGER NOT NULL DEFAULT 0,
  logline TEXT,
  paired_with TEXT,
  shoot_window TEXT,
  stage_details JSONB NOT NULL DEFAULT '[]',
  talent_records JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.episodes TO authenticated;
GRANT ALL ON public.episodes TO service_role;

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read episodes" ON public.episodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and producers can manage episodes" ON public.episodes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role));

CREATE TABLE public.talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  craft TEXT NOT NULL,
  location TEXT NOT NULL,
  sourced_by public.app_role NOT NULL,
  sourced_on TEXT,
  sourced_via TEXT,
  contact TEXT,
  approval TEXT NOT NULL DEFAULT 'sourced',
  story_fit_score INTEGER NOT NULL DEFAULT 3,
  story_fit_note TEXT,
  story_fit_risk TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.talents TO authenticated;
GRANT ALL ON public.talents TO service_role;

ALTER TABLE public.talents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read talents" ON public.talents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins, producers and sourcing producers can manage talents" ON public.talents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'SP'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'SP'::public.app_role));

CREATE TABLE public.talent_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES public.talents(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  UNIQUE (talent_id, episode_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.talent_episodes TO authenticated;
GRANT ALL ON public.talent_episodes TO service_role;

ALTER TABLE public.talent_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read talent episodes" ON public.talent_episodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins, producers and sourcing producers can manage talent episodes" ON public.talent_episodes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'SP'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'SP'::public.app_role));

CREATE TABLE public.talent_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES public.talents(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  duration TEXT,
  interviewer public.app_role NOT NULL,
  summary TEXT,
  outcome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.talent_calls TO authenticated;
GRANT ALL ON public.talent_calls TO service_role;

ALTER TABLE public.talent_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read talent calls" ON public.talent_calls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins, producers and sourcing producers can manage talent calls" ON public.talent_calls FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'SP'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'SP'::public.app_role));

CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  owner public.app_role NOT NULL,
  description TEXT,
  required BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_steps TO authenticated;
GRANT ALL ON public.workflow_steps TO service_role;

ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read workflow steps" ON public.workflow_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can manage workflow steps" ON public.workflow_steps FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role));

CREATE TABLE public.talent_step_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES public.talents(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending',
  by_role public.app_role,
  date TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (talent_id, step_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.talent_step_records TO authenticated;
GRANT ALL ON public.talent_step_records TO service_role;

ALTER TABLE public.talent_step_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read talent step records" ON public.talent_step_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and step owners can update records" ON public.talent_step_records FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'EP'::public.app_role) OR EXISTS (
    SELECT 1 FROM public.workflow_steps WHERE workflow_steps.step_id = talent_step_records.step_id AND workflow_steps.owner = ANY(
      SELECT role FROM public.user_roles WHERE user_id = auth.uid()
    )
  )
) WITH CHECK (
  public.has_role(auth.uid(), 'EP'::public.app_role) OR EXISTS (
    SELECT 1 FROM public.workflow_steps WHERE workflow_steps.step_id = talent_step_records.step_id AND workflow_steps.owner = ANY(
      SELECT role FROM public.user_roles WHERE user_id = auth.uid()
    )
  )
);

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES public.talents(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  by_role public.app_role NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read audit log" ON public.audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can append audit entries" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL UNIQUE REFERENCES public.episodes(id) ON DELETE CASCADE,
  editor TEXT,
  edit_window TEXT,
  status TEXT NOT NULL DEFAULT 'not-ready',
  director TEXT,
  dp TEXT,
  narrative_spine TEXT,
  music_ref TEXT,
  tech JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.handoffs TO authenticated;
GRANT ALL ON public.handoffs TO service_role;

ALTER TABLE public.handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read handoffs" ON public.handoffs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins, producers and editors can manage handoffs" ON public.handoffs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role));

CREATE TABLE public.handoff_treatment_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_id UUID NOT NULL REFERENCES public.handoffs(id) ON DELETE CASCADE,
  heading TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.handoff_treatment_sections TO authenticated;
GRANT ALL ON public.handoff_treatment_sections TO service_role;

ALTER TABLE public.handoff_treatment_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read treatment sections" ON public.handoff_treatment_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins, producers and editors can manage treatment sections" ON public.handoff_treatment_sections FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role));

CREATE TABLE public.handoff_dp_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_id UUID NOT NULL REFERENCES public.handoffs(id) ON DELETE CASCADE,
  scene TEXT NOT NULL,
  lens TEXT,
  movement TEXT,
  light TEXT,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.handoff_dp_notes TO authenticated;
GRANT ALL ON public.handoff_dp_notes TO service_role;

ALTER TABLE public.handoff_dp_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read DP notes" ON public.handoff_dp_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins, producers and editors can manage DP notes" ON public.handoff_dp_notes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role));

CREATE TABLE public.handoff_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_id UUID NOT NULL REFERENCES public.handoffs(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  spec TEXT,
  due TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.handoff_deliverables TO authenticated;
GRANT ALL ON public.handoff_deliverables TO service_role;

ALTER TABLE public.handoff_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read deliverables" ON public.handoff_deliverables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins, producers and editors can manage deliverables" ON public.handoff_deliverables FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role));

CREATE TABLE public.handoff_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_id UUID NOT NULL REFERENCES public.handoffs(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.handoff_checklist TO authenticated;
GRANT ALL ON public.handoff_checklist TO service_role;

ALTER TABLE public.handoff_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read checklist" ON public.handoff_checklist FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins, producers and editors can manage checklist" ON public.handoff_checklist FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role));

CREATE TABLE public.handoff_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  target TEXT NOT NULL,
  body TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'open',
  by_role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_by public.app_role,
  resolved_at TIMESTAMP WITH TIME ZONE
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.handoff_feedback TO authenticated;
GRANT ALL ON public.handoff_feedback TO service_role;

ALTER TABLE public.handoff_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read feedback" ON public.handoff_feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can add feedback" ON public.handoff_feedback FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authors and admins can update feedback" ON public.handoff_feedback FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR by_role = ANY(SELECT role FROM public.user_roles WHERE user_id = auth.uid())) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR by_role = ANY(SELECT role FROM public.user_roles WHERE user_id = auth.uid()));

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_role public.app_role NOT NULL,
  from_role public.app_role NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE SET NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications" ON public.notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), to_role::public.app_role) OR public.has_role(auth.uid(), 'EP'::public.app_role));
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can mark their own notifications read" ON public.notifications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), to_role::public.app_role) OR public.has_role(auth.uid(), 'EP'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), to_role::public.app_role) OR public.has_role(auth.uid(), 'EP'::public.app_role));

CREATE TABLE public.shoot_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_code TEXT NOT NULL,
  date TEXT NOT NULL,
  city TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  pair JSONB NOT NULL DEFAULT '[]',
  wrap TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shoot_days TO authenticated;
GRANT ALL ON public.shoot_days TO service_role;

ALTER TABLE public.shoot_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read shoot days" ON public.shoot_days FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and producers can manage shoot days" ON public.shoot_days FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role));

CREATE TABLE public.shoot_day_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shoot_day_id UUID NOT NULL REFERENCES public.shoot_days(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  label TEXT NOT NULL,
  unit TEXT NOT NULL,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shoot_day_schedule TO authenticated;
GRANT ALL ON public.shoot_day_schedule TO service_role;

ALTER TABLE public.shoot_day_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read schedule blocks" ON public.shoot_day_schedule FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and producers can manage schedule blocks" ON public.shoot_day_schedule FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role));

CREATE TABLE public.shoot_day_crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shoot_day_id UUID NOT NULL REFERENCES public.shoot_days(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  call_time TEXT,
  unit TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shoot_day_crew TO authenticated;
GRANT ALL ON public.shoot_day_crew TO service_role;

ALTER TABLE public.shoot_day_crew ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read crew calls" ON public.shoot_day_crew FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and producers can manage crew calls" ON public.shoot_day_crew FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role));

CREATE TABLE public.shoot_day_logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shoot_day_id UUID NOT NULL REFERENCES public.shoot_days(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT,
  status TEXT NOT NULL DEFAULT 'ok',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shoot_day_logistics TO authenticated;
GRANT ALL ON public.shoot_day_logistics TO service_role;

ALTER TABLE public.shoot_day_logistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read logistics" ON public.shoot_day_logistics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and producers can manage logistics" ON public.shoot_day_logistics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'PR'::public.app_role));

CREATE TABLE public.feedback_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL UNIQUE REFERENCES public.episodes(id) ON DELETE CASCADE,
  signature TEXT NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback_sync_log TO authenticated;
GRANT ALL ON public.feedback_sync_log TO service_role;

ALTER TABLE public.feedback_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read feedback sync log" ON public.feedback_sync_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and editors can manage feedback sync log" ON public.feedback_sync_log FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'EP'::public.app_role) OR public.has_role(auth.uid(), 'ED'::public.app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON public.episodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_talents_updated_at BEFORE UPDATE ON public.talents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON public.workflow_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_talent_step_records_updated_at BEFORE UPDATE ON public.talent_step_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_handoffs_updated_at BEFORE UPDATE ON public.handoffs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_handoff_checklist_updated_at BEFORE UPDATE ON public.handoff_checklist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shoot_days_updated_at BEFORE UPDATE ON public.shoot_days FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feedback_sync_log_updated_at BEFORE UPDATE ON public.feedback_sync_log FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();