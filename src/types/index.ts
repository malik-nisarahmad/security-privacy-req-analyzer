/* =============================================
   SPRAT — Shared TypeScript Types
   ============================================= */

// ---- Enums matching database types ----

export type UserRole = "admin" | "project_manager" | "analyst" | "guest";
export type GoalGranularity = "policy" | "scenario";
export type GoalObservability = "observable" | "unobservable";

// ---- Database row types ----

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  is_global_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  user_id: string;
  project_id: string;
  role: UserRole;
  assigned_at: string;
  // Joined fields
  profile?: Profile;
}

export interface TaxonomyCategory {
  id: string;
  parent_category: "Protection" | "Vulnerability";
  name: string;
  created_at: string;
}

export interface SubjectClassification {
  id: string;
  name: string;
  created_at: string;
}

export interface Policy {
  id: string;
  project_id: string;
  title: string;
  domain: string;
  content: string;
  url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  project_id: string;
  goal_id_label: string;
  description: string;
  taxonomy_id: string | null;
  actor: string;
  policy_id: string | null;
  granularity: GoalGranularity;
  observability: GoalObservability;
  occurrences: number;
  context_info: string;
  relevant_legislation: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  taxonomy?: TaxonomyCategory | null;
  policy?: Policy | null;
  subjects?: SubjectClassification[];
}

export interface Scenario {
  id: string;
  project_id: string;
  name: string;
  sources: string;
  actors: string;
  events: string;
  actions: string;
  obstacles: string;
  constraints_text: string;
  pre_conditions: string;
  post_conditions: string;
  status: string;
  issues: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  goals?: Goal[];
  requirements?: Requirement[];
}

export interface Requirement {
  id: string;
  project_id: string;
  req_id_label: string;
  description: string;
  constraints_text: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  goals?: Goal[];
}

export interface GoalPolicyOccurrence {
  id: string;
  goal_id: string;
  policy_id: string;
  occurrence_count: number;
  // Joined fields
  goal?: Goal;
  policy?: Policy;
}

export interface GuestPolicyAccess {
  id: string;
  user_id: string;
  policy_id: string;
  granted_by: string;
  granted_at: string;
  // Joined fields
  policy?: Policy;
  profile?: Profile;
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

// ---- Flesch Readability result ----

export interface FleschResult {
  fres: number;        // Flesch Reading Ease Score
  fgl: number;         // Flesch-Kincaid Grade Level
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
}

// ---- API response wrapper ----

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}
