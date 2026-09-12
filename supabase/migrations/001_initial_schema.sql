-- =============================================
-- SPRAT Database Schema — Migration 001
-- Implements: R1 (roles), R2 (goals), R3 (scenarios),
--             R4 (requirements), R5 (policies for readability),
--             R6 (traceability), R7 (guest access), R8 (per-project scoping)
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'project_manager', 'analyst', 'guest');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE goal_granularity AS ENUM ('policy', 'scenario');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE goal_observability AS ENUM ('observable', 'unobservable');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- PROFILES (extends auth.users with app-specific fields)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  is_global_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing profiles to determine if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.profiles;

  INSERT INTO public.profiles (id, email, full_name, is_global_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    -- First user becomes global admin (bootstrap mechanism)
    user_count = 0
  );
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- PROJECTS
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- R1/R8: PROJECT_MEMBERS — per-project role scoping
-- =============================================
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'analyst',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- =============================================
-- TAXONOMY CATEGORIES (normalized lookup for R2)
-- =============================================
CREATE TABLE IF NOT EXISTS taxonomy_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_category TEXT NOT NULL CHECK (parent_category IN ('Protection', 'Vulnerability')),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SUBJECT CLASSIFICATIONS (normalized lookup for R2)
-- =============================================
CREATE TABLE IF NOT EXISTS subject_classifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- POLICIES (minimal, supports R5, R6, R7)
-- =============================================
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  domain TEXT DEFAULT '',
  content TEXT DEFAULT '',
  url TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- R2: GOALS
-- =============================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  goal_id_label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  taxonomy_id UUID REFERENCES taxonomy_categories(id),
  actor TEXT DEFAULT '',
  policy_id UUID REFERENCES policies(id) ON DELETE SET NULL,
  granularity goal_granularity NOT NULL DEFAULT 'policy',
  observability goal_observability NOT NULL DEFAULT 'observable',
  occurrences INTEGER NOT NULL DEFAULT 0,
  context_info TEXT DEFAULT '',
  relevant_legislation TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- R2: Goal ↔ Subject Classification junction (many-to-many per FR-GSM 4)
CREATE TABLE IF NOT EXISTS goal_subjects (
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subject_classifications(id) ON DELETE CASCADE,
  PRIMARY KEY (goal_id, subject_id)
);

-- =============================================
-- R4: REQUIREMENTS (must be before scenarios for FK)
-- Only fields from SRS: description, constraints, linked goals.
-- =============================================
CREATE TABLE IF NOT EXISTS requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  req_id_label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  constraints_text TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- R4: Requirement ↔ Goal junction (many-to-many per FR-RS 2)
CREATE TABLE IF NOT EXISTS requirement_goals (
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  PRIMARY KEY (requirement_id, goal_id)
);

-- =============================================
-- R3: SCENARIOS
-- =============================================
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sources TEXT DEFAULT '',
  actors TEXT DEFAULT '',
  events TEXT DEFAULT '',
  actions TEXT DEFAULT '',
  obstacles TEXT DEFAULT '',
  constraints_text TEXT DEFAULT '',
  pre_conditions TEXT DEFAULT '',
  post_conditions TEXT DEFAULT '',
  status TEXT DEFAULT '',
  issues TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- R3: Scenario ↔ Goal junction (many-to-many per FR-SSM 4/5)
CREATE TABLE IF NOT EXISTS scenario_goals (
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  PRIMARY KEY (scenario_id, goal_id)
);

-- R3: Scenario ↔ Requirement junction (many-to-many)
CREATE TABLE IF NOT EXISTS scenario_requirements (
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  PRIMARY KEY (scenario_id, requirement_id)
);

-- =============================================
-- R6: GOAL-POLICY OCCURRENCES (traceability)
-- Manually entered count per goal-policy pair
-- =============================================
CREATE TABLE IF NOT EXISTS goal_policy_occurrences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(goal_id, policy_id)
);

-- =============================================
-- R7: GUEST POLICY ACCESS (visibility restrictions)
-- =============================================
CREATE TABLE IF NOT EXISTS guest_policy_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES profiles(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, policy_id)
);

-- =============================================
-- AUDIT LOG (SR 1 from SRS — supporting infrastructure)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES for common query patterns
-- =============================================
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_goals_project ON goals(project_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_project ON scenarios(project_id);
CREATE INDEX IF NOT EXISTS idx_requirements_project ON requirements(project_id);
CREATE INDEX IF NOT EXISTS idx_policies_project ON policies(project_id);
CREATE INDEX IF NOT EXISTS idx_goal_policy_occ_goal ON goal_policy_occurrences(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_policy_occ_policy ON goal_policy_occurrences(policy_id);
CREATE INDEX IF NOT EXISTS idx_guest_access_user ON guest_policy_access(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
