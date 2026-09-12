-- =============================================
-- SPRAT RLS Policies — Migration 002
-- Enforces R1 (role-based access), R7 (guest restrictions),
-- R8 (per-project scoping) at the DATABASE level.
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_policy_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_policy_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES
-- =============================================
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- PROJECTS — users see only projects they belong to
-- =============================================
CREATE POLICY "Members can view their projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and PMs can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    auth.uid() = created_by
  );

CREATE POLICY "Project creator or admin can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager')
    )
  );

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
  );

-- =============================================
-- PROJECT_MEMBERS (R1, R8)
-- =============================================
CREATE POLICY "Members can view project members"
  ON project_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "PMs and admins can manage members"
  ON project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('admin', 'project_manager')
    )
  );

CREATE POLICY "PMs and admins can update members"
  ON project_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('admin', 'project_manager')
    )
  );

CREATE POLICY "PMs and admins can remove members"
  ON project_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('admin', 'project_manager')
    )
  );

-- =============================================
-- TAXONOMY & SUBJECT CLASSIFICATIONS — read-only for all authenticated users
-- =============================================
CREATE POLICY "Authenticated users can view taxonomy"
  ON taxonomy_categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view subjects"
  ON subject_classifications FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- POLICIES (R7: guest visibility enforcement at DB level)
-- =============================================
CREATE POLICY "Non-guest members can view all project policies"
  ON policies FOR SELECT
  USING (
    -- Global admins see everything
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    -- Non-guest members of the project see all policies
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = policies.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role != 'guest'
    )
    OR
    -- R7: Guests can ONLY see policies explicitly granted to them
    EXISTS (
      SELECT 1 FROM guest_policy_access
      WHERE guest_policy_access.policy_id = policies.id
      AND guest_policy_access.user_id = auth.uid()
    )
  );

CREATE POLICY "PMs can manage policies"
  ON policies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = policies.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager')
    )
  );

CREATE POLICY "PMs can update policies"
  ON policies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = policies.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager')
    )
  );

CREATE POLICY "PMs can delete policies"
  ON policies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = policies.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager')
    )
  );

-- =============================================
-- GOALS (R2) — project members can read, analysts+ can write
-- =============================================
CREATE POLICY "Project members can view goals"
  ON goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = goals.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Analysts and PMs can create goals"
  ON goals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = goals.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts and PMs can update goals"
  ON goals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = goals.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts and PMs can delete goals"
  ON goals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = goals.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

-- GOAL_SUBJECTS junction — follows goal access
CREATE POLICY "Members can view goal subjects"
  ON goal_subjects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_subjects.goal_id
    )
  );

CREATE POLICY "Analysts can manage goal subjects"
  ON goal_subjects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals
      JOIN project_members ON project_members.project_id = goals.project_id
      WHERE goals.id = goal_subjects.goal_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts can delete goal subjects"
  ON goal_subjects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM goals
      JOIN project_members ON project_members.project_id = goals.project_id
      WHERE goals.id = goal_subjects.goal_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

-- =============================================
-- REQUIREMENTS (R4) — same pattern as goals
-- =============================================
CREATE POLICY "Members can view requirements"
  ON requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = requirements.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Analysts can create requirements"
  ON requirements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = requirements.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts can update requirements"
  ON requirements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = requirements.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts can delete requirements"
  ON requirements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = requirements.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

-- REQUIREMENT_GOALS junction
CREATE POLICY "Members can view requirement goals"
  ON requirement_goals FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM requirements WHERE requirements.id = requirement_goals.requirement_id)
  );

CREATE POLICY "Analysts can manage requirement goals"
  ON requirement_goals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN project_members ON project_members.project_id = requirements.project_id
      WHERE requirements.id = requirement_goals.requirement_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts can delete requirement goals"
  ON requirement_goals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN project_members ON project_members.project_id = requirements.project_id
      WHERE requirements.id = requirement_goals.requirement_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

-- =============================================
-- SCENARIOS (R3) — same pattern as goals
-- =============================================
CREATE POLICY "Members can view scenarios"
  ON scenarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = scenarios.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Analysts can create scenarios"
  ON scenarios FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = scenarios.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts can update scenarios"
  ON scenarios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = scenarios.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts can delete scenarios"
  ON scenarios FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = scenarios.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

-- SCENARIO_GOALS junction
CREATE POLICY "Members can view scenario goals"
  ON scenario_goals FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM scenarios WHERE scenarios.id = scenario_goals.scenario_id)
  );

CREATE POLICY "Analysts can manage scenario goals"
  ON scenario_goals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenarios
      JOIN project_members ON project_members.project_id = scenarios.project_id
      WHERE scenarios.id = scenario_goals.scenario_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts can delete scenario goals"
  ON scenario_goals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM scenarios
      JOIN project_members ON project_members.project_id = scenarios.project_id
      WHERE scenarios.id = scenario_goals.scenario_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

-- SCENARIO_REQUIREMENTS junction
CREATE POLICY "Members can view scenario requirements"
  ON scenario_requirements FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM scenarios WHERE scenarios.id = scenario_requirements.scenario_id)
  );

CREATE POLICY "Analysts can manage scenario requirements"
  ON scenario_requirements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenarios
      JOIN project_members ON project_members.project_id = scenarios.project_id
      WHERE scenarios.id = scenario_requirements.scenario_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts can delete scenario requirements"
  ON scenario_requirements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM scenarios
      JOIN project_members ON project_members.project_id = scenarios.project_id
      WHERE scenarios.id = scenario_requirements.scenario_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

-- =============================================
-- GOAL_POLICY_OCCURRENCES (R6) — follows goal access pattern
-- =============================================
CREATE POLICY "Members can view occurrences"
  ON goal_policy_occurrences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_policy_occurrences.goal_id
    )
  );

CREATE POLICY "Analysts can manage occurrences"
  ON goal_policy_occurrences FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals
      JOIN project_members ON project_members.project_id = goals.project_id
      WHERE goals.id = goal_policy_occurrences.goal_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts can update occurrences"
  ON goal_policy_occurrences FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM goals
      JOIN project_members ON project_members.project_id = goals.project_id
      WHERE goals.id = goal_policy_occurrences.goal_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

CREATE POLICY "Analysts can delete occurrences"
  ON goal_policy_occurrences FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM goals
      JOIN project_members ON project_members.project_id = goals.project_id
      WHERE goals.id = goal_policy_occurrences.goal_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager', 'analyst')
    )
  );

-- =============================================
-- GUEST_POLICY_ACCESS (R7) — PMs manage, guests read own
-- =============================================
CREATE POLICY "PMs can view all guest access grants"
  ON guest_policy_access FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    -- PMs of the policy's project can view grants
    EXISTS (
      SELECT 1 FROM policies
      JOIN project_members ON project_members.project_id = policies.project_id
      WHERE policies.id = guest_policy_access.policy_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager')
    )
    OR
    -- Guests can see their own grants
    guest_policy_access.user_id = auth.uid()
  );

CREATE POLICY "PMs can grant guest access"
  ON guest_policy_access FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM policies
      JOIN project_members ON project_members.project_id = policies.project_id
      WHERE policies.id = guest_policy_access.policy_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager')
    )
  );

CREATE POLICY "PMs can revoke guest access"
  ON guest_policy_access FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM policies
      JOIN project_members ON project_members.project_id = policies.project_id
      WHERE policies.id = guest_policy_access.policy_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('admin', 'project_manager')
    )
  );

-- =============================================
-- AUDIT_LOG — only admins can read, system writes via service role
-- =============================================
CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_global_admin = TRUE
    )
  );
