import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { UserRole } from "@/types";

/**
 * Verifies the current user is authenticated.
 * Returns the user object or a 401 response.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { user, error: null };
}

/**
 * Verifies the current user has a specific role (or higher) within a project.
 * Role hierarchy: admin > project_manager > analyst > guest.
 *
 * For R1/R8: enforces per-project role scoping via the project_members table.
 */
export async function requireProjectRole(
  projectId: string,
  minimumRole: UserRole
) {
  const { user, error } = await requireAuth();
  if (error) return { member: null, user: null, error };

  const supabase = await createClient();

  // Check if user is a global admin (bypasses project membership)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_global_admin")
    .eq("id", user!.id)
    .single();

  if (profile?.is_global_admin) {
    return {
      member: { role: "admin" as UserRole, user_id: user!.id, project_id: projectId },
      user: user!,
      error: null,
    };
  }

  // Look up the user's role in this specific project
  const { data: member } = await supabase
    .from("project_members")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user!.id)
    .single();

  if (!member) {
    return {
      member: null,
      user: user!,
      error: NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      ),
    };
  }

  // Check role hierarchy
  const roleHierarchy: Record<UserRole, number> = {
    admin: 4,
    project_manager: 3,
    analyst: 2,
    guest: 1,
  };

  if (roleHierarchy[member.role as UserRole] < roleHierarchy[minimumRole]) {
    return {
      member,
      user: user!,
      error: NextResponse.json(
        { error: `Requires at least ${minimumRole} role` },
        { status: 403 }
      ),
    };
  }

  return { member, user: user!, error: null };
}

/**
 * Verifies the current user is a global admin.
 * Used for admin-only operations like user management (R1).
 */
export async function requireGlobalAdmin() {
  const { user, error } = await requireAuth();
  if (error) return { user: null, error };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_global_admin")
    .eq("id", user!.id)
    .single();

  if (!profile?.is_global_admin) {
    return {
      user: user!,
      error: NextResponse.json(
        { error: "Global admin access required" },
        { status: 403 }
      ),
    };
  }

  return { user: user!, error: null };
}
