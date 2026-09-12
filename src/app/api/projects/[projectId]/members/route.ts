import { requireProjectRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { formatZodError } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const addMemberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["project_manager", "analyst", "guest"]),
});

const updateMemberSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(["project_manager", "analyst", "guest"]),
});

/**
 * GET /api/projects/[projectId]/members
 * R1/R8: Lists all members of a project with their per-project roles.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "guest");
  if (authError) return authError;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_members")
    .select(`
      *,
      profile:profiles(id, email, full_name)
    `)
    .eq("project_id", projectId)
    .order("assigned_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/**
 * POST /api/projects/[projectId]/members
 * R1: PM/Admin can add members to a project with a specific role.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "project_manager");
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = addMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    // Find the user by email using admin client (to search auth.users)
    const adminClient = createAdminClient();
    const { data: users, error: lookupError } = await adminClient
      .from("profiles")
      .select("id, email")
      .eq("email", parsed.data.email)
      .single();

    if (lookupError || !users) {
      return NextResponse.json(
        { error: "No user found with that email address" },
        { status: 404 }
      );
    }

    const supabase = await createClient();

    // Check if already a member
    const { data: existing } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", users.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "User is already a member of this project" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("project_members")
      .insert({
        user_id: users.id,
        project_id: projectId,
        role: parsed.data.role,
      })
      .select(`
        *,
        profile:profiles(id, email, full_name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[projectId]/members
 * R1: PM/Admin can update a member's role.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "project_manager");
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = updateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("project_members")
      .update({ role: parsed.data.role })
      .eq("id", parsed.data.memberId)
      .eq("project_id", projectId)
      .select(`
        *,
        profile:profiles(id, email, full_name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/members
 * R1: PM/Admin can remove a member from a project.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "project_manager");
  if (authError) return authError;

  try {
    const { memberId } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("id", memberId)
      .eq("project_id", projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: { message: "Member removed" } });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
